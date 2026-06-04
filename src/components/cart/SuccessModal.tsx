import { CheckCircle } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, Text, View } from "react-native";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SuccessModal({ visible, onClose }: SuccessModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        {/* Card */}
        <View className="bg-white rounded-3xl p-8 items-center w-full max-w-sm shadow-2xl">
          {/* Icon */}
          <View className="bg-green-100 p-5 rounded-full mb-6">
            <CheckCircle size={56} color="#22C55E" strokeWidth={2.5} />
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 text-center">
            {t("Order_Placed")}
          </Text>

          {/* Subtitle */}
          <Text className="text-gray-500 text-center mt-2 mb-8 leading-5">
            {t("Your_order_has_been_successfully_placed")} {"\n"}
            {t("Well_start_processing_it_shortly")}
          </Text>

          {/* Button */}
          <Pressable onPress={onClose}
            className="w-full bg-blue-600 py-4 rounded-2xl items-center active:opacity-90"
          >
            <Text className="text-white font-bold text-lg">
              {t("Continue_Shopping")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}