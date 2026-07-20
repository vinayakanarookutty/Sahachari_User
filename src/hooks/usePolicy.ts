import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuthStore } from "../store/auth.store";
import { API_BASE_URL } from "@/config/env";

export function usePolicyAgreement() {
  const queryClient = useQueryClient();

  const token =
    useAuthStore.getState().token;

  // Active policy
  const activePolicyQuery = useQuery({
    queryKey: ["policy-active"],
    enabled: !!token,

    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/policies/active`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load active policy"
        );
      }

      return response.json();
    },
  });

  // User acceptance status
  const statusQuery = useQuery({
    queryKey: ["policy-status"],
    enabled: !!token,

    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/policies/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load policy status"
        );
      }

      return response.json();
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