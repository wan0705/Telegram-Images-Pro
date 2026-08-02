import { updateMetadata } from "../../../utils/metadata.js";
import { jsonResponse, textResponse, handleCORS, withCORS } from "../../utils/http.js";

export async function onRequest(context) {
    // 处理 OPTIONS 预检请求
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;
    const { params, env } = context;

    const metadata = await updateMetadata(env, params.id, current => {
        current.liked = !current.liked;
        return current;
    });

    if (!metadata) {
        return withCORS(textResponse(`Image metadata not found for ID: ${params.id}`, { status: 404 }), request);
    }

    return withCORS(jsonResponse({ success: true, liked: metadata.liked }), request);
}
