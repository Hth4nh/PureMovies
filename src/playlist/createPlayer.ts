import logoURL from "../assets/images/logo.svg";
import backwardIconURL from "../assets/icons/backward.svg";
import forwardIconURL from "../assets/icons/forward.svg";

import Artplayer from "artplayer";
import vi from "artplayer/src/i18n/vi.js";

import { config, instances } from "../misc/state";
import { getSvgMarkupFromDataUrl } from "../misc/getSvgMarkupFromDataUrl";
import { createNotification } from "../ui";
import { remoteImport } from "../misc/remoteImport";

export async function createPlayer(playlistUrl: string | URL = "") {
    try {
        if (!Artplayer) throw "";
    } catch (e) {
        console.warn("Artplayer not found. Run workaround...");
        instances.notification ??= await createNotification();

        instances.notification?.open({
            type: "warning",
            message: "Artplayer not found. Run workaround...",
        });

        // @ts-expect-error
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
                click: function () {
                    if (instances.player) {
                        instances.player.seek = this.currentTime - 10;
                    }
                },
            },
            {
                position: "left",
                name: "fast-forward",
                index: 11,
                html: getSvgMarkupFromDataUrl(forwardIconURL),
                tooltip: "10 giây sau",
                click: function () {
                    if (instances.player) {
                        instances.player.seek = this.currentTime + 10;
                    }
                },
            },
            {
                position: "right",
                html: `<img src="${logoURL}" style="height: 25px; padding: 0 7px; transform: translateY(-12%);">`,
                index: 1,
                tooltip: config.name,
            },
        ],
    });
}
