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

import { RentalCard } from "@/components/rentals/RentalCard";
import { StoreCard } from "@/components/stores/StoreCard";

import { useRentalStores } from "@/hooks/useRentalStores";
import { useStoreRentals } from "@/hooks/useStoreRentals";

export default function RentalsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const {
        data: stores = [],
        isLoading: storesLoading,
        refetch: refetchStores,
    } = useRentalStores();

    const {
        data: rentals = [],
        isLoading: rentalsLoading,
        refetch: refetchRentals,
    } = useStoreRentals(selectedStore?._id);

    const onRefresh = async () => {
        setRefreshing(true);

        try {
            if (selectedStore) {
                await refetchRentals();
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
                            router.back() || router.push('/home');
                        }
                    }}
                    className="bg-white/20 rounded-full p-2.5"
                >
                    <ArrowLeft size={22} color="#fff" />
                </Pressable>

                <View className="flex-1 items-center px-3">
                    <Text
                        className="text-white text-2xl font-bold"
                        numberOfLines={1}
                    >
                        {selectedStore
                            ? selectedStore.name
                            : "Rentals"}
                    </Text>

                    <Text className="text-blue-100 text-sm mt-1">
                        {selectedStore
                            ? `${rentals.length} rentals`
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

                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator
                        size="large"
                        color="#2563EB"
                    />

                    <Text className="text-gray-500 mt-3">
                        Loading rental stores...
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
                                No rental stores found
                            </Text>

                            <Text className="text-gray-500 mt-2 text-center">
                                Rental stores will appear here
                                when available.
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
            ) : rentalsLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator
                        size="large"
                        color="#2563EB"
                    />

                    <Text className="text-gray-500 mt-3">
                        Loading rentals...
                    </Text>
                </View>
            ) : (
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
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-24">
                            <Text className="text-6xl mb-3">
                                🏠
                            </Text>

                            <Text className="text-lg font-semibold text-gray-800">
                                No rentals available
                            </Text>

                            <Text className="text-gray-500 mt-2 text-center">
                                This store has no rentals yet.
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