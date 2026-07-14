import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";

export interface ServiceStore {
    _id: string;
    name: string;
    email: string;
    address: string;
    image?: string;
    status: string;
}

export const useServiceStores = () => {
    const { token } = useAuthStore();

    return useQuery({
        queryKey: ["service-stores"],

        queryFn: async () => {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/services/service-stores`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch service stores"
                );
            }

            return response.json();
        },
    });
};