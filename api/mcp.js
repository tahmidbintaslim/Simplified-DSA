/**
 * Remote MCP connector: the same server as mcp/server.js, over HTTPS.
 *
 * Vercel runs this as a serverless function, reachable at
 * https://dsa.tahmid.space/mcp (see the rewrite in vercel.json). Claude and
 * other MCP clients add that URL as a custom connector.
 *
 * Stateless: each POST gets a fresh server and transport, so nothing is kept
 * between requests and any instance can answer. The tools are read-only and
 * public, so no sign-in is needed.
 */
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from '../mcp/server.js';

export default async function handler(req, res) {
  // A stateless server has no event stream to open (GET) or session to end (DELETE).
  if (req.method !== 'POST') {
    res.writeHead(405, { Allow: 'POST', 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed. Use POST.' }, id: null }));
    return;
  }

  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on('close', () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  // Vercel has already parsed a JSON body into req.body; the transport reads the stream when it is absent.
  await transport.handleRequest(req, res, req.body);
}
