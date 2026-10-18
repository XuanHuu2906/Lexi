#!/usr/bin/env bash
# No Apple credentials, serial numbers, UDIDs or token stores are printed.
set -uo pipefail
if [[ -f "$HOME/.local/share/lexi-ios/env.sh" ]]; then
  source "$HOME/.local/share/lexi-ios/env.sh"
fi
failures=0
printf 'Platform: %s / %s\n' "$(uname -s)" "$(uname -m)"
if [[ -r /etc/os-release ]]; then
  source /etc/os-release
  printf 'Distribution: %s\n' "$PRETTY_NAME"
fi
for tool in swift xtool usbmuxd ideviceinfo lsusb git; do
  if command -v "$tool" >/dev/null 2>&1; then
    printf 'FOUND %s\n' "$tool"
  else
    printf 'MISSING %s\n' "$tool"
    failures=$((failures + 1))
  fi
done
if command -v swift >/dev/null 2>&1; then
  swift --version || failures=$((failures + 1))
  sdks=$(swift sdk list 2>&1)
  printf '%s\n' "$sdks"
  if ! grep -qi darwin <<< "$sdks"; then
    printf 'MISSING Darwin SDK (requires Xcode XIP).\n'
    failures=$((failures + 1))
  fi
fi
if command -v xtool >/dev/null 2>&1; then
  if ! xtool --help >/dev/null 2>&1; then
    printf 'FAIL xtool launch (check AppImage/FUSE/runtime).\n'
    failures=$((failures + 1))
  fi
fi
if command -v systemctl >/dev/null 2>&1; then
  printf 'usbmuxd: %s\n' "$(systemctl is-active usbmuxd 2>/dev/null || true)"
fi
if command -v ideviceinfo >/dev/null 2>&1; then
  # Query only model and OS; default ideviceinfo output includes private device identifiers.
  if model=$(timeout 10 ideviceinfo -k ProductType 2>/dev/null); then
    printf 'iPhone product: %s\n' "$model"
    timeout 10 ideviceinfo -k ProductVersion 2>/dev/null || true
  else
    printf 'MISSING paired iPhone via usbmuxd.\n'
    failures=$((failures + 1))
  fi
fi
printf 'Missing/failed checks: %s. This is environment evidence, not a successful app build.\n' "$failures"
[[ "$failures" -eq 0 ]]
