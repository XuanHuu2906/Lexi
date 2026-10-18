#!/usr/bin/env bash
# Run as the normal lexi user in LexiUbuntu, after bootstrap-wsl-root.sh.
# Downloads pinned official releases, verifies Swift's signature and records hashes.
set -euo pipefail
[[ "$(id -un)" == lexi ]] || { echo 'Run as Linux user lexi.' >&2; exit 1; }
source /etc/os-release
[[ "$ID" == ubuntu && "$VERSION_ID" == 24.04 && "$(uname -m)" == x86_64 ]] || exit 1

swift_release='6.4.0'
xtool_release='1.22.2'
swift_name="swift-${swift_release}-RELEASE-ubuntu24.04"
swift_url="https://download.swift.org/swift-${swift_release}-release/ubuntu2404/swift-${swift_release}-RELEASE/${swift_name}.tar.gz"
cache_dir="$HOME/.cache/lexi-ios/downloads"
tools_dir="$HOME/.local/share/lexi-ios/toolchains"
key_dir="$HOME/.local/share/lexi-ios/gnupg"
mkdir -p "$cache_dir" "$tools_dir" "$key_dir" "$HOME/.local/bin"
chmod 700 "$key_dir"
cd "$cache_dir"

if [[ ! -f "$tools_dir/$swift_name/.lexi-extraction-complete" ]]; then
  curl --fail --location --retry 3 --continue-at - "$swift_url" -o "$swift_name.tar.gz"
  curl --fail --location --compressed --retry 3 "$swift_url.sig" -o "$swift_name.tar.gz.sig"
  curl --fail --location --compressed --retry 3 https://www.swift.org/keys/all-keys.asc -o swift-signing-keys.asc
  gpg --homedir "$key_dir" --batch --import swift-signing-keys.asc
  gpg --homedir "$key_dir" --batch --verify "$swift_name.tar.gz.sig" "$swift_name.tar.gz"
  tar -xzf "$swift_name.tar.gz" -C "$tools_dir"
  touch "$tools_dir/$swift_name/.lexi-extraction-complete"
fi
[[ -x "$tools_dir/$swift_name/usr/bin/swift" ]]

curl --fail --location --compressed --retry 3 \
  "https://api.github.com/repos/xtool-org/xtool/releases/tags/$xtool_release" -o xtool-release.json
python3 - "$xtool_release" <<'PY'
import json, sys
from pathlib import Path
release = json.loads(Path('xtool-release.json').read_text())
assert release['tag_name'] == sys.argv[1]
assets = [a for a in release['assets'] if a['name'] == 'xtool-x86_64.AppImage']
assert len(assets) == 1, 'Expected exactly one x86_64 AppImage asset'
asset = assets[0]
assert asset['browser_download_url'].startswith('https://github.com/xtool-org/xtool/releases/download/')
Path('xtool-asset.json').write_text(json.dumps(asset))
Path('xtool-url.txt').write_text(asset['browser_download_url'])
PY
curl --fail --location --retry 3 --continue-at - "$(cat xtool-url.txt)" -o "xtool-$xtool_release-x86_64.AppImage"
python3 - "$xtool_release" <<'PY'
import hashlib, json, sys
from pathlib import Path
asset = json.loads(Path('xtool-asset.json').read_text())
binary = Path(f'xtool-{sys.argv[1]}-x86_64.AppImage')
assert binary.stat().st_size == asset['size'], 'xtool asset size mismatch'
digest = hashlib.sha256(binary.read_bytes()).hexdigest()
expected = asset.get('digest')
if expected:
    assert expected == 'sha256:' + digest, 'xtool release digest mismatch'
print('xtool SHA256:', digest, '(release digest matched)' if expected else '(measured; upstream digest absent)')
PY
install -m 0755 "xtool-$xtool_release-x86_64.AppImage" "$HOME/.local/bin/xtool"

env_file="$HOME/.local/share/lexi-ios/env.sh"
printf 'export PATH="%s/usr/bin:$HOME/.local/bin:$PATH"\n' "$tools_dir/$swift_name" > "$env_file"
profile_line='[ ! -f "$HOME/.local/share/lexi-ios/env.sh" ] || . "$HOME/.local/share/lexi-ios/env.sh"'
grep -Fqx "$profile_line" "$HOME/.profile" || printf '\n%s\n' "$profile_line" >> "$HOME/.profile"
source "$env_file"
swift --version
xtool --help
sha256sum "$swift_name.tar.gz" "xtool-$xtool_release-x86_64.AppImage" > "$HOME/.local/share/lexi-ios/downloads.sha256"
printf 'Toolchain installed. Darwin SDK still requires the Apple Xcode XIP and xtool setup.\n'
