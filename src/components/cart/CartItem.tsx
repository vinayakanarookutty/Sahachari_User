import React from "react";
import { View, Text, Image, Pressable, ActivityIndicator, } from "react-native";
import { Minus, Plus, Trash2 } from "lucide-react-native";

export function CartItem({ item, isUpdating, onQuantityChange, onRemove, parseNumber,
}: any) {
  const s3Base = (process.env.EXPO_PUBLIC_S3_BASE_URL || "").replace(/\/$/, "");
  const rawImg = item.productId?.images?.[0];

  const imgUrl = rawImg
    ? /^https?:\/\//.test(rawImg)
      ? rawImg
      : `${s3Base}/${String(rawImg).replace(/^\/+/, "")}`
    : undefined;

  const itemQuantity = parseNumber(item.quantity ?? item.qty ?? 0);
  const itemPrice = parseNumber(item.productId?.price ?? item.price ?? 0);
  const availableQuantity = parseNumber(item.productId?.quantity ?? 0);
  const disableMinus = isUpdating || itemQuantity <= 1;
  const disablePlus = isUpdating || itemQuantity >= availableQuantity;

  return (
    <View className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden">
      {/* MAIN CONTENT */}
      <View className="flex-row p-4 items-start">
        {/* IMAGE */}
        <View className="bg-gray-100 rounded-xl overflow-hidden">
          <Image source={{ uri: imgUrl }} style={{ width: 100, height: 100, }} resizeMode="cover" />
        </View>
        {/* DETAILS */}
        <View className="flex-1 ml-3">
          {/* NAME + PRICE */}
          <View>
            <Text className="font-semibold text-gray-800 text-base" numberOfLines={2}>
              {item.productId?.name}
            </Text>
            <Text className="text-blue-600 font-bold text-lg mt-1">
              ₹{itemPrice.toFixed(2)}
            </Text>
          </View>
          {/* CONTROLS */}
          <View className="flex-row items-center mt-3">
            {/* QUANTITY CONTROLS */}
            <View className="flex-row items-center bg-gray-100 rounded-lg overflow-hidden">
              {/* MINUS */}
              <Pressable onPress={() =>
                  onQuantityChange(
                    item._id,
                    itemQuantity,
                    -1,
                    availableQuantity
                  )
                }
                disabled={disableMinus}
                className="p-2 active:bg-gray-200"
              >
                <Minus size={18} color={ disableMinus ? "#9CA3AF" : "#1877F2" } strokeWidth={2.5} />
              </Pressable>
              {/* QUANTITY */}
              <View className="px-4 py-2 bg-white min-w-[50px] items-center justify-center">
                {isUpdating ? ( <ActivityIndicator size="small" color="#1877F2"/> ) : (
                  <Text className="font-semibold text-gray-800">
                    {itemQuantity}
                  </Text>
                )}
              </View>
              {/* PLUS */}
              <Pressable onPress={() =>
                  onQuantityChange(
                    item._id,
                    itemQuantity,
                    1,
                    availableQuantity
                  )
                }
                disabled={disablePlus}
                className="p-2 active:bg-gray-200"
              >
                <Plus size={18} color={ disablePlus ? "#9CA3AF" : "#1877F2" } strokeWidth={2.5} />
              </Pressable>
            </View>
            {/* REMOVE */}
            <Pressable onPress={() => onRemove(item._id)} disabled={isUpdating} className="ml-auto p-2 bg-red-50 rounded-lg active:bg-red-100" >
              <Trash2 size={20} color="#EF4444" strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      </View>
      {/* FOOTER */}
      <View className="bg-blue-50 px-4 py-2 flex-row justify-between items-center">
        <Text className="text-gray-600 text-sm">
          Item Total
        </Text>
        <Text className="font-bold text-blue-600">
          ₹{(itemPrice * itemQuantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );
}