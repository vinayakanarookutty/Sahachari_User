import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Product } from "../../types/product";
import { getImageUrl } from "@/utils/image";

export function ProductCard({
  product,
  onPress,
}: {
  product: Product;
  onPress?: (id: string) => void;
}) {
  if (!product) return null;

  // Extract numeric price
  const extractPrice = (value: any) => {
    if (!value) return 0;

    const match = String(value).match(/\d+(\.\d+)?/);

    return match ? Number(match[0]) : 0;
  };

  // const originalPrice = extractPrice(product.price);
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

  // const finalPrice = product.finalPrice ?? originalPrice;

  // const hasDiscount = finalPrice < originalPrice;

  // const activeOffer = product.offers?.find((offer: any) => {
  //   const now = new Date();

  //   return (
  //     offer.isActive &&
  //     new Date(offer.startDate) <= now &&
  //     new Date(offer.endDate) >= now
  //   );
  // });

  // let finalPrice = originalPrice;

  // if (activeOffer?.type === "PERCENTAGE") {
  //   finalPrice =
  //     originalPrice -
  //     (originalPrice * activeOffer.value) / 100;
  // }

  // const hasDiscount = finalPrice < originalPrice;

  // Extract unit from strings like "100/Kg"
  const unit =
    typeof product.price === "string" &&
      product.price.includes("/")
      ? product.price.split("/")[1].trim()
      : "";


  // const imageUri = product.images?.[0]
  //   ? `${S3_BASE_URL}/${product.images[0]}`
  //   : null;

  // const [imgSrc, setImgSrc] = useState<any>(null);

  // useEffect(() => {
  //   if (!imageUri) return;

  //   setImgSrc(null);

  //   const t = setTimeout(() => {
  //     setImgSrc({ uri: imageUri });
  //   }, 30);

  //   return () => clearTimeout(t);
  // }, [imageUri]);

  const imageUri = product.images?.[0]
    ? getImageUrl(product.images[0])
    : null;

  // console.log("ProductCard image", product.images?.[0]);
  // console.log(
  //   "ProductCard final image",
  //   getImageUrl(product.images?.[0])
  // );

  return (
    <Pressable
      className="flex-1 p-2"
      onPress={() => {
        if (onPress) onPress(product.id);
      }}
    >
      <View className="bg-white rounded-lg p-3 shadow">
        {/* {imgSrc ? ( */}
        {imageUri ? (
          <Image
            // source={imgSrc}
            source={{ uri: imageUri }}
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

        <Text className="font-semibold mt-2">
          {product.name}
        </Text>

        {/* Price */}
        <View className="mt-1">
          <View className="flex-row items-end">
            <Text className="font-bold text-lg">
              ₹{finalPrice}
            </Text>

            {unit ? (
              <Text className="text-gray-500 text-sm ml-1 mb-0.5">
                /{unit}
              </Text>
            ) : null}
          </View>

          {hasDiscount && (
            <Text className="text-gray-500 line-through">
              ₹{originalPrice}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}