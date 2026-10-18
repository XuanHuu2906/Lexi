#!/usr/bin/env bash
# Run only in the dedicated LexiUbuntu distro as root.
set -euo pipefail
[[ "$(id -u)" == 0 ]] || { echo 'Run with wsl -d LexiUbuntu -u root.' >&2; exit 1; }
source /etc/os-release
[[ "$ID" == ubuntu && "$VERSION_ID" == 24.04 ]] || { echo 'Expected Ubuntu 24.04.' >&2; exit 1; }
[[ "$(uname -m)" == x86_64 ]] || { echo 'Expected x86_64; review package selection.' >&2; exit 1; }

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates curl git gnupg2 binutils libc6-dev libcurl4-openssl-dev \
  libedit2 libgcc-13-dev libncurses-dev libpython3-dev libsqlite3-0 \
  libstdc++-13-dev libxml2-dev libz3-dev pkg-config tzdata zip unzip zlib1g-dev \
  usbmuxd libimobiledevice-utils usbutils libfuse2t64 rsync

if ! id lexi >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash lexi
fi
install -d -m 0755 -o lexi -g lexi \
  /home/lexi/projects /home/lexi/projects/LexiIOS /home/lexi/.local /home/lexi/.local/bin
# No passwordless sudo or SSH service is installed. Admin commands use wsl -u root.
if ! grep -q '^\[user\]' /etc/wsl.conf; then
  printf '\n[user]\ndefault=lexi\n' >> /etc/wsl.conf
elif ! grep -q '^default=lexi$' /etc/wsl.conf; then
  echo 'Existing [user] configuration differs; review it before changing.' >&2
  exit 1
fi
systemctl start usbmuxd
printf 'Bootstrap complete: Ubuntu %s, %s; workspace /home/lexi/projects/LexiIOS\n' "$VERSION_ID" "$(uname -m)"
id lexi
systemctl is-active usbmuxd
