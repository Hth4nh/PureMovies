import { unrestrictedFetch } from "../network";

async function getPlaylistURLFromNguonC(embedUrl: string | URL, options: RequestInit = {}, retry = 0) {
    if (retry > 3) {
        console.warn("Failed to get playlist URL after multiple attempts.");
        return "";
    }

    // Parse the input URL
    embedUrl = new URL(embedUrl);
    embedUrl.searchParams.append("api", "stream");

    const req = await unrestrictedFetch(embedUrl, options);
    const raw = await req.text();

    // Try to find the encrypted URL in the response
    const encryptedURL = raw.match(/(?<=encryptedURL = ").*(?=";)/)?.[0];
    if (encryptedURL) {
        const playlistUrl = `conf.php?url=${encodeURIComponent(encryptedURL)}`;
        return URL.parse(playlistUrl, embedUrl.href)?.href || "";
    }

    // Try to find the stream URL in the response
    const streamURL = raw.match(
        /(?<=(?:streamURL =|url =|file:|streamUrl":|data-stream-url=)\s?").*(?="(?:;|,|}|>))/,
    )?.[0];
    if (streamURL) {
        const playlistUrl = JSON.parse(`"${streamURL}"`);
        return URL.parse(playlistUrl, embedUrl.href)?.href || "";
    }

    // Try to find the stream URL in the script tag
    const streamURLInScriptTag = raw.match(/(?<=<script.*?src=".*?url=)[^&"]*?\.m3u8[^&"]*/)?.[0];
    if (streamURLInScriptTag) {
        const playlistUrl = decodeURIComponent(streamURLInScriptTag);
        return URL.parse(playlistUrl, embedUrl.href)?.href || "";
    }

    // If no URL is found, try to find the authToken and try to find the stream URL from API
    if (raw.match(/fetch\('\?api=stream'/)) {
        const authToken = raw.match(/(?<=authToken = ['"]).*(?=['"])/)?.[0];
        const apiReq = await unrestrictedFetch(`${embedUrl.origin}${embedUrl.pathname}?api=stream`, {
            ...options,
            method: "POST",
            headers: {
                ...options.headers,
                Referer: embedUrl.href,
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-Embed-Auth": authToken ?? "",
                "X-Requuest-With": "XMLHttpRequest",
            },
            body: JSON.stringify({ hash: embedUrl.searchParams.get("hash") }),
        });

        const apiRaw = await apiReq.text();
        const apiStreamURL = apiRaw.match(/(?<=(?:streamURL =|url =|file:|streamUrl":)\s?").*(?="(?:;|,|}))/)?.[0];
        if (apiStreamURL) {
            const playlistUrl = JSON.parse(`"${apiStreamURL}"`) as string;
            if (playlistUrl.includes("?") || playlistUrl.includes("/") || playlistUrl.includes(".m3u8")) {
                return URL.parse(playlistUrl, embedUrl.href)?.href || "";
            } else {
                const decodesPlaylistUrl = atob(playlistUrl);
                return URL.parse(decodesPlaylistUrl, embedUrl.href)?.href || "";
            }
        }
    }

    // If no URL is found, try to find the encrypted payload and resend the request with it
    const encryptedPayload = raw.match(/(?<=input.value = ").*(?=";)/)?.[0];
    if (encryptedPayload) {
        const optionsWithPayload = {
            ...options,
            method: "POST",
            headers: {
                ...options.headers,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `payload=${encodeURIComponent(JSON.parse(`"${encryptedPayload}"`))}`,
        };

        return getPlaylistURLFromNguonC(embedUrl, optionsWithPayload, retry + 1);
    }

    // If all above fails, return the embed URL with "get.php" instead of "embed.php"
    return embedUrl.href.replace("embed.php", "get.php");
}

export async function getPlaylistURL(embedUrl: string | URL) {
    // Parse the input URL
    embedUrl = new URL(embedUrl);

    // kkphim
    if (embedUrl.hostname.includes("phimapi") && embedUrl.searchParams.has("url")) {
        return embedUrl.searchParams.get("url") ?? "";
    }

    // ophim
    if (embedUrl.hostname.includes("opstream")) {
        const req = await unrestrictedFetch(embedUrl);
        const raw = await req.text();

        const playlistUrl = raw.match(/(?<=const url = ").*(?=";)/)?.[0];
        return URL.parse(String(playlistUrl), embedUrl)?.href || "";
    }

    if (embedUrl.hostname.includes("streamc")) {
        return getPlaylistURLFromNguonC(embedUrl);
    }

    // For other cases, return the original embed URL
    return embedUrl.href;
}
