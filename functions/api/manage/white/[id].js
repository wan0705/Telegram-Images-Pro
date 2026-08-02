import { LIST_TYPE, updateMetadata } from "../../../utils/metadata.js";
import { jsonResponse } from "../utils/http.js";
import { handleCORS, withCORS } from "../utils/http.js";

export async function onRequest(context) {
    // 处理 OPTIONS 预检请求
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;
    const { env, params } = context;
    const metadata = await updateMetadata(env, params.id, current => {
        current.ListType = LIST_TYPE.WHITE;
        return current;
    });

    return withCORS(jsonResponse(metadata), request);
}
