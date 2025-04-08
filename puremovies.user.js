// ==UserScript==
// @name                   Cuki's PureMovie
// @namespace              Hth4nh
// @version                2.0
// @author                 Hth4nh
// @description            Cuki's PureMovie là một user-script hoàn hảo dành cho những ai yêu thích trải nghiệm xem phim liền mạch, không bị gián đoạn bởi quảng cáo "lậu" trong phim. Hy vọng sẽ mang đến cảm giác thoải mái và tập trung, giúp bạn tận hưởng từng khoảnh khắc của bộ phim một cách trọn vẹn nhất.
// @icon                   https://www.google.com/s2/favicons?sz=64&domain=kkphim.com
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
// @require                https://cdn.jsdelivr.net/npm/@trim21/gm-fetch@0.3.0
// @require                https://cdn.jsdelivr.net/npm/hls.js@1.6.0
// @require                https://cdn.jsdelivr.net/npm/notyf@3.10.0
// @require                https://cdn.jsdelivr.net/npm/artplayer@5.2.2
// @connect                phim1280.tv
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
// @grant                  unsafeWindow
// @run-at                 document-start
// ==/UserScript==

(t=>{if(typeof GM_addStyle=="function"){GM_addStyle(t);return}const r=document.createElement("style");r.textContent=t,document.head.append(r)})(" .debug .mr-3.flex-none.overflow-hidden.w-auto>span>a>img{transform:rotate(180deg) scaleY(-1) scaleX(-1);filter:invert(1)}.mr-3.flex-none.overflow-hidden.w-auto{overflow:initial!important}.mr-3.flex-none.overflow-hidden.w-auto>span>a>img{height:40px!important;width:initial!important;padding:0 10px!important;transition:.5s!important}.notyf__toast{max-width:700px!important}.notyf__ripple{width:850px!important}.notyf__icon svg{fill:currentColor}a.text-gray-50.bg-gray-400.shadow-md.rounded.py-1{transition:.5s}a.text-gray-50.bg-gray-400.shadow-md.rounded.py-1.cuki-episode-current{transform:rotate(180deg) scaleY(-1) scaleX(-1);filter:invert(1)}.debug .cuki-player-container{outline:1rem solid cyan}.cuki-player-container{background:#000;width:100%;max-height:min(70vh,100vh - 40px - 4rem);aspect-ratio:16/9;overflow:hidden}.art-video-player.art-mini-progress-bar .art-bottom .art-controls,.art-video-player.art-lock .art-bottom .art-controls{transform:none!important;max-height:0!important;margin-top:calc(-1 * var(--art-bottom-gap))!important}.art-video-player.art-mini-progress-bar .art-bottom .art-progress,.art-video-player.art-lock .art-bottom .art-progress{transform:translateY(0)!important}.art-controls{height:initial!important;max-height:150%!important;flex-wrap:wrap!important;margin-top:10px!important;transition-property:all!important}.art-controls .art-controls-left,.art-controls .art-controls-right{height:initial!important;max-height:150%!important}.art-controls>*{margin-top:-10px!important}.art-controls-right{margin-left:auto!important}.art-controls-left>:first-of-type:after{left:100%!important}.art-controls-right>:last-of-type:after{left:0%!important}.art-control-fast-rewind>svg,.art-control-fast-forward>svg,.art-control-noadserror>svg{width:20px}.art-control-noadserror>svg{fill:#fc0!important}.bg-opacity-40.bg-white.w-full.text-center.space-x-2.bottom-0.absolute{display:none!important} ");

(function (GM_fetch, notyf, Hls, Artplayer) {
  'use strict';

  function isHostnameContains(...keywords) {
    return keywords.some((keyword) => location.hostname.includes(keyword));
  }
  var _GM_info = /* @__PURE__ */ (() => typeof GM_info != "undefined" ? GM_info : void 0)();
  var _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
  async function unrestrictedFetch(input, options = {}) {
    if (typeof input === "string") {
      input = new URL(input);
    }
    const protocol = input instanceof Request ? new URL(input.url).protocol : input.protocol;
    if (protocol === "blob:" || protocol === "data:") {
      return _unsafeWindow.fetch(input, options);
    }
    const rawUrlString = input instanceof Request ? input.url : input.href;
    const [requestUrl, kodiHeaderString = ""] = rawUrlString.split("|", 2);
    const kodiStyleHeaders = kodiHeaderString.split("&").filter(Boolean).reduce((headers, pair) => {
      const separatorIndex = pair.indexOf("=");
      if (separatorIndex > 0) {
        const key = pair.slice(0, separatorIndex);
        const value = decodeURIComponent(
          pair.slice(separatorIndex + 1)
        );
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
    return GM_fetch(requestUrl, {
      ...baseOptions,
      ...options,
      headers: finalHeaders
    });
  }
  function addStyle(css) {
    const parent = document.head ?? document.querySelector("html");
    const style = document.createElement("style");
    style.textContent = css;
    parent.appendChild(style);
    return style;
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
  const config = {
    ..._GM_info.script,
    betWarning: "Hành vi cá cược, cờ bạc online <b>LÀ VI PHẠM PHÁP LUẬT</b><br>theo Điều 321 Bộ luật Hình sự 2015 (sửa đổi, bổ sung 2017)",
    adsRegexList: [
      new RegExp("(?<!#EXT-X-DISCONTINUITY[\\s\\S]*)#EXT-X-DISCONTINUITY\\n(?:.*?\\n){20}#EXT-X-DISCONTINUITY\\n(?![\\s\\S]*#EXT-X-DISCONTINUITY)", "g"),
      /#EXT-X-DISCONTINUITY\n(?:#EXTINF:(?:2.00|2.00|2.34|2.66|2.00|2.38|2.00|0.78|1.96)0000,\n.*\n){9}#EXT-X-DISCONTINUITY\n(?:#EXTINF:(?:2.00|2.74|2.22|2.00|1.36|2.00|2.00|0.72)0000,\n.*\n){8}(?=#EXT-X-DISCONTINUITY)/g
    ]
  };
  const caches = {
    blob: {}
  };
  const elements = {
    body: null,
    playerContainer: null,
    currentEpisode: null,
    dcmaTroll: null,
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
    } catch (e) {
      if (e instanceof URIError) {
        throw `Decoding Error: Malformed URI sequence in SVG data. ${e}`;
      } else {
        throw `Decoding Error: An unexpected error occurred. ${e}`;
      }
    }
  }
  async function createNotification() {
    elements.body ?? (elements.body = await waitForElement("body"));
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
        }
      ]
    });
  }
  async function createPlayerContainer(parentQuery = "body", tagName = "div") {
    let playerContainer = document.createElement(tagName);
    if (tagName === "iframe") {
      playerContainer.setAttribute("allowfullscreen", "");
    }
    playerContainer.classList.add(
      "cuki-player-container",
      "w-full",
      "mx-2",
      "sm:mx-0",
      "mt-4",
      "rounded-lg"
    );
    let parent = await waitForElement(parentQuery);
    parent.append(playerContainer);
    return playerContainer;
  }
  async function remoteImport(scriptURL) {
    try {
      scriptURL = new URL(scriptURL);
      const response = await fetch(scriptURL);
      if (!response.ok) {
        throw new Error(`Failed to load script: ${scriptURL.href}`);
      }
      const scriptContent = (await response.text()).split("\n").filter((line) => !line.startsWith("//")).join("\n").replaceAll("console.log", "(()=>{})");
      eval(scriptContent);
    } catch (error) {
      console.error(error);
    }
  }
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    var _a, _b;
    if (((_a = new Error().stack) == null ? void 0 : _a.includes("loadSource")) || ((_b = new Error().stack) == null ? void 0 : _b.includes("loadFragment"))) {
      return unrestrictedFetch(...args);
    }
    return originalFetch(...args);
  };
  async function changePlayerURL(embedUrl) {
    var _a;
    (_a = instances.player) == null ? void 0 : _a.destroy();
    instances.player = createPlayer();
    let playlistUrl = await getPlaylistURL(embedUrl);
    playlistUrl = await removeAds(playlistUrl);
    try {
      if (!Hls) throw "";
    } catch (e) {
      console.warn("Hls not found. Run workaround...");
      await remoteImport("https://cdn.jsdelivr.net/npm/hls.js");
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
  const logoURL = "data:image/png;base64,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gARIgARIgARIYKMI0AGwUeTZLgmQAAmQAAmQAAmQAAmQAAmQAAmsIwE6ANYRNpsiARIgARIgARIgARIgARIgARIggY0i4N+ohtkuCZAACZDAxhPQdb1WKXXcyxKViH32WMdR2+vYZizTNe3V8HWPf2oz2l6qzbqmn9N07dulXlfsfEfT/pGu1JH840rZKTwjifzyxV6bjpowdN8tXuc4Sn1U11WN17HiZepupbQ7ih/nERIgARIggc1AgN9J1ucu0QGwPpzZCgmQAAlUJAGIf4kE2+lpnFI7leeBTVqoa6Ob1PKSzVa6lsCN7S/5wiIX4Dmow+7xnCit5GdE1/vDh771pldT4c6jN6K8zutYsTKl6RGtdCuKVcdyEiABEiCBDSLA7yTrA55TANaHM1shARIgARIgARIgARIgARIgARIggQ0lQAfAhuJn4yRAAiRAAiRAAiRAAiRAAiRAAiSwPgToAFgfzmyFBEiABEiABEiABEiABEiABEiABDaUAB0AG4qfjZMACZAACZAACZAACZAACZAACZDA+hBgEsD14cxWSIAESIAENpgAksVtD3fdd2++GY7mqIcPPvFkfvlWfO0oPVVVG/heqX1LxtP345qDpV7neb7SarzuQ+Zc47lgta+kVQXSsfTNSER4j2dbLCQBEiABEiCBCiSwkd9J6ACowAeCJpEACZAACawJAb+mVFN+zYZuYJW7K2QzlPM7u/96otTeHuv8p2bJ2f6LNaJrhtd9cE/XtQjsQ1b/5W/HOrEMYdmMW367PJMESIAESIAEVkFgw76TcArAKu4aLyUBEiABEiABEiABEiABEiABEiCBzUKADoDNcqdoJwmQAAmQAAmQAAmQAAmQAAmQAAmsggAdAKuAx0tJgARIgARIgARIgARIgARIgARIYLMQoANgs9wp2kkCJEACJEACJEACJEACJEACJEACqyBAB8Aq4PFSEiABEiABEiABEiABEiABEiABEtgsBOgA2Cx3inaSAAmQAAmQAAmQAAmQAAmQAAmQwCoI0AGwCni8lARIgARIgARIgARIgARIgARIgAQ2CwE6ADbLnaKdJEACJEACJEACJEACJEACJEACJLAKAnQArAIeLyUBEiABEiABEiABEiABEiABEiCBzUKADoDNcqdoJwmQAAmQAAmQAAmQAAmQAAmQAAmsggAdAKuAx0tJgARI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";
  const backwardIconURL = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20512%20512'%3e%3c!--!Font%20Awesome%20Free%206.7.2%20by%20@fontawesome%20-%20https://fontawesome.com%20License%20-%20https://fontawesome.com/license/free%20Copyright%202025%20Fonticons,%20Inc.--%3e%3cpath%20d='M459.5%20440.6c9.5%207.9%2022.8%209.7%2034.1%204.4s18.4-16.6%2018.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1%204.4L288%20214.3l0%2041.7%200%2041.7L459.5%20440.6zM256%20352l0-96%200-128%200-32c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1%204.4l-192%20160C4.2%20237.5%200%20246.5%200%20256s4.2%2018.5%2011.5%2024.6l192%20160c9.5%207.9%2022.8%209.7%2034.1%204.4s18.4-16.6%2018.4-29l0-64z'/%3e%3c/svg%3e";
  const forwardIconURL = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20512%20512'%3e%3c!--!Font%20Awesome%20Free%206.7.2%20by%20@fontawesome%20-%20https://fontawesome.com%20License%20-%20https://fontawesome.com/license/free%20Copyright%202025%20Fonticons,%20Inc.--%3e%3cpath%20d='M52.5%20440.6c-9.5%207.9-22.8%209.7-34.1%204.4S0%20428.4%200%20416L0%2096C0%2083.6%207.2%2072.3%2018.4%2067s24.5-3.6%2034.1%204.4L224%20214.3l0%2041.7%200%2041.7L52.5%20440.6zM256%20352l0-96%200-128%200-32c0-12.4%207.2-23.7%2018.4-29s24.5-3.6%2034.1%204.4l192%20160c7.3%206.1%2011.5%2015.1%2011.5%2024.6s-4.2%2018.5-11.5%2024.6l-192%20160c-9.5%207.9-22.8%209.7-34.1%204.4s-18.4-16.6-18.4-29l0-64z'/%3e%3c/svg%3e";
  function createPlayer(playlistUrl = "") {
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
      i18n: {
        en: {},
        "zh-cn": {},
        "zh-tw": {},
        pl: {},
        cs: {},
        es: {},
        fa: {},
        fr: {},
        id: {},
        ru: {},
        tr: {},
        ar: {},
        vi: {
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
        }
      },
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
        },
        {
          position: "right",
          html: `<img src="${logoURL}" style="height: 25px; padding: 0 7px; transform: translateY(-12%);">`,
          index: 1,
          tooltip: config.name
        }
      ]
    });
  }
  function getExceptionDuration() {
    if (isHostnameContains("ophim", "opstream")) {
      return 600;
    } else if (isHostnameContains("nguonc", "streamc")) {
      return Infinity;
    } else {
      return 900;
    }
  }
  async function getPlaylistURL(embedUrl) {
    var _a, _b;
    embedUrl = new URL(embedUrl);
    if (embedUrl.hostname.includes("phimapi")) {
      return embedUrl.searchParams.get("url") ?? "";
    }
    if (embedUrl.hostname.includes("opstream")) {
      const req = await unrestrictedFetch(embedUrl);
      const raw = await req.text();
      const playlistUrl = (_a = raw.match(new RegExp('(?<=const url = ").*(?=";)'))) == null ? void 0 : _a[0];
      return ((_b = URL.parse(String(playlistUrl), embedUrl)) == null ? void 0 : _b.href) || "";
    }
    if (embedUrl.hostname.includes("streamc")) {
      return embedUrl.toString().replace("embed.php", "get.php");
    }
    return embedUrl.href;
  }
  function getTotalDuration(playlist) {
    const matches = playlist.match(/#EXTINF:([\d.]+)/g) ?? [];
    return matches.reduce((sum, match) => {
      return sum + parseFloat(match.split(":")[1]);
    }, 0);
  }
  function isContainAds(playlist) {
    return config.adsRegexList.some((regex) => regex.test(playlist));
  }
  async function removeAds(playlistUrl) {
    playlistUrl = new URL(playlistUrl);
    if (caches.blob[playlistUrl.href]) {
      return caches.blob[playlistUrl.href];
    }
    let req = await unrestrictedFetch(playlistUrl, {
      headers: {
        Referer: playlistUrl.origin
      }
    });
    let playlist = await req.text();
    playlist = playlist.replace(
      /^[^#].*$/gm,
      (line) => {
        var _a, _b;
        return ((_b = (_a = URL.parse(line, playlistUrl)) == null ? void 0 : _a.toString) == null ? void 0 : _b.call(_a)) ?? line;
      }
    );
    if (playlist.includes("#EXT-X-STREAM-INF")) {
      caches.blob[playlistUrl.href] = await removeAds(
        playlist.trim().split("\n").slice(-1)[0]
      );
      return caches.blob[playlistUrl.href];
    }
    if (isContainAds(playlist)) {
      playlist = config.adsRegexList.reduce((playlist2, regex) => {
        return playlist2.replaceAll(regex, "");
      }, playlist);
    } else if (getTotalDuration(playlist) > getExceptionDuration()) {
      injectReportButton(playlistUrl);
      console.error("Không tìm thấy quảng cáo");
    }
    caches.blob[playlistUrl.href] = URL.createObjectURL(
      new Blob([playlist], {
        type: req.headers.get("Content-Type") ?? "text/plain"
      })
    );
    return caches.blob[playlistUrl.href];
  }
  async function detectEpisodeList(targetQuery, epsListParentQuery) {
    var _a;
    const callbackFn = async (url) => {
      var _a2, _b;
      elements.playerContainer ?? (elements.playerContainer = await createPlayerContainer(
        epsListParentQuery,
        "div"
      ));
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
        ...document.querySelectorAll([
          "#list_episode ~ * > button",
          "#list_episode ~ * > .card-collapse-content",
          "[id^=headlessui-disclosure-button]",
          "[id^=headlessui-disclosure-panel]"
        ].join(", "))
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
    elements.dcmaTroll ?? (elements.dcmaTroll = (() => {
      const dcmaTroll = document.createElement("img");
      Object.assign(dcmaTroll, {
        className: "pt-2",
        alt: "DMCA troll",
        src: "https://images.dmca.com/Badges/dmca-badge-w150-5x1-01.png"
      });
      return dcmaTroll;
    })());
    elements.credit ?? (elements.credit = (() => {
      const credit = document.createElement("p");
      Object.assign(credit, {
        className: "pt-2",
        textContent: `${config.name} v${config.version} | Được viết bởi ${config.author}`
      });
      return credit;
    })());
    element == null ? void 0 : element.before(elements.dcmaTroll);
    element == null ? void 0 : element.after(elements.credit);
  }
  const warningIconURL = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20512%20512'%3e%3c!--!Font%20Awesome%20Free%206.7.2%20by%20@fontawesome%20-%20https://fontawesome.com%20License%20-%20https://fontawesome.com/license/free%20Copyright%202025%20Fonticons,%20Inc.--%3e%3cpath%20d='M256%2032c14.2%200%2027.3%207.5%2034.5%2019.8l216%20368c7.3%2012.4%207.3%2027.7%20.2%2040.1S486.3%20480%20472%20480L40%20480c-14.3%200-27.6-7.7-34.7-20.1s-7-27.8%20.2-40.1l216-368C228.7%2039.5%20241.8%2032%20256%2032zm0%20128c-13.3%200-24%2010.7-24%2024l0%20112c0%2013.3%2010.7%2024%2024%2024s24-10.7%2024-24l0-112c0-13.3-10.7-24-24-24zm32%20224a32%2032%200%201%200%20-64%200%2032%2032%200%201%200%2064%200z'/%3e%3c/svg%3e";
  function injectReportButton(playlistUrl) {
    var _a;
    playlistUrl = new URL(playlistUrl);
    const params = new URLSearchParams({
      title: `No ads detected - ${location.hostname}`,
      labels: "bug",
      assignees: config.author,
      body: [
        `Version: \`v${config.version}\``,
        `User Agent: \`${navigator.userAgent}\``,
        `URL: ${location.href}`,
        `.m3u8 URL: ${playlistUrl.href}`
      ].join("\n")
    });
    (_a = instances.player) == null ? void 0 : _a.controls.add({
      name: "noadserror",
      index: 2,
      position: "right",
      html: getSvgMarkupFromDataUrl(warningIconURL),
      tooltip: "Không tìm thấy quảng cáo - Bấm để báo cáo lỗi",
      click: function() {
        window.open(
          `${config.homepageURL}/issues/new?${params.toString()}`,
          "_blank"
        );
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
  async function replaceLogo() {
    addStyle(`
        .mr-3.flex-none.overflow-hidden.w-auto > span > a > img {
            content: url('${logoURL}') / "${config.name}";
        }
    `);
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
    const episodeListParent = await waitForElement(
      episodeListParentQuery
    );
    episodeListParent.onclick = async (e) => {
      var _a;
      e.preventDefault();
      if (e.target instanceof HTMLAnchorElement && e.target !== elements.currentEpisode) {
        (_a = elements.currentEpisode) == null ? void 0 : _a.classList.remove("cuki-episode-current");
        elements.currentEpisode = e.target;
        elements.currentEpisode.classList.add("cuki-episode-current");
        await onEpisodeClickCallback(e.target.href);
      }
      if (e.target instanceof HTMLAnchorElement && elements.playerContainer) {
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
          new Error(
            `Aborted: Element "${selector}" not found in ${root === document ? "document" : "element"}`
          )
        );
      });
      observer.observe(root, { childList: true, subtree: true });
    });
  }
  addStylesheet("https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css");
  replaceLogo();
  waitForElement("footer .pt-2.justify-between.sm\\:flex").then(injectCredit);
  document.addEventListener("DOMContentLoaded", () => {
    const element = document.querySelector(
      "footer .pt-2.justify-between.sm\\:flex"
    );
    injectCredit(element);
  });
  if (isHostnameContains("player.phimapi", "streamc", "opstream")) {
    replaceEmbedPlayerContainer();
  } else if (isHostnameContains("nguonc")) {
    detectEpisodeList("#content", "#list_episode > div:nth-child(2)");
  } else if (isHostnameContains("ophim")) {
    detectEpisodeList(
      ".container",
      ".mt-0 > div[id^=headlessui-disclosure-panel] > div"
    );
  } else {
    detectEpisodeList("#content > div", "#list_episode > div:nth-child(2)");
  }

})(GM_fetch, {Notyf}, (() => {try { return Hls } catch(e) { return null }})(), (() => {try { return Artplayer } catch(e) { return null }})());