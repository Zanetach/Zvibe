const test = require('node:test');
const assert = require('node:assert/strict');

const {
  isClaudeAvailable,
  getClaudeUpgradeInvocations,
  withAgentEnv,
  agentUnsetVars,
  configuredAgentArgs,
  parseArgList,
  getClaudePermissionToggles,
  applyClaudePermissionToggles
} = require('../src/cli');

test('isClaudeAvailable accepts claude command availability', () => {
  assert.equal(isClaudeAvailable({ claude: true }), true);
});

test('isClaudeAvailable accepts claude-code command availability', () => {
  assert.equal(isClaudeAvailable({ claude: false, 'claude-code': true }), true);
});

test('getClaudeUpgradeInvocations prioritizes claude before legacy claude-code', () => {
  const invocations = getClaudeUpgradeInvocations({
    claude: true,
    'claude-code': true
  });
  assert.deepEqual(invocations, [
    ['claude', 'update'],
    ['claude', 'upgrade'],
    ['claude-code', 'update'],
    ['claude-code', 'upgrade']
  ]);
});

test('getClaudeUpgradeInvocations omits unavailable commands', () => {
  const invocations = getClaudeUpgradeInvocations({
    claude: false,
    'claude-code': true
  });
  assert.deepEqual(invocations, [
    ['claude-code', 'update'],
    ['claude-code', 'upgrade']
  ]);
});

test('withAgentEnv clears codex session variables in smart isolation mode', () => {
  const command = withAgentEnv('codex', 'codex', {});
  assert.match(command, /env /);
  assert.match(command, /-u CODEX_THREAD_ID/);
  assert.doesNotMatch(command, /-u CODEX_SANDBOX/);
  assert.match(command, /-u CLAUDECODE/);
  assert.match(command, /ZVIBE_AGENT=codex codex$/);
});

test('agentUnsetVars supports strict and keep/unset overrides', () => {
  const strict = agentUnsetVars({ ZVIBE_AGENT_ENV_ISOLATION: 'strict' });
  assert.equal(strict.includes('CODEX_THREAD_ID'), true);
  assert.equal(strict.includes('CODEX_SANDBOX'), true);

  const off = agentUnsetVars({ ZVIBE_AGENT_ENV_ISOLATION: 'off' });
  assert.deepEqual(off, []);

  const custom = agentUnsetVars({
    ZVIBE_AGENT_ENV_ISOLATION: 'smart',
    ZVIBE_AGENT_ENV_UNSET: 'FOO,BAR',
    ZVIBE_AGENT_ENV_KEEP: 'CODEX_THREAD_ID,BAR'
  });
  assert.equal(custom.includes('CLAUDECODE'), true);
  assert.equal(custom.includes('FOO'), true);
  assert.equal(custom.includes('BAR'), false);
  assert.equal(custom.includes('CODEX_THREAD_ID'), false);
});

test('agentUnsetVars escalates smart isolation when agent contamination is detected', () => {
  const vars = agentUnsetVars({
    ZVIBE_AGENT_ENV_ISOLATION: 'smart',
    CODEX_CI: '1',
    CODEX_SANDBOX: 'workspace-write'
  });
  assert.equal(vars.includes('CLAUDECODE'), true);
  assert.equal(vars.includes('CODEX_THREAD_ID'), true);
  assert.equal(vars.includes('CODEX_CI'), true);
  assert.equal(vars.includes('CODEX_SANDBOX'), true);
});

test('configuredAgentArgs merges global and per-agent args', () => {
  const args = configuredAgentArgs({
    agentArgs: ['--global'],
    codexArgs: ['--dangerously-skip-permissions']
  }, 'codex');
  assert.deepEqual(args, ['--global', '--dangerously-skip-permissions']);
});

test('parseArgList supports csv and json array strings', () => {
  assert.deepEqual(parseArgList('--a,--b'), ['--a', '--b']);
  assert.deepEqual(parseArgList('["--x","--y"]'), ['--x', '--y']);
});

test('getClaudePermissionToggles detects bypass and skip flags', () => {
  const toggles = getClaudePermissionToggles([
    '--foo',
    '--permission-mode',
    'bypassPermissions',
    '--dangerously-skip-permissions'
  ]);
  assert.deepEqual(toggles, {
    bypassPermissions: true,
    skipPermissions: true
  });
});

test('applyClaudePermissionToggles toggles fixed claude permission flags only', () => {
  const next = applyClaudePermissionToggles([
    '--model',
    'sonnet',
    '--permission-mode=bypassPermissions',
    '--dangerously-skip-permissions'
  ], {
    bypassPermissions: false,
    skipPermissions: true
  });
  assert.deepEqual(next, [
    '--model',
    'sonnet',
    '--dangerously-skip-permissions'
  ]);
});
