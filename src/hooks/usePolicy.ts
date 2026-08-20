import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuthStore } from "../store/auth.store";
import { API_BASE_URL } from "@/config/env";

export function usePolicyAgreement() {
  const queryClient = useQueryClient();

  const token = useAuthStore((s) => s.token);

  // ============================================================
  // USER POLICY STATUS
  //
  // GET /policies/user/status
  //
  // Backend automatically:
  // 1. Gets logged-in user
  // 2. Gets serviceablePincodes
  // 3. Finds matching active policies
  // 4. Returns all policies
  // 5. Checks whether all are accepted
  // ============================================================

  const statusQuery = useQuery({
    queryKey: ["policy-status"],
    enabled: !!token,
    retry: 1,

    queryFn: async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/policies/user/status`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          console.warn(
            "Failed to fetch policy status:",
            response.status,
            errorText
          );

          return null;
        }

        return response.json();
      } catch (err) {
        console.warn(
          "Failed to fetch policy status:",
          err
        );

        return null;
      }
    },
  });

  // ============================================================
  // ACCEPT ALL ACTIVE POLICIES
  //
  // POST /policies/user/accept
  //
  // Backend accepts all active policies matching
  // the user's serviceable pincodes.
  // ============================================================

  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error(
          "Authentication token is missing"
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/policies/user/accept`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText ||
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

  // ============================================================
  // RESPONSE DATA
  // ============================================================

  const policyStatus =
    statusQuery.data;

  // ============================================================
  // ALL ACTIVE POLICIES
  //
  // Example:
  //
  // [
  //   {
  //     pincode: "688524",
  //     version: "v1.0",
  //     title: "...",
  //     content: "..."
  //   },
  //   {
  //     pincode: "688525",
  //     version: "v2.0",
  //     title: "...",
  //     content: "..."
  //   }
  // ]
  // ============================================================

  const policies =
    policyStatus?.policies || [];

  // ============================================================
  // BACKWARD-COMPATIBLE SINGLE POLICY
  //
  // If your existing UI expects `policy`, give it
  // the first policy.
  //
  // New UI should preferably use `policies`.
  // ============================================================

  const policy =
    policies.length > 0
      ? policies[0]
      : null;

  // ============================================================
  // ACCEPTED STATUS
  // ============================================================

  const accepted =
    policyStatus?.accepted;

  // ============================================================
  // SHOW POLICY
  //
  // Show when:
  // - policies exist
  // - backend says they are not accepted
  // ============================================================

  const showPolicy =
    policies.length > 0 &&
    accepted === false;

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // First policy - backward compatibility
    policy,

    // ALL matching policies
    policies,

    // Pincodes having active policies
    pincodes:
      policyStatus?.pincodes || [],

    // Combined version
    activePolicyVersion:
      policyStatus?.activePolicyVersion ||
      null,

    // User's accepted combined version
    acceptedPolicyVersion:
      policyStatus?.acceptedPolicyVersion ||
      null,

    // Whether all current policies are accepted
    accepted:
      accepted ?? false,

    // Whether policy UI should be shown
    showPolicy,

    // Loading
    isInitialLoading:
      statusQuery.isLoading,

    isLoading:
      statusQuery.isLoading,

    // Accepting
    isAccepting:
      acceptMutation.isPending,

    // Accept function
    acceptPolicy: () => {
      acceptMutation.mutate();
    },

    // Optional async version
    acceptPolicyAsync: () =>
      acceptMutation.mutateAsync(),

    // Refetch
    refetchPolicy:
      statusQuery.refetch,
  };
}