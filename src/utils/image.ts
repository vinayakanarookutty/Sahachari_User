const S3_BASE_URL =
    process.env.EXPO_PUBLIC_S3_BASE_URL ?? "";

export const getImageUrl = (
    path?: string | null,
): string => {
    if (!path) return "";

    // already full url
    if (
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {
        return path;
    }

    return `${S3_BASE_URL.replace(/\/$/, "")}/${path.replace(
        /^\//,
        "",
    )}`;
};