import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuthStore } from "../store/auth.store";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:3000";

export function usePolicyAgreement() {
  const queryClient = useQueryClient();

  const token = useAuthStore((s) => s.token);

  // Active policy
  const activePolicyQuery = useQuery({
    queryKey: ["policy-active"],
    enabled: !!token,
    retry: 1,

    queryFn: async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/policies/active`
        );

        if (!response.ok) {
          return null;
        }

        return response.json();
      } catch (err) {
        console.warn("Failed to fetch active policy:", err);
        return null;
      }
    },
  });

  // User acceptance status
  const statusQuery = useQuery({
    queryKey: ["policy-status"],
    enabled: !!token,
    retry: 1,

    queryFn: async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/policies/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return null;
        }

        return response.json();
      } catch (err) {
        console.warn("Failed to fetch policy status:", err);
        return null;
      }
    },
  });

  // Accept policy
  const acceptMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/policies/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to accept policy"
        );
      }

      return response.json();
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["policy-status"],
      });
    },
  });

  const policy =
    activePolicyQuery.data;

  const accepted =
    statusQuery.data?.accepted;

  const showPolicy =
    !!policy &&
    accepted === false;

  return {
    policy,

    showPolicy,

    isInitialLoading:
      activePolicyQuery.isLoading ||
      statusQuery.isLoading,

    isAccepting:
      acceptMutation.isPending,

    acceptPolicy: () => {
      acceptMutation.mutate();
    },
  };
}