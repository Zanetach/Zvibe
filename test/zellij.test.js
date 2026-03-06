const test = require('node:test');
const assert = require('node:assert/strict');

const { sessionName, normalizeSessionInput, filterZvibeSessions, shellWrap } = require('../src/backends/zellij');

test('sessionName normalizes target dir and appends session tag', () => {
  const name = sessionName('/Users/zane/Documents/Coderepo/zvibe-kits', 'codex-ab12');
  assert.equal(name, 'zvibe-codex-ab12');
});

test('sessionName falls back to workspace on empty base', () => {
  const name = sessionName('/', 'terminal-xx22');
  assert.equal(name, 'workspace-terminal-xx22');
});

test('normalizeSessionInput trims surrounding spaces', () => {
  assert.equal(normalizeSessionInput('  demo-session  '), 'demo-session');
});

test('filterZvibeSessions keeps legacy and current zvibe sessions only', () => {
  const output = [
    'zippy-weasel',
    'zvibe-legacy-aa11',
    'Coderepo-claude-ga41',
    'Coderepo-codex-xy22',
    'RandomSession',
    'workspace-terminal-ab12'
  ].join('\n');
  const filtered = filterZvibeSessions(output);
  assert.deepEqual(filtered, [
    'zvibe-legacy-aa11',
    'Coderepo-claude-ga41',
    'Coderepo-codex-xy22',
    'workspace-terminal-ab12'
  ]);
});

test('shellWrap keeps pane exit hint and opens login shell', () => {
  const wrapped = shellWrap('/tmp/demo', 'keifu');
  assert.match(wrapped, /; keifu; _zvibe_code=\$\?/);
  assert.match(wrapped, /pane command exited/);
  assert.match(wrapped, /exec .* -l$/);
});

test('shellWrap keeps pane alive when cd fails and command is empty', () => {
  const wrapped = shellWrap('/tmp/missing-dir', '');
  assert.match(wrapped, /cd '\/tmp\/missing-dir' \|\| printf '\[zvibe\] warning: failed to enter/);
  assert.match(wrapped, /; :; _zvibe_code=\$\?/);
  assert.match(wrapped, /exec .* -l$/);
});
