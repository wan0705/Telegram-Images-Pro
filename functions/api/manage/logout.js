import { handleCORS, withCORS } from "../../utils/http.js";

export async function onRequest(context) {
    const { request } = context;

    // 处理 OPTIONS 预检请求
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    return withCORS(new Response('Logged out.', { status: 401 }), request);
}
