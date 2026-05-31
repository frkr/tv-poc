import { checkAdminAuth } from "./auth";

export async function loader({ request, context }: { request: Request, context: any }) {
    // Acessa as variáveis de ambiente através do context (comum no Cloudflare)
    const env = context?.cloudflare?.env || context?.env;
    const { isAdmin, user } = await checkAdminAuth(request, env);
    
    return {
        isAdmin,
        user: isAdmin ? user : null,
        version: env?.CF_VERSION_METADATA || null,
    };
}

export async function action({ request, context }: { request: Request, context: any }) {
    // Actions futuras de publicação de canal/curso
    return { success: true };
}