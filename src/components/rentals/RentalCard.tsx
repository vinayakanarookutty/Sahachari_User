import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { getImageUrl } from "@/utils/image";

type Rental = {
    _id: string;
    name: string;
    description?: string;
    images?: string[];
    rentalPrice: number;
    finalPrice?: number;
    unit?: string;
    isAvailable?: boolean;
};

export function RentalCard({ item }: { item: Rental }) {
    const router = useRouter();

    const originalPrice = item.rentalPrice;
    const finalPrice = item.finalPrice ?? originalPrice;

    const hasDiscount = finalPrice < originalPrice;

    const discountPercent = hasDiscount
        ? Math.round(
            ((originalPrice - finalPrice) / originalPrice) * 100
        )
        : 0;

    const imageUrl = getImageUrl(item.images?.[0]);

    return (
        <Pressable
            onPress={() => router.push(`/rentals/${item._id}`)}
            className="mb-4 mx-4 rounded-3xl overflow-hidden bg-white max-h-40 active:scale-[0.98]"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
            }}
        >
            <View className="flex-row">
                {/* IMAGE */}
                <View className="w-32 h-32 relative">
                    <Image
                        source={{ uri: imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />

                    <View
                        style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            backgroundColor: "#7C3AED",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 999,
                        }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
                            Rental
                        </Text>
                    </View>

                    {hasDiscount && (
                        <View
                            style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                backgroundColor: "#EF4444",
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 999,
                            }}
                        >
                            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
                                -{discountPercent}%
                            </Text>
                        </View>
                    )}
                </View>

                {/* DETAILS */}
                <View className="flex-1 p-4 justify-between">
                    <View>
                        <Text
                            className="text-lg font-bold text-gray-900"
                            numberOfLines={1}
                        >
                            {item.name}
                        </Text>

                        <Text
                            className="text-sm text-gray-500"
                            numberOfLines={1}
                        >
                            {item.description || "Rental service item"}
                        </Text>
                    </View>

                    <View className="mt-3">
                        {/* PRICE ROW */}
                        <View className="flex-row items-end h-7">
                            <Text className="text-2xl font-bold text-blue-600">
                                ₹{finalPrice}
                            </Text>

                            <Text className="text-xs text-gray-600 ml-1 mb-1">
                                /{item.unit ?? "day"}
                            </Text>

                            <View className="ml-2 min-w-[60px]">
                                {hasDiscount ? (
                                    <Text className="text-sm text-gray-400 line-through">
                                        ₹{originalPrice}
                                    </Text>
                                ) : (
                                    <Text className="opacity-0 text-sm">
                                        {/* ₹0000 */}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* STATUS */}
                        <View className="mt-2">
                            <View
                                className={`self-start px-3 py-1 rounded-full ${item.isAvailable
                                    ? "bg-green-50"
                                    : "bg-red-50"
                                    }`}
                            >
                                <Text
                                    className={`text-xs font-semibold ${item.isAvailable
                                        ? "text-green-700"
                                        : "text-red-700"
                                        }`}
                                >
                                    {item.isAvailable
                                        ? "Available"
                                        : "Not Available"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}