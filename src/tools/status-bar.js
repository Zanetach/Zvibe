#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const TICK_MS = 1000;
const RESCAN_EVERY = 30;
const SPINNER = ['|', '/', '-', '\\'];
const CPU_BARS = '▁▂▃▄▅▆▇█';

let spin = 0;
let tick = 0;
let cpuHistory = [];
let tokenSource = null;
let prevCpu = readCpuSnapshot();
let prevNet = readNetworkBytes();
let prevAt = Date.now();

function readCpuSnapshot() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  cpus.forEach((cpu) => {
    Object.values(cpu.times).forEach((n) => { total += n; });
    idle += cpu.times.idle;
  });
  return { idle, total };
}

function readCpuPercent() {
  const next = readCpuSnapshot();
  const idleDelta = next.idle - prevCpu.idle;
  const totalDelta = next.total - prevCpu.total;
  prevCpu = next;
  if (totalDelta <= 0) return 0;
  return Math.max(0, Math.min(100, (1 - (idleDelta / totalDelta)) * 100));
}

function readNetworkBytes() {
  try {
    const output = execSync('netstat -ibn', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const lines = output.split('\n').filter(Boolean);
    if (lines.length < 2) return 0;
    const header = lines[0].trim().split(/\s+/);
    const iBytesIdx = header.indexOf('Ibytes');
    const oBytesIdx = header.indexOf('Obytes');
    if (iBytesIdx < 0 || oBytesIdx < 0) return 0;

    let total = 0;
    for (let i = 1; i < lines.length; i += 1) {
      const cols = lines[i].trim().split(/\s+/);
      if (cols.length <= Math.max(iBytesIdx, oBytesIdx)) continue;
      const name = cols[0];
      if (name === 'lo0') continue;
      const iBytes = Number(cols[iBytesIdx]);
      const oBytes = Number(cols[oBytesIdx]);
      if (Number.isFinite(iBytes)) total += iBytes;
      if (Number.isFinite(oBytes)) total += oBytes;
    }
    return total;
  } catch {
    return 0;
  }
}

function formatRate(bytesPerSecond) {
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let value = bytesPerSecond;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)}${units[idx]}`;
}

function formatPercent(v) {
  return `${Math.round(v)}%`;
}

function sparkline(values) {
  if (!values.length) return '';
  return values.map((value) => {
    const idx = Math.max(0, Math.min(CPU_BARS.length - 1, Math.floor((value / 100) * (CPU_BARS.length - 1))));
    return CPU_BARS[idx];
  }).join('');
}

function latestMtime(filePath) {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}

function findLatestTokenFile(baseDir, depth = 0) {
  if (depth > 3) return null;
  let best = null;
  let entries = [];
  try {
    entries = fs.readdirSync(baseDir, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const entry of entries) {
    const full = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      const child = findLatestTokenFile(full, depth + 1);
      if (child && (!best || child.mtime > best.mtime)) best = child;
      continue;
    }
    if (!entry.isFile()) continue;
    if (!/\.(jsonl|json|log|txt)$/i.test(entry.name)) continue;
    const mtime = latestMtime(full);
    if (!best || mtime > best.mtime) best = { file: full, mtime };
  }
  return best;
}

function detectTokenSource() {
  const home = os.homedir();
  const candidates = [
    path.join(home, '.codex'),
    path.join(home, '.claude'),
    path.join(home, '.config', 'opencode')
  ];
  let best = null;
  for (const base of candidates) {
    const found = findLatestTokenFile(base);
    if (!found) continue;
    if (!best || found.mtime > best.mtime) best = found;
  }
  return best ? best.file : null;
}

function readTail(filePath, maxBytes = 200 * 1024) {
  try {
    const stat = fs.statSync(filePath);
    const start = Math.max(0, stat.size - maxBytes);
    const size = stat.size - start;
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(size);
    fs.readSync(fd, buf, 0, size, start);
    fs.closeSync(fd);
    return buf.toString('utf8');
  } catch {
    return '';
  }
}

function parseTokenUsage(text) {
  if (!text) return null;

  const totalPatterns = [
    /"total_tokens"\s*:\s*(\d+)/g,
    /total_tokens\s*[=:]\s*(\d+)/gi
  ];
  for (const pattern of totalPatterns) {
    let match;
    let last = null;
    while ((match = pattern.exec(text)) !== null) last = Number(match[1]);
    if (Number.isFinite(last)) return last;
  }

  const inputMatches = [...text.matchAll(/"input_tokens"\s*:\s*(\d+)/g)].map((m) => Number(m[1]));
  const outputMatches = [...text.matchAll(/"output_tokens"\s*:\s*(\d+)/g)].map((m) => Number(m[1]));
  if (inputMatches.length && outputMatches.length) {
    const inLast = inputMatches[inputMatches.length - 1];
    const outLast = outputMatches[outputMatches.length - 1];
    if (Number.isFinite(inLast) && Number.isFinite(outLast)) return inLast + outLast;
  }
  return null;
}

function readTokenUsage() {
  if (!tokenSource) return null;
  const tail = readTail(tokenSource);
  return parseTokenUsage(tail);
}

function shorten(text, max) {
  if (!max || text.length <= max) return text;
  if (max <= 1) return text.slice(0, max);
  return `${text.slice(0, max - 1)}…`;
}

function render() {
  tick += 1;
  spin = (spin + 1) % SPINNER.length;

  if (!tokenSource || tick % RESCAN_EVERY === 1) {
    tokenSource = detectTokenSource();
  }

  const now = Date.now();
  const elapsed = Math.max(0.2, (now - prevAt) / 1000);
  prevAt = now;

  const cpu = readCpuPercent();
  cpuHistory.push(cpu);
  if (cpuHistory.length > 12) cpuHistory = cpuHistory.slice(-12);

  const memUsed = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
  const netNow = readNetworkBytes();
  const netRate = Math.max(0, (netNow - prevNet) / elapsed);
  prevNet = netNow;
  const tokenUsage = readTokenUsage();

  const left = `󰍛 ${formatPercent(cpu)} ${sparkline(cpuHistory)}  󰘚 ${formatPercent(memUsed)}  󰖟 ${formatRate(netRate)}`;
  const tokenLabel = tokenUsage == null ? '󰏗 --' : `󰏗 ${tokenUsage.toLocaleString()}`;
  const sourceLabel = tokenSource ? path.basename(tokenSource) : 'no-source';
  const right = `${tokenLabel}  ${SPINNER[spin]} ${sourceLabel}`;
  const line = `${left}  |  ${right}`;

  if (!process.stdout.isTTY) {
    process.stdout.write(`${line}\n`);
    return;
  }

  const max = process.stdout.columns || 120;
  process.stdout.write(`\x1b[2K\r${shorten(line, max)}`);
}

process.on('SIGINT', () => {
  process.stdout.write('\n');
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.stdout.write('\n');
  process.exit(0);
});

render();
setInterval(render, TICK_MS);
