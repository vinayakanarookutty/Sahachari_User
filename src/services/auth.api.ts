import { api } from "./api";
import { LoginRequest, RegisterRequest, AuthResponse } from "../types/auth";
import { User } from "../types/user";

export const loginApi = (data: LoginRequest) =>
  api.post<AuthResponse>("/auth/login", data).then(r => r.data);

export const registerApi = (data: RegisterRequest) =>
  api.post<AuthResponse>("/auth/register", data).then(r => r.data);

export const getProfile = (token?: string) =>
  api
    .get<User>(token ? "/users/me" : "/auth/me", {
      ...(token && { headers: { Authorization: `Bearer ${token}` } }),
    })
    .then(r => r.data);

export const forgotPasswordApi = (email: string) =>
  api.post<{ message: string }>("/auth/forgot-password", { email }).then(r => r.data);

export const resetPasswordApi = (data: { email: string; otp: string; newPass: string }) =>
  api.post<{ message: string }>("/auth/reset-password", {
    email: data.email,
    otp: data.otp,
    newPassword: data.newPass,
  }).then(r => r.data);
