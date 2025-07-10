import infoIconURL from "../assets/icons/info.svg";
import warningIconURL from "../assets/icons/warning.svg";

import { Notyf } from "notyf";
import { elements } from "../misc/state";
import { waitForElement } from ".";
import { getSvgMarkupFromDataUrl } from "../misc/getSvgMarkupFromDataUrl";
import { remoteImport } from "../misc/remoteImport";

export async function createNotification() {
    elements.body ??= await waitForElement<HTMLBodyElement>("body");

    try {
        if (!Notyf) throw "";
    } catch (e) {
        console.warn("Notyf not found. Run workaround...");

        // @ts-expect-error
        window.tmp = await remoteImport("https://cdn.jsdelivr.net/npm/notyf", "Notyf");
        eval(`notyf = { Notyf: window.tmp }`);
    }

    return new Notyf({
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
                icon: getSvgMarkupFromDataUrl(infoIconURL),
            },
            {
                type: "warning",
                background: "#ffcc00",
                icon: getSvgMarkupFromDataUrl(warningIconURL),
            },
        ],
    });
}
