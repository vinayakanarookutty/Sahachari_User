import { useRouter } from "expo-router";
import {
    FlatList,
    Text,
    View,
    ActivityIndicator,
    RefreshControl,
    Pressable,
} from "react-native";
import { useState } from "react";
import { ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ServiceCard } from "../../components/products/ServiceCard";
import { useServices } from "../../hooks/useServices";

export default function ServicesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const {
        data: services = [],
        isLoading,
        refetch,
    } = useServices();

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);

        try {
            await refetch?.();
        } finally {
            setRefreshing(false);
        }
    };

    const Header = () => (
        <LinearGradient
            colors={["#2563EB", "#1D4ED8"]}
            style={{
                paddingTop: insets.top + 12,
                paddingBottom: 20,
                paddingHorizontal: 16,
            }}
        >
            <View className="flex-row items-center">
                {/* Back Button */}
                <Pressable
                    onPress={() => router.back()}
                    className="bg-white/20 rounded-full p-2.5"
                >
                    <ArrowLeft
                        size={22}
                        color="#FFFFFF"
                    />
                </Pressable>

                {/* Center Title */}
                <View className="flex-1 items-center px-3">
                    <Text
                        className="text-white text-2xl font-bold"
                        numberOfLines={1}
                    >
                        Services
                    </Text>

                    <Text className="text-blue-100 text-sm mt-0.5">
                        {services.length}{" "}
                        {services.length === 1
                            ? "service"
                            : "services"}
                    </Text>
                </View>

                {/* Spacer */}
                <View className="w-[46px]" />
            </View>
        </LinearGradient>
    );

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-50">
                <Header />

                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator
                        size="large"
                        color="#2563EB"
                    />
                    <Text className="text-gray-500 mt-3">
                        Loading services...
                    </Text>
                </View>
            </View>
        );
    }

    if (!services.length) {
        return (
            <View className="flex-1 bg-gray-50">
                <Header />

                <View className="flex-1 items-center justify-center px-6">
                    <View className="bg-white p-8 rounded-3xl items-center shadow-sm">
                        <Text className="text-6xl mb-3">
                            🛠️
                        </Text>

                        <Text className="text-xl font-bold text-gray-900 mb-2">
                            No services available
                        </Text>

                        <Text className="text-gray-500 text-center leading-6">
                            Services will appear here once
                            they are added.
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Header />

            <FlatList
                data={services}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={{
                    paddingTop: 16,
                    paddingBottom: 24,
                    paddingHorizontal: 12,
                }}
                renderItem={({ item }) => (
                    <ServiceCard
                        item={item}
                        onPress={(service: any) =>
                            router.push(
                                `/services/${service._id}`
                            )
                        }
                    />
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