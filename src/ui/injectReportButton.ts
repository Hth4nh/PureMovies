import warningIconURL from "../assets/icons/warning.svg";
import { getSvgMarkupFromDataUrl } from "../misc/getSvgMarkupFromDataUrl";
import { config, instances } from "../misc/state";

export function injectReportButton(playlistUrl: string | URL) {
    // Parse the input URL
    playlistUrl = new URL(playlistUrl);

    const params = new URLSearchParams({
        title: `No ads detected - ${location.hostname}`,
        labels: "bug",
        assignees: config.author,
        body: [
            `Version: \`v${config.version}\``,
            `User Agent: \`${navigator.userAgent}\``,
            `URL: ${location.href}`,
            `.m3u8 URL: ${playlistUrl.href}`,
        ].join("\n"),
    });

    instances.player?.controls.add({
        name: "noadserror",
        index: 2,
        position: "right",
        html: getSvgMarkupFromDataUrl(warningIconURL),
        tooltip: "Không tìm thấy quảng cáo - Bấm để báo cáo lỗi",
        click: function () {
            window.open(`${config.homepageURL}/issues/new?${params.toString()}`, "_blank");
        },
    });
}
