// components/orders/OrderCard.tsx
import { Calendar, CreditCard, Package } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";
import { useAppFonts } from "../../hooks/useAppFonts";

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PLACED: 'bg-yellow-50 border border-yellow-200',
    CONFIRMED: 'bg-blue-50 border border-blue-200',
    SHIPPED: 'bg-purple-50 border border-purple-200',
    DELIVERED: 'bg-green-50 border border-green-200',
    CANCELLED: 'bg-red-50 border border-red-200',
  };
  return colors[status] || 'bg-gray-50 border border-gray-200';
};

const getStatusTextColor = (status: string) => {
  const colors: Record<string, string> = {
    PLACED: 'text-yellow-700',
    CONFIRMED: 'text-blue-700',
    SHIPPED: 'text-purple-700',
    DELIVERED: 'text-green-700',
    CANCELLED: 'text-red-700',
  };
  return colors[status] || 'text-gray-700';
};

const getStatusEmoji = (status: string) => {
  const emojis: Record<string, string> = {
    PLACED: '📦',
    CONFIRMED: '✅',
    SHIPPED: '🚚',
    DELIVERED: '🎉',
    CANCELLED: '❌',
  };
  return emojis[status] || '📋';
};

export function OrderCard({ item, onPress }: any) {
  const { styleRegular, styleBold } = useAppFonts();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  const {t} = useTranslation();

  return (
    <Pressable
      onPress={() => onPress(item._id)}
      style={({ pressed }) => ({
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 3,
        overflow: 'hidden',
        transform: [{ scale: pressed ? 0.98 : 1 }]
      })}
    >
      {/* Header with clean gradient */}
      <View style={{ backgroundColor: "#F8FAFC", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text style={[{ fontSize: 10, color: "#94A3B8", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }, styleRegular]}>
              {t("order_id")}
            </Text>
            <Text style={[{ fontSize: 14, fontWeight: "800", color: "#334155", marginTop: 2 }, styleBold]} numberOfLines={1}>
              #{item.checkoutId}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full flex-row items-center ${getStatusColor(item.status)}`}>
            <Text className="text-sm mr-1">{getStatusEmoji(item.status)}</Text>
            <Text style={[{ fontSize: 10, fontWeight: "800" }, styleBold]} className={`${getStatusTextColor(item.status)}`}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        {/* Items Preview */}
        <View style={{ marginBottom: 12 }}>
          <View className="flex-row items-center mb-2.5">
            <View className="bg-green-50 border border-green-100 p-1.5 rounded-lg mr-2">
              <Package size={14} color="#10B981" />
            </View>
            <Text style={[{ fontSize: 13, fontWeight: "800", color: "#1E293B" }, styleBold]}>
              {item.items?.length} {item.items?.length === 1 ? 'Item' : 'Items'}
            </Text>
          </View>

          {item.items?.slice(0, 2).map((orderItem: any, idx: number) => (
            <View key={idx} className="flex-row items-center mb-2">
              <Image
                source={{
                  uri: orderItem.productId?.images?.[0]?.startsWith("http")
                    ? orderItem.productId.images[0]
                    : `${process.env.EXPO_PUBLIC_S3_BASE_URL}/${orderItem.productId?.images?.[0]}`
                }}
                style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: '#F8FAFC' }}
              />
              <View className="flex-1 ml-3">
                <Text style={[{ fontSize: 13, fontWeight: "700", color: "#334155" }, styleBold]} numberOfLines={1}>
                  {orderItem.productId?.name}
                </Text>
                <Text style={[{ fontSize: 10, color: "#94A3B8", marginTop: 1 }, styleRegular]}>
                  {t("qty")}: {orderItem.quantity}
                </Text>
              </View>
              <Text style={[{ fontSize: 13, fontWeight: "800", color: "#2563EB" }, styleBold]}>
                ₹{(orderItem.quantity * orderItem.price).toFixed(2)}
              </Text>
            </View>
          ))}

          {item.items?.length > 2 && (
            <Text style={[{ fontSize: 11, color: "#2563EB", fontWeight: "700", textAlign: "center", marginTop: 4 }, styleBold]}>
              +{item.items.length - 2} {t("more_items")}
            </Text>
          )}
        </View>

        {/* Footer Info */}
        <View style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View className="bg-blue-50 border border-blue-100 p-1.5 rounded-lg mr-2">
                <CreditCard size={12} color="#3B82F6" />
              </View>
              <Text style={[{ fontSize: 12, color: "#64748B" }, styleRegular]}>
                {t("Total_Amount")}
              </Text>
            </View>
            <Text style={[{ fontSize: 16, fontStyle: 'normal', fontWeight: "900", color: "#2563EB" }, styleBold]}>
              ₹{item.totalAmount?.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-purple-50 border border-purple-100 p-1.5 rounded-lg mr-2">
                <Calendar size={12} color="#8B5CF6" />
              </View>
              <Text style={[{ fontSize: 12, color: "#64748B" }, styleRegular]}>
                {t("order_date")}
              </Text>
            </View>
            <Text style={[{ fontSize: 12, fontWeight: "700", color: "#475569" }, styleBold]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}