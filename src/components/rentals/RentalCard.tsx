import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { getImageUrl } from "@/utils/image";
import { useAppFonts } from "../../hooks/useAppFonts";

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
    const { styleRegular, styleBold } = useAppFonts();

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
            style={({ pressed }) => ({
                marginBottom: 14,
                marginHorizontal: 16,
                borderRadius: 24,
                overflow: "hidden",
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#F1F5F9",
                shadowColor: "#1E3A8A",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 4,
                transform: [{ scale: pressed ? 0.98 : 1 }]
            })}
        >
            <View className="flex-row">
                {/* IMAGE */}
                <View style={{ width: 110, height: 110, position: "relative" }}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                    />

                    <View
                        style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            backgroundColor: "#7C3AED",
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 999,
                        }}
                    >
                        <Text style={[{ color: "#fff", fontWeight: "700", fontSize: 9 }, styleBold]}>
                            Rental
                        </Text>
                    </View>

                    {hasDiscount && (
                        <View
                            style={{
                                position: "absolute",
                                bottom: 8,
                                left: 8,
                                backgroundColor: "#EF4444",
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 999,
                            }}
                        >
                            <Text style={[{ color: "#fff", fontWeight: "700", fontSize: 9 }, styleBold]}>
                                -{discountPercent}%
                            </Text>
                        </View>
                    )}
                </View>

                {/* DETAILS */}
                <View className="flex-1 p-3.5 justify-between">
                    <View>
                        <Text
                            style={[{
                                fontSize: 15,
                                fontWeight: "800",
                                color: "#0F172A",
                            }, styleBold]}
                            numberOfLines={1}
                        >
                            {item.name}
                        </Text>

                        <Text
                            style={[{
                                fontSize: 12,
                                color: "#64748B",
                                marginTop: 2,
                            }, styleRegular]}
                            numberOfLines={1}
                        >
                            {item.description || "Rental service item"}
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-2">
                        {/* PRICE ROW */}
                        <View className="flex-row items-baseline">
                            <Text style={[{ fontSize: 18, fontWeight: "800", color: "#2563EB" }, styleBold]}>
                                ₹{finalPrice}
                            </Text>

                            <Text style={[{ fontSize: 10, color: "#94A3B8", marginLeft: 2 }, styleRegular]}>
                                /{item.unit ?? "day"}
                            </Text>

                            {hasDiscount && (
                                <Text style={[{ fontSize: 11, color: "#94A3B8", textDecorationLine: "line-through", marginLeft: 6 }, styleRegular]}>
                                    ₹{originalPrice}
                                </Text>
                            )}
                        </View>

                        {/* STATUS */}
                        <View
                            style={{
                                paddingHorizontal: 10,
                                paddingVertical: 2,
                                borderRadius: 999,
                                backgroundColor: item.isAvailable ? "#ECFDF5" : "#FEF2F2"
                            }}
                        >
                            <Text
                                style={[{
                                    fontSize: 10,
                                    fontWeight: "700",
                                    color: item.isAvailable ? "#059669" : "#DC2626"
                                }, styleBold]}
                            >
                                {item.isAvailable ? "Available" : "Not Available"}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}