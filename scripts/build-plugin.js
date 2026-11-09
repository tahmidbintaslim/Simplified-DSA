/**
 * Build the Claude Code plugin's MCP server.
 *
 * A plugin is installed by copying its folder, without node_modules, so the
 * server and its dependencies are bundled into one file and the lesson
 * Markdown is copied next to it. Run with `pnpm build:plugin` and commit the
 * result; CI fails if the committed bundle is out of date.
 */
import { cpSync, rmSync } from 'node:fs';
import { build } from 'vite';

const outDir = 'plugin/server';
rmSync(outDir, { recursive: true, force: true });

await build({
  configFile: false,
  publicDir: false, // The site's public/ files do not belong in the plugin.
  logLevel: 'warn',
  ssr: { noExternal: true, target: 'node' },
  build: {
    ssr: 'mcp/server.js',
    outDir,
    minify: true,
    rollupOptions: { output: { entryFileNames: 'server.mjs' } },
  },
});

for (const section of ['data-structures', 'algorithms']) {
  cpSync(`src/content/${section}`, `${outDir}/content/${section}`, { recursive: true });
}
console.log(`Built ${outDir}/server.mjs and copied lessons.`);
