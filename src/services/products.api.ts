import { Product, ProductsQueryParams, Store } from "../types/product";
import { api } from "./api";
import { S3_BASE_URL } from "@/config/env";

const S3_BASE = S3_BASE_URL.replace(/\/$/, "");

function normalizeImage(img: any): string | null {
  if (!img) return null;

  // Prefer configured S3 base; otherwise fall back to API base URL so relative keys become absolute
  const base = S3_BASE || (api.defaults?.baseURL || "").replace(/\/$/, "");

  if (typeof img === "string") {
    if (img.startsWith("http")) return img;
    if (!base) return null;
    return `${base}/${img.replace(/^\/+/, "")}`;
  }

  if (typeof img === "object") {
    const key = img.key || img.path || img.url;
    if (!key) return null;
    if (key.startsWith("http")) return key;
    if (!base) return null;
    return `${base}/${String(key).replace(/^\/+/, "")}`;
  }

  return null;
}

function mapProduct(raw: any): Product {
  return {
    id: raw._id?.toString() ?? raw.id?.toString(),
    name: raw.name,
    description: raw.description,

    images: Array.isArray(raw.images)
      ? raw.images.map(normalizeImage).filter(Boolean) as string[]
      : [],

    quantity: Number(raw.quantity || 0),
    price: String(raw.price ?? 0),
    category: raw.category,
    storeId: raw.storeId?.toString?.() ?? raw.storeId,
    offers: raw.offers || [],
    finalPrice:
      typeof raw.finalPrice === "number"
        ? raw.finalPrice
        : raw.finalPrice
        ? Number(raw.finalPrice)
        : undefined,
  };
}

export const getProducts = (params?: ProductsQueryParams): Promise<Product[]> =>
  api
    .get<any[]>("/customer/products", { params })
    .then(r => r.data.map(mapProduct));

export const getProduct = (id: string): Promise<Product> =>
  api.get<any>(`/customer/products/${id}`).then(r => mapProduct(r.data));

export const getStores = (): Promise<Store[]> =>
  api.get<string[]>("/customer/stores").then(r => r.data.map(String));

export const getStoreProducts = (storeId: string): Promise<Product[]> =>
  api
    .get<any[]>(`/customer/stores/${storeId}/products`)
    .then(r => r.data.map(mapProduct));
