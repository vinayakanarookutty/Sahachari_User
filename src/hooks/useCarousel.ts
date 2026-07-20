import { useQuery } from "@tanstack/react-query";

const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    "http://localhost:3000";

export interface CarouselItem {
    _id: string;
    image: string;
    imageUrl?: string;
    title?: string;
    subtitle?: string;
    order: number;
    isActive: boolean;
}

export function useCarousel() {
    return useQuery({
        queryKey: ["carousel"],
        queryFn: async (): Promise<CarouselItem[]> => {
            const response = await fetch(
                `${API_BASE_URL}/carousel`,
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch carousel",
                );
            }

            const data: CarouselItem[] = await response.json();
            return data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        },
    });
}