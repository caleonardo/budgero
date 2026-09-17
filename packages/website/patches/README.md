# Contentlayer tracing compatibility

Contentlayer 0.5.8 depends on OpenTelemetry 1.x packages with known vulnerabilities.
The security overrides in `pnpm-workspace.yaml` and this website's `package.json`
upgrade the telemetry packages together to 2.x. The website has its own Bun
lockfile because its Docker build installs independently of the pnpm workspace.

The patch replaces the removed `Resource` constructor and `addSpanProcessor`
setup with OpenTelemetry 2 APIs. It preserves Contentlayer's opt-in tracing and
flushes the provider when the Effect layer closes. Both package managers apply
the same patch. Keep both override sets and lockfiles in sync when updating it.

Run `pnpm --dir packages/website run test:tracing` to verify the default dummy
tracer and actual span delivery to a local OTLP/gRPC collector. Also build the
website with pnpm and its Bun Dockerfile. Remove this patch when Contentlayer
supports a patched OpenTelemetry release directly.
