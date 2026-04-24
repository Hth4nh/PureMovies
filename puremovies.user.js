// ==UserScript==
// @name                   PureMovies
// @namespace              Hth4nh
// @version                2.2.12
// @author                 Hth4nh
// @description            PureMovies là một user-script hoàn hảo dành cho những ai yêu thích trải nghiệm xem phim liền mạch, không bị gián đoạn bởi quảng cáo "lậu" trong phim. Hy vọng sẽ mang đến cảm giác thoải mái và tập trung, giúp bạn tận hưởng từng khoảnh khắc của bộ phim một cách trọn vẹn nhất.
// @homepageURL            https://github.com/Hth4nh/PureMovies
// @downloadURL            https://hth4nh.github.io/PureMovies/puremovies.user.js
// @updateURL              https://hth4nh.github.io/PureMovies/puremovies.meta.js
// @match                  https://kkphim.com/*
// @match                  https://kkphim.vip/*
// @match                  https://kkphim1.com/*
// @match                  https://216.180.226.222/*
// @match                  https://player.phimapi.com/player/*
// @match                  https://phim.nguonc.com/*
// @match                  https://*.streamc.xyz/*
// @match                  https://ophim16.cc/*
// @match                  https://ophim17.cc/*
// @match                  https://vip.opstream10.com/share/*
// @match                  https://vip.opstream11.com/share/*
// @match                  https://vip.opstream12.com/share/*
// @match                  https://vip.opstream13.com/share/*
// @match                  https://vip.opstream14.com/share/*
// @match                  https://vip.opstream15.com/share/*
// @match                  https://vip.opstream16.com/share/*
// @match                  https://vip.opstream17.com/share/*
// @match                  https://vip.opstream90.com/share/*
// @require                https://cdn.jsdelivr.net/npm/hls.js@1.6.5
// @require                https://cdn.jsdelivr.net/npm/notyf@3.10.0
// @require                https://cdn.jsdelivr.net/npm/artplayer@5.2.3
// @require                https://cdn.jsdelivr.net/npm/@trim21/gm-fetch@0.3.0
// @connect                phim1280.tv
// @connect                kkphimplayer.com
// @connect                kkphimplayer1.com
// @connect                kkphimplayer2.com
// @connect                kkphimplayer3.com
// @connect                kkphimplayer4.com
// @connect                kkphimplayer5.com
// @connect                kkphimplayer6.com
// @connect                kkphimplayer7.com
// @connect                kkphimplayer8.com
// @connect                kkphimplayer9.com
// @connect                streamc.xyz
// @connect                opstream10.com
// @connect                opstream11.com
// @connect                opstream12.com
// @connect                opstream13.com
// @connect                opstream14.com
// @connect                opstream15.com
// @connect                opstream16.com
// @connect                opstream17.com
// @connect                opstream90.com
// @connect                *
// @grant                  GM.xmlHttpRequest
// @grant                  GM_addStyle
// @grant                  GM_info
// @run-at                 document-start
// ==/UserScript==

(t=>{if(typeof GM_addStyle=="function"){GM_addStyle(t);return}const r=document.createElement("style");r.textContent=t,document.head.append(r)})(" .debug .mr-3.flex-none.overflow-hidden.w-auto>span>a>img{transform:rotate(180deg) scaleY(-1) scaleX(-1);filter:invert(1)}.mr-3.flex-none.overflow-hidden.w-auto{overflow:initial!important}.mr-3.flex-none.overflow-hidden.w-auto>span>a>img{height:40px!important;width:initial!important;padding:0 10px!important;transition:.5s!important}.notyf__toast{max-width:700px!important}.notyf__ripple{width:850px!important}.notyf__icon svg{fill:currentColor}a.text-gray-50.bg-gray-400.shadow-md.rounded.py-1{transition:.5s}a.text-gray-50.bg-gray-400.shadow-md.rounded.py-1.cuki-episode-current{transform:rotate(180deg) scaleY(-1) scaleX(-1);filter:invert(1)}.debug .cuki-player-container{outline:1rem solid cyan}.cuki-player-container{background:#000;width:100%;max-height:min(70vh,100vh - 40px - 4rem);aspect-ratio:16/9;overflow:hidden}.art-video-player.art-mini-progress-bar .art-bottom .art-controls,.art-video-player.art-lock .art-bottom .art-controls{transform:none!important;max-height:0!important;margin-top:calc(-1 * var(--art-bottom-gap))!important}.art-video-player.art-mini-progress-bar .art-bottom .art-progress,.art-video-player.art-lock .art-bottom .art-progress{transform:translateY(0)!important}.art-controls{height:initial!important;max-height:150%!important;flex-wrap:wrap!important;margin-top:10px!important;transition-property:all!important}.art-controls .art-controls-left,.art-controls .art-controls-right{height:initial!important;max-height:150%!important}.art-controls>*{margin-top:-10px!important}.art-controls-right{margin-left:auto!important}.art-controls-left>:first-of-type:after{left:100%!important}.art-controls-right>:last-of-type:after{left:0%!important}.art-control-fast-rewind>svg,.art-control-fast-forward>svg,.art-control-noadserror>svg{width:20px}.art-control-noadserror>svg{fill:#fc0!important}.bg-opacity-40.bg-white.w-full.text-center.space-x-2.bottom-0.absolute{display:none!important} ");

(function (GM_fetch, notyf, Hls, Artplayer) {
  'use strict';

  function isHostnameContains(...keywords) {
    return keywords.some((keyword) => location.hostname.includes(keyword));
  }
  async function remoteImport(scriptURL, scriptOutputVariableName) {
    try {
      scriptURL = new URL(scriptURL);
      const response = await fetch(scriptURL);
      if (!response.ok) {
        throw new Error(`Failed to load script: ${scriptURL.href}`);
      }
      const scriptContent = (await response.text()).split("\n").filter((line) => !line.startsWith("//")).join("\n").replaceAll("console.log", "(()=>{})");
      const scriptOutputExport = `; window.${scriptOutputVariableName} ?? ${scriptOutputVariableName};`;
      return eval(scriptContent + scriptOutputExport);
    } catch (error) {
      console.error(error);
    }
  }
  function addStylesheet(...urls) {
    const parent = document.head ?? document.querySelector("html");
    urls.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = new URL(url).href;
      parent.appendChild(link);
    });
  }
  const infoIconURL = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20512%20512'%3e%3c!--!Font%20Awesome%20Free%206.7.2%20by%20@fontawesome%20-%20https://fontawesome.com%20License%20-%20https://fontawesome.com/license/free%20Copyright%202025%20Fonticons,%20Inc.--%3e%3cpath%20d='M256%20512A256%20256%200%201%200%20256%200a256%20256%200%201%200%200%20512zM216%20336l24%200%200-64-24%200c-13.3%200-24-10.7-24-24s10.7-24%2024-24l48%200c13.3%200%2024%2010.7%2024%2024l0%2088%208%200c13.3%200%2024%2010.7%2024%2024s-10.7%2024-24%2024l-80%200c-13.3%200-24-10.7-24-24s10.7-24%2024-24zm40-208a32%2032%200%201%201%200%2064%2032%2032%200%201%201%200-64z'/%3e%3c/svg%3e";
  const warningIconURL = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20512%20512'%3e%3c!--!Font%20Awesome%20Free%206.7.2%20by%20@fontawesome%20-%20https://fontawesome.com%20License%20-%20https://fontawesome.com/license/free%20Copyright%202025%20Fonticons,%20Inc.--%3e%3cpath%20d='M256%2032c14.2%200%2027.3%207.5%2034.5%2019.8l216%20368c7.3%2012.4%207.3%2027.7%20.2%2040.1S486.3%20480%20472%20480L40%20480c-14.3%200-27.6-7.7-34.7-20.1s-7-27.8%20.2-40.1l216-368C228.7%2039.5%20241.8%2032%20256%2032zm0%20128c-13.3%200-24%2010.7-24%2024l0%20112c0%2013.3%2010.7%2024%2024%2024s24-10.7%2024-24l0-112c0-13.3-10.7-24-24-24zm32%20224a32%2032%200%201%200%20-64%200%2032%2032%200%201%200%2064%200z'/%3e%3c/svg%3e";
  var _GM_info = /* @__PURE__ */ (() => typeof GM_info != "undefined" ? GM_info : void 0)();
  const config = {
    ..._GM_info.script,
    betWarning: "Hành vi cá cược, cờ bạc online <b>LÀ VI PHẠM PHÁP LUẬT</b><br>theo Điều 321 Bộ luật Hình sự 2015 (sửa đổi, bổ sung 2017)",
    adsRegexList: [
      new RegExp("(?<!#EXT-X-DISCONTINUITY[\\s\\S]*)#EXT-X-DISCONTINUITY\\n(?:.*?\\n){18,24}#EXT-X-DISCONTINUITY\\n(?![\\s\\S]*#EXT-X-DISCONTINUITY)", "g"),
      /#EXT-X-DISCONTINUITY\n(?:#EXT-X-KEY:METHOD=NONE\n(?:.*\n){18,24})?#EXT-X-DISCONTINUITY\n|convertv\d+\//g,
      /#EXT-X-DISCONTINUITY\n#EXTINF:3\.920000,\n.*\n#EXTINF:0\.760000,\n.*\n#EXTINF:2\.000000,\n.*\n#EXTINF:2\.500000,\n.*\n#EXTINF:2\.000000,\n.*\n#EXTINF:2\.420000,\n.*\n#EXTINF:2\.000000,\n.*\n#EXTINF:0\.780000,\n.*\n#EXTINF:1\.960000,\n.*\n#EXTINF:2\.000000,\n.*\n#EXTINF:1\.760000,\n.*\n#EXTINF:3\.200000,\n.*\n#EXTINF:2\.000000,\n.*\n#EXTINF:1\.360000,\n.*\n#EXTINF:2\.000000,\n.*\n#EXTINF:2\.000000,\n.*\n#EXTINF:0\.720000,\n.*/g
    ],
    domainBypassWhitelist: ["kkphimplayer", "phim1280", "opstream"]
  };
  const caches = {
    blob: {}
  };
  const elements = {
    body: null,
    playerContainer: null,
    currentEpisode: null,
    dmcaTroll: null,
    credit: null
  };
  const instances = {
    notification: null,
    player: null
  };
  function getSvgMarkupFromDataUrl(dataUrl) {
    dataUrl = new URL(dataUrl).href;
    const prefix = "data:image/svg+xml,";
    if (!dataUrl.startsWith(prefix)) {
      throw `Format Error: URL string must start with '${prefix}'. Received: ${dataUrl.substring(0, 70) + (dataUrl.length > 70 ? "..." : "")}`;
    }
    const encodedSvgData = dataUrl.substring(prefix.length);
    try {
      const decodedSvgMarkup = decodeURIComponent(encodedSvgData);
      return decodedSvgMarkup;
    } catch (e2) {
      if (e2 instanceof URIError) {
        throw `Decoding Error: Malformed URI sequence in SVG data. ${e2}`;
      } else {
        throw `Decoding Error: An unexpected error occurred. ${e2}`;
      }
    }
  }
  async function createNotification() {
    elements.body ?? (elements.body = await waitForElement("body"));
    try {
      if (!notyf.Notyf) throw "";
    } catch (e) {
      console.warn("Notyf not found. Run workaround...");
      window.tmp = await remoteImport("https://cdn.jsdelivr.net/npm/notyf", "Notyf");
      eval(`notyf = { Notyf: window.tmp }`);
    }
    return new notyf.Notyf({
      duration: 7e3,
      dismissible: true,
      position: {
        x: "right",
        y: "top"
      },
      types: [
        {
          type: "info",
          background: "#3b82f6",
          icon: getSvgMarkupFromDataUrl(infoIconURL)
        },
        {
          type: "warning",
          background: "#ffcc00",
          icon: getSvgMarkupFromDataUrl(warningIconURL)
        }
      ]
    });
  }
  async function createPlayerContainer(parentQuery = "body", tagName = "div") {
    let playerContainer = document.createElement(tagName);
    if (tagName === "iframe") {
      playerContainer.setAttribute("allowfullscreen", "");
    }
    playerContainer.classList.add("cuki-player-container", "w-full", "mx-2", "sm:mx-0", "mt-4", "rounded-lg");
    let parent = await waitForElement(parentQuery);
    parent.append(playerContainer);
    return playerContainer;
  }
  const originalFetch = window.fetch;
  window.fetch = function(input2, init) {
    const isUsingByHls = ["loadSource", "loadFragment"].some(
      (functionName) => {
        var _a;
        return (_a = new Error().stack) == null ? void 0 : _a.includes(functionName);
      }
    );
    if (isUsingByHls) {
      return unrestrictedFetch(input2, init);
    }
    return originalFetch(input2, init);
  };
  async function changePlayerURL(embedUrl) {
    var _a, _b;
    (_a = instances.player) == null ? void 0 : _a.destroy();
    instances.player = await createPlayer();
    let playlistUrl = await getPlaylistURL(embedUrl);
    playlistUrl = await removeAds(playlistUrl);
    try {
      if (!Hls) throw "";
    } catch (e) {
      console.warn("Hls not found. Run workaround...");
      instances.notification ?? (instances.notification = await createNotification());
      (_b = instances.notification) == null ? void 0 : _b.open({
        type: "warning",
        message: "Hls not found. Run workaround..."
      });
      window.tmp = await remoteImport("https://cdn.jsdelivr.net/npm/hls.js", "Hls");
      eval("Hls = window.tmp;");
    }
    if (Hls.isSupported()) {
      const hls = new Hls({
        progressive: true,
        fetchSetup: function(context, initParams) {
          const url = `${context.url}#|Referer=${embedUrl}`;
          return new Request(url, initParams);
        }
      });
      hls.loadSource(playlistUrl);
      hls.attachMedia(instances.player.video);
      instances.player.hls = hls;
      instances.player.on("destroy", () => hls.destroy());
    } else if (instances.player.video.canPlayType("application/vnd.apple.mpegurl")) {
      instances.player.video.src = playlistUrl;
    }
    instances.player.play();
  }
  const backwardIconURL = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20512%20512'%3e%3c!--!Font%20Awesome%20Free%206.7.2%20by%20@fontawesome%20-%20https://fontawesome.com%20License%20-%20https://fontawesome.com/license/free%20Copyright%202025%20Fonticons,%20Inc.--%3e%3cpath%20d='M459.5%20440.6c9.5%207.9%2022.8%209.7%2034.1%204.4s18.4-16.6%2018.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1%204.4L288%20214.3l0%2041.7%200%2041.7L459.5%20440.6zM256%20352l0-96%200-128%200-32c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1%204.4l-192%20160C4.2%20237.5%200%20246.5%200%20256s4.2%2018.5%2011.5%2024.6l192%20160c9.5%207.9%2022.8%209.7%2034.1%204.4s18.4-16.6%2018.4-29l0-64z'/%3e%3c/svg%3e";
  const forwardIconURL = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20512%20512'%3e%3c!--!Font%20Awesome%20Free%206.7.2%20by%20@fontawesome%20-%20https://fontawesome.com%20License%20-%20https://fontawesome.com/license/free%20Copyright%202025%20Fonticons,%20Inc.--%3e%3cpath%20d='M52.5%20440.6c-9.5%207.9-22.8%209.7-34.1%204.4S0%20428.4%200%20416L0%2096C0%2083.6%207.2%2072.3%2018.4%2067s24.5-3.6%2034.1%204.4L224%20214.3l0%2041.7%200%2041.7L52.5%20440.6zM256%20352l0-96%200-128%200-32c0-12.4%207.2-23.7%2018.4-29s24.5-3.6%2034.1%204.4l192%20160c7.3%206.1%2011.5%2015.1%2011.5%2024.6s-4.2%2018.5-11.5%2024.6l-192%20160c-9.5%207.9-22.8%209.7-34.1%204.4s-18.4-16.6-18.4-29l0-64z'/%3e%3c/svg%3e";
  const vi = {
    "Video Info": "Thông tin video",
    Close: "Đóng",
    "Video Load Failed": "Tải video thất bại",
    Volume: "Âm lượng",
    Play: "Phát",
    Pause: "Tạm dừng",
    Rate: "Tốc độ",
    Mute: "Tắt tiếng",
    "Video Flip": "Lật video",
    Horizontal: "Ngang",
    Vertical: "Dọc",
    Reconnect: "Kết nối lại",
    "Show Setting": "Cài đặt",
    "Hide Setting": "Ẩn cài đặt",
    Screenshot: "Chụp màn hình",
    "Play Speed": "Tốc độ phát",
    "Aspect Ratio": "Tỷ lệ khung hình",
    Default: "Mặc định",
    Normal: "Bình thường",
    Open: "Mở",
    "Switch Video": "Chuyển video",
    "Switch Subtitle": "Chuyển phụ đề",
    Fullscreen: "Toàn màn hình",
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
    AirPlay: "AirPlay",
    "AirPlay Not Available": "AirPlay không khả dụng"
  };
  if (typeof window !== "undefined") {
    window["artplayer-i18n-vi"] = vi;
  }
  async function createPlayer(playlistUrl = "") {
    var _a;
    try {
      if (!Artplayer) throw "";
    } catch (e) {
      console.warn("Artplayer not found. Run workaround...");
      instances.notification ?? (instances.notification = await createNotification());
      (_a = instances.notification) == null ? void 0 : _a.open({
        type: "warning",
        message: "Artplayer not found. Run workaround..."
      });
      window.tmp = await remoteImport("https://cdn.jsdelivr.net/npm/artplayer", "Artplayer");
      eval("Artplayer = window.tmp;");
    }
    return new Artplayer({
      container: ".cuki-player-container",
      url: playlistUrl === "" ? "" : new URL(playlistUrl).href,
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
      lang: "vi",
      i18n: { vi },
      controls: [
        {
          position: "left",
          name: "fast-rewind",
          index: 10,
          html: getSvgMarkupFromDataUrl(backwardIconURL),
          tooltip: "10 giây trước",
          click: function() {
            if (instances.player) {
              instances.player.seek = this.currentTime - 10;
            }
          }
        },
        {
          position: "left",
          name: "fast-forward",
          index: 11,
          html: getSvgMarkupFromDataUrl(forwardIconURL),
          tooltip: "10 giây sau",
          click: function() {
            if (instances.player) {
              instances.player.seek = this.currentTime + 10;
            }
          }
        }
        // {
        //     position: "right",
        //     html: `<img src="${logoURL}" style="height: 25px; padding: 0 7px; transform: translateY(-12%);">`,
        //     index: 1,
        //     tooltip: config.name,
        // },
      ]
    });
  }
  function getExceptionDuration(url) {
    url = new URL(url);
    if (["ophim", "opstream"].some((keyword) => url.hostname.includes(keyword))) {
      return 600;
    } else if (["nguonc", "streamc"].some((keyword) => url.hostname.includes(keyword))) {
      return Infinity;
    } else {
      return 900;
    }
  }
  async function getPlaylistURLFromNguonC(embedUrl2, options2 = {}, retry = 0) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    if (retry > 3) {
      console.warn("Failed to get playlist URL after multiple attempts.");
      return "";
    }
    embedUrl2 = new URL(embedUrl2);
    embedUrl2.searchParams.append("api", "stream");
    const req = await unrestrictedFetch(embedUrl2, options2);
    const raw = await req.text();
    const encryptedURL = (_a = raw.match(new RegExp('(?<=encryptedURL = ").*(?=";)'))) == null ? void 0 : _a[0];
    if (encryptedURL) {
      const playlistUrl2 = `conf.php?url=${encodeURIComponent(encryptedURL)}`;
      return ((_b = URL.parse(playlistUrl2, embedUrl2.href)) == null ? void 0 : _b.href) || "";
    }
    const streamURL = (_c = raw.match(
      new RegExp('(?<=(?:streamURL =|url =|file:|streamUrl":|data-stream-url=)\\s?").*(?="(?:;|,|}|>|\\n))')
    )) == null ? void 0 : _c[0];
    if (streamURL) {
      const playlistUrl2 = JSON.parse(`"${streamURL}"`);
      return ((_d = URL.parse(playlistUrl2, embedUrl2.href)) == null ? void 0 : _d.href) || "";
    }
    const streamURLInScriptTag = (_e = raw.match(new RegExp('(?<=<script.*?src=".*?url=)[^&"]*?\\.m3u8[^&"]*'))) == null ? void 0 : _e[0];
    if (streamURLInScriptTag) {
      const playlistUrl2 = decodeURIComponent(streamURLInScriptTag);
      return ((_f = URL.parse(playlistUrl2, embedUrl2.href)) == null ? void 0 : _f.href) || "";
    }
    if (raw.match(/fetch\('\?api=stream'/)) {
      const authToken = (_g = raw.match(new RegExp(`(?<=authToken = ['"]).*(?=['"])`))) == null ? void 0 : _g[0];
      const apiReq = await unrestrictedFetch(`${embedUrl2.origin}${embedUrl2.pathname}?api=stream`, {
        ...options2,
        method: "POST",
        headers: {
          ...options2.headers,
          Referer: embedUrl2.href,
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-Embed-Auth": authToken ?? "",
          "X-Requuest-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ hash: embedUrl2.searchParams.get("hash") })
      });
      const apiRaw = await apiReq.text();
      const apiStreamURL = (_h = apiRaw.match(new RegExp('(?<=(?:streamURL =|url =|file:|streamUrl":)\\s?").*(?="(?:;|,|}))'))) == null ? void 0 : _h[0];
      if (apiStreamURL) {
        const playlistUrl2 = JSON.parse(`"${apiStreamURL}"`);
        if (playlistUrl2.includes("?") || playlistUrl2.includes("/") || playlistUrl2.includes(".m3u8")) {
          return ((_i = URL.parse(playlistUrl2, embedUrl2.href)) == null ? void 0 : _i.href) || "";
        } else {
          const decodesPlaylistUrl = atob(playlistUrl2);
          return ((_j = URL.parse(decodesPlaylistUrl, embedUrl2.href)) == null ? void 0 : _j.href) || "";
        }
      }
    }
    const encryptedPayload = (_k = raw.match(new RegExp('(?<=input.value = ").*(?=";)'))) == null ? void 0 : _k[0];
    if (encryptedPayload) {
      const optionsWithPayload = {
        ...options2,
        method: "POST",
        headers: {
          ...options2.headers,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `payload=${encodeURIComponent(JSON.parse(`"${encryptedPayload}"`))}`
      };
      return getPlaylistURLFromNguonC(embedUrl2, optionsWithPayload, retry + 1);
    }
    return embedUrl2.href.replace("embed.php", "get.php");
  }
  async function getPlaylistURL(embedUrl2) {
    var _a, _b;
    embedUrl2 = new URL(embedUrl2);
    if (embedUrl2.hostname.includes("phimapi") && embedUrl2.searchParams.has("url")) {
      return embedUrl2.searchParams.get("url") ?? "";
    }
    if (embedUrl2.hostname.includes("opstream")) {
      const req = await unrestrictedFetch(embedUrl2);
      const raw = await req.text();
      const playlistUrl2 = (_a = raw.match(new RegExp('(?<=const url = ").*(?=";)'))) == null ? void 0 : _a[0];
      return ((_b = URL.parse(String(playlistUrl2), embedUrl2)) == null ? void 0 : _b.href) || "";
    }
    if (embedUrl2.hostname.includes("streamc")) {
      return getPlaylistURLFromNguonC(embedUrl2);
    }
    return embedUrl2.href;
  }
  function getTotalDuration(playlist) {
    const matches = playlist.match(/#EXTINF:([\d.]+)/g) ?? [];
    return matches.reduce((sum, match) => {
      return sum + parseFloat(match.split(":")[1]);
    }, 0);
  }
  function isContainAds(playlist) {
    return config.adsRegexList.some((regex) => {
      regex.lastIndex = 0;
      return regex.test(playlist);
    });
  }
  async function getOphimAdsBlockWorkaroundRegex() {
    let playlistUrl2 = new URL("https://vip.opstream90.com/20250529/6593_07659334/3000k/hls/mixed.m3u8");
    const isNoNeedToBypass = config.domainBypassWhitelist.some((keyword) => playlistUrl2.hostname.includes(keyword));
    let req = isNoNeedToBypass ? await fetch(playlistUrl2) : await unrestrictedFetch(playlistUrl2, {
      headers: {
        Referer: playlistUrl2.origin
      }
    });
    const playlist = await req.text();
    const lines = playlist.split("\n");
    let firstSegmentEnd = 0;
    let lastSegmentStart = lines.length;
    let firstSegmentDuration = 0;
    let lastSegmentDuration = 0;
    while (firstSegmentDuration < 596) {
      const match = lines[firstSegmentEnd++].match(/#EXTINF:(\d\.\d+),/);
      if (match) {
        firstSegmentDuration += Number(match[1]);
      }
    }
    while (lastSegmentDuration < 84) {
      const match = lines[--lastSegmentStart].match(/#EXTINF:(\d\.\d+),/);
      if (match) {
        lastSegmentDuration += Number(match[1]);
      }
    }
    const adsText = playlist.split("\n").slice(firstSegmentEnd + 1, lastSegmentStart - 1).join("\n");
    const escapedAdsText = adsText.replace(/\./g, "\\.").replace(/\n/g, "\\n");
    const regexString = escapedAdsText.replace(/[a-z0-9]{32}\\\.ts/g, ".*");
    return new RegExp(regexString, "g");
  }
  let workaroundRegex = null;
  async function removeAds(playlistUrl2) {
    playlistUrl2 = new URL(playlistUrl2);
    if (caches.blob[playlistUrl2.href]) {
      return caches.blob[playlistUrl2.href];
    }
    const isNoNeedToBypass = config.domainBypassWhitelist.some((keyword) => playlistUrl2.hostname.includes(keyword));
    let req = isNoNeedToBypass ? await fetch(playlistUrl2) : await unrestrictedFetch(playlistUrl2, {
      headers: {
        Referer: playlistUrl2.origin
      }
    });
    let playlist = await req.text();
    playlist = playlist.replace(/^[^#].*$/gm, (line) => {
      var _a, _b;
      return ((_b = (_a = URL.parse(line, playlistUrl2)) == null ? void 0 : _a.toString) == null ? void 0 : _b.call(_a)) ?? line;
    });
    if (playlist.includes("#EXT-X-STREAM-INF")) {
      caches.blob[playlistUrl2.href] = await removeAds(playlist.trim().split("\n").slice(-1)[0]);
      return caches.blob[playlistUrl2.href];
    }
    if (isContainAds(playlist)) {
      playlist = config.adsRegexList.reduce((playlist2, regex) => {
        return playlist2.replaceAll(regex, "");
      }, playlist);
    } else if (getTotalDuration(playlist) <= getExceptionDuration(playlistUrl2)) ;
    else if (["ophim", "opstream"].some((keyword) => playlistUrl2.hostname.includes(keyword))) {
      console.warn("Ads not found, run workaround...");
      workaroundRegex ?? (workaroundRegex = await getOphimAdsBlockWorkaroundRegex());
      playlist = playlist.replaceAll(workaroundRegex, "");
    } else {
      injectReportButton(playlistUrl2);
      console.error("Không tìm thấy quảng cáo");
    }
    caches.blob[playlistUrl2.href] = URL.createObjectURL(
      new Blob([playlist], {
        type: req.headers.get("Content-Type") ?? "text/plain"
      })
    );
    return caches.blob[playlistUrl2.href];
  }
  async function detectEpisodeList(targetQuery, epsListParentQuery) {
    var _a;
    const callbackFn = async (url) => {
      var _a2, _b;
      elements.playerContainer ?? (elements.playerContainer = await createPlayerContainer(epsListParentQuery, "div"));
      instances.notification ?? (instances.notification = await createNotification());
      (_a2 = instances.notification) == null ? void 0 : _a2.dismissAll();
      (_b = instances.notification) == null ? void 0 : _b.open({
        type: "info",
        message: config.betWarning
      });
      elements.playerContainer.style.display = "";
      changePlayerURL(url);
    };
    const start = () => {
      const elementList = [
        ...document.querySelectorAll(
          [
            "#list_episode ~ * > button",
            "#list_episode ~ * > .card-collapse-content",
            "[id^=headlessui-disclosure-button]",
            "[id^=headlessui-disclosure-panel]"
          ].join(", ")
        )
      ];
      elementList.slice(-6).forEach((element) => {
        element.style.display = "none";
      });
      setupEpisodeClickListener(epsListParentQuery, callbackFn);
    };
    const targetNode = await waitForElement(targetQuery);
    if ((_a = targetNode.lastElementChild) == null ? void 0 : _a.classList.contains("px-8")) {
      start();
    }
    const observer = new MutationObserver((_mutationsList) => {
      var _a2, _b;
      if ((_a2 = targetNode.lastElementChild) == null ? void 0 : _a2.classList.contains("px-8")) {
        start();
      } else if (elements.playerContainer) {
        (_b = instances.player) == null ? void 0 : _b.destroy();
        elements.playerContainer.remove();
        elements.playerContainer = null;
      }
    });
    observer.observe(targetNode, { childList: true });
  }
  function getRemValue() {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
  function injectCredit(element) {
    elements.dmcaTroll ?? (elements.dmcaTroll = (() => {
      const dmcaTroll = document.createElement("img");
      Object.assign(dmcaTroll, {
        className: "pt-2",
        alt: "DMCA troll",
        src: "https://images.dmca.com/Badges/dmca-badge-w150-5x1-01.png"
      });
      return dmcaTroll;
    })());
    elements.credit ?? (elements.credit = (() => {
      const credit = document.createElement("p");
      Object.assign(credit, {
        className: "pt-2",
        textContent: `${config.name} v${config.version} | Được viết bởi ${config.author}`
      });
      return credit;
    })());
    element == null ? void 0 : element.before(elements.dmcaTroll);
    element == null ? void 0 : element.after(elements.credit);
  }
  function injectReportButton(playlistUrl2) {
    var _a;
    playlistUrl2 = new URL(playlistUrl2);
    const params = new URLSearchParams({
      title: `No ads detected - ${location.hostname}`,
      labels: "bug",
      assignees: config.author,
      body: [
        `Version: \`v${config.version}\``,
        `User Agent: \`${navigator.userAgent}\``,
        `URL: ${location.href}`,
        `.m3u8 URL: ${playlistUrl2.href}`
      ].join("\n")
    });
    (_a = instances.player) == null ? void 0 : _a.controls.add({
      name: "noadserror",
      index: 2,
      position: "right",
      html: getSvgMarkupFromDataUrl(warningIconURL),
      tooltip: "Không tìm thấy quảng cáo - Bấm để báo cáo lỗi",
      click: function() {
        window.open(`${config.homepageURL}/issues/new?${params.toString()}`, "_blank");
      }
    });
  }
  async function replaceEmbedPlayerContainer() {
    const playerContainer = document.createElement("div");
    playerContainer.classList.add("cuki-player-container");
    Object.assign(playerContainer.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      maxHeight: "initial"
    });
    const html = document.querySelector("html");
    Object.assign(html.style, {
      background: "black",
      width: "100%",
      height: "100%"
    });
    waitForElement("body").then((body) => {
      body.replaceChildren(playerContainer);
      changePlayerURL(location.href);
    });
  }
  function scrollIntoView(element, offset = {}) {
    if (!element) {
      console.warn("scrollIntoView called with no element.");
      return;
    }
    const rect = element.getBoundingClientRect();
    offset = { ...offset };
    offset.top ?? (offset.top = 0);
    offset.bottom ?? (offset.bottom = window.innerHeight - rect.height);
    const boundary = {
      top: offset.top,
      bottom: window.innerHeight - offset.bottom
    };
    let scrollDelta = 0;
    if (rect.top < boundary.top) {
      scrollDelta = rect.top - boundary.top;
    } else if (rect.bottom > boundary.bottom) {
      scrollDelta = rect.bottom - boundary.bottom;
    }
    window.scrollTo({
      top: window.pageYOffset + scrollDelta,
      behavior: "smooth"
    });
  }
  async function setupEpisodeClickListener(episodeListParentQuery, onEpisodeClickCallback = () => {
  }) {
    const episodeListParent = await waitForElement(episodeListParentQuery);
    episodeListParent.onclick = async (e2) => {
      var _a;
      e2.preventDefault();
      if (e2.target instanceof HTMLAnchorElement && e2.target !== elements.currentEpisode) {
        (_a = elements.currentEpisode) == null ? void 0 : _a.classList.remove("cuki-episode-current");
        elements.currentEpisode = e2.target;
        elements.currentEpisode.classList.add("cuki-episode-current");
        await onEpisodeClickCallback(e2.target.href);
      }
      if (e2.target instanceof HTMLAnchorElement && elements.playerContainer) {
        scrollIntoView(elements.playerContainer, {
          top: 40 + 3 * getRemValue(),
          bottom: 1.5 * getRemValue()
        });
      }
    };
  }
  async function waitForElement(selector, { root = document, signal } = {}) {
    const element = root.querySelector(selector);
    if (element) {
      return Promise.resolve(element);
    }
    if (signal == null ? void 0 : signal.aborted) {
      return Promise.reject(
        new Error(
          `Aborted immediately: Element "${selector}" not found in ${root === document ? "document" : "element"}`
        )
      );
    }
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        const element2 = root.querySelector(selector);
        if (element2) {
          observer.disconnect();
          resolve(element2);
        }
      });
      signal == null ? void 0 : signal.addEventListener("abort", () => {
        observer.disconnect();
        reject(
          new Error(`Aborted: Element "${selector}" not found in ${root === document ? "document" : "element"}`)
        );
      });
      observer.observe(root, { childList: true, subtree: true });
    });
  }
  async function unrestrictedFetch(input, options = {}) {
    var _a;
    if (typeof input === "string") {
      input = new URL(input);
    }
    const protocol = input instanceof Request ? new URL(input.url).protocol : input.protocol;
    if (protocol === "blob:" || protocol === "data:") {
      return fetch(input, options);
    }
    const rawUrlString = input instanceof Request ? input.url : input.href;
    const [requestUrl, kodiHeaderString = ""] = rawUrlString.split(/#?\|/, 2);
    const kodiStyleHeaders = kodiHeaderString.split("&").filter(Boolean).reduce((headers, pair) => {
      const separatorIndex = pair.indexOf("=");
      if (separatorIndex > 0) {
        const key = pair.slice(0, separatorIndex);
        const value = decodeURIComponent(pair.slice(separatorIndex + 1));
        headers[key] = value;
      }
      return headers;
    }, {});
    const baseOptions = {};
    let initialHeaders = {};
    if (input instanceof Request) {
      Object.assign(baseOptions, {
        method: input.method,
        body: input.body,
        cache: input.cache,
        credentials: input.credentials,
        mode: input.mode,
        redirect: input.redirect,
        referrer: input.referrer,
        integrity: input.integrity
      });
      initialHeaders = Object.fromEntries(input.headers.entries());
    }
    const finalHeaders = {
      ...initialHeaders,
      ...kodiStyleHeaders,
      ...options.headers
    };
    try {
      if (!GM_fetch) throw "";
    } catch (e) {
      console.warn("GM_fetch not found. Run workaround...");
      instances.notification ?? (instances.notification = await createNotification());
      (_a = instances.notification) == null ? void 0 : _a.open({
        type: "warning",
        message: "GM_fetch not found. Run workaround..."
      });
      window.tmp = await remoteImport("https://cdn.jsdelivr.net/npm/@trim21/gm-fetch", "GM_fetch");
      eval("GM_fetch = window.tmp;");
    }
    return GM_fetch(requestUrl, {
      ...baseOptions,
      ...options,
      headers: finalHeaders
    });
  }
  URL.parse ?? (URL.parse = (url, base) => {
    try {
      return new URL(url, base);
    } catch (e2) {
      console.error(e2);
      return null;
    }
  });
  addStylesheet("https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css");
  waitForElement("footer .pt-2.justify-between.sm\\:flex").then(injectCredit);
  document.addEventListener("DOMContentLoaded", () => {
    const element = document.querySelector("footer .pt-2.justify-between.sm\\:flex");
    injectCredit(element);
  });
  if (isHostnameContains("player.phimapi", "streamc", "opstream")) {
    replaceEmbedPlayerContainer();
  } else if (isHostnameContains("nguonc")) {
    detectEpisodeList("#content", "#list_episode > div:nth-child(2)");
  } else if (isHostnameContains("ophim")) {
    detectEpisodeList(".container", ".mt-0 > div[id^=headlessui-disclosure-panel] > div");
  } else {
    detectEpisodeList("#content > div", "#list_episode > div:nth-child(2)");
  }

})(
    (() => {
        try {
            return GM_fetch
        }
        catch(e) {
            return null;
        }
    })(), 
    (() => {
        try {
            return {Notyf}
        }
        catch(e) {
            return null;
        }
    })(), 
    (() => {
        try {
            return Hls
        }
        catch(e) {
            return null;
        }
    })(), 
    (() => {
        try {
            return Artplayer
        }
        catch(e) {
            return null;
        }
    })());