"""Bounded live API parity check: Tutor, Grammar Q&A and Writing.

--run makes at most SIX billable AI POSTs, sequentially, without retries.
Uses fixed synthetic inputs, same account via native Bearer and web cookie/CSRF.
Stops on the first error. Does not save words/grammar or create conversations.
This checks API auth-mode contracts, NOT Swift decoding or web/iPhone UI parity.
Provider retries/token cost and content safety are NOT measured by this script.

Set LEXI_API_BASE_URL and use --run --login for hidden interactive credentials;
temporary login sessions are revoked on exit. Alternatively configure
LEXI_TEST_TOKEN, LEXI_WEB_COOKIE and LEXI_WEB_CSRF, then use --run.
Never paste credentials into chat. Output contains only aggregate evidence.
"""
import argparse
from datetime import datetime, timezone
from functools import partial
import json
import math
import os
import sys
import time

from smoke_api import configuration, SmokeFailure
from smoke_phase6 import Client, check, clients


CASES = (
    ('tutor', '/tutor/ask', {'question': 'Explain although with one short example.', 'history': []}),
    ('grammar', '/grammar-qa/ask', {'question': 'When do I use the past simple?', 'history': []}),
    ('writing', '/writing/grade', {'text': 'Yesterday I go to school. I meets my friends.'}),
)


def strings(value, fields):
    return isinstance(value, dict) and all(isinstance(value.get(k), str) for k in fields)


def valid_result(kind, value):
    if kind in ('tutor', 'grammar'):
        if not strings(value, ['answer']) or not value['answer'].strip():
            return False
        if kind == 'grammar':
            return True
        # Optional/null takeaways are accepted by the native DTO.
        for field, fields in [('words', ['term', 'meaning']), ('grammar', ['title', 'rule'])]:
            items = value.get(field)
            if items is not None and (not isinstance(items, list) or not all(strings(x, fields) for x in items)):
                return False
        return True
    if kind != 'writing' or not strings(value, ['correctedText', 'overallComment']):
        return False
    score, issues = value.get('score'), value.get('issues')
    return (type(score) in (int, float) and math.isfinite(score) and 0 <= score <= 10
            and isinstance(issues, list)
            and all(strings(x, ['original', 'correction', 'explanation', 'type']) for x in issues))


def run(native, web, report, clock=time.monotonic):
    # Preflight both identities before spending any AI requests. Never report IDs.
    a = native.request('GET', '/users/me')
    b = web.request('GET', '/users/me')
    check(isinstance(a, dict) and isinstance(b, dict) and isinstance(a.get('id'), str)
          and bool(a['id']) and a['id'] == b.get('id'), 'Require the same test account for web/native.')
    report['same_account'] = True
    for kind, path, body in CASES:
        for mode, client in [('native', native), ('web', web)]:
            row = {'operation': kind, 'auth': mode, 'outcome': 'interrupted'}
            report['ai_requests'].append(row)
            started = clock()
            try:
                result = client.request('POST', path, body, accepted=(200, 201))
                row['outcome'] = 'invalid_contract'
                check(valid_result(kind, result), 'AI result does not match the expected contract.')
                row['outcome'] = 'pass'
            except SmokeFailure:
                if row['outcome'] == 'interrupted':
                    row['outcome'] = 'request_failed'
                raise
            finally:
                row['duration_ms'] = round((clock() - started) * 1000)
    report['result'] = 'pass'


def new_report():
    return {'timestamp_utc': datetime.now(timezone.utc).isoformat(),
            'scope': 'live API auth-mode contract parity; synthetic inputs',
            'result': 'incomplete', 'same_account': False, 'ai_requests': [],
            'provider_cost': 'not_measured', 'provider_retries': 'not_measured',
            'device_ui': 'not_tested', 'content_safety': 'not_tested'}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--run', action='store_true', help='Allow up to six billable AI POSTs')
    parser.add_argument('--login', action='store_true', help='Privately prompt for a test account')
    args = parser.parse_args(argv)
    if not args.run:
        parser.error('--run is required; see --help for the request budget')
    report = new_report()
    try:
        if args.login:
            from phase6_session import login_clients
            base, _ = configuration(os.environ, public_only=True)
            with login_clients(base, single_account=True,
                               client_factory=partial(Client, timeout=90)) as (native, web, _):
                run(native, web, report)
        else:
            native, web, _ = clients(os.environ, single_account=True)
            native.timeout = web.timeout = 90
            run(native, web, report)
    except (SmokeFailure, ValueError, TypeError, KeyError):
        # Never interpolate provider responses, credentials, or arbitrary exception text.
        report['result'] = 'fail'
        print('Verification or session cleanup failed; no automatic AI retry.', file=sys.stderr)
    except (KeyboardInterrupt, EOFError):
        report['result'] = 'interrupted'
    finally:
        report['ai_request_count'] = len(report['ai_requests'])
        report['ai_failure_count'] = sum(r['outcome'] != 'pass' for r in report['ai_requests'])
        print('PHASE8_REPORT ' + json.dumps(report, allow_nan=False))
    return 0 if report['result'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
