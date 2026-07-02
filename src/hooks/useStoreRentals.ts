import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export function useStoreRentals(storeId?: string) {
    return useQuery({
        enabled: !!storeId,
        queryKey: ["store-rentals", storeId],
        queryFn: async () => {
            const res = await api(
                `/rentals/stores/${storeId}/rentals`
            );

            return res.data;
        },
    });
}