export function isURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}