import { MarketplaceRoute } from "../types/marketplace.types";

export function resolveCategoryRoute(
    category?: string
): MarketplaceRoute | null {
    if (!category) return null;

    const key = category.toLowerCase().trim();

    if (key === "service") return "services";
    if (key === "rent" || key === "rental") return "rentals";

    return null;
}