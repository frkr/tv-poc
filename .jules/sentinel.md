## 2024-05-24 - Hardcoded Session Secret in Serverless Environment
**Vulnerability:** A hardcoded session secret (`"secret-fallback"`) was used in `createCookieSessionStorage` for initializing session cookies.
**Learning:** In Cloudflare Workers and serverless environments that statically bundle logic but receive secrets per-request (via `env` injected into loaders/actions), statically initializing session storage with `createCookieSessionStorage` using hardcoded fallback keys breaks security, allowing anyone to forge a session.
**Prevention:** Avoid defining singletons for session storage in serverless runtimes. Always wrap `createCookieSessionStorage` in a function (e.g. `getSessionStorage(env)`) and dynamically pass the secret obtained from the request context's `env` object.

## Insecure Cookies in Cloudflare Workers / React Router
**Vulnerability:** The cookie options in `createCookieSessionStorage` lacked the `secure: true` flag, allowing cookies to be transmitted over unencrypted HTTP requests, which could lead to interception in production.
**Learning:** When configuring `createCookieSessionStorage` in environments like React Router and Cloudflare Workers, we must ensure cookies have the `secure` flag properly configured based on the environment.
**Prevention:** Instead of hardcoding `secure: true` which may break local development over HTTP, we can use `secure: import.meta.env.PROD`. This ensures cookies are only transmitted over secure HTTPS connections in production.
