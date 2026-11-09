#!/usr/bin/env node
/**
 * Simplified DSA MCP server.
 *
 * Gives an AI assistant the same lessons and the same algorithm traces the
 * website shows, so a tutor can quote real steps instead of simulating them
 * in its head. Run it with `pnpm mcp` (stdio transport).
 *
 * The traces come from src/demos/algorithms.js, the code the website demos
 * and the unit tests already use: one source of truth for every step.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  binarySearchFrames,
  bstInOrder,
  bstInsert,
  bstSearchPath,
  gridTraversalFrames,
  simpleHash,
  sortingAlgorithms,
} from '../src/demos/algorithms.js';

const contentDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content');
const SECTIONS = ['data-structures', 'algorithms'];
const MAX_FRAMES = 300;

/**
 * Lessons are read from the Markdown files themselves, so a new lesson file
 * shows up here without touching this server. The title is the file's `# ` line.
 */
export function loadLessons() {
  return SECTIONS.flatMap((section) =>
    readdirSync(join(contentDir, section))
      .filter((file) => file.endsWith('.md'))
      .sort()
      .map((file) => {
        const markdown = readFileSync(join(contentDir, section, file), 'utf8');
        return {
          section,
          id: file.replace(/\.md$/, ''),
          title: markdown.match(/^# (.+)$/m)?.[1] ?? file,
          markdown,
        };
      }),
  );
}

const text = (value) => ({ content: [{ type: 'text', text: value }] });

// Number each frame's caption; optionally append a state snapshot.
const numbered = (frames, snapshot = () => '') => {
  const shown = frames.slice(0, MAX_FRAMES);
  const lines = shown.map((frame, i) => `${i + 1}. ${frame.caption}${snapshot(frame)}`);
  if (frames.length > shown.length) lines.push(`… ${frames.length - shown.length} more steps omitted.`);
  return lines.join('\n');
};

export function createServer() {
  const lessons = loadLessons();
  const server = new McpServer({ name: 'simplified-dsa', version: '1.0.0' });

  // Every lesson is also a readable resource, e.g. dsa://algorithms/big-o.
  for (const lesson of lessons) {
    server.registerResource(
      `${lesson.section}/${lesson.id}`,
      `dsa://${lesson.section}/${lesson.id}`,
      { title: lesson.title, mimeType: 'text/markdown' },
      (uri) => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: lesson.markdown }] }),
    );
  }

  server.registerTool(
    'list_lessons',
    {
      title: 'List lessons',
      description: 'List every Simplified DSA lesson with its section and id.',
      annotations: { readOnlyHint: true },
    },
    () => text(lessons.map((l) => `${l.section}/${l.id}: ${l.title}`).join('\n')),
  );

  server.registerTool(
    'get_lesson',
    {
      title: 'Get lesson',
      description: 'Return the full Markdown of one lesson. Use list_lessons for valid ids.',
      inputSchema: { section: z.enum(SECTIONS), lesson: z.string() },
      annotations: { readOnlyHint: true },
    },
    ({ section, lesson }) => {
      const found = lessons.find((l) => l.section === section && l.id === lesson);
      return found ? text(found.markdown) : { ...text(`No lesson ${section}/${lesson}. Call list_lessons.`), isError: true };
    },
  );

  const values = z.array(z.number().int().min(-999).max(999)).min(1).max(30);

  server.registerTool(
    'trace_sort',
    {
      title: 'Trace a sorting algorithm',
      description:
        'Run bubble, selection, insertion or merge sort on up to 30 integers and return every compare/swap/write step with the array after it. Same steps as the website demo.',
      inputSchema: { algorithm: z.enum(Object.keys(sortingAlgorithms)), values },
      annotations: { readOnlyHint: true },
    },
    ({ algorithm, values: input }) => {
      const algo = sortingAlgorithms[algorithm];
      const frames = algo.frames(input);
      return text(`${algo.label} (${algo.big}), ${frames.length} steps:\n${numbered(frames, (f) => `  [${f.values.join(', ')}]`)}`);
    },
  );

  server.registerTool(
    'trace_binary_search',
    {
      title: 'Trace binary search',
      description: 'Sort the values, then binary search for target, showing lo, mid and hi at each step.',
      inputSchema: { values, target: z.number().int() },
      annotations: { readOnlyHint: true },
    },
    ({ values: input, target }) => {
      const sorted = [...new Set(input)].sort((a, b) => a - b);
      const frames = binarySearchFrames(sorted, target);
      const state = (f) => (f.mid >= 0 ? `  (lo=${f.lo}, mid=${f.mid}, hi=${f.hi})` : '');
      return text(`Sorted list: [${sorted.join(', ')}]\n${numbered(frames, state)}`);
    },
  );

  server.registerTool(
    'trace_graph_search',
    {
      title: 'Trace BFS or DFS on a grid',
      description:
        'Breadth-first or depth-first search on a grid from start to goal. Walls are "row,col" strings (0-based). Returns the visit order, the path found and an ASCII picture.',
      inputSchema: {
        mode: z.enum(['bfs', 'dfs']),
        rows: z.number().int().min(1).max(20),
        cols: z.number().int().min(1).max(20),
        walls: z.array(z.string().regex(/^\d+,\d+$/)).max(200).default([]),
        start: z.tuple([z.number().int().min(0), z.number().int().min(0)]).default([0, 0]),
        goal: z.tuple([z.number().int().min(0), z.number().int().min(0)]).optional(),
      },
      annotations: { readOnlyHint: true },
    },
    ({ mode, rows, cols, walls, start, goal = [rows - 1, cols - 1] }) => {
      const inside = ([r, c]) => r < rows && c < cols;
      if (!inside(start) || !inside(goal)) return { ...text('start and goal must be inside the grid.'), isError: true };

      const wallSet = new Set(walls);
      const frames = gridTraversalFrames({ rows, cols, walls: wallSet, start, goal, mode });
      const last = frames.at(-1);
      const path = new Set(last.path);
      const visited = new Set(last.visited);
      // S start, G goal, # wall, * path, . visited, space unvisited.
      const picture = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const key = `${r},${c}`;
          if (key === start.join(',')) return 'S';
          if (key === goal.join(',')) return 'G';
          if (wallSet.has(key)) return '#';
          return path.has(key) ? '*' : visited.has(key) ? '.' : ' ';
        }).join(''),
      ).join('\n');
      return text(`${numbered(frames)}\n\nLegend: S start, G goal, # wall, * path, . visited\n${picture}`);
    },
  );

  server.registerTool(
    'trace_hash',
    {
      title: 'Hash keys into buckets',
      description:
        'Show the teaching hash (sum of character codes mod bucket count) for each key, and which keys collide. The website uses this same hash.',
      inputSchema: {
        keys: z.array(z.string().min(1).max(40)).min(1).max(30),
        buckets: z.number().int().min(1).max(64).default(7),
      },
      annotations: { readOnlyHint: true },
    },
    ({ keys, buckets }) => {
      const table = Array.from({ length: buckets }, () => []);
      const lines = keys.map((key) => {
        const { codes, sum, index } = simpleHash(key, buckets);
        table[index].push(key);
        return `"${key}": ${codes.join(' + ')} = ${sum}; ${sum} % ${buckets} = ${index}`;
      });
      const chains = table.map((chain, i) => `bucket ${i}: ${chain.map((k) => `"${k}"`).join(' → ') || '(empty)'}`);
      return text(`${lines.join('\n')}\n\n${chains.join('\n')}\nLoad factor: ${(keys.length / buckets).toFixed(2)}`);
    },
  );

  server.registerTool(
    'trace_bst',
    {
      title: 'Build and search a binary search tree',
      description: 'Insert values in order into a BST, report its height and in-order walk, and optionally trace a search.',
      inputSchema: { values, search: z.number().int().optional() },
      annotations: { readOnlyHint: true },
    },
    ({ values: input, search }) => {
      let root = null;
      for (const value of input) root = bstInsert(root, value);
      const height = (node) => (node ? 1 + Math.max(height(node.left), height(node.right)) : 0);
      const lines = [
        `Inserted in order: ${input.join(', ')}`,
        `Height: ${height(root)} (a balanced tree of ${bstInOrder(root).length} nodes needs about ${Math.ceil(Math.log2(bstInOrder(root).length + 1))})`,
        `In-order walk: ${bstInOrder(root).join(', ')}`,
      ];
      if (search !== undefined) {
        const { path, found } = bstSearchPath(root, search);
        lines.push(`Search ${search}: ${path.join(' → ')} → ${found ? 'found' : 'not found'} (${path.length} comparisons)`);
      }
      return text(lines.join('\n'));
    },
  );

  return server;
}

// Start only when run directly, so tests can import createServer.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await createServer().connect(new StdioServerTransport());
}
