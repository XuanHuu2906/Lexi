"""Opt-in staging mutations for Phase 6; use disposable test accounts only.

Required environment: LEXI_API_BASE_URL, LEXI_TEST_TOKEN (native user A),
LEXI_TEST_TOKEN_B (different user B), LEXI_WEB_COOKIE (web session for user A),
LEXI_WEB_CSRF (matching web CSRF token). Run with --run to permit test writes.
Creates two uniquely named words, verifies both auth modes/IDOR/settings sync,
and cleans up in finally. No AI calls, retries, redirects or credential/body logs.
Do not edit the same test account settings concurrently with this test.
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
    def __init__(self, base, headers):
        self.base = base
        self.headers = headers
        self.opener = urllib.request.build_opener(NoRedirect())

    def request(self, method, path, body=None, accepted=(200,)):
        headers = {'Accept': 'application/json', **self.headers}
        if body is not None:
            headers['Content-Type'] = 'application/json'
        request = urllib.request.Request(self.base + path, method=method, headers=headers,
                                         data=None if body is None else json.dumps(body).encode())
        try:
            response = self.opener.open(request, timeout=20)
        except urllib.error.HTTPError as error:
            if error.code in accepted:
                # Expected 403/404 must not disclose word content. Never print the body.
                raw = error.read(2_000_001)
                error.close()
                try:
                    data = json.loads(raw)
                    if isinstance(data, dict) and any(k in data for k in ('term', 'meaning', 'data')):
                        raise SmokeFailure('Isolation response exposed unexpected data.')
                except (ValueError, TypeError):
                    pass
                return None
            raise SmokeFailure(f'Unexpected HTTP {error.code}; no retry performed.') from None
        except (urllib.error.URLError, TimeoutError, OSError):
            raise SmokeFailure('Network/TLS/timeout failure; write outcome may be uncertain.') from None
        with response:
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


def run(native, web, other):
    a = native.request('GET', '/users/me')
    w = web.request('GET', '/users/me')
    b = other.request('GET', '/users/me')
    check(a['id'] == w['id'] and a['id'] != b['id'], 'Require web/native same user A and distinct user B.')
    check(isinstance(a.get('setting'), dict), 'Test account A needs existing settings for reversible settings test.')
    print('PASS same-account native/web and distinct account B')
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
            other.request('GET', path, accepted=(403, 404))
            other.request('DELETE', path, accepted=(403, 404))
            isolated = other.request('GET', '/words?' + urllib.parse.urlencode({'search': term}))
            check(not isolated['items'], 'Account B can see account A test word.')
            check(native.request('GET', path)['id'] == word['id'], 'Isolation test changed owner word.')
            check(deleter.request('DELETE', path).get('deleted') is True, 'Delete not acknowledged.')
            creator.request('GET', path, accepted=(404,))
        print('PASS native/web CRUD in both directions; user B GET/list/DELETE isolation')
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


def clients(environ):
    base, token = configuration(environ)
    names = ['LEXI_TEST_TOKEN_B', 'LEXI_WEB_COOKIE', 'LEXI_WEB_CSRF']
    values = [environ.get(name, '') for name in names]
    check(all(values) and all('\r' not in v and '\n' not in v for v in values),
          'Configure user B token, matching user A web cookie and CSRF token via environment.')
    check(token != values[0], 'User B requires a different account token.')
    return (Client(base, {'Authorization': 'Bearer ' + token}),
            Client(base, {'Cookie': values[1], 'X-CSRF-Token': values[2]}),
            Client(base, {'Authorization': 'Bearer ' + values[0]}))


def main():
    if sys.argv[1:] == ['--help']:
        print(__doc__)
        return 0
    if sys.argv[1:] != ['--run']:
        print('Usage: python3 scripts/smoke_phase6.py --run (writes test data; see --help)', file=sys.stderr)
        return 2
    try:
        run(*clients(os.environ))
        return 0
    except (SmokeFailure, KeyError, TypeError) as error:
        print(str(error) if isinstance(error, SmokeFailure) else 'Unexpected test response shape.', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
