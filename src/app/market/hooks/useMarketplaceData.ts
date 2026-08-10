import { useServices } from "@/hooks/useServices";
import { useRentals } from "@/hooks/useRentals";

export function useMarketplaceData(searchQuery?: string) {
    const services = useServices(searchQuery ? { search: searchQuery } : undefined);
    const rentals = useRentals(searchQuery ? { search: searchQuery } : undefined);

    const isLoading =
        services.isLoading ||
        rentals.isLoading;

    const refetchAll = async () => {
        await Promise.all([
            services.refetch?.(),
            rentals.refetch?.(),
        ]);
    };

    return {
        data: {
            services: services.data ?? [],
            rentals: rentals.data ?? [],
        },
        isLoading,
        refetchAll,
    };
}