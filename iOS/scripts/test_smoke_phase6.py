"""Offline tests for smoke safety: identity preflight and finally cleanup."""
import contextlib
import io
import unittest
from smoke_phase6 import SmokeFailure, clients, run


class FakeServer:
    def __init__(self):
        self.words = {}
        self.goal = 10
        self.calls = []
        self.fail_read_once = False
        self.fail_create_once = False

    def client(self, user):
        server = self

        class FakeClient:
            def request(self, method, path, body=None, accepted=(200,)):
                server.calls.append((user, method, path))
                if path == '/users/me':
                    return {'id': user, 'setting': {'dailyGoal': server.goal}}
                if path == '/users/me/settings':
                    server.goal = body['dailyGoal']
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


if __name__ == '__main__':
    unittest.main()
