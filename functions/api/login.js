import { jsonResponse, handleCORS, withCORS } from "../utils/http.js";

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(context) {
    // 处理 OPTIONS 预检请求
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;
    const { request, env } = context;
    if (request.method !== 'POST') {
        return withCORS(new Response('Method Not Allowed', { status: 405 }), request);
    }
    try {
        const body = await request.json();
        const { username, password } = body || {};
        if (!username || !password) {
            return withCORS(jsonResponse({ error: '请输入用户名和密码' }, { status: 400 }), request);
        }
        if (username !== env.BASIC_USER || password !== env.BASIC_PASS) {
            return withCORS(jsonResponse({ error: '用户名或密码错误' }, { status: 401 }), request);
        }
        const token = await sha256(env.BASIC_USER + ':' + env.BASIC_PASS + ':telegraph-image');
        const cookie = `admin_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`;
        return withCORS(jsonResponse({ success: true }, {
            status: 200,
            headers: { 'Set-Cookie': cookie }
        }), request);
    } catch (err) {
        return withCORS(jsonResponse({ error: '请求格式错误' }, { status: 400 }), request);
    }
}
