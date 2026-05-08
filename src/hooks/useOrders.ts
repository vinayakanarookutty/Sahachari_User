import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Platform } from "react-native";
import { getOrders, getOrderById, cancelOrder } from "../services/orders.api";

export function useOrders() {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { data: selectedOrder, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["order", selectedOrderId],
    queryFn: () => getOrderById(selectedOrderId!),
    enabled: !!selectedOrderId && showDetailsModal,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["order", selectedOrderId],
      });

      handleCloseModal();

      if (Platform.OS === "web") {
        window.alert("Order cancelled successfully");
      } else {
        Alert.alert(
          "Success",
          "Order cancelled successfully"
        );
      }
    },

    onError: () => {
      if (Platform.OS === "web") {
        window.alert("Unable to cancel order");
      } else {
        Alert.alert(
          "Error",
          "Unable to cancel order"
        );
      }
    },
  });

  const handleOrderPress = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDetailsModal(true);
  };

  // const handleCancelOrder = (orderId: string) => {
  //   Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
  //     { text: "No", style: "cancel" },
  //     { text: "Yes, Cancel", style: "destructive", onPress: () => cancelMutation.mutate(orderId) },
  //   ]);
  // };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const doCancelOrder = async () => {
        cancelMutation.mutate(orderId);
      };

      if (Platform.OS === "web") {
        const confirm = window.confirm(
          "Are you sure you want to cancel this order?"
        );

        if (confirm) {
          await doCancelOrder();
        }

        return;
      }

      Alert.alert(
        "Cancel Order",
        "Are you sure you want to cancel this order?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: doCancelOrder,
          },
        ]
      );
    } catch (err) {
      console.error("Cancel order failed:", err);
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedOrderId(null);
  };

  const orders = data?.orders || data || [];

  return {
    orders,
    isLoading,
    error,
    selectedOrder,
    isLoadingDetails,
    showDetailsModal,
    isCancelling: cancelMutation.isPending,
    handleOrderPress,
    handleCancelOrder,
    handleCloseModal,
    refetch,
  };
}