import { jsonResponse } from "../utils/http.js";

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(context) {
    const { request, env } = context;
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }
    try {
        const body = await request.json();
        const { username, password } = body || {};
        if (!username || !password) {
            return jsonResponse({ error: '请输入用户名和密码' }, { status: 400 });
        }
        if (username !== env.BASIC_USER || password !== env.BASIC_PASS) {
            return jsonResponse({ error: '用户名或密码错误' }, { status: 401 });
        }
        const token = await sha256(env.BASIC_USER + ':' + env.BASIC_PASS + ':telegraph-image');
        const cookie = `admin_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`;
        return jsonResponse({ success: true }, {
            status: 200,
            headers: { 'Set-Cookie': cookie }
        });
    } catch (err) {
        return jsonResponse({ error: '请求格式错误' }, { status: 400 });
    }
}
