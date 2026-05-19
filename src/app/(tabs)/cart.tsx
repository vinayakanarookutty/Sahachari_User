import React from "react";
import {
  FlatList,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useCart } from "../../hooks/useCart";
import { CartItem } from "../../components/cart/CartItem";
import { CheckoutModal } from "../../components/cart/CheckoutModal";
import { SuccessModal } from "../../components/cart/SuccessModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Cart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const {
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
    handleQuantityChange,
    handleRemoveItem,
    handleCheckout,
    isPlacingOrder,
    parseNumber,
    refetch,
  } = useCart();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4">Loading your cart...</Text>
      </View>
    );
  }

  const isEmpty = !cart || !cart.items?.length;

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch?.();
    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-gray-50">

      {/* HEADER */}
      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        // style={{ paddingBottom: 16 }
        style={{ paddingTop: insets.top + 16, paddingBottom: 20 }}
      >
        <View className="flex-row items-center px-4 pt-4">

          {/* BACK BUTTON */}
          <Pressable
            onPress={() => router.back()}
            className="bg-white/20 p-2 rounded-full"
          >
            <ArrowLeft size={22} color="#fff" />
          </Pressable>

          {/* TITLE */}
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-white">
              Shopping Cart
            </Text>

            {!isEmpty && (
              <Text className="text-blue-100 text-sm mt-1">
                {cart.items.length} items
              </Text>
            )}
          </View>

          <View className="w-10" />
        </View>
      </LinearGradient>

      {/* EMPTY STATE */}
      {isEmpty ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-blue-50 rounded-full p-6 mb-6">
            <ShoppingBag size={64} color="#2563EB" />
          </View>

          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </Text>

          <Text className="text-gray-500 text-center mb-6">
            Start adding items to see them here
          </Text>

          <Pressable
            onPress={() => router.push("/home")}
            className="bg-blue-600 px-8 py-4 rounded-xl flex-row items-center"
          >
            <Text className="text-white font-semibold mr-2">
              Start Shopping
            </Text>
            <ArrowRight size={20} color="white" />
          </Pressable>
        </View>
      ) : (
        <>
          {/* CART ITEMS */}
          <FlatList
            data={cart.items}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#2563EB"]}
                tintColor="#2563EB"
              />
            }
            keyExtractor={(item) => item._id}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 150,
            }}
            renderItem={({ item }) => (
              <CartItem
                item={item}
                isUpdating={updatingItems.has(item._id)}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
                parseNumber={parseNumber}
              />
            )}
          />

          <View
            className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 10,
            }}
          ></View>

          {/* BOTTOM SUMMARY BAR */}
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6">

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Total Amount
              </Text>

              <Text className="text-2xl font-bold text-blue-600">
                ₹{total.toFixed(2)}
              </Text>
            </View>

            <Pressable
              onPress={() => setShowCheckoutModal(true)}
              className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center"
            >
              <Text className="text-white font-bold text-lg mr-2">
                Proceed to Checkout
              </Text>
              <ArrowRight size={22} color="white" />
            </Pressable>
          </View>
        </>
      )}

      {/* MODALS */}
      <CheckoutModal
        visible={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        address={address}
        setAddress={setAddress}
        onConfirm={handleCheckout}
        isPending={isPlacingOrder}
        total={total}
        itemSCount={cart?.items?.length}
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/home");
        }}
      />
    </SafeAreaView>
  );
}