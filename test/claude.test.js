const test = require('node:test');
const assert = require('node:assert/strict');

const { isClaudeAvailable, getClaudeUpgradeInvocations } = require('../src/cli');

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
