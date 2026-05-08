import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getCart,
  placeOrder,
  removeCartItem,
  updateCartItemQuantity,
} from "../services/orders.api";

export function useCart() {
  const queryClient = useQueryClient();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form state
  const [address, setAddress] = useState({
    street: "",
    city: "",
    zipCode: "",
    phone: "",
    notes: "",
  });

  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItemQuantity(itemId, quantity),
    onMutate: ({ itemId }) =>
      setUpdatingItems((prev) => new Set(prev).add(itemId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onSettled: (_, __, { itemId }) =>
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onMutate: (itemId: string) =>
      setUpdatingItems((prev) => new Set(prev).add(itemId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onSettled: (_, __, itemId) =>
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      }),
  });

  const placeOrderMutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      console.debug("placeOrder: success");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      // Close checkout modal first, then open success modal after a short delay to avoid modal overlap issues
      setShowCheckoutModal(false);
      setTimeout(() => setShowSuccessModal(true), 250);
      setAddress({ street: "", city: "", zipCode: "", phone: "", notes: "" });
    },
    onError: (err: any) => {
      console.error("placeOrder failed", err);
      alert("Failed to place order. Please try again.");
    },
  });

  const parseNumber = (v: any) => {
    if (v == null) return 0;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
    const cleaned = parseFloat(String(v).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(cleaned) ? cleaned : 0;
  };

  const total =
    cart?.items?.reduce((sum: number, item: any) => {
      const price = parseNumber(item.productId?.price ?? item.price ?? 0);
      const qty = parseNumber(item.quantity ?? item.qty ?? 0);
      return sum + price * qty;
    }, 0) || 0;

  return {
    cart,
    isLoading,
    total,
    updatingItems,
    showCheckoutModal,
    setShowCheckoutModal,
    showSuccessModal,
    setShowSuccessModal,
    address,
    setAddress,
    // handleQuantityChange: (id: string, cur: number, d: number) => {
    //   const next = cur + d;
    //   if (next >= 1)
    //     updateQuantityMutation.mutate({ itemId: id, quantity: next });
    // },
    handleQuantityChange: (
      id: string,
      cur: number,
      d: number,
      availableQuantity: number
    ) => {

      const next = cur + d;

      // Prevent below 1
      if (next < 1) return;

      // Prevent exceeding stock
      if (next > availableQuantity) {
        alert("Cannot add more than available stock");
        return;
      }

      updateQuantityMutation.mutate({
        itemId: id,
        quantity: next,
      });
    },
    handleRemoveItem: (id: string) => removeItemMutation.mutate(id),
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
  };
}
