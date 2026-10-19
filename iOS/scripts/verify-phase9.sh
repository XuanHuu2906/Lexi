#!/usr/bin/env bash
# No live AI, microphone access, signing or installation in this verification.
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -f "$HOME/.local/share/lexi-ios/env.sh" ]]; then
  source "$HOME/.local/share/lexi-ios/env.sh"
fi
mkdir -p .local
swift --version
if swift test > .local/phase9-swift-tests.log 2>&1; then
  tail -n 5 .local/phase9-swift-tests.log
else
  tail -n 100 .local/phase9-swift-tests.log
  exit 1
fi
if xtool dev build > .local/phase9-ios-build.log 2>&1; then
  tail -n 8 .local/phase9-ios-build.log
else
  tail -n 100 .local/phase9-ios-build.log
  exit 1
fi
