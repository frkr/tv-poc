# Cloudflare Workers - Agents Section

> AGENTS! Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.
> AGENTS! Leave this section always on the final of the file.

## Docs

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

## Commands

| Command                                               | Purpose                   |
|-------------------------------------------------------|---------------------------|
| `npx wrangler dev`                                    | Local development         |
| `npx wrangler deploy`                                 | Deploy to Cloudflare      |
| `npx wrangler types`                                  | Generate TypeScript types |
| `npx wrangler r2 bucket create cfgateway`             | Create R2 bucket          |
| `npx wrangler queues create mqcfgateway`              | Create Queue              |
| `npx wrangler queues create mqcfgateway-dlq`          | Create Dead Letter Queue  |
| `npx wrangler d1 execute <database> --remote --command="ALTER TABLE <table> ADD COLUMN <column> <type>"` | Add column to D1 table |
| `npx wrangler d1 create new-database --location=enam` | Create D1 Database        |

Run `wrangler types` after changing bindings in wrangler.jsonc.

## Node.js Compatibility

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

## Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

## Environment Variables

Do not hand-write your Env interface. Run wrangler types to generate a type definition file that matches your actual Wrangler configuration. This catches mismatches between your config and code at compile time instead of at deploy time.

Re-run wrangler types whenever you add or rename a binding.

```shell
pnpm wrangler types
```
