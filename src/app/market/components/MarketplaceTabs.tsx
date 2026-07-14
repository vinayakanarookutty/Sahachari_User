import { Pressable, Text, View } from "react-native";
import { MarketplaceTab } from "../types/marketplace.types";

const TABS: { key: MarketplaceTab; label: string }[] = [
    // { key: "products", label: "Products" },
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
    return (
        <View className="flex-row bg-gray-100 rounded-full p-1 mt-4">
            {TABS.map((tab) => {
                const isActive = active === tab.key;

                return (
                    <Pressable
                        key={tab.key}
                        onPress={() => onChange(tab.key)}
                        className={`flex-1 py-3 rounded-full items-center ${isActive ? "bg-blue-600" : ""
                            }`}
                    >
                        <Text
                            className={`font-semibold ${isActive ? "text-white" : "text-gray-700"
                                }`}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}