import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../mcp/server.js';

// Connect a real MCP client to the server over an in-memory pipe.
const connect = async () => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await createServer().connect(serverSide);
  const client = new Client({ name: 'test', version: '1.0.0' });
  await client.connect(clientSide);
  return client;
};

const call = async (client, name, args = {}) => (await client.callTool({ name, arguments: args })).content[0].text;

test('lists every lesson file as a tool result and a resource', async () => {
  const client = await connect();
  const list = await call(client, 'list_lessons');
  assert.match(list, /algorithms\/big-o: Big O/);
  assert.match(list, /data-structures\/hash-tables: Hash Tables/);
  const { resources } = await client.listResources();
  assert.ok(resources.some((r) => r.uri === 'dsa://algorithms/sorting'));
  const read = await client.readResource({ uri: 'dsa://algorithms/sorting' });
  assert.match(read.contents[0].text, /^# Sorting/);
});

test('get_lesson reports unknown ids as errors', async () => {
  const client = await connect();
  const result = await client.callTool({ name: 'get_lesson', arguments: { section: 'algorithms', lesson: 'nope' } });
  assert.equal(result.isError, true);
});

test('trace tools return the same steps the website uses', async () => {
  const client = await connect();
  const sort = await call(client, 'trace_sort', { algorithm: 'merge', values: [5, 2, 9, 1] });
  assert.match(sort, /Sorted\.\s+\[1, 2, 5, 9\]/);
  const search = await call(client, 'trace_binary_search', { values: [9, 3, 14, 21, 30], target: 21 });
  assert.match(search, /Found at index 3/);
  const grid = await call(client, 'trace_graph_search', { mode: 'bfs', rows: 3, cols: 3, walls: ['1,1'] });
  assert.match(grid, /Path length: 4 steps/);
  const hash = await call(client, 'trace_hash', { keys: ['cat', 'act'] });
  assert.match(hash, /bucket 4: "cat" → "act"/);
  const bst = await call(client, 'trace_bst', { values: [1, 2, 3, 4], search: 4 });
  assert.match(bst, /Height: 4/);
  assert.match(bst, /1 → 2 → 3 → 4 → found/);
});

test('rejects out-of-range input', async () => {
  const client = await connect();
  const result = await client.callTool({ name: 'trace_sort', arguments: { algorithm: 'bubble', values: [] } });
  assert.equal(result.isError, true);
});
