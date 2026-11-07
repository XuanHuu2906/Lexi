#!/usr/bin/env python3
"""Set marketing version and a strictly increasing build number."""
import argparse
from pathlib import Path
import plistlib
import re

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--version", required=True)
parser.add_argument("--build", required=True, type=int)
args = parser.parse_args()
if not re.fullmatch(r"\d+\.\d+\.\d+", args.version):
    parser.error("version must have three numeric components")
path = Path(__file__).resolve().parents[1] / "Resources/Info.plist"
text = path.read_text(encoding="utf-8")
info = plistlib.loads(text.encode())
if args.build <= int(info["CFBundleVersion"]):
    parser.error("build must increase; do not reuse an uploaded build number")
for key, value in {"CFBundleShortVersionString": args.version, "CFBundleVersion": str(args.build)}.items():
    text, count = re.subn(r"(<key>" + key + r"</key>\s*<string>)[^<]*(</string>)",
                         lambda match: match[1] + value + match[2], text)
    if count != 1:
        parser.error("expected exactly one version entry")
path.write_text(text, encoding="utf-8")
print(f"Version {args.version}, build {args.build}")
