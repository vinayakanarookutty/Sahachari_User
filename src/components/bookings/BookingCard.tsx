import { Calendar, CreditCard, Package } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export function BookingCard({ item, onPress }: any) {
    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PLACED: "bg-yellow-100",
            CONFIRMED: "bg-blue-100",
            PROCESSING: "bg-purple-100",
            COMPLETED: "bg-green-100",
            CANCELLED: "bg-red-100",
        };
        return colors[status] || "bg-gray-100";
    };

    const getStatusTextColor = (status: string) => {
        const colors: Record<string, string> = {
            PLACED: "text-yellow-800",
            CONFIRMED: "text-blue-800",
            PROCESSING: "text-purple-800",
            COMPLETED: "text-green-800",
            CANCELLED: "text-red-800",
        };
        return colors[status] || "text-gray-800";
    };

    const getStatusEmoji = (status: string) => {
        const emojis: Record<string, string> = {
            PLACED: "📦",
            CONFIRMED: "✅",
            PROCESSING: "⚙️",
            COMPLETED: "🎉",
            CANCELLED: "❌",
        };
        return emojis[status] || "📋";
    };

    return (
        <Pressable
            onPress={() => onPress(item)}
            className="bg-white rounded-3xl shadow-lg overflow-hidden"
        >
            {/* HEADER */}
            <View className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                <View className="flex-row justify-between items-start">

                    {/* ID */}
                    <View className="flex-1">
                        <Text className="text-xs text-gray-500 font-semibold uppercase">
                            Booking ID
                        </Text>
                        <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                            #{item._id.slice(-6)}
                        </Text>
                    </View>

                    {/* STATUS */}
                    <View
                        className={`px-4 py-2 rounded-full flex-row items-center ${getStatusColor(
                            item.status
                        )}`}
                    >
                        <Text className="text-xl mr-1">
                            {getStatusEmoji(item.status)}
                        </Text>
                        <Text
                            className={`text-xs font-bold uppercase ${getStatusTextColor(
                                item.status
                            )}`}
                        >
                            {item.status}
                        </Text>
                    </View>
                </View>
            </View>

            {/* BODY */}
            <View className="p-5">
                {/* SERVICE INFO */}
                <View className="mb-4">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-green-100 p-2 rounded-lg mr-2">
                            <Package size={16} color="#10B981" />
                        </View>

                        <Text className="text-base font-bold text-gray-800">
                            Service Details
                        </Text>
                    </View>

                    <Text className="text-sm font-semibold text-gray-800">
                        {item.item?.itemName}
                    </Text>

                    <Text className="text-xs text-gray-500 mt-1">
                        Type: {item.bookingType}
                    </Text>
                </View>

                {/* FOOTER INFO */}
                <View className="pt-4 border-t border-gray-100 space-y-3">

                    {/* PRICE */}
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="bg-blue-100 p-2 rounded-lg mr-2">
                                <CreditCard size={14} color="#3B82F6" />
                            </View>

                            <Text className="text-sm text-gray-600">
                                Total Amount
                            </Text>
                        </View>

                        <Text className="text-xl font-bold text-blue-600">
                            ₹{item.totalAmount}
                        </Text>
                    </View>

                    {/* DATE */}
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="bg-purple-100 p-2 rounded-lg mr-2">
                                <Calendar size={14} color="#8B5CF6" />
                            </View>

                            <Text className="text-sm text-gray-600">
                                Booking Date
                            </Text>
                        </View>

                        <Text className="text-sm font-semibold text-gray-700">
                            {formatDate(item.createdAt)}
                        </Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}