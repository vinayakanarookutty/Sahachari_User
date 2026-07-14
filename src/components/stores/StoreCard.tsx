import { Image, Pressable, Text, View } from "react-native";
import { ChevronRight, MapPin } from "lucide-react-native";
import { getImageUrl } from "@/utils/image";

export function StoreCard({
    store,
    onPress,
}: {
    store: any;
    onPress: () => void;
}) {
    const imageUrl = getImageUrl(store.image);

    return (
        <Pressable
            onPress={onPress}
            className="mb-4 mx-4 rounded-3xl overflow-hidden bg-white active:scale-[0.98]"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
            }}
        >
            <View className="flex-row">
                {/* Store Image */}
                <View className="w-32 h-32 relative">
                    <Image
                        source={{ uri: imageUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />

                    <View className="absolute top-2 left-2 bg-blue-600 px-2 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">
                            Store
                        </Text>
                    </View>
                </View>

                {/* Details */}
                <View className="flex-1 p-4 justify-between">
                    <View>
                        <Text
                            className="text-lg font-bold text-gray-900"
                            numberOfLines={1}
                        >
                            {store.name}
                        </Text>

                        <View className="flex-row items-center mt-2">
                            <MapPin
                                size={14}
                                color="#6B7280"
                            />

                            <Text
                                className="text-sm text-gray-500 ml-1 flex-1"
                                numberOfLines={2}
                            >
                                {store.address}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between mt-4">
                        <View
                            className={`px-3 py-1 rounded-full ${store.status === "ACTIVE"
                                    ? "bg-green-50"
                                    : "bg-red-50"
                                }`}
                        >
                            <Text
                                className={`text-xs font-semibold ${store.status === "ACTIVE"
                                        ? "text-green-700"
                                        : "text-red-700"
                                    }`}
                            >
                                {store.status === "ACTIVE"
                                    ? "Open"
                                    : "Closed"}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Text className="text-blue-600 font-semibold mr-1">
                                View Services
                            </Text>

                            <ChevronRight
                                size={18}
                                color="#2563EB"
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}