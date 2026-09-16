# Dell GitHub Actions runner

The Dell runs `budgero-ci`, a dedicated Ubuntu 24.04 LXD VM with 8 vCPUs,
12 GiB RAM and a 100 GiB virtual disk. Its GitHub runner is `dell-budgero-ci`,
labelled `budgero-build`. Docker runs inside the VM; the Dell's Docker socket
and service directories are not mounted into it. LXD manages this VM, so it
will not appear as a Portainer container.

## Network and access

The `budgerobr0` bridge uses `10.203.77.1/24`. The host firewall script blocks
runner connections to private networks, the tailnet, and host services, except
for the bridge's DNS and DHCP. Public internet access is allowed. IPv6 routing
is disabled on the bridge. The systemd unit reapplies the rules at boot and
when Docker restarts. `budgero-ci-vm.service` starts the VM only after those
rules are installed; LXD automatic startup is disabled for this VM. Restarting
the host Docker service also restarts the VM, interrupting any active job.
Do not attach other instances to this dedicated bridge.

GitHub requires approval for all outside contributors' workflows. Review
workflow changes before approving them: a public repository's contributor can
request a self-hosted label. The routing condition in `ci.yml` is not a security
boundary. Do not approve such a change for an outside PR. This is a persistent
VM; do not treat it as a disposable sandbox for untrusted code.

## Operations

Run these commands on the Dell as `aleksa`:

```sh
lxc list budgero-ci
lxc exec budgero-ci -- systemctl status actions.runner.tombadilo-bombadilo-budgero.dell-budgero-ci.service
lxc exec budgero-ci -- journalctl -u actions.runner.tombadilo-bombadilo-budgero.dell-budgero-ci.service -n 60
sudo systemctl status budgero-ci-firewall
```

The runner updates itself. Update Ubuntu packages inside the VM periodically.
Only one runner is registered, so web and server jobs queue rather than running
simultaneously. Keep at least 30 GiB free on the host and monitor disk use in
the VM. Docker caches belong to the VM, not the Dell host.

`provision-vm.sh` installs the initial runner and dependencies inside the VM.
`firewall.sh` is installed as `/usr/local/sbin/budgero-ci-firewall` on the Dell,
and the accompanying unit goes in `/etc/systemd/system/`.
Registration tokens must be supplied at setup time, never committed.

## Repository workflow

GitHub is the primary remote (`origin`). The previous remote is retained as
`forgejo`; its private history is untouched. Push development branches and
`master` to GitHub. A manual `git push forgejo master:master` updates the private
copy; scheduled reverse mirroring is not configured yet.

## Migration controls

- `DELL_RUNNER_ENABLED=true` selects this runner for pushes to GitHub `master`.
  PR checks always select GitHub-hosted runners.
- Unset that repository variable, or set it to `false`, to send future master
  jobs back to GitHub-hosted runners. Cancel/re-run jobs already queued for Dell.
- `runner-check.yml` builds the app and Go server without publishing artifacts.
- GitHub release jobs require `DELL_RELEASES_ENABLED=true`, a version tag matching
  `package.json`, and the protected `production` environment. They run both
  vulnerability scanners before publishing and remove local credential files.
- Existing Forgejo release workflows stay active until the release credentials
  and GitHub release jobs are migrated and verified. Do not trigger both systems
  for the same release.
- Preserve Forgejo's private `pre-oss-history` branch. Never use `git push --mirror`
  to publish this checkout to GitHub.

Release migration still requires Docker Hub and Google Cloud credentials, plus
SaaS build configuration. Configure production credentials in a GitHub environment
restricted to approved release refs before enabling publication.
