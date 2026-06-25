export type MarketplaceTab = "products" | "services" | "rentals";

export type MarketplaceRoute =
    | "products"
    | "services"
    | "rentals";

export interface MarketplaceItem {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    storeId?: string;
    images?: string[];
    price?: string | number;
}