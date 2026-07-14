import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Product } from "../../types/product";
import { getImageUrl } from "@/utils/image";
import { useAppFonts } from "../../hooks/useAppFonts";

export function ProductCard({
  product,
  onPress,
}: {
  product: Product;
  onPress?: (id: string) => void;
}) {
  const { styleRegular, styleBold } = useAppFonts();
  if (!product) return null;

  // Extract numeric price
  const extractPrice = (value: any) => {
    if (!value) return 0;

    const match = String(value).match(/\d+(\.\d+)?/);

    return match ? Number(match[0]) : 0;
  };

  const originalPrice = extractPrice(product.price);

  const finalPrice =
    product.finalPrice ?? originalPrice;

  const hasDiscount =
    finalPrice < originalPrice;

  const discountPercent = hasDiscount
    ? Math.round(
      ((originalPrice - finalPrice) / originalPrice) * 100
    )
    : 0;

  // Extract unit from strings like "100/Kg"
  const unit =
    typeof product.price === "string" &&
      product.price.includes("/")
      ? product.price.split("/")[1].trim()
      : "";

  const imageUri = product.images?.[0]
    ? getImageUrl(product.images[0])
    : null;

  return (
    <Pressable
      style={{ flex: 1, padding: 6 }}
      onPress={() => {
        if (onPress) onPress(product.id);
      }}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 10,
          borderWidth: 1,
          borderColor: "#F1F5F9",
          shadowColor: "#1E3A8A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        {imageUri ? (
          <View style={{ borderRadius: 14, overflow: "hidden" }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: 110 }}
              resizeMode="cover"
            />
            {hasDiscount && (
              <View style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "#EF4444",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
              }}>
                <Text style={[{ color: "#FFFFFF", fontSize: 10, fontWeight: "800" }, styleBold]}>
                  -{discountPercent}%
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View
            style={{
              width: "100%",
              height: 110,
              borderRadius: 14,
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        )}

        <Text
          numberOfLines={1}
          style={[{
            color: "#0F172A",
            fontSize: 13,
            fontWeight: "700",
            marginTop: 8,
          }, styleBold]}
        >
          {product.name}
        </Text>

        {/* Price */}
        <View style={{ marginTop: 4, flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" }}>
          <Text style={[{ fontSize: 15, fontWeight: "800", color: "#2563EB" }, styleBold]}>
            ₹{finalPrice}
          </Text>

          {unit ? (
            <Text style={[{ fontSize: 10, color: "#94A3B8", marginLeft: 2 }, styleRegular]}>
              /{unit}
            </Text>
          ) : null}

          {hasDiscount && (
            <Text style={[{ fontSize: 11, color: "#94A3B8", textDecorationLine: "line-through", marginLeft: 6 }, styleRegular]}>
              ₹{originalPrice}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}