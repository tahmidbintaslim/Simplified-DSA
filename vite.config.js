import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { loadLessons } from "./mcp/server.js";

const SITE = "https://dsa.tahmid.space";

// Writes sitemap.xml at build time from the lesson files, so a new lesson
// is listed without editing anything here.
const sitemap = {
  name: "sitemap",
  apply: "build",
  generateBundle() {
    const urls = ["/", ...loadLessons().map((l) => `/${l.section}/${l.id}`), "/privacy.html"];
    this.emitFile({
      type: "asset",
      fileName: "sitemap.xml",
      source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${SITE}${url}</loc></url>`).join("\n")}
</urlset>
`,
    });
  },
};

export default defineConfig({
  plugins: [tailwindcss(), sitemap],
  server: {
    port: 3000,
  },
});
