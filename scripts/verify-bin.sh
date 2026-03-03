#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

FAKE_PREFIX="$TMP_DIR/prefix"
mkdir -p "$FAKE_PREFIX/bin"

# Simulate npm global bin symlink behavior.
ln -s "$ROOT_DIR/bin/zvibe" "$FAKE_PREFIX/bin/zvibe"

if ! "$FAKE_PREFIX/bin/zvibe" --help >/dev/null 2>&1; then
  echo "verify:bin failed: zvibe could not run from symlinked global bin path."
  "$FAKE_PREFIX/bin/zvibe" --help || true
  exit 1
fi

echo "verify:bin passed"
