// app/(tabs)/orders/index.tsx
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AlertCircle, ArrowLeft, RefreshCw, ShoppingBag, Search, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View, Keyboard } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { OrderCard } from "../../components/orders/OrderCard";
import { OrderDetailsModal } from "../../components/orders/OrderDetailsModal";
import { useOrders } from "../../hooks/useOrders";

export default function Orders() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    orders, isLoading, error, selectedOrder, isLoadingDetails,
    showDetailsModal, isCancelling, handleOrderPress, handleCancelOrder,
    handleCloseModal, refetch
  } = useOrders();
  const {t} = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

  const filteredOrders = orders.filter((order: any) => {
    if (queryWords.length === 0) return true;
    const checkoutId = order.checkoutId?.toLowerCase() || "";
    const id = order._id?.toLowerCase() || "";
    const status = order.status?.toLowerCase() || "";
    return queryWords.every((word) =>
      checkoutId.includes(word) ||
      id.includes(word) ||
      status.includes(word) ||
      order.items?.some((item: any) =>
        item.productId?.name?.toLowerCase().includes(word)
      )
    );
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <View className="bg-white p-8 rounded-3xl shadow-xl items-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-4 text-gray-600 font-semibold">
            {t("loading_orders")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !orders?.length) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="bg-white rounded-3xl shadow-2xl p-8 items-center max-w-sm mx-auto">
          <View className={`${error ? 'bg-red-100' : 'bg-blue-100'} p-6 rounded-full mb-6`}>
            {error ? (
              <AlertCircle size={48} color="#dc2626" />
            ) : (
              <ShoppingBag size={48} color="#2563eb" />
            )}
          </View>

          <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
            {error ? t("oops_something_went_wrong") : t("no_orders_yet")}
          </Text>

          <Text className="text-gray-500 text-center mb-6 leading-6">
            {error
              ? t("orders_load_failed")
              : t("start_shopping_orders")}
          </Text>

          <Pressable
            onPress={() => error ? refetch() : router.push("/(tabs)/home")}
            className="bg-blue-600 px-8 py-4 rounded-2xl shadow-lg active:bg-blue-700 flex-row items-center"
          >
            {error && <RefreshCw size={20} color="white" className="mr-2" />}
            <Text className="text-white font-bold text-lg ml-2">
              {error ? t("try_again") : t("start_shopping")}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    // <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: "#2563EB" }}
    >
      <View className="flex-1 bg-gray-50">
        {/* Premium Header */}
        {/* <View className="bg-white px-6 py-5 shadow-sm border-b border-gray-100">
        <Text className="text-3xl font-bold text-gray-800 mb-1">My Orders</Text>
        <Text className="text-gray-500 font-medium">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} in total
        </Text>
      </View> */}
        {/* HEADER */}
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          // style={{ paddingBottom: 16 }
          style={{ paddingTop: insets.top + 10, paddingBottom: 20 }
          } >
          <View className="flex-row items-center px-4 pt-4">
            {/* BACK BUTTON */}
            <Pressable onPress={() => router.back()} className="bg-white/20 p-2 rounded-full" >
              <ArrowLeft size={22} color="#fff" />
            </Pressable>
            {/* TITLE */}
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-white">
                {t("my_orders")}
              </Text>
              <Text className="text-blue-100 text-sm mt-1">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? t("order") : t("orders")}
              </Text>
            </View>
            <View className="w-10" />
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white rounded-full pl-4 pr-1.5 py-1.5 mt-3 mx-4 shadow-md border border-gray-100/60">
            <Search size={18} color="#4B5563" strokeWidth={2.5} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t("search") || "Search..."}
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-gray-800 text-sm font-medium py-1"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} className="mr-3 p-1 rounded-full active:bg-gray-100">
                <X size={16} color="#6B7280" />
              </Pressable>
            )}
            <Pressable 
              onPress={() => Keyboard.dismiss()}
              className="bg-blue-600 rounded-full p-2.5 flex-row items-center justify-center active:bg-blue-700 shadow-sm"
            >
              <Search size={16} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>
        </LinearGradient>


        <FlatList
          data={filteredOrders}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <OrderCard
              item={item}
              onPress={handleOrderPress}
            />
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-3" />}

          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
            />
          }
        />

        <OrderDetailsModal
          visible={showDetailsModal}
          order={selectedOrder}
          isLoading={isLoadingDetails}
          onClose={handleCloseModal}
          onCancel={handleCancelOrder}
          isCancelling={isCancelling}
        />
      </View>
    </SafeAreaView>
  );
}