import { Wrench } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "@/utils/image";

export function ServiceCard({ item, onPress }: any) {
  const { t } = useTranslation();

  const extractPrice = (value: any) => {
    if (!value) return 0;

    const match = String(value).match(/\d+(\.\d+)?/);

    return match ? Number(match[0]) : 0;
  };

  const originalPrice = extractPrice(item.price);
  const finalPrice = item.finalPrice ?? originalPrice;

  const hasDiscount = finalPrice < originalPrice;

  const discountPercent = hasDiscount
    ? Math.round(
      ((originalPrice - finalPrice) / originalPrice) * 100
    )
    : 0;

  const imageUrl = getImageUrl(item.images?.[0]);

  const unit =
    typeof item.price === "string" &&
      item.price.includes("/")
      ? item.price.split("/")[1].trim()
      : "hr";

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      className="mb-4 mx-4 rounded-3xl overflow-hidden bg-white max-h-40 active:scale-[0.98]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <View className="flex-row">
        {/* IMAGE */}
        <View className="w-32 h-32 relative">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gray-100 items-center justify-center">
              <Wrench size={32} color="#9CA3AF" />
            </View>
          )}

          {/* Service Badge */}
          <View className="absolute top-2 left-2 bg-blue-600 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">
              {t("Service")}
            </Text>
          </View>

          {/* Discount Badge */}
          {hasDiscount && (
            <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">
                -{discountPercent}%
              </Text>
            </View>
          )}
        </View>

        {/* DETAILS */}
        <View className="flex-1 p-4 justify-between">
          <View>
            <Text
              className="text-lg font-bold text-gray-900"
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text
              className="text-sm text-gray-500"
              numberOfLines={1}
            >
              {item.description || t("professional_service")}
            </Text>
          </View>

          <View className="mt-3">
            <View className="flex-row items-end h-7">
              <Text className="text-2xl font-bold text-blue-600">
                ₹{finalPrice}
              </Text>

              <Text className="text-xs text-gray-600 ml-1 mb-1">
                /{unit}
              </Text>

              <View className="ml-2 min-w-[60px]">
                {hasDiscount ? (
                  <Text className="text-sm text-gray-400 line-through">
                    ₹{originalPrice}
                  </Text>
                ) : (
                  <Text className="opacity-0 text-sm">
                    {/* ₹0000 */}
                  </Text>
                )}
              </View>
            </View>


            <View className="mt-2">
              <View className="self-start px-3 py-1 rounded-full bg-blue-50">
                <Text className="text-xs font-semibold text-blue-700">
                  {t("Available")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}