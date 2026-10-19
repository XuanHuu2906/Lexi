#!/usr/bin/env bash
# Phase 10 deterministic verification only. No APNs, audio, remote push or real iPhone.
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -f "$HOME/.local/share/lexi-ios/env.sh" ]]; then
  source "$HOME/.local/share/lexi-ios/env.sh"
fi
mkdir -p .local
swift --version
if swift test > .local/phase10-swift-tests.log 2>&1; then
  tail -n 12 .local/phase10-swift-tests.log
else
  tail -n 100 .local/phase10-swift-tests.log
  exit 1
fi
if xtool dev build > .local/phase10-ios-build.log 2>&1; then
  tail -n 12 .local/phase10-ios-build.log
else
  tail -n 100 .local/phase10-ios-build.log
  exit 1
fi
echo "Phase 10 code/test verification finished; device notification delivery still requires manual QA."
