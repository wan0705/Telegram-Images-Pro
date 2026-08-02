import { getMetadata } from "../../../utils/metadata.js";
import { deleteShortLink } from "../../../utils/shortlink.js";
import { jsonResponse, handleCORS, withCORS } from "../../../utils/http.js";

export async function onRequest(context) {
    // 处理 OPTIONS 预检请求
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;
    const { env, params } = context;

    const metadata = await getMetadata(env, params.id);
    await env.img_url.delete(params.id);

    if (metadata?.shortId) {
        await deleteShortLink(env, metadata.shortId);
    }

    return withCORS(jsonResponse(params.id), request);
}
