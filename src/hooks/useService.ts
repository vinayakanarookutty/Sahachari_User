import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";


export function useService(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["service", id],
    queryFn: async () => {
      const response = await api(`/services/find/${id}`);

      return response.data;
    },
  });
}