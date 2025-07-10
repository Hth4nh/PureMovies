interface WaitForElementOption {
    root?: ParentNode;
    signal?: AbortSignal;
}

export async function waitForElement<T extends Element = Element>(
    selector: string,
    { root = document, signal }: WaitForElementOption = {},
): Promise<T> {
    const element = root.querySelector<T>(selector);

    if (element) {
        return Promise.resolve(element);
    }

    if (signal?.aborted) {
        return Promise.reject(
            new Error(
                `Aborted immediately: Element "${selector}" not found in ${root === document ? "document" : "element"}`,
            ),
        );
    }

    return new Promise<T>((resolve, reject) => {
        const observer = new MutationObserver(() => {
            const element = root.querySelector<T>(selector);

            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        signal?.addEventListener("abort", () => {
            observer.disconnect();
            reject(
                new Error(`Aborted: Element "${selector}" not found in ${root === document ? "document" : "element"}`),
            );
        });

        observer.observe(root, { childList: true, subtree: true });
    });
}
