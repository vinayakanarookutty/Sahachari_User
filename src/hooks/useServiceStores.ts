import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { API_BASE_URL } from "@/config/env";

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
                `${API_BASE_URL}/services/service-stores`,
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