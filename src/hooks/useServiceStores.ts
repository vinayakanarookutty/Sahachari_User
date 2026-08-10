import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export interface ServiceStore {
    _id: string;
    name: string;
    email: string;
    address: string;
    image?: string;
    status: string;
}

export const useServiceStores = () => {
    return useQuery({
        queryKey: ["service-stores"],
        queryFn: async () => {
            const res = await api("/services/service-stores");
            return res.data;
        },
    });
};