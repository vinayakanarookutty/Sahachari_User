import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/env';

interface Store {
  _id: string;
  name: string;
  email: string;
  address: string;
  status: string;
  isVerified: boolean;
  image: string;
}
interface CategoryStoresResponse {
  stores: Store[];
  category: string;
}
// Hook to fetch stores by category
export const useCategoryStores = (category: string | undefined, token: string | undefined) => {
  return useQuery({
    queryKey: ['categoryStores', category],
    queryFn: async () => {
      if (!category) return [];
      
      const response = await fetch(
        `${API_BASE_URL}/customer/category/${category}/stores`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch category stores');
      }
      const data: CategoryStoresResponse[] = await response.json();
      
      // Return stores array from first element
      if (data && data.length > 0) {
        return data[0].stores || [];
      }
      
      return [];
    },
    enabled: !!category, // Only fetch if category exists
  });
};