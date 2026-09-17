import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const all = () => ({ app: true, website: true, server: true });

export function planChanges(paths) {
  const plan = { app: false, website: false, server: false };
  for (const path of paths) {
    // Dependency patches affect the shared workspace installation.
    if (path.startsWith('packages/website/patches/')) return all();
    // The web job invokes the server's package.json build script too.
    if (path === 'packages/server/package.json') {
      plan.app = true;
      plan.server = true;
      continue;
    }
    if (path.startsWith('packages/website/') || path === 'scripts/i18n/audit-website.mjs') {
      plan.website = true;
    } else if (/^packages\/(app|core|runtime|eslint-config)\//.test(path) || path.startsWith('scripts/i18n/')) {
      plan.app = true;
    } else if (path.startsWith('packages/server/')) {
      plan.server = true;
    } else if (
      /^(README|CONTRIBUTING|SECURITY)\.md$/.test(path) ||
      /^docs\/.*\.md$/.test(path) ||
      path.startsWith('.github/ISSUE_TEMPLATE/') ||
      path === '.github/PULL_REQUEST_TEMPLATE.md'
    ) {
      // Repository prose and issue templates have no build consumers.
    } else {
      // Workflow, lockfile, tooling, shared configuration, and unknown paths
      // retain the full existing check set rather than risking a missed consumer.
      return all();
    }
  }
  return plan;
}

export function changedPaths(base, head, pullRequest, cwd = process.cwd()) {
  if (![base, head].every((sha) => /^[a-f0-9]{40}$/.test(sha) && !/^0+$/.test(sha))) {
    return null;
  }
  try {
    // PRs use the entire merge-base diff; pushes use the complete before/after
    // range. Disable rename detection so both old and new consumers are checked.
    const range = `${base}${pullRequest ? '...' : '..'}${head}`;
    return execFileSync('git', ['diff', '--name-only', '--no-renames', '-z', range, '--'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).split('\0').filter(Boolean);
  } catch {
    // A force push or unavailable base must run all checks, never skip them.
    return null;
  }
}

export function planEvent(event, cwd) {
  const pr = event.pull_request;
  const paths = changedPaths(pr?.base.sha ?? event.before, pr?.head.sha ?? event.after, Boolean(pr), cwd);
  return paths === null ? all() : planChanges(paths);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const plan = planEvent(event);
  const output = Object.entries(plan).map(([key, value]) => `${key}=${value}`).join('\n') + '\n';
  appendFileSync(process.env.GITHUB_OUTPUT, output);
  console.log(output);
}
