import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { realpathSync } from 'node:fs';
import http2 from 'node:http2';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
// Resolve the adapter actually used by Contentlayer in both pnpm and Bun installs.
const require = createRequire(fileURLToPath(new URL('../package.json', import.meta.url)));
const cli = realpathSync(
  path.join(path.dirname(require.resolve('contentlayer2/package.json')), '../@contentlayer2/cli')
);
const utils = realpathSync(path.join(cli, '../utils'));
const { T, OT } = await import(pathToFileURL(path.join(utils, 'dist/effect/index.js')));
const { provideTracing } = await import(
  pathToFileURL(path.join(utils, 'dist/tracing-effect/index.js'))
);
const server = http2.createServer();
const requests = [];
const sessions = new Set();
server.on('session', (s) => {
  sessions.add(s);
  s.on('close', () => sessions.delete(s));
});
server.on('stream', (stream, headers) => {
  const chunks = [];
  stream.on('data', (data) => chunks.push(data));
  stream.on('end', () => {
    requests.push({ path: headers[':path'], body: Buffer.concat(chunks) });
    stream.respond(
      { ':status': 200, 'content-type': 'application/grpc' },
      { waitForTrailers: true }
    );
    stream.on('wantTrailers', () => stream.sendTrailers({ 'grpc-status': '0' }));
    stream.end(Buffer.alloc(5));
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
process.env.OTEL_EXPORTER_OTLP_ENDPOINT = `http://127.0.0.1:${server.address().port}`;
process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
process.env.OTEL_TRACES_SAMPLER = 'always_on';
let timeout;
try {
  const deadline = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error('Tracing export timed out')), 10000);
  });
  for (const mode of ['dummy', 'otel']) {
    assert.equal(
      await Promise.race([
        T.runPromise(
          provideTracing(
            'budgero-security-smoke',
            mode
          )(OT.withSpan('compatibility-span')(T.succeed('ok')))
        ),
        deadline,
      ]),
      'ok'
    );
  }
  assert.equal(requests.length, 1);
  assert.equal(requests[0].path, '/opentelemetry.proto.collector.trace.v1.TraceService/Export');
  assert.ok(requests[0].body.includes(Buffer.from('compatibility-span')));
  assert.ok(requests[0].body.includes(Buffer.from('budgero-security-smoke')));
  console.log(
    'PASS: dummy tracing stays local; real OTel span delivered to local gRPC collector and flushed on shutdown'
  );
} finally {
  clearTimeout(timeout);
  for (const session of sessions) session.destroy();
  await new Promise((resolve) => server.close(resolve));
}
