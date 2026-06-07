import { r as createRequestHandler } from "./assets/chunk-S54KXAEJ-DE-qgX_b.js";
//#region src/front/lib/httpcodes.ts
var HTTP_OK = () => new Response("200 Ok", {
	status: 200,
	headers: {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
		"Access-Control-Allow-Headers": "Content-Type, Authorization"
	}
});
//#endregion
//#region src/worker.ts
var requestHandler = createRequestHandler(() => import("./assets/server-build-Ck9Glj5f.js"), "production");
//#endregion
//#region \0virtual:cloudflare/worker-entry
var worker_entry_default = { async fetch(request, env, ctx) {
	if (request.method === "OPTIONS") return HTTP_OK();
	return requestHandler(request, { cloudflare: {
		env,
		ctx
	} });
} };
//#endregion
export { worker_entry_default as default };
