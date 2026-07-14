import { Wrench } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "@/utils/image";
import { useAppFonts } from "../../hooks/useAppFonts";

export function ServiceCard({ item, onPress }: any) {
  const { t } = useTranslation();
  const { styleRegular, styleBold } = useAppFonts();

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
      style={({ pressed }) => ({
        marginBottom: 14,
        marginHorizontal: 16,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        shadowColor: "#1E3A8A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
        transform: [{ scale: pressed ? 0.98 : 1 }]
      })}
    >
      <View className="flex-row">
        {/* IMAGE */}
        <View style={{ width: 110, height: 110, position: "relative" }}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-slate-50 items-center justify-center">
              <Wrench size={24} color="#94A3B8" />
            </View>
          )}

          {/* Service Badge */}
          <View className="absolute top-2 left-2 bg-blue-600 px-2 py-0.5 rounded-full">
            <Text style={[{ color: "#FFFFFF", fontSize: 9, fontWeight: "800" }, styleBold]}>
              {t("Service")}
            </Text>
          </View>

          {/* Discount Badge */}
          {hasDiscount && (
            <View className="absolute bottom-2 left-2 bg-red-500 px-2 py-0.5 rounded-full">
              <Text style={[{ color: "#FFFFFF", fontSize: 9, fontWeight: "800" }, styleBold]}>
                -{discountPercent}%
              </Text>
            </View>
          )}
        </View>

        {/* DETAILS */}
        <View className="flex-1 p-3.5 justify-between">
          <View>
            <Text
              style={[{
                fontSize: 15,
                fontWeight: "800",
                color: "#0F172A",
              }, styleBold]}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text
              style={[{
                fontSize: 12,
                color: "#64748B",
                marginTop: 2,
              }, styleRegular]}
              numberOfLines={1}
            >
              {item.description || t("professional_service")}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-baseline">
              <Text style={[{ fontSize: 18, fontWeight: "800", color: "#2563EB" }, styleBold]}>
                ₹{finalPrice}
              </Text>

              <Text style={[{ fontSize: 10, color: "#94A3B8", marginLeft: 2 }, styleRegular]}>
                /{unit}
              </Text>

              {hasDiscount && (
                <Text style={[{ fontSize: 11, color: "#94A3B8", textDecorationLine: "line-through", marginLeft: 6 }, styleRegular]}>
                  ₹{originalPrice}
                </Text>
              )}
            </View>

            <View className="px-2.5 py-0.5 rounded-full bg-blue-50">
              <Text style={[{ fontSize: 10, fontWeight: "700", color: "#2563EB" }, styleBold]}>
                {t("Available")}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}