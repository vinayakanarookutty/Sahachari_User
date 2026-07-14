import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
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
  isBookable = false,
}: any) {
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [places, setPlaces] = useState<string[]>([]);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [placeDetails, setPlaceDetails] = useState<any[]>([]);
  const { t } = useTranslation();

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
      // Split the full address into street and city parts
      const fullAddress = profile.address || '';
      let streetPart = fullAddress;
      let cityPart = (prev: any) => prev.city || '';

      if (fullAddress.includes(',')) {
        const parts = fullAddress.split(',').map((p: string) => p.trim());
        if (parts.length >= 3) {
          // e.g. "123 Main Street, Fort Kochi, Kerala" -> street: "123 Main Street", city: "Fort Kochi, Kerala"
          streetPart = parts.slice(0, Math.ceil(parts.length / 2)).join(', ');
          cityPart = (_prev: any) => parts.slice(Math.ceil(parts.length / 2)).join(', ');
        } else if (parts.length === 2) {
          // e.g. "123 Main Street, Fort Kochi" -> street: "123 Main Street", city: "Fort Kochi"
          streetPart = parts[0];
          cityPart = (_prev: any) => parts[1];
        }
      }

      setAddress((prev: any) => ({
        ...prev,

        // Auto fill user details with smart splitting
        street: streetPart,
        city: cityPart(prev) || profile.address2 || prev.city || '',
        zipCode:
          profile.serviceablePincodes?.[0] || prev.zipCode || '',
        phone: profile.mobileNumber || '',

        // Services/Rentals => Self Pickup only
        paymentMethod: isBookable
          ? 'SELF_PICKUP'
          : prev.paymentMethod || '',
      }));
    }
  }, [profile, visible, isBookable]);

  useEffect(() => {
    if (!visible) {
      setShowPaymentDropdown(false);
    }
  }, [visible]);

  const paymentOptions = isBookable
    ? [
      {
        label: 'Self Pickup',
        value: 'SELF_PICKUP',
      },
    ]
    : [
      {
        label: 'Cash on Delivery',
        value: 'CASH_ON_DELIVERY',
      },
      {
        label: 'Self Pickup',
        value: 'SELF_PICKUP',
      },
    ];

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!address.zipCode) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/customer/delivery-charges/${address.zipCode}`,
          {
            headers: {
              Authorization: `Bearer ${await useAuthStore.getState().token}`,
            },
          }
        );

        const data = await response.json();

        // assuming backend returns:
        // { places: [{ place: "Fort Kochi" }, ...] }

        const availablePlaces =
          data?.places?.map((p: any) => p.place) || [];

        setPlaces(availablePlaces);

        setPlaceDetails(data?.places || []);
        // set delivery charge from backend
        // set first place charge
        if (data?.places?.length > 0) {
          setDeliveryCharge(data.places[0].charge || 0);
        }

        // auto select first place
        if (availablePlaces.length > 0) {
          setAddress((prev: any) => ({
            ...prev,
            place: availablePlaces[0],
          }));
        }
      } catch (err) {
        console.error("Failed to fetch places", err);
      }
    };

    fetchPlaces();
  }, [address.zipCode]);

  const effectiveDeliveryCharge =
    address.paymentMethod === 'SELF_PICKUP'
      ? 0
      : deliveryCharge;

  const itemsSubtotal = total;

  const finalTotal =
    itemsSubtotal + effectiveDeliveryCharge;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        {/* <View className="bg-white rounded-t-3xl max-h-[85%]"> */}
        <View className="bg-white rounded-t-3xl flex-1 mt-16">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">
              {t("Delivery_Details")}
            </Text>
            <Pressable onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <X size={24} color="#374151" />
            </Pressable>
          </View>

          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-gray-500 mt-2">
                {t("Loading_your_details")}
              </Text>
            </View>
          ) : (
            <>
              {/* Overlay for closing dropdown */}
              {/* {showPaymentDropdown && (
                <Pressable
                  className="absolute inset-0 z-10"
                  onPress={() => setShowPaymentDropdown(false)}
                />
              )} */}

              <ScrollView
                className="px-6 py-4"
                // contentContainerStyle={{ paddingBottom: 10 }}
                showsVerticalScrollIndicator={false}
              >

                {/* Address Fields */}
                {[
                  { label: `${t("street_address")}`, key: 'street', placeholder: '123 Main Street' },
                  { label: `${t("city")}`, key: 'city', placeholder: 'Mumbai' },
                  {
                    label: `${t("zip_code")}`,
                    key: 'zipCode',
                    placeholder: '400001',
                    keyboard: 'numeric',
                    readOnly: true,
                  },

                  {
                    label: `${t("phone_number")}`,
                    key: 'phone',
                    placeholder: '+919876543210',
                    keyboard: 'phone-pad',
                  },
                ].map((f) => (
                  <View key={f.key} className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">
                      {f.label}
                    </Text>
                    <TextInput
                      value={address[f.key]}
                      editable={!f.readOnly}
                      onChangeText={(v) => updateField(f.key, v)}
                      placeholder={f.placeholder}
                      keyboardType={f.keyboard as any}
                      // className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                      className={`border rounded-xl px-4 py-3 text-gray-800 ${f.readOnly
                        ? 'bg-gray-100 border-gray-300'
                        : 'bg-gray-50 border-gray-200'
                        }`}
                    />
                  </View>
                ))}
                {/* Place Dropdown */}
                <View className="mb-4 relative z-20">
                  <Text className="text-gray-700 font-semibold mb-2">
                    {t("select_place")}
                  </Text>

                  <Pressable
                    onPress={() =>
                      setShowPlaceDropdown(!showPlaceDropdown)
                    }
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                  >
                    <Text className="text-gray-800">
                      {address.place || t("select_place_placeholder")}
                    </Text>

                    <Text className="text-gray-500">▼</Text>
                  </Pressable>

                  {showPlaceDropdown && (
                    <View className="bg-white border border-gray-200 rounded-xl mt-2 overflow-hidden">
                      {places.map((place) => (
                        <Pressable
                          key={place}
                          onPress={() => {
                            updateField("place", place);

                            const selectedPlace = placeDetails.find(
                              (p: any) => p.place === place
                            );

                            setDeliveryCharge(
                              selectedPlace?.charge || 0
                            );

                            setShowPlaceDropdown(false);
                          }}
                          className="px-4 py-3 border-b border-gray-100"
                        >
                          <Text
                            className={`${address.place === place
                              ? "text-blue-600 font-bold"
                              : "text-gray-800"
                              }`}
                          >
                            {place}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Notes */}
                <View className="mb-4">
                  <Text className="text-gray-700 font-semibold mb-2">
                    {t("delivery_notes")}
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
                {!isBookable ? (
                  <View className="mb-4 relative z-20">
                    <Text className="text-gray-700 font-semibold mb-2">
                      {t("payment_method")}
                    </Text>

                    <Pressable
                      onPress={() => setShowPaymentDropdown(!showPaymentDropdown)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                    >
                      <Text className="text-gray-800">
                        {address.paymentMethod
                          ? paymentOptions.find(p => p.value === address.paymentMethod)?.label
                          : t("select_payment_method")}
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
                              className={`${address.paymentMethod === item.value
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
                ) : (
                  <View className="mb-4">
                    <Text className="text-gray-700 font-semibold mb-2">
                      {t("pickup_method")}
                    </Text>

                    <View className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-4">
                      <Text className="text-blue-700 font-bold">
                        {t("self_pickup")}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Summary */}
                {/* <View className="bg-blue-50 rounded-xl p-4 mb-6">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600">
                      {itemSCount} {itemSCount === 1 ? 'item' : 'items'}
                    </Text>
                    <Text className="text-2xl font-bold text-blue-600">
                      ₹{total.toFixed(2)}
                    </Text>
                  </View>
                </View> */}
                {/* Summary */}
                <View className="bg-blue-50 rounded-xl p-4 mb-6">

                  {/* Items subtotal */}
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-600">
                      {t("Items")} ({itemSCount})
                    </Text>

                    <Text className="text-gray-800 font-semibold">
                      ₹{itemsSubtotal.toFixed(2)}
                    </Text>
                  </View>

                  {/* Delivery charge */}
                  {!isBookable && (
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-gray-600">
                        {t("Delivery_Charge")}
                      </Text>

                      <Text className="text-gray-800 font-semibold">
                        ₹{effectiveDeliveryCharge.toFixed(2)}
                      </Text>
                    </View>
                  )}

                  {/* Final total */}
                  <View className="border-t border-blue-200 pt-3 mt-2 flex-row justify-between items-center">
                    <Text className="text-lg font-bold text-gray-800">
                      {t("Total_Amount")}
                    </Text>

                    <Text className="text-2xl font-bold text-blue-600">
                      ₹{finalTotal.toFixed(2)}
                    </Text>
                  </View>

                </View>

                {/* Place Order */}
                <Pressable
                  onPress={() => {
                    if (!address.city) {
                      alert(t("please_select_place"));
                      return;
                    }
                    if (!address.paymentMethod) {
                      alert(t("please_select_payment_method"));
                      return;
                    }

                    onConfirm({
                      ...address,
                      paymentMethod: address.paymentMethod,
                    });
                  }}
                  disabled={isPending}
                  // className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center active:bg-blue-700 mb-6"
                  className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center active:bg-blue-700 mb-10"
                >
                  {isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text className="text-white font-bold text-lg mr-2">
                        {t("Place_Order")}
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
    </Modal >
  );
}