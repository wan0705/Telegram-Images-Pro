import { updateMetadata } from "../../../utils/metadata.js";
import { jsonResponse, textResponse, handleCORS, withCORS } from "../../../utils/http.js";

export async function onRequest(context) {
    // 处理 OPTIONS 预检请求
    const { request, params, env } = context;

    // 处理 OPTIONS 预检请求
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const fileName = url.searchParams.get('newName') || params.name;
    const metadata = await updateMetadata(env, params.id, current => {
        current.fileName = fileName;
        return current;
    });

    if (!metadata) {
        return withCORS(textResponse(`Image metadata not found for ID: ${params.id}`, { status: 404 }), request);
    }

    return withCORS(jsonResponse({ success: true, fileName: metadata.fileName }), request);
}
