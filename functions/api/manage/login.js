import { handleCORS, withCORS } from "../../utils/http.js";

export async function onRequest(context) {
    const { request, env } = context;

    // 处理 OPTIONS 预检请求
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    //get the request url
    const url = new URL(request.url);
    //redirect to admin page
    return withCORS(Response.redirect(url.origin+"/admin.html", 302), request);
}
