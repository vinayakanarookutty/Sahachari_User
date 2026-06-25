import { useState } from "react";
import { FlatList, ActivityIndicator, Text, View } from "react-native";

import { useMarketplaceData } from "../market/hooks/useMarketplaceData";
import { MarketplaceTabs } from "../market/components/MarketplaceTabs";
import { MarketplaceHeader } from "../market/components/MarketplaceHeader";
import { MarketplaceTab } from "../market/types/marketplace.types";
import { ServiceCard } from "@/components/products/ServiceCard";
import { RentalCard } from "@/components/rentals/RentalCard";
import { useRouter } from "expo-router";

export default function MarketplaceScreen() {
    const [activeTab, setActiveTab] =
        useState<MarketplaceTab>("services");

    const { data, isLoading } = useMarketplaceData();
    const router = useRouter();

    const getData = () => {
        switch (activeTab) {
            case "rentals":
                return data.rentals;
            case "services":
            default:
                return data.services;
            // return data.products;
        }
    };

    const renderItem = ({ item }: any) => {
        switch (activeTab) {
            case "rentals":
                return <RentalCard item={item} />;

            case "services":
            default:
                return (
                    <ServiceCard
                        item={item}
                        onPress={(service: any) =>
                            router.push(`/services/${service._id}`)
                        }
                    />
                );
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <MarketplaceHeader
                activeTab={activeTab}
                onChangeTab={setActiveTab}
            />

            {/* <MarketplaceTabs
                active={activeTab}
                onChange={setActiveTab}
            /> */}

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text className="mt-2 text-gray-500">
                        Loading marketplace...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={getData()}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item._id || item.id}
                    contentContainerStyle={{ padding: 12 }}
                />
            )}
        </View>
    );
}