export async function onRequest(context) {
    const { env, params } = context;
    const value = await env.img_url.getWithMetadata(params.id);
    if (!value.metadata) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    value.metadata.ListType = "White";
    await env.img_url.put(params.id, "", { metadata: value.metadata });
    return new Response(JSON.stringify(value.metadata), { headers: { 'Content-Type': 'application/json' } });
}
