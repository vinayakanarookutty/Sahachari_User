import { S3_BASE_URL } from "@/config/env";

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