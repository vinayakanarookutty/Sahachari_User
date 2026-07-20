import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/env";

export const useStoreStatus = (token?: string) => {
  return useQuery({
    queryKey: ["store-status"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/customer/store-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch store status");
      }

      return res.json();
    },
  });
};