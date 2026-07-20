import { LinearGradient } from "expo-linear-gradient";
import { Minus, Plus, ShoppingCart, X } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AddToCartModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<boolean>;
  product: {
    name: string;
    finalPrice: number;
    quantity: number;
    images?: string[];
  };
  isPending?: boolean;
}

export function AddToCartModal({
  visible,
  onClose,
  onConfirm,
  product,
  isPending = false,
}: AddToCartModalProps) {
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const incrementQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const success = await onConfirm(quantity);
    setIsSubmitting(false);

    if (success) {
      // Reset quantity and close modal on success
      setQuantity(1);
      onClose();
    }
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  const totalPrice = product.finalPrice * quantity;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={handleClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-t-3xl"
          style={{ paddingBottom: insets.bottom }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
            <Text className="text-2xl font-bold text-gray-900">
              {t("addToCart")}
            </Text>
            <Pressable
              onPress={handleClose}
              className="bg-gray-100 rounded-full p-2"
            >
              <X size={20} color="#1F2937" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Product Info */}
          <View className="px-6 pt-4">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={2}>
              {product.name}
            </Text>
            <View className="flex-row items-baseline mt-2">
              <Text className="text-3xl font-bold text-blue-600">
                ₹{product.finalPrice}
              </Text>
              <Text className="text-gray-500 ml-2">
                {t("per_item")}
              </Text>
            </View>
          </View>

          {/* Quantity Selector */}
          <View className="px-6 py-6">
            <Text className="text-base font-semibold text-gray-700 mb-4">
              {t("Select_Quantity")}
            </Text>

            <View className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-4">
              <Pressable
                onPress={decrementQuantity}
                disabled={quantity <= 1 || isSubmitting}
                className={`bg-white rounded-full p-3 shadow-sm ${quantity <= 1 || isSubmitting ? "opacity-50" : ""
                  }`}
              >
                <Minus size={24} color="#1F2937" strokeWidth={2.5} />
              </Pressable>

              <View className="items-center">
                <Text className="text-4xl font-bold text-blue-600">
                  {quantity}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {product.quantity} {t("available")}
                </Text>
              </View>

              <Pressable
                onPress={incrementQuantity}
                disabled={quantity >= product.quantity || isSubmitting}
                className={`bg-white rounded-full p-3 shadow-sm ${quantity >= product.quantity || isSubmitting ? "opacity-50" : ""
                  }`}
              >
                <Plus size={24} color="#1F2937" strokeWidth={2.5} />
              </Pressable>
            </View>
          </View>

          {/* Total Price */}
          <View className="px-6 py-4 bg-blue-50 mx-6 rounded-2xl">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-700 font-semibold">
                {t("Total_Price")}
              </Text>
              <Text className="text-3xl font-bold text-blue-600">
                ₹{totalPrice.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="p-6 gap-3">
            <Pressable
              onPress={handleConfirm}
              disabled={isSubmitting || isPending}
              className={`rounded-2xl overflow-hidden ${isSubmitting || isPending ? "opacity-50" : ""
                }`}
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isSubmitting || isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <ShoppingCart size={22} color="#FFFFFF" strokeWidth={2.5} />
                    <Text className="text-white font-bold text-lg ml-3">
                      {t("addToCart")}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={handleClose}
              disabled={isSubmitting || isPending}
              className="bg-gray-100 py-4 rounded-2xl"
            >
              <Text className="text-center text-gray-700 font-semibold text-base">
                {t("cancel")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}