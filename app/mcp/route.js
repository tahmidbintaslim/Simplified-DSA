/**
 * Remote MCP connector at https://dsa.tahmid.space/mcp: the same server as
 * mcp/server.js, over HTTPS. Public on purpose (the AI tutor stays free), so
 * it is outside the sign-in gate.
 *
 * Stateless: each POST gets a fresh server and transport, so nothing is kept
 * between requests and any instance can answer.
 */
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer } from '../../mcp/server.js';

export async function POST(request) {
  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  return transport.handleRequest(request);
}

// A stateless server has no event stream to open (GET) or session to end (DELETE).
const notAllowed = () =>
  Response.json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed. Use POST.' }, id: null }, { status: 405, headers: { Allow: 'POST' } });
export const GET = notAllowed;
export const DELETE = notAllowed;
