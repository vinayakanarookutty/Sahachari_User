import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/env";

export interface CarouselItem {
  _id: string;

  // New images are stored as data URLs
  // Old images may still be S3 paths
  image: string;

  imageUrl?: string;

  title?: string;
  subtitle?: string;

  order: number;
  isActive: boolean;

  type?: "global" | "pincode";

  pincodes?: string[];
}

const normalizeImage = (image?: string, imageUrl?: string) => {
  // Prefer imageUrl if backend provides it
  if (imageUrl) {
    return imageUrl;
  }

  if (!image) {
    return "";
  }

  // New carousel images
  // Example:
  // data:image/webp;base64,...
  if (image.startsWith("data:")) {
    return image;
  }

  // Already a complete URL
  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  // Old S3 images
  const S3_BASE_URL =
    process.env.EXPO_PUBLIC_S3_BASE_URL || "";

  if (S3_BASE_URL) {
    return `${S3_BASE_URL.replace(/\/$/, "")}/${image.replace(
      /^\//,
      "",
    )}`;
  }

  // If no S3 URL is configured,
  // return the original value.
  return image;
};

export function useCarousel(pincode?: string) {
  return useQuery({
    queryKey: ["carousel", pincode || "global"],

    queryFn: async (): Promise<CarouselItem[]> => {
      /*
       * If user has a pincode:
       *
       * GET /carousel/user/688570
       *
       * Backend should return:
       * - global carousels
       * - pincode-specific carousels matching 688570
       *
       * If no pincode:
       *
       * GET /carousel/global
       *
       * This prevents pincode-specific banners
       * from appearing for users without that pincode.
       */

      const endpoint = pincode
        ? `${API_BASE_URL}/carousel/user/${encodeURIComponent(
            pincode,
          )}`
        : `${API_BASE_URL}/carousel/global`;

      console.log(
        "Fetching carousel:",
        endpoint,
      );

      const response = await fetch(endpoint);

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Carousel API error:",
          response.status,
          errorText,
        );

        throw new Error(
          `Failed to fetch carousel (${response.status})`,
        );
      }

      const responseData = await response.json();

      /*
       * Support both:
       *
       * [...]
       *
       * and
       *
       * { data: [...] }
       */

      const data: CarouselItem[] =
        Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

      /*
       * Normalize old and new carousel records.
       */
      const normalized = data
        .filter(
          (item) =>
            item &&
            item.isActive !== false,
        )
        .map((item) => ({
          ...item,

          type:
            item.type || "global",

          pincodes:
            Array.isArray(item.pincodes)
              ? item.pincodes
              : [],

          image: normalizeImage(
            item.image,
            item.imageUrl,
          ),
        }));

      /*
       * Backend normally handles this,
       * but sorting here guarantees the
       * correct display order.
       */
      normalized.sort(
        (a, b) =>
          (a.order ?? 0) -
          (b.order ?? 0),
      );

      console.log(
        "Carousel data:",
        normalized,
      );

      return normalized;
    },

    enabled: true,

    staleTime: 5 * 60 * 1000,

    retry: 2,
  });
}