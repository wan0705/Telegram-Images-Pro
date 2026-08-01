export async function onRequest(context) {
    const { request, env, params } = context;
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400',
            }
        });
    }
    let fileUrl = 'https://telegra.ph/' + url.pathname + url.search;
    if (url.pathname.length > 39) {
        const formdata = new FormData();
        formdata.append("file_id", url.pathname);
        const filePath = await getFilePath(env, url.pathname.split(".")[0].split("/")[2]);
        fileUrl = `https://api.telegram.org/file/bot${env.TG_Bot_Token}/${filePath}`;
    }
    const response = await fetch(fileUrl, { method: request.method, headers: request.headers, body: request.body });
    if (!response.ok) return makeInlineResponse(response, url, request);
    const isAdmin = request.headers.get('Referer')?.includes(`${url.origin}/admin`);
    if (isAdmin) return makeInlineResponse(response, url, request);
    if (!env.img_url) return makeInlineResponse(response, url, request);
    let record = await env.img_url.getWithMetadata(params.id);
    if (!record || !record.metadata) {
        record = { metadata: { ListType: "None", Label: "None", TimeStamp: Date.now(), liked: false, fileName: params.id, fileSize: 0 } };
        await env.img_url.put(params.id, "", { metadata: record.metadata });
    }
    const metadata = { ListType: record.metadata.ListType || "None", Label: record.metadata.Label || "None", TimeStamp: record.metadata.TimeStamp || Date.now(), liked: record.metadata.liked !== undefined ? record.metadata.liked : false, fileName: record.metadata.fileName || params.id, fileSize: record.metadata.fileSize || 0 };
    if (metadata.ListType === "White") return makeInlineResponse(response, url, request);
    if (metadata.ListType === "Block" || metadata.Label === "adult") {
        const referer = request.headers.get('Referer');
        const redirectUrl = referer ? "https://static-res.pages.dev/teleimage/img-block-compressed.png" : `${url.origin}/block-img.html`;
        return Response.redirect(redirectUrl, 302);
    }
    if (env.WhiteList_Mode === "true") return Response.redirect(`${url.origin}/whitelist-on.html`, 302);
    if (env.ModerateContentApiKey) {
        try {
            const moderateUrl = `https://api.moderatecontent.com/moderate/?key=${env.ModerateContentApiKey}&url=https://telegra.ph${url.pathname}${url.search}`;
            const moderateResponse = await fetch(moderateUrl);
            if (moderateResponse.ok) {
                const moderateData = await moderateResponse.json();
                if (moderateData && moderateData.rating_label) {
                    metadata.Label = moderateData.rating_label;
                    if (moderateData.rating_label === "adult") {
                        await env.img_url.put(params.id, "", { metadata });
                        return Response.redirect(`${url.origin}/block-img.html`, 302);
                    }
                }
            }
        } catch (error) { console.error("Moderation error:", error.message); }
    }
    await env.img_url.put(params.id, "", { metadata });
    return makeInlineResponse(response, url, request);
}

function makeInlineResponse(response, requestUrl, request) {
    const newHeaders = new Headers();
    const pathname = requestUrl.pathname || '';
    const ext = pathname.split('.').pop().toLowerCase();
    const mimeTypes = { 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'webp': 'image/webp', 'svg': 'image/svg+xml', 'bmp': 'image/bmp', 'ico': 'image/x-icon', 'mp4': 'video/mp4', 'webm': 'video/webm', 'mov': 'video/quicktime' };
    const correctMime = mimeTypes[ext] || 'application/octet-stream';
    newHeaders.set('Content-Type', correctMime);
    newHeaders.set('Content-Disposition', 'inline');
    newHeaders.set('Cache-Control', 'public, max-age=31536000');
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
    const contentLength = response.headers.get('content-length');
    if (contentLength) newHeaders.set('Content-Length', contentLength);
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
}

async function getFilePath(env, file_id) {
    try {
        const url = `https://api.telegram.org/bot${env.TG_Bot_Token}/getFile?file_id=${file_id}`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.ok && data.result ? data.result.file_path : null;
    } catch (error) { console.error('Error fetching file path:', error.message); return null; }
}
