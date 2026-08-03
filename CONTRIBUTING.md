# Contributing to Budgero

Contributions are welcome — bug reports, fixes, and features alike. This document
explains how the project works and what a good contribution looks like.

## How this repository works

Budgero's day-to-day development happens on private infrastructure; this GitHub
repository is the project's public home. Issues and pull requests live here, reviews
happen here, and CI for pull requests runs here on GitHub-hosted runners.

When a PR is accepted, a maintainer merges it into the canonical repository and pushes
the result back — with your commits and authorship intact, so GitHub marks your PR as
merged. There may be a short delay between approval and the merge appearing on
`master`.

## Before you start

- **Bug fixes and small improvements** — open a PR directly.
- **Features and larger changes** — open an issue first so we can agree on the
  approach before you invest real time. Budgero is maintained by one person, and
  unsolicited large PRs may be declined simply because reviewing them responsibly
  isn't feasible.
- **Security issues** — never via a public issue or PR; see [SECURITY.md](./SECURITY.md).

## Development setup

See the [README](./README.md#development-setup). Short version: Node.js 22+, pnpm 11+,
Go 1.26+, then:

```bash
pnpm install
pnpm run setup:dev
pnpm run dev:selfhost
```

## Quality gates

CI runs these on every PR; running them locally first saves a round-trip:

```bash
pnpm run type-check:all   # tsc across core, runtime, app
pnpm run lint:app         # eslint (also :core, :runtime, :server)
pnpm run test:core        # domain logic tests (also test:app, test:server)
pnpm run build:all        # full production build
```

Pre-commit hooks (husky + lint-staged) format and lint staged files automatically.

## Commit style

Terse conventional commits, matching the existing history: `fix(import): …`,
`feat(budget): …`, `chore: …`. No long bodies needed.

## Developer Certificate of Origin

Budgero uses the [DCO](https://developercertificate.org/) instead of a CLA. By signing
off a commit you certify that you wrote the change (or otherwise have the right to
submit it) under the project's license. You keep the copyright on your contribution.

Every commit must carry a `Signed-off-by` trailer. Git adds it for you:

```bash
git commit -s
```

Forgot some? Fix up your branch and force-push:

```bash
git rebase --signoff origin/master
git push --force-with-lease
```

CI rejects PRs containing unsigned commits.

## Licensing

- Budgero is licensed [AGPL-3.0-only](./LICENSE). Contributions are accepted under the
  same license (inbound = outbound) — no copyright assignment, no CLA.
- The exception is `packages/sdk-python`, which is MIT-licensed; contributions to it
  are accepted under MIT.
- **Parity promise:** Budgero Cloud and Self-Host are built from this same public
  source with 1:1 feature parity. Your contribution ships in both editions.

## Supporting the project without code

Not every contribution is a pull request. Reporting bugs well, answering other users'
questions, [donating](https://budgero.app/donate), or starring the repository all
genuinely help a one-person project.

## Conduct

Be respectful in issues and discussions. Abusive or harassing behavior can be
reported to hello@budgero.app and may result in interactions being restricted.
