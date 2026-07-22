import { Calendar, CreditCard, Package } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { getImageUrl } from "../../utils/image";

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PLACED: "bg-yellow-100",
    ACCEPTED: "bg-blue-100",
    IN_PROGRESS: "bg-purple-100",
    COMPLETED: "bg-green-100",
    RETURNED: "bg-indigo-100",
    CANCELLED: "bg-red-100",
    REJECTED: "bg-red-100",
  };
  return colors[status] || "bg-gray-100";
};

const getStatusTextColor = (status: string) => {
  const colors: Record<string, string> = {
    PLACED: "text-yellow-800",
    ACCEPTED: "text-blue-800",
    IN_PROGRESS: "text-purple-800",
    COMPLETED: "text-green-800",
    RETURNED: "text-indigo-800",
    CANCELLED: "text-red-800",
    REJECTED: "text-red-800",
  };
  return colors[status] || "text-gray-800";
};

const getStatusEmoji = (status: string) => {
  const emojis: Record<string, string> = {
    PLACED: "📦",
    ACCEPTED: "✅",
    IN_PROGRESS: "⚙️",
    COMPLETED: "🎉",
    RETURNED: "🔄",
    CANCELLED: "❌",
    REJECTED: "❌",
  };
  return emojis[status] || "📋";
};

export function BookingCard({ item, onPress }: any) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isRental = item.bookingType === "RENTAL";
  const itemName = item.item?.itemName || "Booking Item";
  const imageUri = item.item?.images?.[0] ? getImageUrl(item.item.images[0]) : null;

  return (
    <Pressable
      onPress={() => onPress(item)}
      className="bg-white rounded-3xl shadow-lg overflow-hidden active:scale-98"
    >
      {/* Header with gradient (Matching OrderCard) */}
      <View className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <View className="flex-row items-center gap-2 mb-1">
              <View
                className={`px-3 py-1 rounded-full ${
                  isRental ? "bg-purple-100" : "bg-blue-100"
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase ${
                    isRental ? "text-purple-800" : "text-blue-800"
                  }`}
                >
                  {isRental ? "Rental" : "Service"}
                </Text>
              </View>
            </View>

            {/* Prominent Item Name */}
            <Text className="text-xl font-bold text-gray-800" numberOfLines={2}>
              {itemName}
            </Text>
          </View>

          {/* Status Badge with Emoji */}
          <View
            className={`px-4 py-2 rounded-full flex-row items-center ${getStatusColor(
              item.status
            )} shadow-sm`}
          >
            <Text className="text-lg mr-1">{getStatusEmoji(item.status)}</Text>
            <Text
              className={`font-bold text-xs uppercase ${getStatusTextColor(
                item.status
              )}`}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Body Section */}
      <View className="p-5">
        {/* Item Preview */}
        <View className="mb-4">
          <View className="flex-row items-center mb-3">
            <View className="bg-green-100 p-2 rounded-lg mr-2">
              <Package size={16} color="#10B981" />
            </View>
            <Text className="text-base font-bold text-gray-800">
              {isRental ? "Rental Item Details" : "Service Details"}
            </Text>
          </View>

          <View className="flex-row items-center">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-14 h-14 rounded-xl bg-gray-100 mr-3"
                resizeMode="cover"
              />
            ) : (
              <View
                className={`w-14 h-14 rounded-xl items-center justify-center mr-3 ${
                  isRental ? "bg-purple-50" : "bg-blue-50"
                }`}
              >
                <Package size={22} color={isRental ? "#7C3AED" : "#2563EB"} />
              </View>
            )}

            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
                {itemName}
              </Text>
              {item.item?.category && (
                <Text className="text-xs text-gray-500 mt-0.5">
                  Category: {item.item.category}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Footer Info */}
        <View className="pt-4 border-t border-gray-100 space-y-3">
          {/* Total Amount */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-2 rounded-lg mr-2">
                <CreditCard size={14} color="#3B82F6" />
              </View>
              <Text className="text-sm text-gray-600">Total Amount</Text>
            </View>
            <Text className="text-xl font-bold text-blue-600">
              ₹{item.totalAmount?.toFixed ? item.totalAmount.toFixed(2) : item.totalAmount}
            </Text>
          </View>

          {/* Service Date / Rental Period */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-purple-100 p-2 rounded-lg mr-2">
                <Calendar size={14} color="#8B5CF6" />
              </View>
              <Text className="text-sm text-gray-600">
                {isRental ? "Rental Period" : "Service Date"}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-gray-700">
              {item.startDate
                ? isRental && item.endDate
                  ? `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`
                  : formatDate(item.startDate)
                : formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}