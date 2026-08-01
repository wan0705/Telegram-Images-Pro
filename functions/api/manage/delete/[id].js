export async function onRequest(context) {
    const { env, params } = context;
    await env.img_url.delete(params.id);
    return new Response(JSON.stringify({ success: true, id: params.id }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
