import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export function useRentals(params?: {
  search?: string;
  unit?: string;
  available?: boolean;
}) {
  return useQuery({
    queryKey: ["rentals", params],
    queryFn: async () => {
      const query = new URLSearchParams();

      if (params?.search) {
        query.append("search", params.search);
      }
      if (params?.unit) {
        query.append("unit", params.unit);
      }
      if (params?.available !== undefined) {
        query.append("available", String(params.available));
      }

      const url = query.toString() ? `/rentals?${query}` : "/rentals";
      const response = await api(url);
      return response.data;
    },
  });
}