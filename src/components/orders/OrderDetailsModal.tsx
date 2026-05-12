import {
  ChevronLeft,
  CreditCard,
  MapPin,
  Package,
  Phone,
  StickyNote,
  X,
} from "lucide-react-native";

import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { getStatusColor } from "./OrderCard";

const getStatusEmoji = (status: string) => {
  const emojis: Record<string, string> = {
    PLACED: "📦",
    CONFIRMED: "✅",
    SHIPPED: "🚚",
    DELIVERED: "🎉",
    CANCELLED: "❌",
  };

  return emojis[status] || "📋";
};

const getStatusTextColor = (status: string) => {
  const colors: Record<string, string> = {
    PLACED: "text-yellow-800",
    CONFIRMED: "text-blue-800",
    SHIPPED: "text-purple-800",
    DELIVERED: "text-green-800",
    CANCELLED: "text-red-800",
  };

  return colors[status] || "text-gray-800";
};

export function OrderDetailsModal({
  visible,
  order,
  isLoading,
  onClose,
  onCancel,
  isCancelling,
}: any) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-gray-50" >
        {/* HEADER */}
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          style={{ paddingBottom: 16 }}
        >
          <View className="flex-row items-center px-4 pt-4">

            {/* BACK BUTTON */}
            <Pressable
              onPress={onClose}
              className="bg-white/20 p-2 rounded-full"
            >
              <ChevronLeft size={22} color="#fff" />
            </Pressable>

            {/* TITLE */}
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-white">
                Order Details
              </Text>

              <Text className="text-blue-100 text-sm mt-1">
                Track your order
              </Text>
            </View>

            <View className="w-10" />
          </View>
        </LinearGradient>

        {!order || isLoading ? (
          <View className="flex-1 items-center justify-center">
            <View className="bg-white p-8 rounded-3xl shadow-lg items-center">
              <ActivityIndicator
                size="large"
                color="#2563eb"
              />

              <Text className="text-gray-500 mt-4 font-medium">
                Loading details...
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >

            {/* ORDER STATUS */}
            <View className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
              {/* ORDER ID */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-1">
                  Order ID
                </Text>
                <Text className="text-gray-800 font-bold text-lg" numberOfLines={1} >
                  #{order.checkoutId}
                </Text>
              </View>

              {/* STATUS */}
              <View>
                <Text className="text-gray-500 text-sm mb-2">
                  Order Status
                </Text>
                <View className={`px-4 py-2 rounded-full self-start ${getStatusColor(order.status)}`} >
                  <Text className={`font-bold text-sm ${getStatusTextColor(order.status)}`} >
                    {getStatusEmoji(order.status)} {order.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* ORDER ITEMS */}
            <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-5">
              <View className="flex-row items-center mb-4">
                <View className="bg-green-100 p-2 rounded-lg mr-3">
                  <Package size={20} color="#10B981" />
                </View>

                <Text className="font-bold text-xl text-gray-800">
                  Order Items
                </Text>
              </View>

              {order.items?.map(
                (item: any, idx: number) => (
                  <View key={idx} className="flex-row items-center bg-gray-50 rounded-2xl p-3 mb-3" >
                    {/* <Image
                      source={{
                        // uri:
                        //   item.productId?.images?.[0],
                        uri:
                          item.productId?.images?.[0]?.startsWith("http")
                            ? item.productId.images[0]
                            : `${process.env.EXPO_PUBLIC_S3_BASE_URL}/${item.productId?.images?.[0]}`,
                      }}
                      className="w-20 h-20 rounded-xl bg-gray-100"
                    /> */}
                    <Image
                      source={{
                        uri: item.productId?.images?.[0]?.startsWith("http")
                          ? item.productId.images[0]
                          : `${process.env.EXPO_PUBLIC_S3_BASE_URL}/${item.productId?.images?.[0]}`
                      }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        backgroundColor: "#f3f4f6",
                      }}
                      resizeMode="cover"
                    />

                    <View className="flex-1 ml-3 justify-between">

                      <Text
                        className="font-semibold text-gray-800 text-base"
                        numberOfLines={2}
                      >
                        {item.productId?.name}
                      </Text>

                      <Text className="text-gray-500 mt-1">
                        Qty: {item.quantity}
                      </Text>

                      <Text className="text-blue-600 font-bold text-lg mt-2">
                        ₹{(item.quantity * item.price)?.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>

            {/* DELIVERY ADDRESS */}
            <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-5">
              <View className="flex-row items-center mb-4">
                <View className="bg-red-100 p-2 rounded-lg mr-3">
                  <MapPin size={20} color="#EF4444" />
                </View>

                <Text className="font-bold text-xl text-gray-800">
                  Delivery Address
                </Text>
              </View>

              <View className="bg-gray-50 rounded-2xl p-4">

                <Text className="text-gray-800 leading-6 text-base mb-3">
                  {order.deliveryAddress?.street}
                </Text>

                <Text className="text-gray-700 font-medium mb-3">
                  {order.deliveryAddress?.city},{" "}
                  {order.deliveryAddress?.zipCode}
                </Text>

                <View className="flex-row items-center pt-3 border-t border-gray-200">
                  <View className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Phone size={16} color="#3B82F6" />
                  </View>

                  <Text className="text-gray-700 font-semibold">
                    {order.deliveryAddress?.phone}
                  </Text>
                </View>

                {order.deliveryAddress?.notes && (
                  <View className="mt-3 pt-3 border-t border-gray-200">
                    <View className="flex-row items-start">
                      <StickyNote size={16} color="#F59E0B" />

                      <View className="flex-1 ml-2">
                        <Text className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wide">
                          Delivery Notes
                        </Text>
                        <Text className="text-gray-700 italic">
                          {order.deliveryAddress.notes}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* TOTAL */}
            <View className="mx-4 mt-4 mb-6 bg-blue-600 rounded-2xl p-6">
              <View className="flex-row items-center justify-between">

                <View>
                  <Text className="text-blue-100 text-sm">
                    Total Amount
                  </Text>
                  <Text className="text-white text-3xl font-bold mt-1">
                    ₹{order.totalAmount?.toFixed(2)}
                  </Text>
                </View>

                <View className="bg-white/20 p-3 rounded-full">
                  <CreditCard size={24} color="white" />
                </View>
              </View>
            </View>

            {/* CANCEL BUTTON */}
            {order.status?.toUpperCase() === "PLACED" && (
              <View className="px-4 pb-6">
                <Pressable
                  onPress={() => onCancel(order._id)}
                  disabled={isCancelling}
                  className="rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor: "#ed5e68",
                    paddingVertical: 16,
                  }}
                >
                  {isCancelling ? (<ActivityIndicator color="white" />) : (
                    <View className="flex-row items-center justify-center">
                      <X size={20} color="white" />
                      <Text className="text-white text-center font-bold text-lg ml-2">
                        Cancel Order
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}