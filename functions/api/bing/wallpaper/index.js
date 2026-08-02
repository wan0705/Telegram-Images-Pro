import { handleCORS, withCORS } from "../../utils/http.js";

export async function onRequest(context) {
    const { request } = context;

    // 处理 OPTIONS 预检请求
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    const res = await fetch(`https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=5`);
    const bing_data = await res.json();
    const return_data = {
        "status": true,
        "message": "操作成功",
        "data": bing_data.images
    };
    const info = JSON.stringify(return_data);
    return withCORS(new Response(info, {
        headers: { 'Content-Type': 'application/json' }
    }), request);
}
