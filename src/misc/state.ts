import { GM_info } from "$";
import type { GmInfoScriptType } from "$";
import type { Notyf } from "notyf";
import type Artplayer from "artplayer";

interface ExtraConfig {
    betWarning: string;
    debug: boolean;
    flash: boolean;
    adsRegexList: RegExp[];
    domainBypassWhitelist: string[];
}

export const config: GmInfoScriptType & ExtraConfig = {
    ...GM_info.script,

    betWarning:
        "Hành vi cá cược, cờ bạc online <b>LÀ VI PHẠM PHÁP LUẬT</b><br>theo Điều 321 Bộ luật Hình sự 2015 (sửa đổi, bổ sung 2017)",
    debug: false,
    flash: false,
    adsRegexList: [
        /(?<!#EXT-X-DISCONTINUITY[\s\S]*)#EXT-X-DISCONTINUITY\n(?:.*?\n){18,24}#EXT-X-DISCONTINUITY\n(?![\s\S]*#EXT-X-DISCONTINUITY)/g,
        /#EXT-X-DISCONTINUITY\n(?:#EXT-X-KEY:METHOD=NONE\n(?:.*\n){18,24})?#EXT-X-DISCONTINUITY\n|convertv7\//g,
        /#EXT-X-DISCONTINUITY\n(?:#EXTINF:(?:3.92|0.76|2.00|2.50|2.00|2.42|2.00|0.78|1.96)0000,\n.*\n){9}#EXT-X-DISCONTINUITY\n(?:#EXTINF:(?:2.00|1.76|3.20|2.00|1.36|2.00|2.00|0.72)0000,\n.*\n){8}(?=#EXT-X-DISCONTINUITY)/g,
    ],
    domainBypassWhitelist: ["kkphimplayer", "phim1280", "opstream"]
};

export const caches = {
    url: {} as Record<string, string>,
    blob: {} as Record<string, string>,
};

export const elements = {
    body: null as HTMLBodyElement | null,
    playerContainer: null as HTMLDivElement | null,
    currentEpisode: null as HTMLAnchorElement | null,
    dmcaTroll: null as HTMLImageElement | null,
    credit: null as HTMLParagraphElement | null,
};

export const instances = {
    notification: null as Notyf | null,
    player: null as Artplayer | null,
};
