import { ArrowLeft, Search, X } from "lucide-react-native";
import { Pressable, Text, TextInput, View, Keyboard } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { MarketplaceTabs } from "./MarketplaceTabs";
import { MarketplaceTab } from "../types/marketplace.types";

type Props = {
    activeTab: MarketplaceTab;
    onChangeTab: (tab: MarketplaceTab) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
};

export function MarketplaceHeader({
    activeTab,
    onChangeTab,
    searchQuery,
    setSearchQuery,
}: Props) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <LinearGradient
            colors={["#2563EB", "#1D4ED8"]}
            style={{
                paddingTop: insets.top + 16,
                paddingBottom: 16,
                paddingHorizontal: 16,
            }}
        >
            {/* Header Row */}
            <View className="flex-row items-center justify-between mb-3">
                <Pressable
                    onPress={() => router.back()}
                    className="bg-white/20 p-2 rounded-full z-10"
                >
                    <ArrowLeft size={20} color="#fff" />
                </Pressable>

                <View className="absolute left-0 right-0 items-center">
                    <Text className="text-white text-xl font-bold">
                        Marketplace
                    </Text>
                </View>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-white rounded-full pl-4 pr-1.5 py-1.5 mb-3 shadow-md border border-gray-100/60">
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

            {/* Tabs */}
            <MarketplaceTabs
                active={activeTab}
                onChange={onChangeTab}
            />
        </LinearGradient>
    );
}