import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export function usePolicyAgreement() {
  const queryClient = useQueryClient();

  const token = useAuthStore.getState().token;

  // ----------------------------
  // 1. ACTIVE POLICY
  // ----------------------------
  const activePolicyQuery = useQuery({
    queryKey: ["policy-active"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/policies/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch active policy");

      return res.json();
    },
  });

  // ----------------------------
  // 2. USER POLICY STATUS
  // ----------------------------
  const statusQuery = useQuery({
    queryKey: ["policy-status"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/policies/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch policy status");

      return res.json();
    },
  });

  // ----------------------------
  // 3. ACCEPT POLICY
  // ----------------------------
  const acceptMutation = useMutation({
    mutationFn: async (version: string) => {
      const res = await fetch(`${API_BASE_URL}/policies/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ version }),
      });

      if (!res.ok) throw new Error("Failed to accept policy");

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policy-status"] });
    },
  });

  const policy = activePolicyQuery.data;

  const showPolicy =
    policy &&
    statusQuery.data &&
    !statusQuery.data.accepted;

  return {
    policy,
    showPolicy,

    status: statusQuery.data,

    isLoading:
      activePolicyQuery.isLoading || statusQuery.isLoading,

    acceptPolicy: () => {
      if (!policy?.version) return;
      acceptMutation.mutate(policy.version);
    },
  };
}