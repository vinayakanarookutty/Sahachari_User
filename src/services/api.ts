import axios from "axios";
import { useAuthStore } from "../store/auth.store";
import { API_BASE_URL } from "@/config/env";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (__DEV__) {
    console.debug(
      "[api.request]",
      `${config.method?.toUpperCase()} ${config.url}`,
      {
        hasToken: Boolean(token),
        tokenLength: token?.length || 0,
      },
    );
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("API 401 Unauthorized — clearing auth store.");
      try {
        useAuthStore.getState().logout();
      } catch (err) {
        console.error("Failed to clear auth store after 401", err);
      }
    }
    return Promise.reject(error);
  },
);
