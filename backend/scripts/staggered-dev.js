'use strict';

const { spawn } = require('node:child_process');
const path = require('node:path');

const backendRoot = path.join(__dirname, '..');

/** Auth first; gateway has no DB pool; remaining services stagger to avoid connection spikes. */
const STARTUP_PLAN = [
  { name: 'auth', script: 'start:auth', delayMs: 0 },
  { name: 'gateway', script: 'start:gateway', delayMs: 1000 },
  { name: 'user', script: 'start:user', delayMs: 3000 },
  { name: 'registration', script: 'start:registration', delayMs: 5500 },
  { name: 'content', script: 'start:content', delayMs: 8000 },
  { name: 'gallery', script: 'start:gallery', delayMs: 10500 },
  { name: 'atlas', script: 'start:atlas', delayMs: 13000 },
  { name: 'events', script: 'start:events', delayMs: 15500 },
  { name: 'notify', script: 'start:notification', delayMs: 18000 },
];

const children = [];

function startService({ name, script }) {
  console.log(`[dev] Starting ${name}…`);
  const child = spawn('npm', ['run', script], {
    cwd: backendRoot,
    shell: true,
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[dev] ${name} exited with code ${code}`);
    }
  });
  children.push(child);
}

for (const entry of STARTUP_PLAN) {
  setTimeout(() => startService(entry), entry.delayMs);
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
