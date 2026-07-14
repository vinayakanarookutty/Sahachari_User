import { ArrowLeft } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { MarketplaceTabs } from "./MarketplaceTabs";
import { MarketplaceTab } from "../types/marketplace.types";

type Props = {
    activeTab: MarketplaceTab;
    onChangeTab: (tab: MarketplaceTab) => void;
};

export function MarketplaceHeader({
    activeTab,
    onChangeTab,
}: Props) {
    const insets = useSafeAreaInsets();
    const router = useRouter();

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
            <View className="flex-row items-center justify-between">
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

            {/* Tabs */}
            <MarketplaceTabs
                active={activeTab}
                onChange={onChangeTab}
            />
        </LinearGradient>
    );
}