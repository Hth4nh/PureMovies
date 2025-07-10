import { waitForElement } from ".";

export async function createPlayerContainer(parentQuery = "body", tagName: "div" | "iframe" = "div") {
    let playerContainer = document.createElement(tagName);
    if (tagName === "iframe") {
        playerContainer.setAttribute("allowfullscreen", "");
    }

    playerContainer.classList.add("cuki-player-container", "w-full", "mx-2", "sm:mx-0", "mt-4", "rounded-lg");

    // Add to HTML
    let parent = await waitForElement(parentQuery);
    parent.append(playerContainer);

    return playerContainer;
}
