import { jsonResponse, handleCORS, withCORS } from "../utils/http.js";

export async function onRequest(context) {
    const { request } = context;
    // 处理 OPTIONS 预检请求
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;
    const cookie = 'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax';
    return withCORS(jsonResponse({ success: true }, {
        status: 200,
        headers: { 'Set-Cookie': cookie }
    }), request);
}
