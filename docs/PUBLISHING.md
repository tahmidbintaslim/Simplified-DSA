# Publishing Guide

How to get the site, plugin, skill, MCP server and connector to people. Steps were checked against the official docs on 2026-11-09; these products change quickly, so re-read the linked page before each release.

## Status at a glance

| Channel | Who can use it | Ready? | Blocker |
| --- | --- | --- | --- |
| Website (dsa.tahmid.space) | Everyone | After PR merge | Vercel free plan hit 100 deploys/day; merge when the limit resets |
| Plugin via this repo's marketplace | Claude Code users | After PR merge | None. Install tested locally |
| Anthropic plugin directory | Claude Code and Claude app users | No | Needs a paid Claude plan to submit, a privacy policy page, and a manual review |
| Skill on claude.ai | Claude app users | No | The skill needs the MCP tools, and claude.ai only reaches remote servers, so the connector comes first |
| Remote connector | claude.ai, Claude apps, any MCP client | No | Not built yet: needs an HTTPS (Streamable HTTP) deployment of the server |
| Official MCP Registry | MCP clients that browse the registry | No | Needs the remote connector (or an npm package) first |

## 1. Website

Merge the PR into `main`; Vercel deploys `main` to production. Before announcing it widely, finish the launch list in [Strategy](./STRATEGY.md#4-brand-and-design) and these gaps:

- A privacy page (also required by the directory and by any browser extension).
- Open Graph tags and a share image, so links look right on social media.
- `robots.txt` and a `sitemap.xml`. Lessons are rendered by JavaScript; pre-rendering them to static HTML would help search engines.
- A "not found" page instead of falling back to the first lesson.

## 2. Plugin from this repository (works after merge)

The repository is its own marketplace (`.claude-plugin/marketplace.json`). There is nothing to submit. Users run, inside Claude Code:

```text
/plugin install simplified-dsa --marketplace tahmidbintaslim/Simplified-DSA
```

Or in two steps, which also works on older versions:

```text
/plugin marketplace add tahmidbintaslim/Simplified-DSA
/plugin install simplified-dsa@simplified-dsa
```

For releases: bump `version` in `plugin/.claude-plugin/plugin.json` and in `.claude-plugin/marketplace.json`, run `pnpm build:plugin`, then `claude plugin tag plugin` to create a `simplified-dsa--v<version>` tag. Users can pin a tag with `tahmidbintaslim/Simplified-DSA#<tag>`. Third-party marketplaces do not auto-update by default; users run `/plugin marketplace update simplified-dsa`.

Docs: [Install plugins](https://code.claude.com/docs/en/plugins/install.md), [Publish plugins](https://code.claude.com/docs/en/plugins/publish.md).

## 3. Anthropic's plugin directory

Submitted through the developer portal at [claude.ai/directory/manage](https://claude.ai/directory/manage).

- **Who:** a paid Claude plan (Pro, Max, Team or Enterprise). The claude.ai account must have GitHub connected with push access to this repository.
- **Steps:** Submit new → Plugin bundle → repository `tahmidbintaslim/Simplified-DSA`, path `plugin` → Validate → listing details → data handling questions → compliance (contact email and acknowledgements) → Submit for review.
- **Review:** automated validation and a security scan on every version; a person reviews the first listing. No published timeline.
- **Updates:** push to the tracked branch with a higher `version`.
- **Before submitting:** `claude plugin validate ./plugin --strict` (passes today), read the [pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist.md), and publish a privacy page. The server collects nothing and sends nothing, which makes the data handling answers simple.

Docs: [Directory publishing](https://claude.com/docs/directory/publish), [Submit a plugin](https://claude.com/docs/plugins/submit).

## 4. Remote connector (next build step)

claude.ai cannot run a local `node` process, so it needs the same server over HTTPS:

- Add an HTTP entry point that serves `createServer()` with the SDK's Streamable HTTP transport in stateless mode, at e.g. `https://dsa.tahmid.space/mcp`. The tools are read-only and public, so no sign-in is needed.
- Anyone can then add it: claude.ai → Customize → Connectors → Add custom connector → paste the URL. Free plans get one custom connector.
- **Directory listing** (same portal, "MCP connector"): needs HTTPS, a `title` and `readOnlyHint` on every tool (already set), a documentation URL, a privacy policy URL, a support contact and an icon. The slug is permanent once published.

Docs: [Add a custom connector](https://claude.com/docs/connectors/custom/add-unlisted.md), [Connector submission](https://claude.com/docs/connectors/building/submission.md), [Review criteria](https://claude.com/docs/connectors/building/review-criteria.md).

## 5. Skill on claude.ai

The same `SKILL.md` works on claude.ai: its frontmatter uses only `name` and `description`, which uploads accept. Package it with the folder at the top of the zip:

```bash
cd plugin/skills && zip -r dsa-tutor.zip dsa-tutor/
```

Upload it under claude.ai → Customize → Skills. On Team and Enterprise it can be shared with the organisation. There is no public skills directory; the plugin directory is the public route, since a plugin carries its skills.

Upload it after the connector exists, because the skill tells Claude to use the trace tools.

## 6. Official MCP Registry

The registry ([registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io), in preview) stores metadata only. Once the remote connector is live, publish a remote-only entry; no npm package is needed:

- Install `mcp-publisher` (`brew install mcp-publisher` or a release binary).
- `mcp-publisher init`. Set `name` to `io.github.tahmidbintaslim/simplified-dsa` and add a `remotes` entry with the HTTPS URL. The description must be 100 characters or fewer.
- `mcp-publisher login github`, then `mcp-publisher publish`.

Docs: [Registry quickstart](https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/quickstart.mdx).

## Recommended order

1. Merge the PR. The site and plugin go live, and the plugin installs from GitHub.
2. Add a privacy page and Open Graph tags.
3. Build and deploy the remote connector.
4. Submit the plugin and the connector to the Anthropic directory, upload the skill, and publish to the MCP Registry.
