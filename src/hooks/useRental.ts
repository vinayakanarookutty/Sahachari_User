import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export function useRental(id?: string) {
    return useQuery({
        queryKey: ["rental", id],
        enabled: !!id,
        queryFn: async () => {
            const res = await api(`/rentals/${id}`);
            return res.data;
        },
    });
}