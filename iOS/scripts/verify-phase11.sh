#!/usr/bin/env bash
# Deterministic checks. No deployment, account deletion or provider calls.
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -f "$HOME/.local/share/lexi-ios/env.sh" ]]; then
  source "$HOME/.local/share/lexi-ios/env.sh"
fi
mkdir -p .local
python3 scripts/audit-security.py > .local/phase11-source-audit.json
swift test -Xswiftc -warnings-as-errors > .local/phase11-swift-tests.log 2>&1
tail -n 12 .local/phase11-swift-tests.log
xtool dev build > .local/phase11-ios-build.log 2>&1
tail -n 8 .local/phase11-ios-build.log
python3 scripts/audit-security.py --app xtool/LexiIOS.app \
  --log .local/phase11-swift-tests.log --log .local/phase11-ios-build.log \
  > .local/phase11-bundle-audit.json
cat .local/phase11-bundle-audit.json
echo "Code checks complete. Device QA and release approval remain separate."
