import { elements } from "../misc/state";
import { getRemValue, scrollIntoView, waitForElement } from ".";

export async function setupEpisodeClickListener(
    episodeListParentQuery: string,
    onEpisodeClickCallback: (embedUrl: string | URL) => void | Promise<void> = () => {},
) {
    const episodeListParent = await waitForElement<HTMLDivElement>(episodeListParentQuery);

    // Add click event to change video
    episodeListParent.onclick = async (e) => {
        e.preventDefault();

        if (e.target instanceof HTMLAnchorElement && e.target !== elements.currentEpisode) {
            elements.currentEpisode?.classList.remove("cuki-episode-current");

            elements.currentEpisode = e.target;
            elements.currentEpisode.classList.add("cuki-episode-current");

            await onEpisodeClickCallback(e.target.href);
        }

        if (e.target instanceof HTMLAnchorElement && elements.playerContainer) {
            scrollIntoView(elements.playerContainer, {
                top: 40 + 3 * getRemValue(),
                bottom: 1.5 * getRemValue(),
            });
        }
    };
}
