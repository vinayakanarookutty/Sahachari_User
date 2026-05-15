import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Product } from "../../types/product";

export function ProductCard({
  product,
  onPress,
}: {
  product: Product;
  onPress?: (id: string) => void;
}) {
  const originalPrice = Number(product.price) || 0;
  const finalPrice = product.finalPrice ?? originalPrice;
  const hasDiscount = finalPrice < originalPrice;

  const S3_BASE_URL = process.env.EXPO_PUBLIC_S3_BASE_URL;

  const imageUri = product.images?.[0]
    ? `${S3_BASE_URL}/${product.images[0]}`
    : null;
  const [imgSrc, setImgSrc] = useState<any>(null);

  useEffect(() => {
    if (!imageUri) return;
    setImgSrc(null);
    const t = setTimeout(() => {
      setImgSrc({ uri: imageUri });
    }, 30);
    return () => clearTimeout(t);
  }, [imageUri]);

  return (
    <Pressable
      className="flex-1 p-2"
      onPress={() => {
        if (onPress) onPress(product.id);
      }}
    >
      <View className="bg-white rounded-lg p-3 shadow">
        {imgSrc ? (
          <Image
            source={imgSrc}
            style={{ width: "100%", height: 128, borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 128,
              borderRadius: 8,
              backgroundColor: "#eee",
            }}
          />
        )}

        <Text className="font-semibold mt-2">{product.name}</Text>

        <View className="flex-row items-center mt-1">
          <Text className="font-bold">₹{finalPrice}</Text>
          {hasDiscount && (
            <Text className="ml-2 text-gray-500 line-through">
              ₹{originalPrice}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
