export function jsonResponse(data, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function textResponse(body, init = {}) {
  return new Response(body, init);
}

export function isEmptyBinding(value) {
  return typeof value === 'undefined' || value === null || value === '';
}

/**
 * 生成 CORS 响应头
 * @param {Request} request - 原始请求，用于读取 Origin
 * @param {Object} options - 额外选项
 * @returns {Headers}
 */
export function corsHeaders(request, options = {}) {
  const headers = new Headers();

  // 回显 Origin，支持 credentials（比 * 更灵活）
  const origin = request.headers.get('Origin') || '*';
  headers.set('Access-Control-Allow-Origin', origin);

  // 允许的 HTTP 方法
  headers.set('Access-Control-Allow-Methods', options.methods || 'GET, POST, PUT, DELETE, OPTIONS');

  // 允许的请求头
  headers.set('Access-Control-Allow-Headers', options.allowHeaders || 'Content-Type, Authorization, X-Requested-With');

  // 允许携带 Cookie
  headers.set('Access-Control-Allow-Credentials', 'true');

  // 预检缓存时间
  headers.set('Access-Control-Max-Age', '86400');

  // 暴露给前端的响应头
  headers.set('Access-Control-Expose-Headers', options.exposeHeaders || 'Content-Length, Content-Type');

  return headers;
}

/**
 * 处理 OPTIONS 预检请求
 * @param {Request} request
 * @param {Object} options
 * @returns {Response|null} - 如果是 OPTIONS 请求返回响应，否则返回 null
 */
export function handleCORS(request, options = {}) {
  if (request.method === 'OPTIONS') {
    const headers = corsHeaders(request, options);
    return new Response(null, { status: 204, headers });
  }
  return null;
}

/**
 * 为现有 Response 添加 CORS 头
 * @param {Response} response
 * @param {Request} request
 * @param {Object} options
 * @returns {Response}
 */
export function withCORS(response, request, options = {}) {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(request, options);
  cors.forEach((value, key) => {
    headers.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
