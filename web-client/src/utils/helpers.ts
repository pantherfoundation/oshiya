export function isValidHttpUrl(str: string): boolean {
    let url;

    try {
        url = new URL(str);
    } catch (_) {
        return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
}

export function sleep(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
}
