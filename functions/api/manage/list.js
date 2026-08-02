import { isInternalKey } from "../../utils/kv-keys.js";
import { jsonResponse, handleCORS, withCORS } from "../../utils/http.js";

export async function onRequest(context) {
    // 处理 OPTIONS 预检请求
  const { request, env } = context;

  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;
  const url = new URL(request.url);

  const raw = url.searchParams.get("limit");
  let limit = parseInt(raw || "100", 10);
  if (!Number.isFinite(limit) || limit <= 0) limit = 100;
  if (limit > 1000) limit = 1000;

  const cursor = url.searchParams.get("cursor") || undefined;
  const prefix = url.searchParams.get("prefix") || undefined;
  const value = await env.img_url.list({ limit, cursor, prefix });

  return withCORS(jsonResponse({
    ...value,
    // Hide internal bookkeeping keys (short links, caches) from the file list
    keys: value.keys.filter(key => !isInternalKey(key.name)),
  }), request);
}
