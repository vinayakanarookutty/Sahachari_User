import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { CheckCircle } from "lucide-react-native";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SuccessModal({ visible, onClose }: SuccessModalProps) {
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
            Order Placed!
          </Text>

          {/* Subtitle */}
          <Text className="text-gray-500 text-center mt-2 mb-8 leading-5">
            Your order has been successfully placed.{"\n"}
            We’ll start processing it shortly.
          </Text>

          {/* Button */}
          <Pressable onPress={onClose}
            className="w-full bg-blue-600 py-4 rounded-2xl items-center active:opacity-90"
          >
            <Text className="text-white font-bold text-lg">
              Continue Shopping
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}