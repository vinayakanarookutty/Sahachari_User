// app/(tabs)/orders/index.tsx
import { useRouter } from "expo-router";
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-react-native";
import { ActivityIndicator, FlatList, Pressable, Text, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OrderCard } from "../../components/orders/OrderCard";
import { OrderDetailsModal } from "../../components/orders/OrderDetailsModal";
import { useOrders } from "../../hooks/useOrders";
import { ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Orders() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    orders, isLoading, error, selectedOrder, isLoadingDetails,
    showDetailsModal, isCancelling, handleOrderPress, handleCancelOrder,
    handleCloseModal, refetch
  } = useOrders();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <View className="bg-white p-8 rounded-3xl shadow-xl items-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-4 text-gray-600 font-semibold">Loading your orders...</Text>
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
            {error ? "Oops! Something went wrong" : "No orders yet"}
          </Text>

          <Text className="text-gray-500 text-center mb-6 leading-6">
            {error
              ? "We couldn't load your orders. Please try again."
              : "Start shopping and your orders will appear here"}
          </Text>

          <Pressable
            onPress={() => error ? refetch() : router.push("/(tabs)/home")}
            className="bg-blue-600 px-8 py-4 rounded-2xl shadow-lg active:bg-blue-700 flex-row items-center"
          >
            {error && <RefreshCw size={20} color="white" className="mr-2" />}
            <Text className="text-white font-bold text-lg ml-2">
              {error ? "Try Again" : "Start Shopping"}
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
          style={{ paddingTop: insets.top + 16, paddingBottom: 20 }
          } >
          <View className="flex-row items-center px-4 pt-4">
            {/* BACK BUTTON */}
            <Pressable onPress={() => router.back()} className="bg-white/20 p-2 rounded-full" >
              <ArrowLeft size={22} color="#fff" />
            </Pressable>
            {/* TITLE */}
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-white">
                My Orders
              </Text>
              <Text className="text-blue-100 text-sm mt-1">
                {orders.length}{" "}
                {orders.length === 1 ? "order" : "orders"}
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