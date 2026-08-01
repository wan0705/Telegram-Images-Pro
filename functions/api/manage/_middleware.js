async function errorHandling(context) {
    try { return await context.next(); }
    catch (err) { return new Response(`${err.message}\n${err.stack}`, { status: 500 }); }
}

function parseCookies(request) {
    const cookie = request.headers.get('Cookie') || '';
    return Object.fromEntries(cookie.split(';').filter(Boolean).map(c => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
    }));
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyToken(context) {
    const env = context.env;
    if (typeof env.BASIC_USER === "undefined" || env.BASIC_USER == null || env.BASIC_USER === "") {
        return { ok: true, reason: 'no_auth' };
    }
    const cookies = parseCookies(context.request);
    const token = cookies.admin_token;
    if (!token) return { ok: false, reason: 'missing_token' };
    const expected = await sha256(env.BASIC_USER + ':' + env.BASIC_PASS + ':telegraph-image');
    if (token === expected) return { ok: true, reason: 'valid' };
    return { ok: false, reason: 'invalid_token' };
}

async function authentication(context) {
    if (typeof context.env.img_url === "undefined" || context.env.img_url == null || context.env.img_url === "") {
        return new Response('Dashboard is disabled. Please bind a KV namespace.', { status: 200 });
    }
    const check = await verifyToken(context);
    if (check.ok) return context.next();
    const accept = context.request.headers.get('Accept') || '';
    const isApi = accept.includes('application/json') || context.request.url.includes('/api/');
    if (isApi) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
        });
    }
    return Response.redirect(new URL('/login.html', context.request.url).toString(), 302);
}

export const onRequest = [errorHandling, authentication];
