import { createNotification, createPlayerContainer, setupEpisodeClickListener, waitForElement } from ".";
import { config, elements, instances } from "../misc/state";
import { changePlayerURL } from "../playlist";

export async function detectEpisodeList(targetQuery: string, epsListParentQuery: string) {
    const callbackFn = async (url: string | URL) => {
        elements.playerContainer ??= await createPlayerContainer(epsListParentQuery, "div");

        instances.notification ??= await createNotification();

        instances.notification?.dismissAll();
        instances.notification?.open({
            type: "info",
            message: config.betWarning,
        });

        elements.playerContainer.style.display = "";
        changePlayerURL(url);
    };

    const start = () => {
        const elementList = [
            ...document.querySelectorAll<HTMLDivElement | HTMLButtonElement>(
                [
                    "#list_episode ~ * > button",
                    "#list_episode ~ * > .card-collapse-content",
                    "[id^=headlessui-disclosure-button]",
                    "[id^=headlessui-disclosure-panel]",
                ].join(", "),
            ),
        ];

        elementList.slice(-6).forEach((element) => {
            element.style.display = "none";
        });

        setupEpisodeClickListener(epsListParentQuery, callbackFn);
    };

    const targetNode = await waitForElement(targetQuery);
    if (targetNode.lastElementChild?.classList.contains("px-8")) {
        start();
    }

    const observer = new MutationObserver((_mutationsList) => {
        if (targetNode.lastElementChild?.classList.contains("px-8")) {
            start();
        } else if (elements.playerContainer) {
            instances.player?.destroy();
            elements.playerContainer.remove();
            elements.playerContainer = null;
        }
    });

    observer.observe(targetNode, { childList: true });
}
