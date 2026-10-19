"""Offline checks: budget, identity preflight, privacy and stop-on-error."""
import contextlib
import io
import json
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from smoke_phase6 import Client, SmokeFailure
from smoke_phase8 import main, new_report, run, valid_result


class FakeClient:
    def __init__(self, identity='same', fail=False):
        self.identity, self.fail, self.calls = identity, fail, []

    def request(self, method, path, body=None, accepted=(200,)):
        self.calls.append((method, path, body))
        if method == 'GET':
            return {'id': self.identity}
        if self.fail:
            raise SmokeFailure('private prompt and credentials must never be printed')
        if path == '/writing/grade':
            return {'score': 5, 'correctedText': 'private result', 'overallComment': 'private feedback', 'issues': []}
        return {'answer': 'private answer', 'words': None}


class Phase8SmokeTests(unittest.TestCase):
    def test_six_calls_same_inputs_and_report_contains_no_content(self):
        native, web, report = FakeClient(), FakeClient(), new_report()
        run(native, web, report)
        self.assertEqual(len(report['ai_requests']), 6)
        self.assertEqual(native.calls, web.calls)
        self.assertEqual(report['result'], 'pass')
        self.assertNotIn('private', json.dumps(report))

    def test_mismatched_or_missing_identity_never_spends_ai(self):
        for identity in ['different', '']:
            native, web = FakeClient(), FakeClient(identity)
            with self.assertRaises(SmokeFailure):
                run(native, web, new_report())
            self.assertTrue(all(c[0] == 'GET' for c in native.calls + web.calls))

    def test_uncertain_failure_stops_without_retry_or_second_auth_call(self):
        native, web, report = FakeClient(fail=True), FakeClient(), new_report()
        with self.assertRaises(SmokeFailure):
            run(native, web, report)
        self.assertEqual(len(report['ai_requests']), 1)
        self.assertEqual(len(native.calls), 2)
        self.assertEqual(len(web.calls), 1)
        self.assertEqual(report['ai_requests'][0]['outcome'], 'request_failed')

    def test_malformed_shapes_and_non_finite_scores_fail(self):
        for value in [None, [], {}, {'answer': ''}, {'answer': 'ok', 'words': 'wrong'}]:
            self.assertFalse(valid_result('tutor', value))
        for score in [True, -1, 11, float('nan'), float('inf'), '5']:
            self.assertFalse(valid_result('writing', {'score': score, 'issues': [],
                                                     'correctedText': 'ok', 'overallComment': 'ok'}))
        self.assertTrue(valid_result('tutor', {'answer': 'ok'}))

    def test_main_sanitizes_failure_output(self):
        stdout, stderr = io.StringIO(), io.StringIO()
        with patch('smoke_phase8.clients', return_value=(FakeClient(fail=True), FakeClient(), None)), \
                contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            self.assertEqual(main(['--run']), 1)
        self.assertNotIn('private', stdout.getvalue() + stderr.getvalue())
        self.assertIn('"ai_request_count": 1', stdout.getvalue())

    def test_timeout_is_configurable_without_changing_phase6_default(self):
        seen = []
        def open_request(request, timeout):
            seen.append(timeout)
            raise TimeoutError()
        for timeout in [20, 90]:
            client = Client('https://example.invalid', {}, opener=SimpleNamespace(open=open_request), timeout=timeout)
            with self.assertRaises(SmokeFailure):
                client.request('POST', '/tutor/ask', {'question': 'synthetic'})
        self.assertEqual(seen, [20, 90])


if __name__ == '__main__':
    unittest.main()
