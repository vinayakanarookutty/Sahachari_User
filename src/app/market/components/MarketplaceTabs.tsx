import { Pressable, Text, View } from "react-native";
import { MarketplaceTab } from "../types/marketplace.types";
import { useAppFonts } from "../../../hooks/useAppFonts";

const TABS: { key: MarketplaceTab; label: string }[] = [
    { key: "services", label: "Services" },
    { key: "rentals", label: "Rentals" },
];

export function MarketplaceTabs({
    active,
    onChange,
}: {
    active: MarketplaceTab;
    onChange: (tab: MarketplaceTab) => void;
}) {
    const { styleBold } = useAppFonts();

    return (
        <View style={{
            flexDirection: "row",
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            borderRadius: 99,
            padding: 4,
            marginTop: 18,
        }}>
            {TABS.map((tab) => {
                const isActive = active === tab.key;

                return (
                    <Pressable
                        key={tab.key}
                        onPress={() => onChange(tab.key)}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 99,
                            alignItems: "center",
                            backgroundColor: isActive ? "#FFFFFF" : "transparent",
                            shadowColor: isActive ? "#1E3A8A" : "transparent",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: isActive ? 0.15 : 0,
                            shadowRadius: 8,
                            elevation: isActive ? 4 : 0,
                        }}
                    >
                        <Text
                            style={[{
                                fontSize: 13,
                                fontWeight: "800",
                                color: isActive ? "#2563EB" : "#FFFFFF",
                                letterSpacing: 0.3,
                            }, styleBold]}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}