import { ArrowLeft } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppFonts } from "../../../hooks/useAppFonts";

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
    const { styleBold } = useAppFonts();

    return (
        <LinearGradient
            colors={["#1E3A8A", "#2563EB", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                paddingTop: insets.top + 10,
                paddingBottom: 20,
                paddingHorizontal: 16,
            }}
        >
            {/* Decorative overlay */}
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.08 }}>
                <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: "white", position: "absolute", top: -40, right: -30 }} />
                <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "white", position: "absolute", bottom: -20, left: -20 }} />
            </View>

            {/* Header Row */}
            <View className="flex-row items-center justify-between pt-4">
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => ({
                        backgroundColor: pressed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)",
                        padding: 10,
                        borderRadius: 16,
                        zIndex: 10,
                    })}
                >
                    <ArrowLeft size={22} color="#fff" strokeWidth={2.5} />
                </Pressable>

                <View className="absolute left-0 right-0 items-center">
                    <Text style={[{ fontSize: 20, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 }, styleBold]}>
                        Marketplace
                    </Text>
                </View>

                <View className="w-10" />
            </View>

            {/* Tabs */}
            <MarketplaceTabs
                active={activeTab}
                onChange={onChangeTab}
            />
        </LinearGradient>
    );
}