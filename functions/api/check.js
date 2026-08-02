import { jsonResponse, textResponse } from "../utils/http.js";

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(context) {
    const { env, request } = context;
    if (typeof env.BASIC_USER === "undefined" || env.BASIC_USER == null || env.BASIC_USER === "") {
        return textResponse('Not using basic auth.', { status: 200 });
    }
    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/admin_token=([^;]+)/);
    if (!match) return textResponse('false', { status: 200 });
    const expected = await sha256(env.BASIC_USER + ':' + env.BASIC_PASS + ':telegraph-image');
    return textResponse(match[1] === expected ? 'true' : 'false', { status: 200 });
}
