# WebMCP testing environment

## Safety boundary

There are two database classes:

| Class | Environment variable | Allowed use |
| --- | --- | --- |
| Application/development | `DATABASE_URL` | Local application, manual smoke testing, deployed runtime |
| Disposable WebMCP integration database | `TEST_DATABASE_URL` | Migration, seed/reset, and integration tests only |

Integration commands refuse to run unless `WEBMCP_TEST_DATABASE=true`. By default they also require a distinct `TEST_DATABASE_URL`. To reuse `DATABASE_URL`, set `WEBMCP_ALLOW_SHARED_DATABASE=true`; this is an explicit acknowledgement that the integration runner will reset and seed the application database.

The broad integration suite additionally requires `WEBMCP_RUN_INTEGRATION=true`, which the dedicated runner sets itself. As a result, ordinary `npm test` remains database-free even when shared-database permission is configured locally.

## Setup

1. Preferred: create a separate Neon branch/database named for WebMCP tests. Alternatively, explicitly opt into reuse of `DATABASE_URL` when the database contains only disposable demo data.
2. Copy `.env.test.example` to a local ignored `.env.test` and populate the dedicated URL, or set the shared-database acknowledgement.
3. Load the variables into your shell; they are not committed and must never use the production/app URL.
4. Run `npm run db:test:verify` to prove the safety gate and connection.
5. Run `npm run test:webmcp:integration` to apply tracked migrations, reset/seed the dedicated database, and run integration tests.

The integration runner reuses the repository's existing seed rather than encoding catalog data in WebMCP tests. It destructively resets the selected database. When `WEBMCP_ALLOW_SHARED_DATABASE=true`, that selected database is the current application database.

## Reproducible local checks

```text
npm install
npm run eval:webmcp
npm run db:test:verify
npm run test:webmcp:integration
npm run dev
```

`npm run eval:webmcp` is database-free. Browser verification additionally needs Chrome with `chrome://flags/#enable-webmcp-testing` enabled and the Model Context Tool Inspector.

## Deterministic tool coverage

The database-free Vitest suites cover the complete tool inventory through the exported `webmcpTools` list. They verify:

| Concern | Coverage |
| --- | --- |
| Request contract | Every tool's relative endpoint, HTTP method, encoded identifiers, and JSON request body |
| Invalid input | Required-field and type validation occurs in the registry before execution |
| Authentication | Every protected tool is hidden from guest discovery and rejected before execution |
| API failures | Every tool forwards the structured error payload returned by its same-origin API |
| State changes | Cart, wishlist, order, and address tools are asserted to use explicit mutation methods and bodies |

These tests use generic runtime identifiers and inputs; catalog fixtures remain in the normal seed and integration suite rather than in individual tool tests.

## Environment record

- Node: 20 (see `netlify.toml`)
- Application: Next.js 14, React 18, Prisma 5, PostgreSQL/Neon
- Deterministic runner: Vitest 2
- Browser: compatible Chrome with WebMCP testing enabled
- LLM evaluations: `npm run eval:webmcp:llm` uses the OpenAI Responses API when `OPENAI_API_KEY` is configured. It repeats every generic dataset case and records selection, argument, ordered-chain, recovery, and latency metrics in ignored `eval-results/llm-results.json`. It deliberately performs planning only and never executes tools against the database.
