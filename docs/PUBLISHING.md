# Publishing Guide

How to get the site, plugin, skill, MCP server and connector to people. Steps were checked against the official docs on 2026-11-09; these products change quickly, so re-read the linked page before each release.

## Status at a glance

| Channel | Who can use it | Ready? | Blocker |
| --- | --- | --- | --- |
| Website (dsa.tahmid.space) | Everyone | Yes | Live since the lessons PR merged |
| Plugin via this repo's marketplace | Claude Code users | Yes | None |
| Anthropic plugin directory | Claude Code and Claude app users | Ready to submit after the connector PR (privacy page) | Needs a paid Claude plan, then a manual review |
| Skill on claude.ai | Claude app users | Once the connector is live | Upload by hand (section 5) |
| Remote connector | claude.ai, Claude apps, any MCP client | Built (`api/mcp.js`) | Live at `https://dsa.tahmid.space/mcp` once its PR is merged |
| Official MCP Registry | MCP clients that browse the registry | Once the connector is live | `mcp-publisher` login with your GitHub account (section 6) |

## 1. Website

Vercel deploys `main` to production. The connector PR adds a privacy page (`public/privacy.html`), link-preview tags and image, `robots.txt`, a generated `sitemap.xml` and a "Page not found" view.

Still open: lessons are rendered by JavaScript, so pre-rendering them to static HTML would help search engines, and unknown URLs still return HTTP 200. See also the launch list in [Strategy](./STRATEGY.md#4-brand-and-design).

## 2. Plugin from this repository (live)

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

## 4. Remote connector (built)

claude.ai cannot run a local `node` process, so it needs the same server over HTTPS:

- `api/mcp.js` serves `createServer()` with the SDK's Streamable HTTP transport in stateless mode, and `vercel.json` routes `https://dsa.tahmid.space/mcp` to it. The tools are read-only and public, so no sign-in is needed. `tests/mcp-http.test.js` drives it with a real MCP client.
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

1. ~~Merge the lessons and plugin PR.~~ Done.
2. Merge the connector PR, then add `https://dsa.tahmid.space/mcp` as a custom connector in claude.ai to confirm it works.
3. Submit the plugin and the connector to the Anthropic directory, upload the skill, and publish to the MCP Registry.
