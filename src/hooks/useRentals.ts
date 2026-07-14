import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export function useRentals() {
  return useQuery({
    queryKey: ["rentals"],
    queryFn: async () => {
      const response = await api("/rentals");
      return response.data;
    },
  });
}