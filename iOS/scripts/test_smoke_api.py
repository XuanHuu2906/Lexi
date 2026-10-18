import contextlib
import io
import json
import unittest
import urllib.error
import urllib.request
from unittest.mock import Mock
from smoke_api import NoRedirect, SmokeFailure, configuration, smoke


class SmokeTests(unittest.TestCase):
    def test_configuration_requires_https_and_env_token(self):
        for base in ['', 'http://example.invalid', 'https://user:secret@example.invalid',
                     'https://example.invalid?token=secret', 'https://localhost', 'https://example.invalid//api']:
            with self.assertRaises(SmokeFailure):
                configuration(dict(LEXI_API_BASE_URL=base, LEXI_TEST_TOKEN='synthetic'))
        with self.assertRaises(SmokeFailure):
            configuration(dict(LEXI_API_BASE_URL='https://example.invalid'))

    def test_redirect_is_never_followed(self):
        handler = NoRedirect()
        self.assertIsNone(handler.redirect_request(None, None, 302, '', {}, 'https://other.invalid'))

    def test_public_only_does_not_require_or_send_token(self):
        base, token = configuration(dict(LEXI_API_BASE_URL='https://example.invalid'), public_only=True)
        response = Mock(status=200)
        response.read.return_value = b'{"success":true,"data":{"status":"ok","database":"up","uptime":1,"timestamp":"fixture"}}'
        opener = Mock()
        opener.open.return_value = contextlib.nullcontext(response)
        with contextlib.redirect_stdout(io.StringIO()):
            smoke(base, token, opener, public_only=True)
        self.assertEqual(opener.open.call_count, 1)
        self.assertIsNone(opener.open.call_args.args[0].get_header('Authorization'))

    def test_routes_are_read_only_and_logs_contain_no_private_data(self):
        payloads = [dict(status='ok', database='up', uptime=1, timestamp='fixture'),
                    dict(id='private-id', email='private-email', setting=None, streak=None),
                    dict(items=[], total=0, page=1, limit=1), dict(items=[], count=0, total=0),
                    dict(period='all', totalWords=0, quizzes={})]
        responses = []
        for data in payloads:
            response = Mock(status=200)
            response.read.return_value = json.dumps(dict(success=True, data=data)).encode()
            context = contextlib.nullcontext(response)
            responses.append(context)
        opener = Mock()
        opener.open.side_effect = responses
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            smoke('https://example.invalid/api', 'synthetic-secret', opener)
        self.assertEqual(opener.open.call_count, 5)
        for i, call in enumerate(opener.open.call_args_list):
            request = call.args[0]
            self.assertEqual(request.method, 'GET')
            self.assertEqual(request.get_header('Authorization'), None if i == 0 else 'Bearer synthetic-secret')
            self.assertIsNone(request.get_header('Cookie'))
        for secret in ['private-id', 'private-email', 'synthetic-secret']:
            self.assertNotIn(secret, output.getvalue())

    def test_error_does_not_leak_server_text_or_retry(self):
        opener = Mock()
        opener.open.side_effect = urllib.error.HTTPError('https://example.invalid', 429, 'private-body', {}, None)
        with self.assertRaisesRegex(SmokeFailure, 'HTTP 429') as result:
            smoke('https://example.invalid', 'synthetic', opener)
        self.assertNotIn('private-body', str(result.exception))
        self.assertEqual(opener.open.call_count, 1)


if __name__ == '__main__':
    unittest.main()
