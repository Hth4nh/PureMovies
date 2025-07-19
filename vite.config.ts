import { defineConfig } from "vite";
import monkey, { cdn } from "vite-plugin-monkey";

function tryCatchWrapper(variableName) {
    return `
    (() => {
        try {
            return ${variableName}
        }
        catch(e) {
            return null;
        }
    })()`;
}

const kkphimMatch = [
    "https://kkphim.com/*",
    "https://kkphim.vip/*",
    "https://kkphim1.com/*",
    "https://216.180.226.222/*",
    "https://player.phimapi.com/player/*",
];

const nguoncMatch = ["https://phim.nguonc.com/*", "https://*.streamc.xyz/*"];

const ophimMatch = [
    "https://ophim16.cc/*",
    "https://ophim17.cc/*",
    "https://vip.opstream10.com/share/*",
    "https://vip.opstream11.com/share/*",
    "https://vip.opstream12.com/share/*",
    "https://vip.opstream13.com/share/*",
    "https://vip.opstream14.com/share/*",
    "https://vip.opstream15.com/share/*",
    "https://vip.opstream16.com/share/*",
    "https://vip.opstream17.com/share/*",
    "https://vip.opstream90.com/share/*",
];

const connect = [
    "phim1280.tv",
    "kkphimplayer.com",
    "kkphimplayer1.com",
    "kkphimplayer2.com",
    "kkphimplayer3.com",
    "kkphimplayer4.com",
    "kkphimplayer5.com",
    "kkphimplayer6.com",
    "kkphimplayer7.com",
    "kkphimplayer8.com",
    "kkphimplayer9.com",
    "streamc.xyz",
    "opstream10.com",
    "opstream11.com",
    "opstream12.com",
    "opstream13.com",
    "opstream14.com",
    "opstream15.com",
    "opstream16.com",
    "opstream17.com",
    "opstream90.com",
    "*",
];

const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split("/")[1] : "PureMovies";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [
        monkey({
            entry: "src/main.ts",
            userscript: {
                name: "Cuki's PureMovie",
                namespace: "Hth4nh",
                description: `Cuki's PureMovie là một user-script hoàn hảo dành cho những ai yêu thích trải nghiệm xem phim liền mạch, không bị gián đoạn bởi quảng cáo "lậu" trong phim. Hy vọng sẽ mang đến cảm giác thoải mái và tập trung, giúp bạn tận hưởng từng khoảnh khắc của bộ phim một cách trọn vẹn nhất.`,
                homepageURL: "https://github.com/Hth4nh/PureMovies",
                icon: "https://raw.githubusercontent.com/Hth4nh/PureMovies/refs/heads/main/src/assets/images/favicon.png",
                updateURL: "https://hth4nh.github.io/PureMovies/puremovies.meta.js",
                downloadURL: "https://hth4nh.github.io/PureMovies/puremovies.user.js",
                match: [...kkphimMatch, ...nguoncMatch, ...ophimMatch],
                connect: connect,
                grant: ["GM.xmlHttpRequest"],
                "run-at": "document-start",
            },
            build: {
                metaFileName: true,
                externalGlobals: {
                    "hls.js": cdn.jsdelivr(tryCatchWrapper("Hls")),
                    notyf: cdn.jsdelivr(tryCatchWrapper("{Notyf}")),
                    artplayer: cdn.jsdelivr(tryCatchWrapper("Artplayer")),
                    "@trim21/gm-fetch": cdn.jsdelivr(tryCatchWrapper("GM_fetch")),
                },
            },
            format: {
                align: 12,
            },
        }),
    ],
    base: command === "build" ? `/${repoName}/` : "/",
}));
