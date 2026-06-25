import { useState } from "react";
import {
    FlatList,
    View,
    Text,
    RefreshControl,
    ActivityIndicator,
    Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRentals } from "../../hooks/useRentals";
import { RentalCard } from "../../components/rentals/RentalCard";

export default function RentalsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const {
        data: rentals = [],
        isLoading,
        refetch,
    } = useRentals();

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);

        try {
            await refetch?.();
        } finally {
            setRefreshing(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-500 mt-3">
                    Loading rentals...
                </Text>
            </View>
        );
    }

    if (!rentals.length) {
        return (
            <View className="flex-1 bg-gray-50">
                {/* Header */}
                <LinearGradient
                    colors={["#2563EB", "#1D4ED8"]}
                    style={{
                        paddingTop: insets.top + 16,
                        paddingBottom: 20,
                        paddingHorizontal: 20,
                    }}
                >
                    <View className="flex-row items-center">
                        <Pressable
                            onPress={() => router.back()}
                            className="bg-white/20 rounded-full p-2.5"
                        >
                            <ArrowLeft size={22} color="#FFFFFF" />
                        </Pressable>

                        <View className="flex-1 items-center">
                            <Text className="text-2xl font-bold text-white">
                                Rentals
                            </Text>
                        </View>

                        <View className="w-11" />
                    </View>
                </LinearGradient>

                <View className="flex-1 items-center justify-center px-6">
                    <View className="bg-white p-8 rounded-3xl items-center shadow-sm">
                        <Text className="text-6xl mb-3">🏠</Text>

                        <Text className="text-xl font-bold text-gray-900 mb-2">
                            No rentals found
                        </Text>

                        <Text className="text-gray-500 text-center leading-6">
                            Rentals will appear here once they are available.
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                style={{
                    paddingTop: insets.top + 16,
                    paddingBottom: 20,
                    paddingHorizontal: 20,
                }}
            >
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="bg-white/20 rounded-full p-2.5"
                    >
                        <ArrowLeft size={22} color="#FFFFFF" />
                    </Pressable>

                    <View className="flex-1 items-center">
                        <Text className="text-2xl font-bold text-white">
                            Rentals
                        </Text>

                        <Text className="text-blue-100 text-sm">
                            {rentals.length}{" "}
                            {rentals.length === 1 ? "item" : "items"}
                        </Text>
                    </View>

                    <View className="w-11" />
                </View>
            </LinearGradient>

            <FlatList
                data={rentals}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={{
                    paddingTop: 16,
                    paddingBottom: 24,
                    paddingHorizontal: 12,
                }}
                renderItem={({ item }) => (
                    <RentalCard item={item} />
                )}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#2563EB"]}
                    />
                }
            />
        </View>
    );
}