// ==UserScript==
// @name             PureMovies
// @namespace        Hth4nh
// @version          1.2.4.2
// @description      PureMovies là một user-script hoàn hảo dành cho những ai yêu thích trải nghiệm xem phim liền mạch, không bị gián đoạn bởi quảng cáo "lậu" trong phim. Hy vọng sẽ mang đến cảm giác thoải mái và tập trung, giúp bạn tận hưởng từng khoảnh khắc của bộ phim một cách trọn vẹn nhất.
// @author           Thành Hoàng Trần (@hth4nh) và Team CukiPirate
// @updateURL        https://github.com/Hth4nh/PureMovies/raw/refs/heads/main/PureMovies.user.js
// @downloadURL      https://github.com/Hth4nh/PureMovies/raw/refs/heads/main/PureMovies.user.js
// @match            http*://kkphim.com/*
// @match            http*://phim.nguonc.com/*
// @match            http*://ophim17.cc/*
// @match            https://player.phimapi.com/player/*
// @match            http*://*.streamc.xyz/*
// @match            http*://vip.opstream10.com/share/*
// @match            http*://vip.opstream11.com/share/*
// @match            http*://vip.opstream12.com/share/*
// @match            http*://vip.opstream13.com/share/*
// @match            http*://vip.opstream14.com/share/*
// @match            http*://vip.opstream15.com/share/*
// @match            http*://vip.opstream16.com/share/*
// @match            http*://vip.opstream17.com/share/*
// @match            http*://kkphim.vip/*
// @match            http*://kkphim1.com/*
// @match            http*://img.phimapi.com/*
// @match            https://216.180.226.222/*
// @icon             https://www.google.com/s2/favicons?sz=128&domain=kkphim.com
// @run-at           document-end
// @grant            none
// ==/UserScript==

/* global Artplayer, Hls, url */

let DEBUG = false;

try {
    window.url = url;
} catch(e) {}

let console = {
    log: () => {},
    error: () => {},
}

URL.parse ??= (url, base) => {
    try {
        return new URL(url, base);
    }
    catch (e) {
        console.error(e);
        return null;
    }
};


async function loadScript(src) {
    try {
        const response = await fetch(src);
        if (!response.ok) {
            throw new Error(`Failed to load script: ${src}`);
        }

        const scriptContent = (await response.text())
        .split("\n")
        .filter(line => !line.startsWith("//")) // Remove comments
        .join("\n")
        .replaceAll("console.log", "(()=>{})"); // Suppress console.log

        // Create a script element and set its type and content
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.textContent = scriptContent;

        // Append the script to the head
        document.head.appendChild(script);

    } catch (error) {
        console.error(error);
    }
}


let blobURLMap = {};

async function convertToBlobURL(_url) {
    // Parse the input URL and check if its blob representation is already cached
    let url = new URL(_url);
    if (blobURLMap[url.href]) return blobURLMap[url.href];

    // Fetch the content of the URL
    let req = await fetch(url);
    let res = await req.text();

    // Adjust relative paths in the playlist by converting them to absolute URLs
    res = res.replace(/^[^#].*$/gm, (line) => URL.parse(line, url)?.toString?.() ?? line);

    // If the content is a master playlist, recursively process its last URI
    if (res.includes("#EXT-X-STREAM-INF")) {
        blobURLMap[url.href] = await convertToBlobURL(res.trim().split("\n").at(-1));
        return blobURLMap[url.href];
    }

    const regexList = [
        /(?<!#EXT-X-DISCONTINUITY[\s\S]*)#EXT-X-DISCONTINUITY\n(?:.*?\n){20}#EXT-X-DISCONTINUITY\n(?![\s\S]*#EXT-X-DISCONTINUITY)/g,
        /#EXT-X-DISCONTINUITY\n(?:#EXTINF:(?:2.00|3.80|1.76|2.00|2.16|1.64|1.68|1.52|1.84)0000,\n.*\n){9}(?=#EXT-X-DISCONTINUITY)/g,
    ]

    // Remove ads
    if (DEBUG) {
        res = [
            ...res.split("\n").slice(0, 5),
            ...regexList.reduce((arr, regex) => {
                return [ ...arr, ...(res.match(regex) ?? []) ];
            }, []),
            ...res.split("\n").slice(-2),
        ].join('\n') || '';
    }
    else {
        res = regexList.reduce((res, regex) => {
            return res.replaceAll(regex, '');
        }, res);
    }

    // Convert the content to blob URL and cache it
    blobURLMap[url.href] = URL.createObjectURL(new Blob([res], {
        type: 'application/vnd.apple.mpegurl'
    }));

    return blobURLMap[url.href];
}

async function getM3u8URL(_url) {
    let url = new URL(_url);

    if (url.hostname.includes("phimapi")) {
        return url.searchParams.get("url");
    }

    if (url.hostname.includes("opstream") || url.hostname.includes("player.phimapi")) {
        return URL.parse(window.url, url)?.toString?.();
    }

    if (url.hostname.includes("streamc")) {
        return url.toString().replace("embed.php", "get.php");
    }

    return url.href;
}


async function changeUrl(_url) {
    window.player.hls?.destroy?.();
    window.player.video.removeAttribute('src');
    window.player.video.load();

    let url = await getM3u8URL(_url);
    let blobUrl = await convertToBlobURL(url);

    // Change url
    if (Hls.isSupported()) {
        const hls = new Hls({
            xhrSetup: (xhr) => {
                console.log(xhr);
                xhr.setRequestHeader('Referer', _url);
            }
        });

        hls.loadSource(blobUrl);
        hls.attachMedia(window.player.video);

        window.player.hls = hls;
        window.player.on('destroy', () => hls.destroy());
    }
    else if (window.player.video.canPlayType('application/vnd.apple.mpegurl')) {
        window.player.video.src = blobUrl;
    }

    // Play video
    window.player.play()
}

function createIframe(parentQuery, url = "") {
    let container = document.createElement("iframe");
    container.classList.add("vid-container", "w-full", "mx-2", "sm:mx-0", "mt-4", "rounded-lg");
    container.setAttribute("allowfullscreen", "");
    container.style.background = "black"
    container.style.aspectRatio = "16/9"
    container.style.overflow = "hidden"
    container.style.maxHeight = "80vh";

    container.src = url;

    let parent = document.querySelector(parentQuery);
    parent.append(container);

    return container;
}

function initEpsListOnClick(parentQuery) {
    // Create "scroll to here"
    if (!window.scrollToHereWrapper) {
        let scrollToHere = document.createElement("div");
        scrollToHere.style.position = "absolute"
        scrollToHere.style.bottom = "10vh"

        let scrollToHereWrapper = document.createElement("div");
        scrollToHereWrapper.style.position = "relative"

        scrollToHereWrapper.append(scrollToHere);

        window.scrollToHere = scrollToHere;
        window.scrollToHereWrapper = scrollToHereWrapper;
    }

    // Add to HTML
    let parent = document.querySelector(parentQuery);
    parent.append(window.scrollToHereWrapper);

    // Add click event to change video
    parent.onclick = (e) => {
        e.preventDefault();

        if (e.target.tagName == 'A' && e.target.style.filter != "invert(1)") {
            if (window.prevA) window.prevA.style.filter = "";
            window.prevA = e.target;

            window.container?.remove();
            window.container = createIframe(parentQuery, e.target.href);
        }

        if (e.target.tagName == 'A') {
            window.scrollToHere.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
}

async function detectEpisodeList(targetQuery, epsListParentQuery) {
    const callbackFn = (url, container) => Promise.resolve(() => {
        container.src = "";
    }).then(() => {
        container.src = url;
    });

    const targetNode = document.querySelector(targetQuery);
    if (targetNode.lastElementChild.classList.contains("px-8")) {
        initEpsListOnClick(epsListParentQuery);
        document.querySelectorAll("#list_episode ~ * > button").forEach(elem => elem.click());
    }

    const observer = new MutationObserver((mutationsList) => {
        if (targetNode.lastElementChild.classList.contains("px-8")) {
            initEpsListOnClick(epsListParentQuery);
            document.querySelectorAll("#list_episode ~ * > button").forEach(elem => elem.click());
        }
        else if (window.container) {
            window.container.remove();
        }
    });

    observer.observe(targetNode, { childList: true });
}

function createArtplayer(url = "") {
    return new Artplayer({
        container: '.vid-container',
        url: "",
        autoplay: true,
        autoSize: false,
        loop: false,
        mutex: true,
        setting: true,
        pip: true,
        flip: false,
        lock: true,
        fastForward: true,
        playbackRate: true,
        aspectRatio: true,
        theme: '#ff0057',
        fullscreen: true,
        fullscreenWeb: false,
        miniProgressBar: true,
        autoOrientation: true,
        airplay: false,
        whitelist: ['*'],
    });
}

function injectPlayer(container, parentQuery, callbackFn = () => {}) {
    container.style.display = "none"

    if (!window.scrollToHereWrapper) {
        let scrollToHere = document.createElement("div");
        scrollToHere.style.position = "absolute"
        scrollToHere.style.bottom = "10vh"

        let scrollToHereWrapper = document.createElement("div");
        scrollToHereWrapper.style.position = "relative"

        scrollToHereWrapper.append(scrollToHere);

        window.scrollToHere = scrollToHere;
        window.scrollToHereWrapper = scrollToHereWrapper;
    }

    // Add to HTML
    let parent = document.querySelector(parentQuery);
    parent.append(window.scrollToHereWrapper);
    parent.append(container);

    // Add click event to change video
    parent.onclick = (e) => {
        e.preventDefault();

        if (e.target.tagName == 'A' && e.target.style.filter != "invert(1)") {
            if (window.prevA) window.prevA.style.filter = "";
            window.prevA = e.target;

            e.target.style.filter = "invert(1)";
            container.style.display = "block";

            callbackFn(e.target.href, container);
        }

        if (e.target.tagName == 'A') {
            window.scrollToHere.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
}

function initPlayer(parentQuery = "body") {
    // Create video container
    let container = document.createElement("div");
    container.classList.add("vid-container", "w-full", "h-full", "mx-2", "sm:mx-0", "mt-4", "rounded-lg");
    container.style.aspectRatio = "16/9";
    container.style.overflow = "hidden";
    container.style.maxHeight = "80vh";

    injectPlayer(container, parentQuery, (url) => changeUrl(url));
    window.player = createArtplayer();
}

(async function main() {
    // Replace logo
    let logoURL = "data:image/png;base64,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";
    let logoAlt = "Cuki's PureMovie";

    let imgElemList = document.querySelectorAll("img[src*=ogo]");

    imgElemList.forEach(img => {
        img.src = logoURL;
        img.alt = logoAlt;
        img.style.height = "40px"
        img.style.width = "initial"
        if (DEBUG) img.style.transform = `rotate(180deg)`;
    })

    // Import lib (iOS support)
    window.Hls ?? await loadScript("https://cdn.jsdelivr.net/npm/hls.js");
    window.Artplayer ?? await loadScript("https://cdn.jsdelivr.net/npm/artplayer");

    if ((location.hostname.includes("kkphim") || location.hostname === "216.180.226.222") && (location.pathname.startsWith("/index.php/vod/detail/") || location.pathname.startsWith("/phim/"))) {
        initPlayer("#list_episode > div:nth-child(2)");
        document.querySelectorAll("#list_episode ~ * > button").forEach(elem => elem.click());
    }
    else if (location.hostname.includes("nguonc")) {
        detectEpisodeList("#content", "#list_episode > div:nth-child(2)");
    }
    else if (location.hostname.includes("ophim")) {
        detectEpisodeList(".container", ".mt-0 > div[id^=headlessui-disclosure-panel] > div");
    }
    else if (location.hostname.includes("opstream") || location.hostname.includes("streamc") || location.hostname.includes("player.phimapi")) {
        // Create video container
        let container = document.createElement("div");
        container.classList.add("vid-container");
        container.style = "position: absolute; left: 0; right: 0; top: 0; bottom: 0; width: 100%; height: 100%;";

        // Add to HTML
        document.body.replaceChildren(container);

        // Init player
        window.player = createArtplayer();

        changeUrl(location.href);
    }
})();
