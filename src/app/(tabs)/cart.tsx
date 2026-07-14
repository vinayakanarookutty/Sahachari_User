import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CartItem } from "../../components/cart/CartItem";
import { CheckoutModal } from "../../components/cart/CheckoutModal";
import { SuccessModal } from "../../components/cart/SuccessModal";
import { useCart } from "../../hooks/useCart";

export default function Cart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);
  const { t } = useTranslation();

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
        <Text className="text-gray-600 mt-4">
          {t("Loading_your_cart")}
        </Text>
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
    // <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-gray-50">
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: "#2563EB" }}
    >
      <View className="flex-1 bg-gray-50">

        {/* Premium Header */}
        <LinearGradient
          colors={["#1E3A8A", "#2563EB", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 10, paddingBottom: 24 }}
        >
          {/* Decorative overlay */}
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.08 }}>
            <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: "white", position: "absolute", top: -40, right: -30 }} />
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "white", position: "absolute", bottom: -20, left: -20 }} />
          </View>

          <View className="flex-row items-center px-5 pt-4">
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)",
                padding: 10,
                borderRadius: 16,
              })}
            >
              <ArrowLeft size={22} color="#fff" strokeWidth={2.5} />
            </Pressable>

            <View className="flex-1 items-center">
              <Text style={{ fontSize: 22, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 }}>
                {t("Shopping_Cart")}
              </Text>
              {!isEmpty && (
                <Text style={{ fontSize: 13, color: "#BFDBFE", fontWeight: "600", marginTop: 4 }}>
                  {cart.items.length} {t("items")}
                </Text>
              )}
            </View>

            <View className="w-10" />
          </View>
        </LinearGradient>

        {/* EMPTY STATE */}
        {isEmpty ? (
          <View className="flex-1 items-center justify-center px-8">
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 40,
              overflow: "hidden",
              marginBottom: 28,
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 15,
            }}>
              <LinearGradient
                colors={["#EFF6FF", "#DBEAFE", "#BFDBFE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingBag size={52} color="#2563EB" strokeWidth={1.8} />
              </LinearGradient>
            </View>

            <Text style={{ fontSize: 24, fontWeight: "900", color: "#0F172A", marginBottom: 10, letterSpacing: -0.3 }}>
              {t("Your_cart_is_empty")}
            </Text>

            <Text style={{ fontSize: 15, color: "#94A3B8", textAlign: "center", marginBottom: 32, lineHeight: 22, fontWeight: "500" }}>
              {t("Start_adding_items_to_see_them_here")}
            </Text>

            <Pressable
              onPress={() => router.push("/home")}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingHorizontal: 36,
                  paddingVertical: 16,
                  borderRadius: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#1E40AF",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 10,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 16, marginRight: 8, letterSpacing: 0.3 }}>
                  {t("Start_Shopping")}
                </Text>
                <ArrowRight size={20} color="white" strokeWidth={2.5} />
              </LinearGradient>
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

            {/* BOTTOM SUMMARY BAR */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingHorizontal: 24,
                paddingTop: 24,
                paddingBottom: 24,
                shadowColor: "#1E3A8A",
                shadowOffset: { width: 0, height: -12 },
                shadowOpacity: 0.12,
                shadowRadius: 30,
                elevation: 25,
              }}
            >
              <View className="flex-row justify-between items-center mb-5">
                <View>
                  <Text style={{ fontSize: 13, color: "#94A3B8", fontWeight: "600", letterSpacing: 0.5, marginBottom: 4 }}>
                    {t("Total_Amount")}
                  </Text>
                  <Text style={{ fontSize: 28, fontWeight: "900", color: "#0F172A", letterSpacing: -0.5 }}>
                    ₹{total.toFixed(2)}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: "#EFF6FF",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#2563EB" }}>
                    {cart.items.length} {t("items")}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => setShowCheckoutModal(true)}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <LinearGradient
                  colors={["#2563EB", "#1D4ED8", "#1E40AF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 18,
                    borderRadius: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#1E40AF",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.35,
                    shadowRadius: 16,
                    elevation: 12,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 17, marginRight: 8, letterSpacing: 0.5 }}>
                    {t("Proceed_to_Checkout")}
                  </Text>
                  <ArrowRight size={20} color="white" strokeWidth={2.5} />
                </LinearGradient>
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
      </View>
    </SafeAreaView>
  );
}