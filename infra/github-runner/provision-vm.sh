#!/usr/bin/env bash
# Run as root inside the dedicated Ubuntu 24.04 VM.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git jq unzip zip zstd build-essential python3 \
  libicu74 libssl3 libkrb5-3 liblttng-ust1t64 docker.io docker-buildx qemu-user-static binfmt-support
id runner >/dev/null 2>&1 || useradd --create-home --shell /bin/bash runner
usermod -aG docker runner
systemctl enable --now docker
install -d -o runner -g runner /opt/actions-runner
runner_version=2.337.0
runner_sha256=70920811a4f8ad4328818682bca5c6469c1c942fab52448868071d0063816613
archive=$(mktemp)
trap 'rm -f "$archive"' EXIT
curl --fail --location --retry 3 "https://github.com/actions/runner/releases/download/v${runner_version}/actions-runner-linux-x64-${runner_version}.tar.gz" -o "$archive"
printf '%s  %s\n' "$runner_sha256" "$archive" | sha256sum --check -
tar -xzf "$archive" -C /opt/actions-runner
chown -R runner:runner /opt/actions-runner
/opt/actions-runner/bin/installdependencies.sh
