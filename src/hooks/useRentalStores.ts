import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export function useRentalStores() {
    return useQuery({
        queryKey: ["rental-stores"],
        queryFn: async () => {
            const res = await api("/rentals/rental-stores");
            return res.data;
        },
    });
}