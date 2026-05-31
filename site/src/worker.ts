//region Imports
import { createRequestHandler } from 'react-router';
import { HTTP_OK } from '~/lib/httpcodes';
//endregion

//region Inicializacao React Router
declare module 'react-router' {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import('virtual:react-router/server-build'),
	import.meta.env.MODE
);
//endregion

/**
 * Cloudflare Worker Entry Point
 */
export default {
	
	// A função abaixo deve ficar simples e inalterada. Pedir permissao para o usuario se precisar alterar.
	async fetch(request, env, ctx) {
		if (request.method === 'OPTIONS') {
			return HTTP_OK();
		}
		return requestHandler(request, {
			cloudflare: { env, ctx }
		});
	},

} satisfies ExportedHandler<Env>;
