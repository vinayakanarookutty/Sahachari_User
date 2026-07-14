import { useQuery } from "@tanstack/react-query";

export const useStoreStatus = (token?: string) => {
  return useQuery({
    queryKey: ["store-status"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/customer/store-status`,
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