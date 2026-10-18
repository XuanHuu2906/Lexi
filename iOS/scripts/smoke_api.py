"""Read-only staging smoke. Requires LEXI_API_BASE_URL and LEXI_TEST_TOKEN.
Use --public-only to check health without a token (not the full smoke gate).

No cookie auth, redirects, retries, AI calls, mutations, or response-body logs.
GET streak/badges are excluded because those handlers can write to the DB.
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request


class SmokeFailure(Exception):
    pass


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def configuration(environ, public_only=False):
    base = environ.get('LEXI_API_BASE_URL', '').strip()
    token = environ.get('LEXI_TEST_TOKEN', '')
    try:
        parts = urllib.parse.urlsplit(base)
        if (parts.scheme != 'https' or not parts.hostname or parts.username or parts.password
                or parts.query or parts.fragment or '//' in parts.path
                or parts.hostname in ['localhost', '127.0.0.1', '::1', '0.0.0.0']
                or parts.hostname.endswith('.localhost')
                or any(ord(c) < 33 or ord(c) == 127 for c in base)):
            raise ValueError()
        _ = parts.port
    except ValueError:
        raise SmokeFailure('Set LEXI_API_BASE_URL to the verified staging HTTPS base URL.') from None
    if not public_only and (not token or any(c.isspace() or ord(c) < 32 or ord(c) == 127 for c in token)):
        raise SmokeFailure('Set LEXI_TEST_TOKEN to a staging test-account access token.')
    return base.rstrip('/'), token


def smoke(base, token, opener=None, public_only=False):
    opener = opener or urllib.request.build_opener(NoRedirect())
    routes = [('/health', ['status', 'database', 'uptime', 'timestamp']),
              ('/users/me', ['id', 'email', 'setting', 'streak']),
              ('/words?limit=1', ['items', 'total', 'page', 'limit']),
              ('/review/due?limit=1', ['items', 'count', 'total']),
              ('/stats/overview?period=all', ['period', 'totalWords', 'quizzes'])]
    if public_only:
        routes = routes[:1]
    for path, keys in routes:
        headers = {'Accept': 'application/json'}
        if path != '/health':
            headers['Authorization'] = 'Bearer ' + token
        request = urllib.request.Request(base + path, headers=headers, method='GET')
        try:
            with opener.open(request, timeout=15) as response:
                if response.status != 200:
                    raise SmokeFailure(f'FAIL {path}: unexpected HTTP status {response.status}.')
                raw = response.read(2_000_001)
                if len(raw) > 2_000_000:
                    raise SmokeFailure(f'FAIL {path}: response exceeds smoke limit.')
                body = json.loads(raw)
            data = body.get('data') if isinstance(body, dict) else None
            if body.get('success') is not True or not isinstance(data, dict) or not all(k in data for k in keys):
                raise SmokeFailure(f'FAIL {path}: unexpected envelope/data shape.')
            if path == '/health' and (data['status'] != 'ok' or data['database'] != 'up'):
                raise SmokeFailure('FAIL /health: service/database not healthy.')
        except urllib.error.HTTPError as error:
            raise SmokeFailure(f'FAIL {path}: HTTP {error.code}; no retry performed.') from None
        except (urllib.error.URLError, TimeoutError, OSError):
            raise SmokeFailure(f'FAIL {path}: network/TLS/timeout failure.') from None
        except (ValueError, AttributeError, TypeError):
            raise SmokeFailure(f'FAIL {path}: malformed response.') from None
        print(f'PASS GET {path} (200, expected envelope/keys)')


def main():
    if sys.argv[1:] == ['--help']:
        print(__doc__)
        return 0
    public_only = sys.argv[1:] == ['--public-only']
    if sys.argv[1:] and not public_only:
        print('Usage: bash scripts/smoke-api.sh [--help|--public-only]', file=sys.stderr)
        return 2
    try:
        smoke(*configuration(os.environ, public_only), public_only=public_only)
        return 0
    except SmokeFailure as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
