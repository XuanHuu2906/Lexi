"""Offline tests for smoke safety: identity preflight and finally cleanup."""
import contextlib
import io
import unittest
from smoke_phase6 import Client, SmokeFailure, clients, run
import json
from types import SimpleNamespace
from urllib.error import HTTPError


class FakeServer:
    def __init__(self):
        self.words = {}
        self.goal = 10
        self.calls = []
        self.fail_read_once = False
        self.fail_create_once = False
        self.fail_settings_once = False

    def client(self, user):
        server = self

        class FakeClient:
            def request(self, method, path, body=None, accepted=(200,)):
                server.calls.append((user, method, path))
                if path == '/users/me':
                    return {'id': user, 'setting': {'dailyGoal': server.goal}}
                if path == '/users/me/settings':
                    server.goal = body['dailyGoal']
                    if server.fail_settings_once:
                        server.fail_settings_once = False
                        raise SmokeFailure('Synthetic lost response after settings commit')
                    return {'dailyGoal': server.goal}
                if path == '/words' and method == 'POST':
                    word = {'id': str(len(server.calls)), **body}
                    server.words[word['id']] = word
                    if server.fail_create_once:
                        server.fail_create_once = False
                        raise SmokeFailure('Synthetic lost response after create')
                    return word
                if path.startswith('/words?'):
                    from urllib.parse import parse_qs, urlsplit
                    term = parse_qs(urlsplit(path).query)['search'][0]
                    return {'items': [w for w in server.words.values() if w['term'] == term and user == 'a']}
                word_id = path.rsplit('/', 1)[-1]
                if user == 'b' or word_id not in server.words:
                    if 404 not in accepted:
                        raise SmokeFailure('Synthetic 404')
                    return None
                if method == 'DELETE':
                    del server.words[word_id]
                    return {'deleted': True}
                if server.fail_read_once:
                    server.fail_read_once = False
                    raise SmokeFailure('Synthetic read failure')
                return server.words[word_id]

        return FakeClient()


class Phase6SmokeTests(unittest.TestCase):
    def test_success_cleans_data_and_restores_settings(self):
        server = FakeServer()
        with contextlib.redirect_stdout(io.StringIO()):
            run(server.client('a'), server.client('a'), server.client('b'))
        self.assertEqual(server.words, {})
        self.assertEqual(server.goal, 10)

    def test_mismatched_web_identity_fails_before_writes(self):
        server = FakeServer()
        with self.assertRaises(SmokeFailure):
            run(server.client('a'), server.client('b'), server.client('b'))
        self.assertTrue(all(method == 'GET' for _, method, _ in server.calls))

    def test_failure_after_create_still_cleans_only_test_words(self):
        for fail in ['fail_read_once', 'fail_create_once']:
            with self.subTest(fail=fail):
                server = FakeServer()
                server.words['original'] = {'id': 'original', 'term': 'untouched', 'meaning': 'keep'}
                setattr(server, fail, True)
                with self.assertRaises(SmokeFailure), contextlib.redirect_stdout(io.StringIO()):
                    run(server.client('a'), server.client('a'), server.client('b'))
                self.assertEqual(list(server.words), ['original'])

    def test_missing_credentials_fail_before_network(self):
        with self.assertRaises(SmokeFailure):
            clients({})

    def test_single_account_reports_skipped_isolation(self):
        server = FakeServer()
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            run(server.client('a'), server.client('a'))
        self.assertIn('SKIP IOS-0630', output.getvalue())
        self.assertNotIn('PASS user B', output.getvalue())
        self.assertIn('PASS native/web CRUD', output.getvalue())
        self.assertEqual(server.words, {})
        self.assertEqual(server.goal, 10)

    def test_lost_settings_response_restores_original_goal(self):
        server = FakeServer()
        server.goal = 37
        server.fail_settings_once = True
        with self.assertRaises(SmokeFailure), contextlib.redirect_stdout(io.StringIO()):
            run(server.client('a'), server.client('a'))
        self.assertEqual(server.goal, 37)
        self.assertEqual(server.words, {})

    def test_single_account_does_not_require_user_b_credentials(self):
        env = {'LEXI_API_BASE_URL': 'https://example.invalid', 'LEXI_TEST_TOKEN': 'native-a',
               'LEXI_WEB_COOKIE': 'access_token=web-a; csrf_token=csrf', 'LEXI_WEB_CSRF': 'csrf'}
        native, web, other = clients(env, single_account=True)
        self.assertIsNone(other)
        self.assertNotIn('Cookie', native.headers)
        self.assertNotIn('Authorization', web.headers)
        with self.assertRaises(SmokeFailure):
            clients(env)

    def test_denials_require_api_envelope_and_never_expose_word_data(self):
        safe = {'success': False, 'statusCode': 404, 'message': 'Word not found'}
        cases = [(json.dumps(safe).encode(), True), (b'<html>not found</html>', False),
                 (json.dumps({**safe, 'data': {'meaning': 'private'}}).encode(), False),
                 (json.dumps({**safe, 'statusCode': 500}).encode(), False)]
        for raw, valid in cases:
            with self.subTest(valid=valid, length=len(raw)):
                error = HTTPError('https://example.invalid/words/test', 404, 'Not found', {}, io.BytesIO(raw))

                def deny(*args, **kwargs):
                    raise error

                client = Client('https://example.invalid', {}, opener=SimpleNamespace(open=deny))
                if valid:
                    self.assertIsNone(client.request('GET', '/words/test', accepted=(404,)))
                else:
                    with self.assertRaises(SmokeFailure) as caught:
                        client.request('GET', '/words/test', accepted=(404,))
                    self.assertNotIn('private', str(caught.exception))


if __name__ == '__main__':
    unittest.main()
