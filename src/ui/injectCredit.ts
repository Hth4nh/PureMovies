import { config, elements } from "../misc/state";

export function injectCredit(element: Element | null) {
    // DMCA troll
    elements.dmcaTroll ??= (() => {
        const dmcaTroll = document.createElement("img");

        Object.assign(dmcaTroll, {
            className: "pt-2",
            alt: "DMCA troll",
            src: "https://images.dmca.com/Badges/dmca-badge-w150-5x1-01.png",
        } as Partial<typeof dmcaTroll>);

        return dmcaTroll;
    })();

    // Footer credit
    elements.credit ??= (() => {
        const credit = document.createElement("p");

        Object.assign(credit, {
            className: "pt-2",
            textContent:
                `${config.name} v${config.version} | Được viết bởi ${config.author}`,
        } as Partial<typeof credit>);

        return credit;
    })();

    element?.before(elements.dmcaTroll);
    element?.after(elements.credit);
}
