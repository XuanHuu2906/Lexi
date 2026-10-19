"""Offline checks for temporary authentication, cleanup and safe output."""
import contextlib
from email.message import Message
import io
import unittest

from phase6_session import login_clients
from smoke_api import SmokeFailure


class LoginServer:
    def __init__(self):
        self.calls = []
        self.bad_csrf = False
        self.fail_b = False
        self.fail_logout = False

    def client(self, base, headers):
        server = self

        class FakeClient:
            response_headers = Message()

            def request(self, method, path, body=None):
                server.calls.append((path, headers, body))
                if path.endswith('/logout'):
                    if server.fail_logout:
                        raise SmokeFailure('Synthetic logout failure')
                    return {'message': 'Logged out'}
                if path == '/auth/mobile/login':
                    if body['email'] == 'b@example.invalid' and server.fail_b:
                        raise SmokeFailure('Synthetic login failure')
                    return {'accessToken': 'native-secret', 'refreshToken': 'refresh-secret'}
                if path == '/auth/login':
                    self.response_headers = Message()
                    self.response_headers.add_header('Set-Cookie', 'access_token=web-secret; HttpOnly; Path=/')
                    self.response_headers.add_header('Set-Cookie', 'csrf_token=csrf-secret; Path=/')
                    self.response_headers.add_header('Set-Cookie', 'refresh_token=web-refresh; HttpOnly; Path=/api/auth')
                    return {'csrfToken': 'wrong' if server.bad_csrf else 'csrf-secret'}
                raise AssertionError('Unexpected path')

        return FakeClient()


def read_credentials(label):
    return {'email': label.lower() + '@example.invalid', 'password': 'synthetic-password'}


class Phase6SessionTests(unittest.TestCase):
    def test_sessions_use_separate_auth_modes_and_are_revoked(self):
        server = LoginServer()
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            with login_clients('https://example.invalid', read_credentials=read_credentials,
                               client_factory=server.client) as clients:
                self.assertIsNotNone(clients[2])
        logouts = [(path, headers, body) for path, headers, body in server.calls if path.endswith('/logout')]
        self.assertEqual(len(logouts), 3)
        self.assertTrue(any(headers.get('Cookie') == 'refresh_token=web-refresh' for _, headers, _ in logouts))
        self.assertFalse(any('Authorization' in headers for _, headers, _ in logouts))
        for secret in ['synthetic-password', 'native-secret', 'web-secret', 'refresh-secret', 'web-refresh', '@example.invalid']:
            self.assertNotIn(secret, output.getvalue())

    def test_single_account_only_prompts_once(self):
        server = LoginServer()
        prompts = []

        def read(label):
            prompts.append(label)
            return read_credentials(label)

        with contextlib.redirect_stdout(io.StringIO()):
            with login_clients('https://example.invalid', single_account=True,
                               read_credentials=read, client_factory=server.client) as clients:
                self.assertIsNone(clients[2])
        self.assertEqual(prompts, ['A'])
        self.assertEqual(sum(path.endswith('/logout') for path, _, _ in server.calls), 2)

    def test_partial_login_and_test_failures_still_revoke_sessions(self):
        for failure, count in [('bad_csrf', 2), ('fail_b', 2), ('test_body', 3)]:
            with self.subTest(failure=failure):
                server = LoginServer()
                setattr(server, failure, True)
                with self.assertRaises(SmokeFailure), contextlib.redirect_stdout(io.StringIO()):
                    with login_clients('https://example.invalid', read_credentials=read_credentials,
                                       client_factory=server.client):
                        raise SmokeFailure('Synthetic test body failure')
                self.assertEqual(sum(path.endswith('/logout') for path, _, _ in server.calls), count)

    def test_logout_failure_does_not_report_success(self):
        server = LoginServer()
        server.fail_logout = True
        output = io.StringIO()
        with self.assertRaisesRegex(SmokeFailure, 'logout incomplete'), contextlib.redirect_stdout(output):
            with login_clients('https://example.invalid', single_account=True,
                               read_credentials=read_credentials, client_factory=server.client):
                pass
        self.assertNotIn('PASS revoked', output.getvalue())
        self.assertEqual(sum(path.endswith('/logout') for path, _, _ in server.calls), 2)


if __name__ == '__main__':
    unittest.main()
