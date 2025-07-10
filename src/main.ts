URL.parse ??= (url, base) => {
    try {
        return new URL(url, base);
    } catch (e) {
        console.error(e);
        return null;
    }
};

import "./assets/scss/main.scss";
import { isHostnameContains } from "./network";

import {
    addStylesheet,
    detectEpisodeList,
    injectCredit,
    replaceEmbedPlayerContainer,
    replaceLogo,
    waitForElement,
} from "./ui";

addStylesheet("https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css");

replaceLogo();

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
