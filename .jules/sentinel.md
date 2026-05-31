## 2024-05-24 - Hardcoded Session Secret in Serverless Environment
**Vulnerability:** A hardcoded session secret (`"secret-fallback"`) was used in `createCookieSessionStorage` for initializing session cookies.
**Learning:** In Cloudflare Workers and serverless environments that statically bundle logic but receive secrets per-request (via `env` injected into loaders/actions), statically initializing session storage with `createCookieSessionStorage` using hardcoded fallback keys breaks security, allowing anyone to forge a session.
**Prevention:** Avoid defining singletons for session storage in serverless runtimes. Always wrap `createCookieSessionStorage` in a function (e.g. `getSessionStorage(env)`) and dynamically pass the secret obtained from the request context's `env` object.
