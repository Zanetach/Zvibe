# Release Notes v2.0.14

Date: 2026-03-06

## Highlights

- Claude agent install flow now uses the official installer script:
  - `curl -fsSL https://claude.ai/install.sh | bash`
- Claude managed upgrade flow now supports both command variants for compatibility:
  - `claude update`
  - `claude upgrade`
  - fallback support for legacy `claude-code update|upgrade`
- Zellij layout sizing was simplified to avoid hard-coded `94%` container widths and improve pane behavior.
- Repository cleanup removes the legacy `video/` demo package and old packed artifacts from version control.

## Details

### Claude Agent Ops
- `zvibe setup` installs Claude through the official installer instead of Homebrew cask management.
- `zvibe update` upgrades Claude using CLI-native commands, preferring `update` and falling back to `upgrade`.
- Added tests covering Claude command detection and upgrade invocation order.

### Layout
- Terminal-only and standard workspace layouts no longer depend on fixed outer pane sizing.
- Left top pane role label changed from `file` to `project` in zellij layout metadata.

### Docs
- README now documents the official Claude install path and the update/upgrade compatibility behavior.

## Validation

- `npm run verify:all`
- `npm pack`
