const test = require('node:test');
const assert = require('node:assert/strict');

const { defaultConfig, normalizeBackend, validate, mergeWithPriority } = require('../src/core/config');
const { ZvibeError, ERRORS } = require('../src/core/errors');

test('normalizeBackend maps legacy aliases to zellij', () => {
  assert.equal(normalizeBackend('zellij'), 'zellij');
  assert.equal(normalizeBackend('ghostty'), 'zellij');
  assert.equal(normalizeBackend('tmux'), 'zellij');
  assert.equal(normalizeBackend('auto'), 'zellij');
});

test('validate accepts a strict, initialized config', () => {
  const cfg = {
    ...defaultConfig(),
    defaultAgent: 'codex',
    agentPair: ['claude', 'opencode'],
    initialized: true
  };
  assert.equal(validate(cfg, { strict: true }), true);
});

test('validate rejects invalid agent pair in strict mode', () => {
  const cfg = {
    ...defaultConfig(),
    defaultAgent: 'codex',
    agentPair: ['codex', 'unknown'],
    initialized: true
  };
  assert.throws(() => validate(cfg, { strict: true }), (error) => {
    assert.equal(error instanceof ZvibeError, true);
    assert.equal(error.code, ERRORS.CONFIG_INVALID);
    return true;
  });
});

test('validate accepts agent args arrays', () => {
  const cfg = {
    ...defaultConfig(),
    defaultAgent: 'codex',
    agentPair: ['codex', 'claude'],
    agentArgs: ['--foo'],
    codexArgs: ['--model', 'gpt-5'],
    initialized: true
  };
  assert.equal(validate(cfg, { strict: true }), true);
});

test('validate allows dangerously-skip-permissions in claudeArgs only', () => {
  const cfg = {
    ...defaultConfig(),
    defaultAgent: 'codex',
    agentPair: ['codex', 'claude'],
    claudeArgs: ['--dangerously-skip-permissions'],
    initialized: true
  };
  assert.equal(validate(cfg, { strict: true }), true);
});

test('validate rejects dangerously-skip-permissions in codexArgs', () => {
  const cfg = {
    ...defaultConfig(),
    defaultAgent: 'codex',
    agentPair: ['codex', 'claude'],
    codexArgs: ['--dangerously-skip-permissions'],
    initialized: true
  };
  assert.throws(() => validate(cfg, { strict: true }), (error) => {
    assert.equal(error instanceof ZvibeError, true);
    assert.equal(error.code, ERRORS.CONFIG_INVALID);
    return true;
  });
});

test('validate rejects non-array agent args', () => {
  const cfg = {
    ...defaultConfig(),
    codexArgs: '--dangerously-skip-permissions',
    initialized: true
  };
  assert.throws(() => validate(cfg, { strict: true }), (error) => {
    assert.equal(error instanceof ZvibeError, true);
    assert.equal(error.code, ERRORS.CONFIG_INVALID);
    return true;
  });
});

test('mergeWithPriority keeps CLI overrides and config defaults', () => {
  const merged = mergeWithPriority(
    { defaultAgent: 'claude', rightTerminal: true },
    {
      ...defaultConfig(),
      defaultAgent: 'codex',
      agentPair: ['codex', 'opencode'],
      codexArgs: ['--dangerously-skip-permissions'],
      backend: 'zellij',
      initialized: true
    }
  );
  assert.equal(merged.defaultAgent, 'claude');
  assert.deepEqual(merged.agentPair, ['codex', 'opencode']);
  assert.deepEqual(merged.codexArgs, ['--dangerously-skip-permissions']);
  assert.equal(merged.rightTerminal, true);
  assert.equal(merged.initialized, true);
});
