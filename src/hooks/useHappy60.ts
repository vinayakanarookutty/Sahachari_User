import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "../config/env";

export interface Happy60StatusResponse {
  _id?: string;
  name?: string;
  phoneNumber: string;
  isEnabled: boolean;
  description?: string;
}

export function useHappy60(pincode?: string) {
  return useQuery({
    queryKey: ["happy60-status", pincode],
    queryFn: async (): Promise<Happy60StatusResponse> => {
      try {
        const url = pincode && pincode.trim()
          ? `${API_BASE_URL}/happy60/public?pincode=${encodeURIComponent(pincode.trim())}`
          : `${API_BASE_URL}/happy60/public`;
        const response = await fetch(url);
        if (!response.ok) {
          return { isEnabled: true, phoneNumber: "7025548470" };
        }
        const data = await response.json();
        return data;
      } catch (error) {
        return { isEnabled: true, phoneNumber: "7025548470" };
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
