import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Search, X } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    Text,
    TextInput,
    View,
    Keyboard,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RentalCard } from "@/components/rentals/RentalCard";
import { StoreCard } from "@/components/stores/StoreCard";

import { useRentalStores } from "@/hooks/useRentalStores";
import { useStoreRentals } from "@/hooks/useStoreRentals";

export default function RentalsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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

    const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

    const filteredStores = stores.filter((store: any) => {
        if (queryWords.length === 0) return true;
        const name = store.name?.toLowerCase() || "";
        const address = store.address?.toLowerCase() || "";
        return queryWords.every((word) => name.includes(word) || address.includes(word));
    });

    const filteredRentals = rentals.filter((rental: any) => {
        if (queryWords.length === 0) return true;
        const name = rental.name?.toLowerCase() || "";
        const description = rental.description?.toLowerCase() || "";
        return queryWords.every((word) => name.includes(word) || description.includes(word));
    });

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
                            setSearchQuery("");
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
                            ? `${filteredRentals.length} rentals`
                            : `${filteredStores.length} stores`}
                    </Text>
                </View>

                <View className="w-[46px]" />
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-white rounded-full pl-4 pr-1.5 py-1.5 mt-3 shadow-md border border-gray-100/60">
                <Search size={18} color="#4B5563" strokeWidth={2.5} />
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t("search") || "Search..."}
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-2 text-gray-800 text-sm font-medium py-1"
                    onSubmitEditing={() => Keyboard.dismiss()}
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery("")} className="mr-3 p-1 rounded-full active:bg-gray-100">
                        <X size={16} color="#6B7280" />
                    </Pressable>
                )}
                <Pressable 
                    onPress={() => Keyboard.dismiss()}
                    className="bg-blue-600 rounded-full p-2.5 flex-row items-center justify-center active:bg-blue-700 shadow-sm"
                >
                    <Search size={16} color="#FFFFFF" strokeWidth={2.5} />
                </Pressable>
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
                    data={filteredStores}
                    keyExtractor={(item: any) => item._id}
                    contentContainerStyle={{
                        padding: 12,
                        paddingBottom: 24,
                    }}
                    renderItem={({ item }) => (
                        <StoreCard
                            store={item}
                            onPress={() => {
                                setSelectedStore(item);
                                setSearchQuery("");
                            }}
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
                    data={filteredRentals}
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