import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    CheckCircle,
    Heart,
    Share2
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    Share,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CheckoutModal } from "@/components/cart/CheckoutModal";
import { SuccessModal } from "@/components/cart/SuccessModal";
import { useRental } from "@/hooks/useRental";
import { createBooking } from "@/services/booking.api";
import { getImageUrl } from "@/utils/image";

const { width } = Dimensions.get("window");

export default function RentalDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { data: rental, isLoading, error, refetch } = useRental(id);

    const [isFavorite, setIsFavorite] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const heartAnim = useRef(new Animated.Value(1)).current;

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (error || !rental) {
        return (
            <View className="flex-1 items-center justify-center px-6">
                <Text className="text-gray-600 mb-4">Failed to load rental</Text>
                <Pressable onPress={refetch} className="bg-blue-600 px-4 py-2 rounded-xl">
                    <Text className="text-white">Retry</Text>
                </Pressable>
            </View>
        );
    }

    const price = rental.finalPrice ?? rental.rentalPrice;
    const originalPrice = rental.rentalPrice;
    const finalPrice = rental.finalPrice ?? originalPrice;

    const hasDiscount = finalPrice < originalPrice;

    const discountPercent = hasDiscount
        ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
        : 0;

    const unit = rental.unit ?? "day";

    const handleShare = async () => {
        await Share.share({
            message: `${rental.name} - ₹${price}/${unit}`,
        });
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        Animated.sequence([
            Animated.timing(heartAnim, {
                toValue: 1.3,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(heartAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleConfirm = async (addressData: any) => {
        await createBooking("RENTAL", {
            rentalId: rental._id,
            quantity: 1,
            bookingAddress: addressData,
        });

        setShowCheckout(false);
        setShowSuccess(true);
    };

    return (
        <View className="flex-1 bg-white">

            {/* HEADER */}
            <View
                className="absolute top-0 left-0 right-0 z-10 flex-row justify-between px-6"
                style={{ paddingTop: insets.top + 10 }}
            >
                <Pressable onPress={() => router.back()} className="bg-white p-3 rounded-full">
                    <ArrowLeft size={20} color="#111827" />
                </Pressable>

                <View className="flex-row gap-3">
                    <Pressable onPress={handleShare} className="bg-white p-3 rounded-full">
                        <Share2 size={20} color="#111827" />
                    </Pressable>

                    <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
                        <Pressable onPress={toggleFavorite} className="bg-white p-3 rounded-full">
                            <Heart
                                size={20}
                                color={isFavorite ? "#EF4444" : "#111827"}
                                fill={isFavorite ? "#EF4444" : "transparent"}
                            />
                        </Pressable>
                    </Animated.View>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>

                {/* IMAGE */}
                <View>
                    <Image
                        source={{ uri: getImageUrl(rental.images?.[0]) }}
                        style={{ width, height: 400 }}
                        resizeMode="cover"
                    />

                    {hasDiscount && discountPercent > 0 && (
                        <View className="absolute bottom-5 right-5 bg-red-500 px-3 py-2 rounded-xl">
                            <Text className="text-white font-bold">
                                {discountPercent}% OFF
                            </Text>
                        </View>
                    )}

                    {/* Rental Badge (bottom-right like product style) */}
                    {/* <View className="absolute bottom-5 right-5 bg-blue-600 px-3 py-2 rounded-xl">
                        <Text className="text-white font-bold">
                            Rental
                        </Text>
                    </View> */}
                </View>

                <View className="px-6 pt-6">

                    {/* NAME */}
                    <Text className="text-3xl font-bold text-gray-900">
                        {rental.name}
                    </Text>

                    {/* PRICE CARD */}
                    <View className="mt-6 bg-blue-50 rounded-3xl p-5">

                        <View className="flex-row items-center justify-between">

                            {/* PRICE */}
                            <View>
                                <Text className="text-gray-600 text-sm">
                                    Rate
                                </Text>

                                <Text className="text-4xl font-bold text-blue-600 mt-1">
                                    ₹{price}
                                    <Text className="text-lg text-gray-600">
                                        /{unit}
                                    </Text>
                                </Text>
                            </View>

                            {/* AVAILABILITY (RIGHT SIDE like product UI) */}
                            <View className="bg-green-100 px-4 py-2 rounded-full flex-row items-center">
                                <CheckCircle size={18} color="#16A34A" />
                                <Text className="ml-2 text-green-700 font-semibold">
                                    Available
                                </Text>
                            </View>

                        </View>
                    </View>

                    {/* DESCRIPTION */}
                    <View className="mt-6 border border-gray-100 rounded-2xl p-5">
                        <Text className="text-lg font-bold text-gray-900 mb-2">
                            Description
                        </Text>
                        <Text className="text-gray-600 leading-6">
                            {rental.description}
                        </Text>
                    </View>

                </View>
            </ScrollView>

            {/* BOTTOM ACTION */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6"
                style={{
                    paddingBottom: insets.bottom + 12,
                    paddingTop: 12,
                }}
            >
                <Pressable onPress={() => setShowCheckout(true)}>
                    <LinearGradient
                        colors={["#2563EB", "#1D4ED8"]}
                        style={{
                            padding: 16,
                            borderRadius: 14,
                            alignItems: "center",
                        }}
                    >
                        <Text className="text-white font-bold text-lg">
                            Book Now
                        </Text>
                    </LinearGradient>
                </Pressable>

                <View className="mt-3 bg-blue-50 rounded-2xl p-3">
                    <Text className="text-blue-700 text-center font-semibold text-sm">
                        Self pickup only
                    </Text>
                </View>
            </View>

            {/* MODALS */}
            <CheckoutModal
                visible={showCheckout}
                onClose={() => setShowCheckout(false)}
                address={{}}
                setAddress={() => { }}
                onConfirm={handleConfirm}
                isPending={false}
                total={price}
                itemSCount={1}
                isBookable={true}
            />

            <SuccessModal
                visible={showSuccess}
                onClose={() => {
                    setShowSuccess(false);
                    router.push("/orders");
                }}
            />
        </View>
    );
}