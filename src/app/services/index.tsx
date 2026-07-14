import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ServiceCard } from "../../components/products/ServiceCard";
import { StoreCard } from "../../components/stores/StoreCard";

import { useServiceStores } from "../../hooks/useServiceStores";
import { useStoreServices } from "../../hooks/useStoreServices";

export default function ServicesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const {
        data: stores = [],
        isLoading: storesLoading,
        refetch: refetchStores,
    } = useServiceStores();

    const {
        data: services = [],
        isLoading: servicesLoading,
        refetch: refetchServices,
    } = useStoreServices(selectedStore?._id);

    const onRefresh = async () => {
        setRefreshing(true);

        try {
            if (selectedStore) {
                await refetchServices();
            } else {
                await refetchStores();
            }
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
                <Pressable
                    onPress={() => {
                        if (selectedStore) {
                            setSelectedStore(null);
                        } else {
                            router.back();
                        }
                    }}
                    className="bg-white/20 rounded-full p-2.5"
                >
                    <ArrowLeft
                        size={22}
                        color="#FFFFFF"
                    />
                </Pressable>

                <View className="flex-1 items-center px-3">
                    <Text
                        className="text-white text-2xl font-bold"
                        numberOfLines={1}
                    >
                        {selectedStore
                            ? selectedStore.name
                            : "Services Store"}
                    </Text>

                    <Text className="text-blue-100 text-sm mt-0.5">
                        {selectedStore
                            ? `${services.length} services`
                            : `${stores.length} stores`}
                    </Text>
                </View>

                <View className="w-[46px]" />
            </View>
        </LinearGradient>
    );

    if (storesLoading) {
        return (
            <View className="flex-1 bg-gray-50">
                <Header />

                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator
                        size="large"
                        color="#2563EB"
                    />

                    <Text className="text-gray-500 mt-3">
                        Loading service stores...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Header />

            {!selectedStore ? (
                <FlatList
                    data={stores}
                    keyExtractor={(item: any) => item._id}
                    contentContainerStyle={{
                        padding: 12,
                        paddingBottom: 24,
                    }}
                    renderItem={({ item }) => (
                        <StoreCard
                            store={item}
                            onPress={() =>
                                setSelectedStore(item)
                            }
                        />
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-24">
                            <Text className="text-6xl mb-3">
                                🏪
                            </Text>

                            <Text className="text-lg font-semibold text-gray-800">
                                No service stores found
                            </Text>

                            <Text className="text-gray-500 mt-2 text-center">
                                Service stores will appear
                                here when available.
                            </Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#2563EB"]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            ) : servicesLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator
                        size="large"
                        color="#2563EB"
                    />

                    <Text className="text-gray-500 mt-3">
                        Loading services...
                    </Text>
                </View>
            ) : (
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
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-24">
                            <Text className="text-6xl mb-3">
                                🛠️
                            </Text>

                            <Text className="text-lg font-semibold text-gray-800">
                                No services available
                            </Text>

                            <Text className="text-gray-500 mt-2 text-center">
                                This store has no services
                                yet.
                            </Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#2563EB"]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}