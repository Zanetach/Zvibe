# Release Notes v2.0.15

Date: 2026-03-06

## Highlights

- Full republish with version bump to `2.0.15`.
- Removed historical package artifacts from workspace/repo context.
- Regenerated a fresh full package tarball for the current codebase.

## Details

### Packaging
- Removed old `zanetach-zvibe-*.tgz` artifacts before packing.
- Published package file is now:
  - `zanetach-zvibe-2.0.15.tgz`

## Validation

- `npm run verify:all`
- `npm pack --cache ./.npm-cache`
