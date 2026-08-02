import {
    basicAuthentication,
    basicAuthChallengeResponse,
    dashboardDisabledResponse,
    unauthorizedResponse,
} from "../../utils/auth.js";
import { isEmptyBinding } from "../../utils/http.js";

async function errorHandling(context) {
    try {
        return await context.next();
    } catch (err) {
        return new Response(`${err.message}\n${err.stack}`, { status: 500 });
    }
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function authentication(context) {
    if (isEmptyBinding(context.env.img_url)) {
        return dashboardDisabledResponse();
    }

    // 如果未设置 BASIC_USER，允许直接访问
    if (isEmptyBinding(context.env.BASIC_USER)) {
        return context.next();
    }

    // 优先检查 Cookie Token 认证（你的美化系统使用）
    const cookie = context.request.headers.get('Cookie') || '';
    const match = cookie.match(/admin_token=([^;]+)/);
    if (match) {
        const expected = sha256(context.env.BASIC_USER + ':' + context.env.BASIC_PASS + ':telegraph-image');
        // 注意：sha256 是异步的，这里需要特殊处理
        // 实际上 Cookie 认证需要在异步函数中处理
    }

    // 回退到 Basic Auth
    if (!context.request.headers.has('Authorization')) {
        return basicAuthChallengeResponse();
    }

    const credentials = basicAuthentication(context.request);
    if (credentials instanceof Response) {
        return credentials;
    }

    if (context.env.BASIC_USER !== credentials.user || context.env.BASIC_PASS !== credentials.pass) {
        return unauthorizedResponse('Invalid credentials.');
    }

    return context.next();
}

// 异步认证中间件（支持 Cookie Token）
async function asyncAuthentication(context) {
    if (isEmptyBinding(context.env.img_url)) {
        return dashboardDisabledResponse();
    }

    if (isEmptyBinding(context.env.BASIC_USER)) {
        return context.next();
    }

    // 优先检查 Cookie Token
    const cookie = context.request.headers.get('Cookie') || '';
    const match = cookie.match(/admin_token=([^;]+)/);
    if (match) {
        const expected = await sha256(context.env.BASIC_USER + ':' + context.env.BASIC_PASS + ':telegraph-image');
        if (match[1] === expected) {
            return context.next();
        }
    }

    // 回退到 Basic Auth
    if (!context.request.headers.has('Authorization')) {
        return basicAuthChallengeResponse();
    }

    const credentials = basicAuthentication(context.request);
    if (credentials instanceof Response) {
        return credentials;
    }

    if (context.env.BASIC_USER !== credentials.user || context.env.BASIC_PASS !== credentials.pass) {
        return unauthorizedResponse('Invalid credentials.');
    }

    return context.next();
}

export const onRequest = [errorHandling, asyncAuthentication];
