// useProductActions.ts
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import { addToCart, placeSingleOrder } from "../services/orders.api";

export function useProductActions(product: any) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    zipCode: "",
    place: "",
    phone: "",
    notes: "",
    paymentMethod: "",
  });

  const handleAddToCart = async (quantity: number) => {
    setLoading(true);
    try {
      await addToCart({ productId: product.id, quantity });
      await queryClient.invalidateQueries({ queryKey: ["cart"] });

      if (Platform.OS === "android") {
        ToastAndroid.show(
          `Added ${quantity} item(s) to cart`,
          ToastAndroid.SHORT,
        );
      } else {
        Alert.alert("Success", `Added ${quantity} item(s) to cart`);
      }

      return true; // Success indicator
    } catch (err) {
      console.error("Add to cart error:", err);
      Alert.alert("Error", "Failed to add to cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async (quantity: number) => {
    if (!address.street || address.street.length < 5 || !address.phone) {
      Alert.alert("Error", "Please fill valid delivery details");
      return;
    }

    setLoading(true);
    try {
      await placeSingleOrder({
        productId: product.id,
        quantity,
        deliveryAddress: {
          street: address.street,
          city: address.city,
          zipCode: address.zipCode,
          place: address.place,
          phone: address.phone,
          notes: address.notes,
          paymentMethod: address.paymentMethod,
        },
        paymentMethod: address.paymentMethod,
      });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      setShowAddressModal(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Buy now error:", err);
      const msg = err?.response?.data?.message;
      Alert.alert("Order Failed", Array.isArray(msg) ? msg[0] : msg || "Error");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    address,
    setAddress,
    showAddressModal,
    setShowAddressModal,
    showSuccessModal,
    setShowSuccessModal,
    showQuantityModal,
    setShowQuantityModal,
    handleAddToCart,
    handleBuyNow,
  };
}
