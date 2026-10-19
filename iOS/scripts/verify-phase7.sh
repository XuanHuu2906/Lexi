#!/usr/bin/env bash
# Run from WSL. No API mutations, signing, installation, or credentials required.
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -f "$HOME/.local/share/lexi-ios/env.sh" ]]; then
  source "$HOME/.local/share/lexi-ios/env.sh"
fi
mkdir -p .local
swift --version
if swift test > .local/phase7-swift-tests.log 2>&1; then
  tail -n 5 .local/phase7-swift-tests.log
else
  tail -n 70 .local/phase7-swift-tests.log
  exit 1
fi
if xtool dev build > .local/phase7-ios-build.log 2>&1; then
  tail -n 8 .local/phase7-ios-build.log
else
  tail -n 70 .local/phase7-ios-build.log
  exit 1
fi
