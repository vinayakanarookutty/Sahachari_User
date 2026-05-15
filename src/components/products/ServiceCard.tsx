import { Wrench } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

export function ServiceCard({ item, onPress }: any) {
  const imgUrl = item.images?.[0] || null;
  const [imgSrc, setImgSrc] = useState<any>(null);

  useEffect(() => {
    if (!imgUrl) {
      setImgSrc(null);
      return;
    }

    setImgSrc(null);

    const t = setTimeout(() => {
      setImgSrc({ uri: imgUrl });
    }, 30);

    return () => clearTimeout(t);
  }, [imgUrl]);

  // Extract numeric price from strings like "100/Hour"
  const extractPrice = (value: any) => {
    if (!value) return 0;

    const match = String(value).match(/\d+(\.\d+)?/);

    return match ? Number(match[0]) : 0;
  };

  const originalPrice = extractPrice(item.price);

  let finalPrice = originalPrice;

  // Apply active percentage offer
  if (item.offers?.length > 0) {
    const activeOffer = item.offers.find(
      (offer: any) => offer.isActive
    );

    if (activeOffer?.type === "PERCENTAGE") {
      finalPrice =
        originalPrice -
        (originalPrice * activeOffer.value) / 100;
    }
  }

  const hasDiscount = finalPrice < originalPrice;

  // Extract unit from "100/Hour"
  const unit =
    typeof item.price === "string" && item.price.includes("/")
      ? item.price.split("/")[1]
      : "";

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm active:opacity-70"
    >
      <View className="relative">
        {imgSrc ? (
          <Image
            source={imgSrc}
            style={{ width: "100%", height: 160 }}
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-blue-50 items-center justify-center">
            <Wrench size={48} color="#1877F2" strokeWidth={1.5} />
          </View>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-lg">
            <Text className="text-white text-xs font-bold">
              {Math.round(
                ((originalPrice - finalPrice) / originalPrice) * 100
              )}
              % OFF
            </Text>
          </View>
        )}
      </View>

      <View className="p-3">
        {/* Service Name */}
        <Text
          className="text-gray-800 font-semibold text-base"
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Description */}
        <Text
          className="text-gray-500 text-xs mt-1"
          numberOfLines={2}
        >
          {item.description || "Professional Service"}
        </Text>

        {/* Price */}
        <View className="mt-2">
          <View className="flex-row items-end">
            <Text className="text-blue-600 font-bold text-lg">
              ₹{finalPrice.toFixed(0)}
            </Text>

            {unit ? (
              <Text className="text-gray-500 text-sm ml-1 mb-0.5">
                /{unit}
              </Text>
            ) : null}
          </View>

          {hasDiscount && (
            <Text className="text-gray-400 text-sm line-through">
              ₹{originalPrice.toFixed(0)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}