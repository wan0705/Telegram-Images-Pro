import { isEmptyBinding, textResponse, handleCORS, withCORS } from "../utils/http.js";

export async function onRequest(context) {
    // 处理 OPTIONS 预检请求
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;
    if (isEmptyBinding(context.env.BASIC_USER)) {
        return withCORS(textResponse('Not using basic auth.', { status: 200 }), request);
    }

    return withCORS(textResponse('true', { status: 200 }), request);
}
