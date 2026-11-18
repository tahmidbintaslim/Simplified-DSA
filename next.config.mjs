/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lesson Markdown is read from src/content at request time; ship it with the server.
  outputFileTracingIncludes: {
    '/[section]/[lesson]': ['./src/content/**/*.md'],
    '/mcp': ['./src/content/**/*.md'],
  },
};

export default nextConfig;
