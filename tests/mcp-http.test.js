import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import handler from '../api/mcp.js';

// Serve the Vercel handler from a local HTTP server, as Vercel would.
const listen = () =>
  new Promise((resolve) => {
    const http = createHttpServer((req, res) => handler(req, res));
    http.listen(0, () => resolve(http));
  });

test('the remote connector answers MCP over Streamable HTTP', async () => {
  const http = await listen();
  const url = new URL(`http://127.0.0.1:${http.address().port}/mcp`);
  const client = new Client({ name: 'test', version: '1.0.0' });
  try {
    await client.connect(new StreamableHTTPClientTransport(url));
    const { tools } = await client.listTools();
    assert.ok(tools.every((tool) => tool.annotations?.readOnlyHint === true && tool.title));
    const result = await client.callTool({ name: 'trace_hash', arguments: { keys: ['cat', 'act'] } });
    assert.match(result.content[0].text, /bucket 4: "cat" → "act"/);

    const get = await fetch(url);
    assert.equal(get.status, 405);
  } finally {
    await client.close();
    http.close();
  }
});
