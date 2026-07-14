// app/(tabs)/orders/index.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AlertCircle, ArrowLeft, RefreshCw, ShoppingBag } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
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
                {t("my_orders")}
              </Text>
              <Text style={{ fontSize: 13, color: "#BFDBFE", fontWeight: "600", marginTop: 4 }}>
                {orders.length}{" "}
                {orders.length === 1 ? t("order") : t("orders")}
              </Text>
            </View>
            <View className="w-10" />
          </View>
        </LinearGradient>


        <FlatList
          data={orders}
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