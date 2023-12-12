import { bitable } from "@lark-base-open/js-sdk";
import { getAuthMeta } from "./app/actions";

export async function auth(){
    const meta = await getAuthMeta();
    return {user: {id: meta?.userId}}
}