const test = require('node:test');
const assert = require('node:assert/strict');

const { spawnSync } = require('child_process');
const path = require('path');

const { shouldTreatFirstPositionalAsRunTarget, parseArgv, buildCommitPaneCommand } = require('../src/cli');

test('shouldTreatFirstPositionalAsRunTarget rejects plain unknown command token', () => {
  assert.equal(shouldTreatFirstPositionalAsRunTarget('v'), false);
});

test('shouldTreatFirstPositionalAsRunTarget accepts explicit path-like token', () => {
  assert.equal(shouldTreatFirstPositionalAsRunTarget('./docs'), true);
});

test('shouldTreatFirstPositionalAsRunTarget accepts existing directory token', () => {
  assert.equal(shouldTreatFirstPositionalAsRunTarget('docs'), true);
});

test('parseArgv recognizes -help as help flag', () => {
  const parsed = parseArgv(['-help']);
  assert.equal(parsed.flags.help, true);
});

test('parseArgv keeps unknown single-dash token in unknownFlags bucket', () => {
  const parsed = parseArgv(['-unknown']);
  assert.deepEqual(parsed.flags.unknownFlags, ['-unknown']);
});

test('buildCommitPaneCommand keeps keifu pane persistent by default', () => {
  const command = buildCommitPaneCommand();
  assert.match(command, /while true; do keifu;/);
});

test('cli returns error for unknown config subcommand', () => {
  const cliPath = path.join(__dirname, '..', 'src', 'cli.js');
  const result = spawnSync(process.execPath, [cliPath, 'config', 'foobar'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  assert.equal(result.status, 1);
  assert.match(`${result.stdout}\n${result.stderr}`, /未知 config 子命令/);
});

test('cli returns error for unknown top-level flag', () => {
  const cliPath = path.join(__dirname, '..', 'src', 'cli.js');
  const result = spawnSync(process.execPath, [cliPath, '--no-such-flag'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  assert.equal(result.status, 1);
  assert.match(`${result.stdout}\n${result.stderr}`, /未知参数/);
});
