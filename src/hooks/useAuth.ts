import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { loginApi, registerApi, getProfile } from "../services/auth.api";
import { useAuthStore } from "../store/auth.store";
import { ApiError } from "../types/api";
import { AuthResponse } from "../types/auth";
import { Role } from "../types/user";
import { jwtDecode } from "jwt-decode";


export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<
    AuthResponse,
    AxiosError<ApiError>,
    Parameters<typeof loginApi>[0]
  >({
    mutationFn: loginApi,
    onSuccess: async ({ accessToken: token, user }) => {
      if (!token) {
        throw new Error("No access token received from server");
      }

      if (user) {
        await setAuth(token, user);
        return;
      }

      try {
        const profile = await getProfile(token);
        await setAuth(token, profile);
        return;
      } catch (err: any) {
        console.error("Profile fetch failed:", err?.response ?? err);

        if (typeof token === "string") {
          try {
            const d: any = jwtDecode(token);
            const id = d.userId ?? d.sub;
            if (id && d.role === Role.USER) {
              await setAuth(token, {
                id,
                role: d.role,
                email: d.email ?? "",
                name: d.name,
              });
              return;
            }
          } catch (decodeErr) {
            console.error("JWT decode error:", decodeErr);
          }
        }

        throw new Error(
          err?.response?.status
            ? `Login ok, profile failed (${err.response.status})`
            : "Login ok, profile failed"
        );
      }
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<
    AuthResponse,
    AxiosError<ApiError>,
    Parameters<typeof registerApi>[0]
  >({
    mutationFn: registerApi,
    onSuccess: async (res, variables) => {
      const token = res?.accessToken;
      const user = res?.user;

      if (token && user) {
        await setAuth(token, user);
        return;
      }

      if (token) {
        try {
          const profile = await getProfile(token);
          await setAuth(token, profile);
          return;
        } catch (err: any) {
          console.error("Profile fetch after register failed:", err?.response ?? err);
          if (typeof token === "string") {
            try {
              const d: any = jwtDecode(token);
              const id = d.userId ?? d.sub;
              if (id && d.role === Role.USER) {
                await setAuth(token, {
                  id,
                  role: d.role,
                  email: d.email ?? "",
                  name: d.name,
                });
                return;
              }
            } catch (decodeErr) {
              console.error("JWT decode error after register:", decodeErr);
            }
          }
        }
      }

      // Fallback: If registration succeeded but backend didn't return accessToken, auto-login with credentials
      try {
        const loginRes = await loginApi({
          email: variables.email,
          password: variables.password,
        });
        if (loginRes?.accessToken) {
          if (loginRes.user) {
            await setAuth(loginRes.accessToken, loginRes.user);
          } else {
            const profile = await getProfile(loginRes.accessToken);
            await setAuth(loginRes.accessToken, profile);
          }
        }
      } catch (loginErr) {
        console.error("Auto-login after registration failed:", loginErr);
      }
    },
  });
};
