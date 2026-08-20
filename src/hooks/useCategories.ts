import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/env';

export interface CategoryItem {
  _id: string;
  name: string;
  image: string; // Base64 Data URL or URL
  pincode?: string;
  pincodes?: string[];
  isActive?: boolean;
  order?: number;
}

export function useCategories(pincode?: string) {
  return useQuery<CategoryItem[]>({
    queryKey: ['categories', pincode || 'all'],
    queryFn: async () => {
      const baseUrls = [
        API_BASE_URL,
        'http://localhost:5000',
        'http://10.0.2.2:5000',
        'http://192.168.0.190:5000',
      ].filter(Boolean);

      for (const base of baseUrls) {
        try {
          const url = pincode && pincode.trim()
            ? `${base}/categories?pincode=${encodeURIComponent(pincode.trim())}`
            : `${base}/categories`;

          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              return data;
            }
          }
        } catch (e) {
          // try next base url
        }
      }
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
