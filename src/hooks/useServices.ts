import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../services/products.api";
import { api } from "@/services/api";

// export function useServices() {
// const { data: products, isLoading, refetch } = useQuery({
//   queryKey: ["services"],
//   queryFn: () => getProducts({ category: "Service" }),
// });

// const parseNumber = (v: any) => {
//   if (v == null) return 0;
//   const n = Number(v);
//   if (Number.isFinite(n)) return n;
//   const cleaned = parseFloat(String(v).replace(/[^0-9.-]+/g, ""));
//   return Number.isFinite(cleaned) ? cleaned : 0;
// };

// return {
//   products: products || [],
//   isLoading,
//   refetch,
//   parseNumber,
// };
// }

export function useServices(params?: {
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["services", params],
    queryFn: async () => {
      const query = new URLSearchParams();

      if (params?.category) {
        query.append("category", params.category);
      }

      if (params?.search) {
        query.append("search", params.search);
      }

      const url = query.toString()
        ? `/services?${query}`
        : "/services";

      const response = await api(url);

      return response.data;
    },
  });
}