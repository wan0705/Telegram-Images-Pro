import { jsonResponse } from "../utils/http.js";

export async function onRequest(context) {
    const cookie = 'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax';
    return jsonResponse({ success: true }, {
        status: 200,
        headers: { 'Set-Cookie': cookie }
    });
}
