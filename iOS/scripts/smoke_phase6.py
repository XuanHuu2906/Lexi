"""Opt-in staging mutations for Phase 6; use disposable test accounts only.

Required environment: LEXI_API_BASE_URL, LEXI_TEST_TOKEN (native user A),
LEXI_TEST_TOKEN_B (different user B), LEXI_WEB_COOKIE (web session for user A),
LEXI_WEB_CSRF (matching web CSRF token). Run with --run to permit test writes.
Creates two uniquely named words, verifies both auth modes/IDOR/settings sync,
and cleans up in finally. No AI calls, retries, redirects or credential/body logs.
Do not edit the same test account settings concurrently with this test.

Alternative: --run --login prompts privately for account credentials, obtains
temporary native/web sessions, and revokes them at exit. Add --single-account
when only account A is available: IDOR checks are explicitly SKIPPED.
Only LEXI_API_BASE_URL is required for --login.
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from smoke_api import NoRedirect, SmokeFailure, configuration


class Client:
    def __init__(self, base, headers, opener=None, timeout=20):
        self.base = base
        self.headers = headers
        self.opener = opener or urllib.request.build_opener(NoRedirect())
        self.response_headers = None
        self.timeout = timeout

    def request(self, method, path, body=None, accepted=(200,)):
        headers = {'Accept': 'application/json', **self.headers}
        if body is not None:
            headers['Content-Type'] = 'application/json'
        request = urllib.request.Request(self.base + path, method=method, headers=headers,
                                         data=None if body is None else json.dumps(body).encode())
        try:
            response = self.opener.open(request, timeout=self.timeout)
        except urllib.error.HTTPError as error:
            if error.code in accepted:
                # Expected 403/404 must not disclose word content. Never print the body.
                raw = error.read(2_000_001)
                error.close()
                try:
                    data = json.loads(raw)
                    if (len(raw) > 2_000_000 or not isinstance(data, dict)
                            or data.get('success') is not False or data.get('statusCode') != error.code
                            or any(k in data for k in ('term', 'meaning', 'data'))):
                        raise SmokeFailure('Expected denial did not match the safe API error contract.')
                except (ValueError, TypeError):
                    raise SmokeFailure('Expected API denial returned malformed data; cannot verify isolation.') from None
                return None
            error.close()
            raise SmokeFailure(f'Unexpected HTTP {error.code}; no retry performed.') from None
        except (urllib.error.URLError, TimeoutError, OSError):
            raise SmokeFailure('Network/TLS/timeout failure; write outcome may be uncertain.') from None
        with response:
            self.response_headers = response.headers
            if response.status not in accepted:
                raise SmokeFailure(f'Unexpected HTTP {response.status}.')
            raw = response.read(2_000_001)
        try:
            value = json.loads(raw)
            if len(raw) > 2_000_000 or not isinstance(value, dict) or value.get('success') is not True:
                raise ValueError()
            return value['data']
        except (ValueError, KeyError, TypeError):
            raise SmokeFailure('Unexpected response envelope.') from None


def check(condition, message):
    if not condition:
        raise SmokeFailure(message)


def run(native, web, other=None):
    a = native.request('GET', '/users/me')
    w = web.request('GET', '/users/me')
    check(a['id'] == w['id'], 'Require web/native same user A.')
    if other is not None:
        b = other.request('GET', '/users/me')
        check(a['id'] != b['id'], 'Require a distinct user B.')
    check(isinstance(a.get('setting'), dict), 'Test account A needs existing settings for reversible settings test.')
    print('PASS same-account native/web identity')
    if other is not None:
        print('PASS distinct account B identity')
    else:
        print('SKIP IOS-0630 account isolation: second test account not provided')
    original_goal = a['setting']['dailyGoal']
    marker = 'lexi-phase6-' + uuid.uuid4().hex
    terms = [marker + '-native', marker + '-web']
    settings_touched = False
    cleanup_errors = []
    try:
        for creator, reader, deleter, term in [(native, web, web, terms[0]), (web, native, native, terms[1])]:
            word = creator.request('POST', '/words', {'term': term, 'meaning': 'Synthetic Phase 6 test'}, (201,))
            path = '/words/' + urllib.parse.quote(word['id'], safe='')
            visible = reader.request('GET', path)
            check(visible['id'] == word['id'] and visible['term'] == term, 'Cross-client word differs.')
            page = reader.request('GET', '/words?' + urllib.parse.urlencode({'search': term}))
            check(any(item['id'] == word['id'] for item in page['items']), 'Created word missing from list.')
            if other is not None:
                other.request('GET', path, accepted=(403, 404))
                other.request('DELETE', path, accepted=(403, 404))
                isolated = other.request('GET', '/words?' + urllib.parse.urlencode({'search': term}))
                check(not isolated['items'], 'Account B can see account A test word.')
            check(native.request('GET', path)['id'] == word['id'], 'Isolation test changed owner word.')
            check(deleter.request('DELETE', path).get('deleted') is True, 'Delete not acknowledged.')
            creator.request('GET', path, accepted=(404,))
        print('PASS native/web CRUD in both directions')
        if other is not None:
            print('PASS user B GET/list/DELETE isolation')
        temporary_goal = 11 if original_goal == 10 else 10
        settings_touched = True  # Also restore when PATCH times out after server commit.
        updated = native.request('PATCH', '/users/me/settings', {'dailyGoal': temporary_goal})
        check(updated['dailyGoal'] == temporary_goal, 'Native settings PATCH differs.')
        check(web.request('GET', '/users/me')['setting']['dailyGoal'] == temporary_goal, 'Web did not see native settings.')
        web.request('PATCH', '/users/me/settings', {'dailyGoal': original_goal})
        check(native.request('GET', '/users/me')['setting']['dailyGoal'] == original_goal, 'Native did not see web settings.')
        settings_touched = False
        print('PASS native bearer PATCH without CSRF, web PATCH with CSRF, bidirectional settings sync')
    finally:
        # Discover by unique exact term too: POST may commit even if response is lost.
        for term in terms:
            try:
                page = native.request('GET', '/words?' + urllib.parse.urlencode({'search': term, 'limit': 100}))
                for item in page['items']:
                    if item['term'] == term:
                        native.request('DELETE', '/words/' + urllib.parse.quote(item['id'], safe=''), accepted=(200, 404))
            except (SmokeFailure, KeyError, TypeError):
                cleanup_errors.append('word cleanup')
        if settings_touched:
            try:
                native.request('PATCH', '/users/me/settings', {'dailyGoal': original_goal})
            except SmokeFailure:
                cleanup_errors.append('settings restoration')
        if cleanup_errors:
            # Random test prefix is not a credential or private user content; useful for manual cleanup.
            raise SmokeFailure('Cleanup incomplete: ' + ', '.join(cleanup_errors) + '; test prefix ' + marker)
        print('PASS cleanup of synthetic words and restoration of test settings')


def clients(environ, single_account=False):
    base, token = configuration(environ)
    cookie, csrf = (environ.get(name, '') for name in ['LEXI_WEB_COOKIE', 'LEXI_WEB_CSRF'])
    check(all([cookie, csrf]) and all('\r' not in v and '\n' not in v for v in [cookie, csrf]),
          'Configure matching user A web cookie and CSRF token via environment.')
    other = None
    if not single_account:
        _, token_b = configuration({**environ, 'LEXI_TEST_TOKEN': environ.get('LEXI_TEST_TOKEN_B', '')})
        check(token != token_b, 'User B requires a different account token.')
        other = Client(base, {'Authorization': 'Bearer ' + token_b})
    return (Client(base, {'Authorization': 'Bearer ' + token}),
            Client(base, {'Cookie': cookie, 'X-CSRF-Token': csrf}), other)


def main():
    if sys.argv[1:] == ['--help']:
        print(__doc__)
        return 0
    flags = set(sys.argv[1:])
    if '--run' not in flags or flags - {'--run', '--login', '--single-account'}:
        print('Usage: python3 scripts/smoke_phase6.py --run [--login] [--single-account] (see --help)', file=sys.stderr)
        return 2
    try:
        if '--login' in flags:
            from phase6_session import login_clients
            base, _ = configuration(os.environ, public_only=True)
            with login_clients(base, single_account='--single-account' in flags) as authenticated:
                run(*authenticated)
        else:
            run(*clients(os.environ, single_account='--single-account' in flags))
        print('RESULT ' + ('PARTIAL PASS (account isolation not tested)' if '--single-account' in flags else 'PASS'))
        return 0
    except (SmokeFailure, KeyError, TypeError) as error:
        print(str(error) if isinstance(error, SmokeFailure) else 'Unexpected test response shape.', file=sys.stderr)
        return 1
    except (KeyboardInterrupt, EOFError):
        print('Stopped by user; inspect cleanup messages before rerunning.', file=sys.stderr)
        return 130


if __name__ == '__main__':
    sys.exit(main())
