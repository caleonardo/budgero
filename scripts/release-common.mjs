import { execFileSync } from 'node:child_process';

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
