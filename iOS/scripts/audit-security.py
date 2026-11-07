#!/usr/bin/env python3
"""Read-only, redacted source/bundle checks. Not a full history or entropy scan."""
import argparse
import hashlib
import json
from pathlib import Path
import plistlib
import re
import subprocess
import sys
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
PATTERNS = {
    "private-key": re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "provider-key": re.compile(rb"\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b"),
    "github-token": re.compile(rb"\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,})\b"),
    "aws-access-id": re.compile(rb"\bAKIA[A-Z0-9]{16}\b"),
}
PRIVATE_SUFFIXES = {".p8", ".p12", ".pfx", ".key", ".mobileprovision"}


def secure_url(value):
    if not isinstance(value, str):
        return False
    try:
        url = urlsplit(value)
        return (url.scheme == "https" and bool(url.hostname)
                and url.hostname not in {"localhost", "127.0.0.1", "::1"}
                and not url.username and not url.password and not url.query
                and not url.fragment)
    except ValueError:
        return False


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--app", type=Path, help="Also inspect a built .app bundle")
    parser.add_argument("--log", action="append", type=Path, default=[])
    parser.add_argument("--release", action="store_true", help="Check required release metadata; NOT App Store approval")
    args = parser.parse_args()
    failures = []
    count = 0

    def fail(path, rule):
        # Never print the matched secret or surrounding source/log data.
        failures.append({"path": str(path), "rule": rule})

    def scan(path, label):
        nonlocal count
        if not path.is_file() or path.is_symlink():
            return
        count += 1
        data = path.read_bytes()
        for rule, pattern in PATTERNS.items():
            if pattern.search(data):
                fail(label, rule)
        # Report literal remote credentials, but permit documented local fixtures.
        for match in re.finditer(rb"postgres(?:ql)?://([^:\s/'\"]+):([^@\s'\"]+)@([^/\s'\"]+)", data):
            host = match[3].split(b":")[0]
            if host not in {b"localhost", b"127.0.0.1", b"db", b"postgres"} and b"${" not in match[0]:
                if match[2].lower() not in {b"password", b"your_password", b"<password>"}:
                    fail(label, "remote-database-credentials")

    paths = subprocess.check_output(
        ["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
        cwd=ROOT,
    ).decode("utf-8").split("\0")
    # Ignore generated bundles and unrelated uploads; scan tracked source/docs
    # and nonignored working source. No .env or credential output.
    for name in sorted(set(paths)):
        if not name:
            continue
        path = ROOT / name
        if path.suffix.lower() in PRIVATE_SUFFIXES:
            fail(name, "private-signing-file-in-worktree")
        if name.startswith(("iOS/", "backend/src/", "backend/test/", ".github/")):
            if path.suffix.lower() in {".swift", ".ts", ".js", ".cjs", ".json", ".plist", ".md", ".yml", ".yaml", ".sh", ".py"}:
                scan(path, name)

    info_path = (args.app / "Info.plist") if args.app else ROOT / "iOS/Resources/Info.plist"
    info = plistlib.loads(info_path.read_bytes())
    if not secure_url(info.get("LexiAPIBaseURL")):
        fail(info_path.name, "invalid-api-origin")
    if info.get("NSAppTransportSecurity"):
        fail(info_path.name, "ATS-exceptions-require-review")
    if info.get("NSUserTrackingUsageDescription") or info.get("UIBackgroundModes"):
        fail(info_path.name, "unexpected-tracking-or-background-mode")
    if not info.get("NSMicrophoneUsageDescription"):
        fail(info_path.name, "missing-microphone-purpose")
    if not re.fullmatch(r"\d+\.\d+\.\d+", str(info.get("CFBundleShortVersionString", ""))):
        fail(info_path.name, "invalid-marketing-version")
    if not re.fullmatch(r"[1-9]\d*", str(info.get("CFBundleVersion", ""))):
        fail(info_path.name, "invalid-build-number")
    metadata = {key: info.get(key) for key in
                ("CFBundleShortVersionString", "CFBundleVersion", "LexiBuildFlavor")}
    if args.app:
        for path in args.app.rglob("*"):
            # Provisioning profiles are expected in a signed dev bundle, not source.
            if path.is_file():
                scan(path, str(path.relative_to(args.app)))
        executable = args.app / info.get("CFBundleExecutable", "LexiIOS")
        if executable.is_file():
            metadata["executableSHA256"] = hashlib.sha256(executable.read_bytes()).hexdigest()
        else:
            fail("app", "missing-executable")
    for path in args.log:
        scan(path, path.name)
    if args.release:
        if not secure_url(info.get("LexiPrivacyPolicyURL")):
            fail(info_path.name, "public-privacy-policy-required")
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", str(info.get("LexiSupportEmail", ""))):
            fail(info_path.name, "support-email-required")
        if info.get("LexiBuildFlavor") != "production":
            fail(info_path.name, "production-flavor-required")
        if not args.app:
            fail("release", "built-app-required")
        elif not (args.app / "PrivacyInfo.xcprivacy").is_file():
            fail("app", "packaged-privacy-manifest-required")
    print(json.dumps({"passed": not failures, "filesScanned": count,
                      "metadata": metadata, "findings": failures}, indent=2))
    return bool(failures)


if __name__ == "__main__":
    sys.exit(main())
