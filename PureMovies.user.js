// ==UserScript==
// @name             Cuki's PureMovie
// @namespace        Hth4nh
// @version          2.0
// @description      Cuki's PureMovie là một user-script hoàn hảo dành cho những ai yêu thích trải nghiệm xem phim liền mạch, không bị gián đoạn bởi quảng cáo "lậu" trong phim. Hy vọng sẽ mang đến cảm giác thoải mái và tập trung, giúp bạn tận hưởng từng khoảnh khắc của bộ phim một cách trọn vẹn nhất.
// @author           Thành Hoàng Trần (@hth4nh) & Cuki's Pirate team
// @updateURL        https://github.com/Hth4nh/PureMovies/raw/refs/heads/main/PureMovies.user.js
// @downloadURL      https://github.com/Hth4nh/PureMovies/raw/refs/heads/main/PureMovies.user.js
// @match            https://kkphim.com/*
// @match            https://phim.nguonc.com/*
// @match            https://ophim17.cc/*
// @match            https://player.phimapi.com/player/*
// @match            https://*.streamc.xyz/*
// @match            https://vip.opstream10.com/share/*
// @match            https://vip.opstream11.com/share/*
// @match            https://vip.opstream12.com/share/*
// @match            https://vip.opstream13.com/share/*
// @match            https://vip.opstream14.com/share/*
// @match            https://vip.opstream15.com/share/*
// @match            https://vip.opstream16.com/share/*
// @match            https://vip.opstream17.com/share/*
// @match            https://vip.opstream90.com/share/*
// @match            https://kkphim.vip/*
// @match            https://kkphim1.com/*
// @match            https://img.phimapi.com/*
// @match            https://216.180.226.222/*
// @icon             https://www.google.com/s2/favicons?sz=128&domain=kkphim.com
// @grant            GM.info
// @grant            GM.getResourceUrl
// @grant            GM.setValue
// @grant            GM.getValue
// @grant            GM_addValueChangeListener
// @grant            GM.xmlHttpRequest
// @grant            GM.fetch
// @grant            GM.registerMenuCommand
// @grant            unsafeWindow
// @require          https://cdn.jsdelivr.net/npm/hls.js
// @require          https://cdn.jsdelivr.net/npm/artplayer
// @require          https://cdn.jsdelivr.net/npm/notyf
// @resource         customCss           https://github.com/Hth4nh/PureMovies/raw/refs/heads/main/style.css
// @resource         customLogo          https://github.com/Hth4nh/PureMovies/raw/refs/heads/main/logo.png
// @run-at           document-start
// @connect          phim1280.tv
// @connect          streamc.xyz
// @connect          opstream10.com
// @connect          opstream11.com
// @connect          opstream12.com
// @connect          opstream13.com
// @connect          opstream14.com
// @connect          opstream15.com
// @connect          opstream16.com
// @connect          opstream17.com
// @connect          opstream90.com
// @connect          *
// ==/UserScript==

/* global Artplayer, Hls, Notyf, url */

function GM_getResourceURL(name, isBlobUrl = true) {
    if (!GM.info?.script?.resources) {
        throw new Error('GM.info.resources is not available');
    }

    console.log(GM.info.script.resources);

    const resource = GM.info.script.resources.find(res => res.name === name);
    if (!resource?.content || !resource?.meta) {
        throw new Error('Resource not found or missing required properties: ' + name);
    }

    if (isBlobUrl) {
        const blob = new Blob([resource.content], { type: resource.meta });
        return URL.createObjectURL(blob);
    }
    else {
        return `data:${resource.meta};base64,${btoa(resource.content)}`;
    }
}

GM.fetch ??= function(url, options = {}) {
    return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
            method: options.method || "GET",
            url: url,
            headers: options.headers || {},
            responseType: "arraybuffer",
            onload: function(response) {
                let headers = new Headers();
                response.responseHeaders.split("\r\n").forEach(line => {
                    let [key, ...value] = line.split(": ");
                    if (key && value.length) {
                        headers.append(key.trim(), value.join(": ").trim());
                    }
                });

                resolve(new Response(response.response, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: headers
                }));
            },
            onerror: function(error) {
                reject(error);
            }
        });
    });
};

async function init() {
    // Init info
    window.info = {
        author: "Thành Hoàng Trần (@hth4nh) và Team Cuki's Pirate",
        grant: [
            "GM.info",
            "GM.getResourceUrl",
            "GM.setValue",
            "GM.getValue",
            "GM.xmlHttpRequest",
            "GM.registerMenuCommand",
            "unsafeWindows",
        ],

        ...GM.info.script,
    }

    // Debug: console.warn if grant is not available
    window.info.grant.forEach(grant => {
        try {
            eval(`${grant}.constructor`)
        }
        catch(e) {
            console.warn(e)
        }
    });

    // Init config
    window.config = {
        logoURL: GM_getResourceURL("customLogo", false),
        betWarning: "Hành vi cá cược, cờ bạc online <b>LÀ VI PHẠM PHÁP LUẬT</b><br>theo Điều 321 Bộ luật Hình sự 2015 (sửa đổi, bổ sung 2017)",

        debug: false,
        flash: false,
    };

    // Init debug state
    GM.getValue("DEBUG", false).then(val => {
        window.config.debug = val
    });

    // Debug toggle detect (only work with GM 3 API)
    try {
        GM_addValueChangeListener?.("DEBUG", (key, oldValue, newValue, remote) => {
            window.config.debug = newValue;

            replaceLogo();
            Object.keys(window.blobURLMap).forEach(key => delete window.blobURLMap[key]);

            if (window.container) {
                window.container.style.outline = `${window.config.debug*1}rem solid cyan`;
            }
        });
    }
    catch(e) {}

    // Init m3u8 url for player.phimapi & opstream
    try {
        window.url = url;
    } catch (e) {}

    // Init blob pool
    window.blobURLMap = {};

    // Disable Hls
    unsafeWindow.Hls = new Proxy(class {}, {
        construct(target, args) {
            return new Proxy({}, {
                get() {
                    return () => true;
                }
            });
        },
        get(target, prop) {
            return () => true;
        }
    });

    // Toggle debug
    GM.registerMenuCommand("Debug", async function(event) {
        window.config.debug = !window.config.debug;
        GM.setValue("DEBUG", window.config.debug);

        replaceLogo();
        Object.keys(window.blobURLMap).forEach(key => delete window.blobURLMap[key]);

        if (window.container) {
            window.container.style.outline = `${window.config.debug*1}rem solid cyan`;
        }
    });

    // Toggle flash
    GM.registerMenuCommand("Flash", async function(event) {
        window.config.flash = !window.config.flash;

        requestAnimationFrame(function switchMode() {
            if (window.config.flash) {
                document.body.parentElement.style.filter = "invert(1)";
                requestAnimationFrame(() => {
                    document.body.parentElement.style.filter = "";
                    requestAnimationFrame(switchMode);
                });
            }
        });
    });

    // Inject CSS
    document.head.insertAdjacentHTML("beforeend", `<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/fa-solid-900.woff2" as="font" type="font/woff2" crossorigin="anonymous">`);
    document.head.insertAdjacentHTML("beforeend", `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/fontawesome.min.css">`);
    document.head.insertAdjacentHTML("beforeend", `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/solid.min.css">`);
    document.head.insertAdjacentHTML("beforeend", "<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css\">");
}

function createLogo(img = document.createElement("img")) {
    img.src = window.config.logoURL;
    img.alt = window.info.name;
    img.style.display = "initial"
    img.style.height = "40px"
    img.style.padding = "0 10px"
    img.style.width = "initial"
    img.style.transition = "0.5s"

    return img;
}

function replaceLogo() {
    window.imgParent ??= document.querySelector(".mr-3.flex-none.overflow-hidden.w-auto > span > a");
    if (window.imgParent) {
        window.imgParent.parentElement.parentElement.classList.remove("overflow-hidden");

        if (!window.logo) {
            window.logo = createLogo(window.imgParent.firstElementChild);
            window.imgParent.replaceChildren(window.logo);
        }

        window.logo.style.transform = `rotate(${window.config.debug*180}deg) scaleY(${window.config.debug*-2 + 1}) scaleX(${window.config.debug*-2 + 1})`;
        window.logo.style.filter = `invert(${window.config.debug*1})`;
    }
}

async function convertToBlobURL(_url) {
    // Parse the input URL and check if its blob representation is already cached
    let url = new URL(_url);
    if (window.blobURLMap[url.href]) {
        return window.blobURLMap[url.href];
    }

    // Fetch the content of the URL
    let req = await GM.fetch(url);
    let res = await req.text();

    // Adjust relative paths in the playlist by converting them to absolute URLs
    res = res.replace(/^[^#].*$/gm, (line) => URL.parse(line, url)?.toString?.() ?? line);

    // If the content is a master playlist, recursively process its last URI
    if (res.includes("#EXT-X-STREAM-INF")) {
        window.blobURLMap[url.href] = await convertToBlobURL(res.trim().split("\n").at(-1));
        return window.blobURLMap[url.href];
    }

    const regexList = [
        /(?<!#EXT-X-DISCONTINUITY[\s\S]*)#EXT-X-DISCONTINUITY\n(?:.*?\n){20}#EXT-X-DISCONTINUITY\n(?![\s\S]*#EXT-X-DISCONTINUITY)/g,
        /#EXT-X-DISCONTINUITY\n(?:#EXTINF:(?:2.00|2.00|2.34|2.66|2.00|2.38|2.00|0.78|1.96)0000,\n.*\n){9}#EXT-X-DISCONTINUITY\n(?:#EXTINF:(?:2.00|2.74|2.22|2.00|1.36|2.00|2.00|0.72)0000,\n.*\n){8}(?=#EXT-X-DISCONTINUITY)/g,
    ]

    // Remove ads
    if (window.config.debug) {
        res = [
            ...res.split("\n").slice(0, 5),
            ...regexList.reduce((arr, regex) => {
                return [ ...arr, ...(res.match(regex) ?? []) ];
            }, []),
            ...res.split("\n").slice(-2),
        ].join("\n") || "";
    }
    else {
        let oldLen = res.length;

        res = regexList.reduce((res, regex) => {
            return res.replaceAll(regex, "");
        }, res);

        if (res.length === oldLen && !location.hostname.includes("streamc") && !location.hostname.includes("nguonc")) {
            window.player.controls.add({
                name: "noadserror",
                index: 2,
                position: "right",
                html: "<i class=\"fa-solid fa-triangle-exclamation fa-lg\"></i>",
                tooltip: "Không tìm thấy quảng cáo - Bấm để báo cáo lỗi",
                style: {
                    color: "#FFCC00",
                },
                click: function () {
                    const title = `No ads detected - ${location.hostname}`;
                    const body = [
                        `Version: \`v${window.info.version}\``,
                        `User Agent: \`${navigator.userAgent}\``,
                        `URL: ${location.href}`,
                        `.m3u8 URL: ${_url}`,
                    ].join("\n");

                    window.open(`https://github.com/Hth4nh/PureMovies/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=bug&assignees=${window.info.author}`, "_blank");
                },
            });
            console.error("Không tìm thấy quảng cáo");
        }
    }

    // Convert the content to blob URL and cache it
    window.blobURLMap[url.href] = URL.createObjectURL(new Blob([res], {
        type: "application/vnd.apple.mpegurl"
    }));

    return window.blobURLMap[url.href];
}

async function getM3u8URL(_url) {
    let url = new URL(_url);

    if (url.hostname.includes("phimapi")) {
        return url.searchParams.get("url");
    }

    if (url.hostname.includes("opstream") /* || url.hostname.includes("player.phimapi")*/) {
        const req = await GM.fetch(url);
        const raw = await req.text();

        const newUrl = raw.match(/(?<=const url = ").*(?=";)/)?.[0];
        return URL.parse(newUrl, url)?.toString?.();
    }

    if (url.hostname.includes("streamc")) {
        return url.toString().replace("embed.php", "get.php");
    }

    return url.href;
}

class HLSLoader extends Hls.DefaultConfig.loader {
    constructor(config) {
        super(config);
        this.request = null;
    }

    load(context, config, callbacks) {
        const { url, responseType } = context;
        const { onSuccess, onError, onProgress, onTimeout } = callbacks;

        console.log("Intercepting request:", url);

        let headers = {
            "Accept": "*/*",
            "Cache-Control": "no-cache",
        };

        if (this.xhrSetup) {
            try {
                this.xhrSetup({
                    setRequestHeader: (key, value) => {
                        headers[key] = value;
                    }
                }, url);
            } catch (e) {
                console.warn("xhrSetup error:", e);
            }
        }

        let startTime = performance.now();

        this.request = GM.xmlHttpRequest({
            method: "GET",
            url: url,
            responseType: responseType || "arraybuffer",
            headers: headers,
            timeout: config.timeout || 30000,

            // Xử lý khi request thành công
            onload: (response) => {
                let endTime = performance.now();
                const stats = {
                    aborted: false,
                    loaded: response.response.byteLength || response.response.length,
                    total: response.response.byteLength || response.response.length,
                    retry: 0,
                    chunkCount: 0,
                    bwEstimate: (response.response.byteLength * 8) / ((endTime - startTime) / 1000),
                    loading: { start: startTime, first: startTime, end: endTime },
                    parsing: { start: 0, end: 0 },
                    buffering: { start: 0, first: 0, end: 0 }
                };

                onSuccess({
                    url: response.url,
                    data: response.response
                }, stats, context);
            },

            // Xử lý khi có lỗi xảy ra
            onerror: (error) => {
                onError({ code: error.status || 0, text: error.statusText || "Unknown Error" }, context, error);
            },
        });
    }

    abort() {
        this.request?.abort();
    }
}

async function changeUrl(_url) {
    window.player?.destroy();
    window.player = createArtplayer();

    let url = await getM3u8URL(_url);
    let blobUrl = await convertToBlobURL(url);


    // Change url
    if (Hls.isSupported()) {
        const hls = new Hls({
            loader: HLSLoader,
            xhrSetup: function(xhr) {
                xhr.setRequestHeader("Referer", _url);
            },
        });

        hls.loadSource(blobUrl);
        hls.attachMedia(window.player.video);

        window.player.hls = hls;
        window.player.on("destroy", () => hls.destroy());
    }
    else if (window.player.video.canPlayType("application/vnd.apple.mpegurl")) {
        window.player.video.src = blobUrl;
    }

    // Play video
    window.player.play()
}

function initEpsListOnClick(parentQuery, callbackFn = () => {}) {
    // Add click event to change video
    document.querySelector(parentQuery).onclick = (e) => {
        e.preventDefault();

        if (e.target.tagName == "A" && e.target.style.filter != "invert(1)") {
            if (window.prevA) {
                window.prevA.style.transform = "";
                window.prevA.style.filter = "";
            }
            window.prevA = e.target;

            e.target.style.transition = "0.5s"
            e.target.style.transform = `rotate(180deg) scaleY(-1) scaleX(-1)`;
            e.target.style.filter = `invert(1)`;

            callbackFn(e.target.href);
        }

        if (e.target.tagName == "A" && window.container) {
            const rect = window.container.getBoundingClientRect();
            const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

            if (rect.top - 40 - 3 * rem < 0) {
                window.scrollTo({
                    top: window.pageYOffset + rect.top - 40 - 3 * rem,
                    behavior: "smooth"
                });

            }
            else if (rect.bottom + rem > window.innerHeight) {
                window.scrollTo({
                    top: window.pageYOffset + rect.bottom - window.innerHeight + rem,
                    behavior: "smooth"
                });
            }
        }
    }
}

function detectEpisodeList(targetQuery, epsListParentQuery) {
    const callbackFn = (url) => {
        window.container ??= createContainer(epsListParentQuery, "div");

        window.notyf.dismissAll();
        window.notyf.open({
            type: "info",
            message: window.config.betWarning
        });

        window.container.style.display = ""
        changeUrl(url)
    }

    const targetNode = document.querySelector(targetQuery);
    if (targetNode.lastElementChild.classList.contains("px-8")) {
        initEpsListOnClick(epsListParentQuery, callbackFn);
    }

    const observer = new MutationObserver((mutationsList) => {
        if (targetNode.lastElementChild.classList.contains("px-8")) {
            initEpsListOnClick(epsListParentQuery, callbackFn);
        }
        else if (window.container) {
            window.player?.destroy();
            window.container.remove();
            delete window.container;
        }
    });

    observer.observe(targetNode, { childList: true });
}

function createArtplayer(url = "") {
    return new Artplayer({
        container: ".vid-container",
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
        theme: "#ff0057",
        fullscreen: true,
        fullscreenWeb: false,
        miniProgressBar: true,
        autoOrientation: true,
        airplay: false,
        whitelist: ["*"],
        lang: "vi-vn",
        i18n: {
            "vi-vn": {
                "Video Info": "Thông tin video",
                "Close": "Đóng",
                "Video Load Failed": "Tải video thất bại",
                "Volume": "Âm lượng",
                "Play": "Phát",
                "Pause": "Tạm dừng",
                "Rate": "Tốc độ",
                "Mute": "Tắt tiếng",
                "Video Flip": "Lật video",
                "Horizontal": "Ngang",
                "Vertical": "Dọc",
                "Reconnect": "Kết nối lại",
                "Show Setting": "Cài đặt",
                "Hide Setting": "Ẩn cài đặt",
                "Screenshot": "Chụp màn hình",
                "Play Speed": "Tốc độ phát",
                "Aspect Ratio": "Tỷ lệ khung hình",
                "Default": "Mặc định",
                "Normal": "Bình thường",
                "Open": "Mở",
                "Switch Video": "Chuyển video",
                "Switch Subtitle": "Chuyển phụ đề",
                "Fullscreen": "Toàn màn hình",
                "Exit Fullscreen": "Thoát toàn màn hình",
                "Web Fullscreen": "Toàn màn hình trình duyệt",
                "Exit Web Fullscreen": "Thoát toàn màn hình trình duyệt",
                "Mini Player": "Trình phát mini",
                "PIP Mode": "Phát trong hình",
                "Exit PIP Mode": "Thoát phát trong hình",
                "PIP Not Supported": "Không hỗ trợ phát trong hình",
                "Fullscreen Not Supported": "Không hỗ trợ toàn màn hình",
                "Subtitle Offset": "Độ trễ phụ đề",
                "Last Seen": "Lần xem cuối",
                "Jump Play": "Nhảy đến đoạn phát",
                "AirPlay": "Phát qua AirPlay",
                "AirPlay Not Available": "AirPlay không khả dụng"
            },
        },
        controls: [
            {
                position: "left",
                name: "fast-rewind",
                index: 10,
                html: "<i class=\"fa-solid fa-backward fa-lg\"></i>",
                tooltip: "10 giây trước",
                click: function () {
                    window.player.seek = this.currentTime - 10
                }
            },
            {
                position: "left",
                name: "fast-forward",
                index: 11,
                html: "<i class=\"fa-solid fa-forward fa-lg\"></i>",
                tooltip: "10 giây sau",
                click: function () {
                    window.player.seek = this.currentTime + 10
                }
            },
            {
                position: "right",
                html: `<img src="${window.config.logoURL}" style="height: 25px; padding: 0 7px; transform: translateY(-12%);">`,
                index: 1,
                tooltip: window.info.name
            }
        ],
    });
}

function createContainer(parentQuery = "body", tagName = "div") {
    let container = document.createElement(tagName);
    container.classList.add("vid-container", "w-full", "mx-2", "sm:mx-0", "mt-4", "rounded-lg");
    container.setAttribute("allowfullscreen", "");
    container.style.background = "black"
    container.style.aspectRatio = "16/9"
    container.style.overflow = "hidden"
    container.style.maxHeight = "min(70vh, calc(100vh - 40px - 4rem))";
    container.style.outline = `${window.config.debug*1}rem solid cyan`;

    // Add to HTML
    let parent = document.querySelector(parentQuery);
    parent.append(container);

    return container;
}

function replacePlayer() {
    document.body.parentElement.style.background = "black";

    // Create video container
    let container = document.createElement("div");
    container.classList.add("vid-container");
    container.style = "position: absolute; left: 0; right: 0; top: 0; bottom: 0; width: 100%; height: 100%;";

    // Add to HTML
    document.body.replaceChildren(container);

    changeUrl(location.href);
}

function injectPlayer() {
    let epsListParentQuery = "#list_episode > div:nth-child(2)"

    window.container = createContainer(epsListParentQuery, "div");
    window.container.style.display = "none";

    initEpsListOnClick(epsListParentQuery, (url) => {
        window.notyf.dismissAll();
        window.notyf.open({
            type: "info",
            message: window.config.betWarning
        });

        window.container.style.display = ""
        changeUrl(url)
    });
}

function domInit() {
    // Replace logo
    replaceLogo();

    // Inject custom CSS
    document.head.insertAdjacentHTML("beforeend", `<link rel="stylesheet" href="${GM_getResourceURL("customCss")}">`);

    // Init notyf
    window.notyf = new Notyf({
        duration: 7000,
        dismissible: true,
        position: {
            x: "right",
            y: "top",
        },
        types: [
            {
                type: "info",
                background: "#3b82f6",
                icon: {
                    className: "fas fa-info-circle",
                    tagName: "i",
                    color: "white",
                },
            },
        ],
    });

    // Inject/replace player
    const keywords = ["player.phimapi", "streamc", "opstream"];

    if (keywords.some(keyword => location.hostname.includes(keyword))) {
        replacePlayer();
    }
    else {
        document.querySelectorAll("#list_episode ~ * > button").forEach(elem => elem.click());
        detectEpisodeList("#content, .container", "#list_episode > div:nth-child(2), .mt-0 > div[id^=headlessui-disclosure-panel] > div");
    }
    // else if ((location.hostname.includes("kkphim") || location.hostname.includes("nguonc") || location.hostname === "216.180.226.222") && location.pathname.startsWith("/phim/")) {
    //     document.querySelectorAll("#list_episode ~ * > button").forEach(elem => elem.click());
    //     injectPlayer("#list_episode > div:nth-child(2)")
    // }
    // else if (location.hostname.includes("nguonc")) {
    //     detectEpisodeList("#content", "#list_episode > div:nth-child(2)");
    // }
    // else if (location.hostname.includes("ophim")) {
    //     detectEpisodeList(".container", ".mt-0 > div[id^=headlessui-disclosure-panel] > div");
    // }

    // DCMA troll
    document.querySelector("footer .pt-2.justify-between.sm\\:flex")?.insertAdjacentHTML(
        "beforebegin",
        `<img class="pt-2" alt="DMCA troll" src="//images.dmca.com/Badges/dmca-badge-w150-5x1-01.png">`
    );

    // Footer credit
    document.querySelector("footer .pt-2.justify-between.sm\\:flex")?.insertAdjacentHTML(
        "afterend",
        `<p class="pt-2">${window.info.name} v${window.info.version} | Được viết bởi ${window.info.author}</p>`
    );
};

(function main() {
    // document.write("<html></html>");
    // return;
    init();

    if (document.body) {
        replaceLogo();
    }
    else {
        new MutationObserver((mutations, obs) => {
            if (document.body) {
                obs.disconnect();
                replaceLogo();
            }
        }).observe(document, { childList: true, subtree: true });
    }

    document.addEventListener('DOMContentLoaded', domInit);
})();
