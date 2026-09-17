import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function findLinuxBinary(distDir, arch) {
  const candidates = readdirSync(distDir, { withFileTypes: true }).filter(
    (entry) => entry.isDirectory() && entry.name.startsWith(`budgero_linux_${arch}_`)
  );
  if (candidates.length !== 1) {
    throw new Error(`Expected one GoReleaser build directory for linux/${arch}`);
  }
  const binary = join(distDir, candidates[0].name, 'budgero');
  if (!statSync(binary).isFile()) throw new Error(`Missing GoReleaser binary for linux/${arch}`);
  return binary;
}

export function assertReleaseTag(tag, cwd = process.cwd()) {
  if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag)) throw new Error('Invalid release version');
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  if (git('rev-parse', `${tag}^{commit}`) !== git('rev-parse', 'HEAD')) {
    throw new Error(
      `${tag} must already point to HEAD; release tags are never created or moved by publishing.`
    );
  }
}

export function dockerLogin(username, token) {
  if (!token) throw new Error('DOCKER_TOKEN is required');
  execFileSync('docker', ['login', '--username', username, '--password-stdin'], {
    input: token,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
}
