import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export function CheckoutModal({
  visible,
  onClose,
  address,
  setAddress,
  onConfirm,
  isPending,
  total,
  itemSCount,
}: any) {
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role?: string;
    address?: string;
    address2?: string;
    mobileNumber?: string;
    serviceablePincodes?: string[];
    image?: string;
  }

  const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  const updateField = (field: string, value: string) =>
    setAddress({ ...address, [field]: value });

  const { data: profile, isLoading } = useQuery<UserProfile, Error>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const authToken = await useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    },
  });

  useEffect(() => {
    if (profile && visible) {
      setAddress((prev: any) => ({
        ...prev,
        street: prev.street || profile.address || '',
        phone: prev.phone || profile.mobileNumber || '',
        paymentMethod: prev.paymentMethod || '',
      }));
    }
  }, [profile, visible]);

  useEffect(() => {
    if (!visible) {
      setShowPaymentDropdown(false);
    }
  }, [visible]);

  const paymentOptions = [
    { label: 'UPI', value: 'UPI' },
    { label: 'Cash on Delivery', value: 'CASH_ON_DELIVERY' },
    { label: 'Self Pickup', value: 'SELF_PICKUP' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%]">

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">
              Delivery Details
            </Text>
            <Pressable onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <X size={24} color="#374151" />
            </Pressable>
          </View>

          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-gray-500 mt-2">
                Loading your details...
              </Text>
            </View>
          ) : (
            <>
              {/* Overlay for closing dropdown */}
              {showPaymentDropdown && (
                <Pressable
                  className="absolute inset-0 z-10"
                  onPress={() => setShowPaymentDropdown(false)}
                />
              )}

              <ScrollView className="px-6 py-4">

                {/* Address Fields */}
                {[
                  { label: 'Street Address *', key: 'street', placeholder: '123 Main Street' },
                  { label: 'City *', key: 'city', placeholder: 'Mumbai' },
                  { label: 'Zip Code *', key: 'zipCode', placeholder: '400001', keyboard: 'numeric' },
                  { label: 'Phone Number *', key: 'phone', placeholder: '+919876543210', keyboard: 'phone-pad' },
                ].map((f) => (
                  <View key={f.key} className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">
                      {f.label}
                    </Text>
                    <TextInput
                      value={address[f.key]}
                      onChangeText={(v) => updateField(f.key, v)}
                      placeholder={f.placeholder}
                      keyboardType={f.keyboard as any}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                    />
                  </View>
                ))}

                {/* Notes */}
                <View className="mb-4">
                  <Text className="text-gray-700 font-semibold mb-2">
                    Delivery Notes (Optional)
                  </Text>
                  <TextInput
                    value={address.notes}
                    onChangeText={(v) => updateField('notes', v)}
                    multiline
                    numberOfLines={3}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                    textAlignVertical="top"
                  />
                </View>

                {/* Payment Dropdown */}
                <View className="mb-4 relative z-20">
                  <Text className="text-gray-700 font-semibold mb-2">
                    Payment Method *
                  </Text>

                  <Pressable
                    onPress={() => setShowPaymentDropdown(!showPaymentDropdown)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                  >
                    <Text className="text-gray-800">
                      {address.paymentMethod
                        ? paymentOptions.find(p => p.value === address.paymentMethod)?.label
                        : 'Select payment method'}
                    </Text>
                    <Text className="text-gray-500">▼</Text>
                  </Pressable>

                  {showPaymentDropdown && (
                    <View className="bg-white border border-gray-200 rounded-xl mt-2 overflow-hidden">
                      {paymentOptions.map((item) => (
                        <Pressable
                          key={item.value}
                          onPress={() => {
                            updateField('paymentMethod', item.value);
                            setShowPaymentDropdown(false);
                          }}
                          className="px-4 py-3 border-b border-gray-100"
                        >
                          <Text
                            className={`${
                              address.paymentMethod === item.value
                                ? 'text-blue-600 font-bold'
                                : 'text-gray-800'
                            }`}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Summary */}
                <View className="bg-blue-50 rounded-xl p-4 mb-6">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600">
                      {itemSCount} {itemSCount === 1 ? 'item' : 'items'}
                    </Text>
                    <Text className="text-2xl font-bold text-blue-600">
                      ₹{total.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Place Order */}
                <Pressable
                  onPress={() => {
                    if (!address.paymentMethod) {
                      alert('Please select a payment method');
                      return;
                    }

                    onConfirm({
                      ...address,
                      paymentMethod: address.paymentMethod,
                    });
                  }}
                  disabled={isPending}
                  className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center active:bg-blue-700 mb-6"
                >
                  {isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text className="text-white font-bold text-lg mr-2">
                        Place Order
                      </Text>
                      <ArrowRight size={24} color="white" />
                    </>
                  )}
                </Pressable>

              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}