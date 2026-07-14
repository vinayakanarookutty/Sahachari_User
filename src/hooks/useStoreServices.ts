import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";

export interface Service {
    _id: string;
    storeId: string;
    name: string;
    description: string;
    price: string;
    finalPrice?: number;
    images: string[];
}

export const useStoreServices = (
    storeId: string | undefined
) => {
    const { token } = useAuthStore();

    return useQuery({
        queryKey: ["store-services", storeId],

        enabled: !!storeId,

        queryFn: async () => {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/services/stores/${storeId}/services`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch store services"
                );
            }

            return response.json();
        },
    });
};