export const HTTP_OK = () => new Response('200 Ok', {
    status: 200,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
});
export const HTTP_CREATED = () => new Response('201 Created', {status: 201});
export const HTTP_UNPROCESSABLE_ENTITY = () => new Response('422 Unprocessable Content', {status: 422});
