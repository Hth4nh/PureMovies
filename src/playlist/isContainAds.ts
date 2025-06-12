import { config } from "../misc/state";

export function isContainAds(playlist: string) {
    return config.adsRegexList.some((regex) => {
        regex.lastIndex = 0;
        return regex.test(playlist);
    });
}
