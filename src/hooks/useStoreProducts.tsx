import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/env';

interface Product {
  _id: string;
  storeId: string;
  name: string;
  description: string;
  category: string;
  price: string;
  finalPrice?: number;
  images: string[];
  quantity: number;
  offers: any[];
  createdAt: string;
  updatedAt: string;
}

// Hook to fetch products by store ID
export const useStoreProducts = (storeId: string | undefined) => {
   const { token } = useAuthStore();
    return useQuery({
    queryKey: ['storeProducts', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      
      const response = await fetch(
        `${API_BASE_URL}/customer/stores/${storeId}/products`,
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Replace with actual token
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch store products');
      }
      
      const data: Product[] = await response.json();
      return data;
    },
    enabled: !!storeId, // Only fetch if storeId exists
  });
};