import GM_fetch from "@trim21/gm-fetch";
import { remoteImport } from "../misc/remoteImport";
import { createNotification } from "../ui";
import { instances } from "../misc/state";

/**
 * Performs a fetch request using `GM_fetch` to potentially bypass CORS.
 * Handles Kodi-style headers embedded within the URL string itself (for string, URL, or Request inputs).
 *
 * @remarks
 * - Depends on the availability of `GM_fetch` in the environment (typically a userscript).
 * - Uses the native `fetch` for `blob:` and `data:` URLs.
 * - Headers following a '|' in the input URL string (e.g., `url|key=value&key2=value2`)
 *   are parsed and merged. Values should be URL-encoded if they contain special characters.
 * - Header merging precedence: `options.headers` > headers from URL (Kodi) > headers from `input` (if it's a Request).
 *
 * @param input The resource information to fetch. Can be a URL string (will be converted to URL object), URL object, or `Request` object. The URL part can contain Kodi-style headers after a '|'.
 * @param options Configuration options for the request, similar to the native `fetch`'s `RequestInit`. Defaults to an empty object.
 * @returns A `Promise` that resolves to the `Response` object.
 * @throws {TypeError} If the input string is not a valid URL.
 * @async
 * @example
 * // Fetch with Kodi-style headers in a URL string
 * await unrestrictedFetch('https://api.example.com/data|X-Token=mytoken&Cache-Control=no-cache');
 *
 * @example
 * // Fetch using a Request object, Kodi headers in its URL still work
 * const requestWithKodiHeaders = new Request('https://api.example.com/other|Auth=123');
 * await unrestrictedFetch(requestWithKodiHeaders, { headers: { 'Accept': 'application/json' } });
 */
export async function unrestrictedFetch(input: RequestInfo | URL, options: RequestInit = {}): Promise<Response> {
    if (typeof input === "string") {
        // Parse the input URL
        input = new URL(input);
    }

    // Get the protocol for blob/data check - works for both URL and Request
    const protocol = input instanceof Request ? new URL(input.url).protocol : input.protocol;

    // Use native fetch for local URL schemes not requiring network/CORS.
    if (protocol === "blob:" || protocol === "data:") {
        // Pass the original input to native fetch
        return fetch(input, options);
    }

    // Determine the raw URL string (including potential Kodi headers)
    const rawUrlString = input instanceof Request ? input.url : input.href;

    // Separate the actual URL from the Kodi-style header string.
    const [requestUrl, kodiHeaderString = ""] = rawUrlString.split(/#?\|/, 2);

    // Parse the Kodi-style header string.
    const kodiStyleHeaders = kodiHeaderString
        .split("&")
        .filter(Boolean)
        .reduce((headers: Record<string, string>, pair) => {
            const separatorIndex = pair.indexOf("=");
            if (separatorIndex > 0) {
                const key = pair.slice(0, separatorIndex);
                const value = decodeURIComponent(pair.slice(separatorIndex + 1));
                headers[key] = value;
            }
            return headers;
        }, {});

    // Prepare base options and initial headers, potentially deriving from the Request object.
    const baseOptions: RequestInit = {};
    let initialHeaders: HeadersInit = {};

    if (input instanceof Request) {
        Object.assign(baseOptions, {
            method: input.method,
            body: input.body,
            cache: input.cache,
            credentials: input.credentials,
            mode: input.mode,
            redirect: input.redirect,
            referrer: input.referrer,
            integrity: input.integrity,
        } as RequestInit);

        initialHeaders = Object.fromEntries(input.headers.entries());
        // signal is handled by options spreading
    }

    // Merge headers in the correct order of precedence.
    const finalHeaders = {
        ...initialHeaders,
        ...kodiStyleHeaders,
        ...options.headers,
    };

    // Workaround: Download GM_fetch if is not found
    try {
        if (!GM_fetch) throw "";
    } catch (e) {
        console.warn("GM_fetch not found. Run workaround...");
        instances.notification ??= await createNotification();

        instances.notification?.open({
            type: "warning",
            message: "GM_fetch not found. Run workaround...",
        });

        // @ts-expect-error
        window.tmp = await remoteImport("https://cdn.jsdelivr.net/npm/@trim21/gm-fetch", "GM_fetch");
        eval("GM_fetch = window.tmp;");
    }

    // Call GM_fetch with the processed URL and merged options/headers.
    return GM_fetch(requestUrl, {
        ...baseOptions,
        ...options,
        headers: finalHeaders,
    });
}

export default unrestrictedFetch;
