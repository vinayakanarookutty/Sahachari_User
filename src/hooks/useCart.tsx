import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getCart,
  placeOrder,
  removeCartItem,
  updateCartItemQuantity,
} from "../services/orders.api";
import { registerOrderStatus, scheduleOrderNotification } from "../services/notification.service";

export function useCart() {
  const queryClient = useQueryClient();

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [address, setAddress] = useState({
    street: "",
    city: "",
    zipCode: "",
    phone: "",
    notes: "",
  });

  const {
    data: cart,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  const parseNumber = (v: any) => {
    if (v == null) return 0;

    const n = Number(v);

    if (Number.isFinite(n)) return n;

    const cleaned = parseFloat(
      String(v).replace(/[^0-9.-]+/g, "")
    );

    return Number.isFinite(cleaned) ? cleaned : 0;
  };

  const getDiscountedPrice = (product: any) => {
    const originalPrice = parseNumber(product?.price ?? 0);

    const now = new Date();

    const activeOffer = product?.offers?.find(
      (offer: any) =>
        offer.isActive &&
        new Date(offer.startDate) <= now &&
        new Date(offer.endDate) >= now
    );

    if (!activeOffer) {
      return originalPrice;
    }

    if (activeOffer.type === "PERCENTAGE") {
      return Math.max(
        0,
        originalPrice -
        (originalPrice * activeOffer.value) / 100
      );
    }

    if (activeOffer.type === "FIXED") {
      return Math.max(
        0,
        originalPrice - activeOffer.value
      );
    }

    return originalPrice;
  };

  const updateQuantityMutation = useMutation({
    mutationFn: ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => updateCartItemQuantity(itemId, quantity),

    onMutate: ({ itemId }) =>
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.add(itemId);
        return next;
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },

    onSettled: (_, __, { itemId }) =>
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      removeCartItem(itemId),

    onMutate: (itemId: string) =>
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.add(itemId);
        return next;
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },

    onSettled: (_, __, itemId) =>
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      }),
  });

  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      setShowCheckoutModal(false);

      setTimeout(() => {
        setShowSuccessModal(true);
      }, 250);

      try {
        const orderObj = data?.order || data;
        if (orderObj && (orderObj._id || orderObj.id)) {
          const orderId = orderObj._id || orderObj.id;
          const checkoutId = orderObj.checkoutId || orderId.slice(-6);
          const status = orderObj.status || "PLACED";
          registerOrderStatus(orderId, status);
          scheduleOrderNotification(
            "Order Placed Successfully 📦",
            `Your order #${checkoutId} has been placed.`
          );
        } else {
          scheduleOrderNotification(
            "Order Placed Successfully 📦",
            "Your order has been placed."
          );
        }
      } catch (err) {
        console.error("Failed to trigger local order placement notification:", err);
      }

      setAddress({
        street: "",
        city: "",
        zipCode: "",
        phone: "",
        notes: "",
      });
    },

    onError: (err: any) => {
      console.error("placeOrder failed", err);
      alert("Failed to place order. Please try again.");
    },
  });

  const total =
    cart?.items?.reduce((sum: number, item: any) => {
      const price = getDiscountedPrice(
        item.productId
      );

      const qty = parseNumber(
        item.quantity ?? item.qty ?? 0
      );

      return sum + price * qty;
    }, 0) || 0;

  return {
    cart,
    isLoading,
    refetch,
    total,

    updatingItems,

    showCheckoutModal,
    setShowCheckoutModal,

    showSuccessModal,
    setShowSuccessModal,

    address,
    setAddress,

    handleQuantityChange: (
      id: string,
      currentQuantity: number,
      delta: number,
      availableQuantity: number
    ) => {
      const next = currentQuantity + delta;

      if (next < 1) return;

      if (next > availableQuantity) {
        alert("Cannot add more than available stock");
        return;
      }

      updateQuantityMutation.mutate({
        itemId: id,
        quantity: next,
      });
    },

    handleRemoveItem: (id: string) => {
      removeItemMutation.mutate(id);
    },

    handleCheckout: () => {
      if (
        !address.street ||
        !address.city ||
        !address.zipCode ||
        !address.phone
      ) {
        alert("Please fill in all required fields");
        return;
      }

      placeOrderMutation.mutate(address);
    },

    isPlacingOrder: placeOrderMutation.isPending,

    parseNumber,
    getDiscountedPrice,
  };
}