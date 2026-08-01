export async function onRequest(context) {
    const { params, env } = context;
    const value = await env.img_url.getWithMetadata(params.id);
    if (!value.metadata) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    value.metadata.liked = !value.metadata.liked;
    await env.img_url.put(params.id, "", { metadata: value.metadata });
    return new Response(JSON.stringify({ success: true, liked: value.metadata.liked }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
