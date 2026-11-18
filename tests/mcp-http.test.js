import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import * as route from '../app/mcp/route.js';

// Call the Next.js route handlers directly, as the server would.
const routeFetch = (url, init = {}) => route[(init.method ?? 'GET').toUpperCase()](new Request(url, init));

test('the remote connector answers MCP over Streamable HTTP', async () => {
  const url = new URL('http://localhost/mcp');
  const client = new Client({ name: 'test', version: '1.0.0' });
  try {
    await client.connect(new StreamableHTTPClientTransport(url, { fetch: routeFetch }));
    const { tools } = await client.listTools();
    assert.ok(tools.every((tool) => tool.annotations?.readOnlyHint === true && tool.title));
    const result = await client.callTool({ name: 'trace_hash', arguments: { keys: ['cat', 'act'] } });
    assert.match(result.content[0].text, /bucket 4: "cat" → "act"/);

    const get = await routeFetch(url);
    assert.equal(get.status, 405);
  } finally {
    await client.close();
  }
});
