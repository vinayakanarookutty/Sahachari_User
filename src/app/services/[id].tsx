import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Heart,
    Package,
    Share2,
} from "lucide-react-native";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Animated,
    Image,
    Pressable,
    ScrollView,
    Share,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CheckoutModal } from "@/components/cart/CheckoutModal";
import { SuccessModal } from "@/components/cart/SuccessModal";

import { useService } from "@/hooks/useService";
import { useProductActions } from "@/hooks/useProductActions";
import { createBooking } from "@/services/booking.api";
import { getImageUrl } from "@/utils/image";


export default function ServiceDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { width } = useWindowDimensions();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const { data: service, isLoading, error, refetch } = useService(id);

    const {
        loading,
        address,
        setAddress,
        showAddressModal,
        setShowAddressModal,
        showSuccessModal,
        setShowSuccessModal,
        handleBuyNow,
    } = useProductActions(service);

    const [activeImageIndex, setActiveImageIndex] =
        useState(0);

    const [isFavorite, setIsFavorite] =
        useState(false);

    const scrollViewRef =
        useRef<ScrollView>(null);

    const heartScaleAnim =
        useRef(new Animated.Value(1)).current;

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator
                    size="large"
                    color="#2563EB"
                />
            </View>
        );
    }

    if (error || !service) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>
                    {t("unable_to_load_service")}
                </Text>

                <Pressable
                    onPress={() => refetch()}
                    className="mt-4 bg-blue-600 px-5 py-3 rounded-xl"
                >
                    <Text className="text-white">
                        {t("retry")}
                    </Text>
                </Pressable>
            </View>
        );
    }

    const extractPrice = (value: any) => {
        if (!value) return 0;

        const match = String(value).match(
            /\d+(\.\d+)?/
        );

        return match
            ? Number(match[0])
            : 0;
    };

    const originalPrice =
        extractPrice(service.price);

    const finalPrice =
        service.finalPrice ??
        originalPrice;

    const hasDiscount =
        finalPrice < originalPrice;

    const discountPercent =
        hasDiscount
            ? Math.round(
                ((originalPrice - finalPrice) /
                    originalPrice) *
                100
            )
            : 0;

    const unit =
        typeof service.price === "string" &&
            service.price.includes("/")
            ? service.price.split("/")[1]
            : "Hour";

    const handleShare = async () => {
        await Share.share({
            message: `${service.name} - ₹${finalPrice}/${unit}`,
        });
    };

    const handleFavorite = () => {
        setIsFavorite(!isFavorite);

        Animated.sequence([
            Animated.timing(heartScaleAnim, {
                toValue: 1.3,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(heartScaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleImageScroll = (
        event: any
    ) => {
        const slideSize =
            event.nativeEvent.layoutMeasurement.width;

        const offset =
            event.nativeEvent.contentOffset.x;

        setActiveImageIndex(
            Math.round(offset / slideSize)
        );
    };

    const scrollToImage = (
        index: number
    ) => {
        scrollViewRef.current?.scrollTo({
            x: index * width,
            animated: true,
        });
    };

    const handleConfirm = async (
        addressData: any
    ) => {
        try {

            await createBooking("SERVICE", {
                serviceId: service._id,
                bookingAddress: {
                    street: addressData.street,
                    city: addressData.city,
                    zipCode: addressData.zipCode,
                    place: addressData.place,
                    phone: addressData.phone,
                    notes: addressData.notes,
                },
            });

            setShowAddressModal(false);
            setShowSuccessModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}

            <View
                className="absolute top-0 left-0 right-0 z-10 flex-row justify-between px-6"
                style={{
                    paddingTop: insets.top + 12,
                }}
            >
                <Pressable
                    onPress={() => router.back()}
                    className="bg-white rounded-full p-3"
                >
                    <ArrowLeft
                        size={22}
                        color="#111827"
                    />
                </Pressable>

                <View className="flex-row gap-3">
                    <Pressable
                        onPress={handleShare}
                        className="bg-white rounded-full p-3"
                    >
                        <Share2
                            size={22}
                            color="#111827"
                        />
                    </Pressable>

                    <Animated.View
                        style={{
                            transform: [
                                {
                                    scale: heartScaleAnim,
                                },
                            ],
                        }}
                    >
                        <Pressable
                            onPress={handleFavorite}
                            className="bg-white rounded-full p-3"
                        >
                            <Heart
                                size={22}
                                color={
                                    isFavorite
                                        ? "#EF4444"
                                        : "#111827"
                                }
                                fill={
                                    isFavorite
                                        ? "#EF4444"
                                        : "transparent"
                                }
                            />
                        </Pressable>
                    </Animated.View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{
                    paddingBottom: 140,
                }}
            >
                {/* Images */}

                <View>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={
                            false
                        }
                        onScroll={handleImageScroll}
                    >
                        {service.images?.map(
                            (
                                image: string,
                                index: number
                            ) => (
                                <Image
                                    key={index}
                                    source={{ uri: getImageUrl(image) }}
                                    style={{
                                        width,
                                        height: 380,
                                    }}
                                    resizeMode="cover"
                                />
                            )
                        )}
                    </ScrollView>

                    {discountPercent > 0 && (
                        <View className="absolute bottom-5 left-5 bg-red-500 px-3 py-2 rounded-xl">
                            <Text className="text-white font-bold">
                                {discountPercent}% OFF
                            </Text>
                        </View>
                    )}

                    <View className="absolute bottom-5 right-5 bg-blue-600 px-3 py-2 rounded-xl">
                        <Text className="text-white font-bold">
                            Service
                        </Text>
                    </View>

                    {service.images?.length > 1 && (
                        <View className="absolute bottom-5 right-5 flex-row gap-2">
                            {service.images.map(
                                (
                                    _: any,
                                    index: number
                                ) => (
                                    <Pressable
                                        key={index}
                                        onPress={() =>
                                            scrollToImage(index)
                                        }
                                        className={`h-2 rounded-full ${activeImageIndex ===
                                            index
                                            ? "w-8 bg-white"
                                            : "w-2 bg-white/50"
                                            }`}
                                    />
                                )
                            )}
                        </View>
                    )}

                    {activeImageIndex > 0 && (
                        <Pressable
                            onPress={() =>
                                scrollToImage(
                                    activeImageIndex - 1
                                )
                            }
                            className="absolute left-4 top-1/2 bg-white rounded-full p-2"
                        >
                            <ChevronLeft
                                size={24}
                                color="#111827"
                            />
                        </Pressable>
                    )}

                    {activeImageIndex <
                        service.images?.length - 1 && (
                            <Pressable
                                onPress={() =>
                                    scrollToImage(
                                        activeImageIndex + 1
                                    )
                                }
                                className="absolute right-4 top-1/2 bg-white rounded-full p-2"
                            >
                                <ChevronRight
                                    size={24}
                                    color="#111827"
                                />
                            </Pressable>
                        )}
                </View>

                {/* Content */}

                <View className="p-6">
                    <Text className="text-3xl font-bold text-gray-900">
                        {service.name}
                    </Text>

                    <View className="mt-5 bg-blue-50 p-5 rounded-3xl">
                        <View className="flex-row items-center justify-between">

                            {/* Price Section */}
                            <View>
                                <Text className="text-gray-500 mb-1">
                                    {t("Rate")}
                                </Text>

                                <View className="flex-row items-end">
                                    <Text className="text-4xl font-bold text-blue-600">
                                        ₹{finalPrice}
                                    </Text>

                                    <Text className="ml-2 text-gray-600">
                                        /{unit}
                                    </Text>
                                </View>

                                {hasDiscount && (
                                    <Text className="line-through text-gray-400 mt-1">
                                        ₹{originalPrice}
                                    </Text>
                                )}
                            </View>

                            {/* Availability Badge (RIGHT SIDE) */}
                            <View className="bg-green-100 px-4 py-2 rounded-full flex-row items-center">
                                <CheckCircle size={18} color="#16A34A" />
                                <Text className="text-green-700 font-bold ml-2">
                                    {t("available")}
                                </Text>
                            </View>

                        </View>
                    </View>

                    {/* Description */}

                    <View className="mt-6 border border-gray-100 rounded-2xl p-5">
                        <Text className="font-bold text-lg mb-3">
                            {t("description")}
                        </Text>

                        <Text className="text-gray-600 leading-7">
                            {service.description}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Book Button */}

            <View
                className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6"
                style={{
                    paddingBottom:
                        insets.bottom + 16,
                    paddingTop: 16,
                }}
            >
                <Pressable
                    onPress={() =>
                        setShowAddressModal(true)
                    }
                    disabled={loading}
                    className="rounded-2xl overflow-hidden"
                >
                    <LinearGradient
                        colors={[
                            "#2563EB",
                            "#1D4ED8",
                        ]}
                        style={{
                            paddingVertical: 16,
                            alignItems: "center",
                        }}
                    >
                        <View className="flex-row items-center">
                            <Package
                                size={20}
                                color="white"
                            />

                            <Text className="text-white font-bold text-lg ml-2">
                                {t("book_now")}
                            </Text>
                        </View>
                    </LinearGradient>
                </Pressable>

                <View className="bg-blue-50 rounded-xl mt-3 p-3">
                    <Text className="text-center text-blue-700 font-semibold">
                        {t("self_pickup_only")}
                    </Text>
                </View>
            </View>

            <CheckoutModal
                visible={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                address={address}
                setAddress={setAddress}
                onConfirm={handleConfirm}
                isPending={loading}
                total={finalPrice}
                itemSCount={1}
                itemType="SERVICE"
            />

            <SuccessModal
                visible={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    router.push("/orders");
                }}
            />
        </View>
    );
}