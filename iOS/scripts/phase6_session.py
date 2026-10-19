"""Private interactive credentials for Phase 6 smoke; sessions live in memory only."""
from contextlib import contextmanager
from getpass import getpass, GetPassWarning
from http.cookies import SimpleCookie, CookieError
import warnings

from smoke_phase6 import Client, SmokeFailure, check


def credentials(label):
    # Never fall back to echoed password input, including when stdin is redirected.
    with warnings.catch_warnings():
        warnings.simplefilter('error', GetPassWarning)
        try:
            email = getpass(f'{label} test email (hidden): ').strip()
            password = getpass(f'{label} password (hidden): ')
        except GetPassWarning:
            raise SmokeFailure('Run --login in an interactive terminal with hidden input support.') from None
    check(bool(email and password), 'Test email and password are required.')
    return {'email': email, 'password': password}


@contextmanager
def login_clients(base, single_account=False, read_credentials=credentials, client_factory=Client):
    """No registration, token refresh/retry, AI calls or persistent cookie jars.

    Manually forward the web access/CSRF cookies to the same configured origin.
    The backend refresh cookie is scoped to the web /api/auth proxy path, so it
    is only forwarded explicitly to /auth/logout when revoking this test session.
    This tests API auth-mode parity, not a browser or physical iPhone UI.
    """
    account_a = read_credentials('A')
    account_b = None if single_account else read_credentials('B')
    if account_b is not None:
        check(account_a['email'].casefold() != account_b['email'].casefold(),
              'Use distinct test accounts A and B.')
    sessions = []
    cleanup_failed = False

    def native_login(account):
        client = client_factory(base, {})
        response = client.request('POST', '/auth/mobile/login', account)
        check(isinstance(response, dict), 'Native login returned an unexpected data shape.')
        refresh = response.get('refreshToken')
        check(isinstance(refresh, str) and bool(refresh), 'Native login omitted its refresh credential.')
        sessions.append((client_factory(base, {}), '/auth/mobile/logout', {'refreshToken': refresh}))
        token = response.get('accessToken')
        check(isinstance(token, str) and bool(token), 'Native login omitted its access credential.')
        return client_factory(base, {'Authorization': 'Bearer ' + token})

    try:
        native = native_login(account_a)
        web_login = client_factory(base, {})
        response = web_login.request('POST', '/auth/login', account_a)
        cookie = SimpleCookie()
        try:
            for header in web_login.response_headers.get_all('Set-Cookie', []):
                cookie.load(header)
        except (AttributeError, CookieError):
            raise SmokeFailure('Web login returned invalid cookies.') from None
        if 'refresh_token' in cookie:
            logout = client_factory(base, {'Cookie': 'refresh_token=' + cookie['refresh_token'].value})
            sessions.append((logout, '/auth/logout', {}))
        check(isinstance(response, dict), 'Web login returned an unexpected data shape.')
        check(all(key in cookie for key in ['access_token', 'csrf_token', 'refresh_token']),
              'Web login omitted required cookies.')
        csrf = response.get('csrfToken')
        check(isinstance(csrf, str) and bool(csrf) and csrf == cookie['csrf_token'].value,
              'Web login CSRF token does not match its cookie.')
        web = client_factory(base, {
            'Cookie': '; '.join(key + '=' + cookie[key].value for key in ['access_token', 'csrf_token']),
            'X-CSRF-Token': csrf,
        })
        other = None if single_account else native_login(account_b)
        # Drop password references before running CRUD tests; never write them to disk.
        account_a = account_b = None
        yield native, web, other
    finally:
        for client, path, body in reversed(sessions):
            try:
                client.request('POST', path, body)
            except (SmokeFailure, ValueError, TypeError, KeyError):
                cleanup_failed = True
        if cleanup_failed:
            raise SmokeFailure('Test session logout incomplete; test-data cleanup is reported separately.')
        if sessions:
            print('PASS revoked temporary test login sessions')
