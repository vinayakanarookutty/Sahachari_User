import React, { useState, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Headphones,
  MapPin,
  Sparkles,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useHelpSupport } from "../../hooks/useHelpSupport";
import { useAuthStore } from "../../store/auth.store";
import { API_BASE_URL } from "../../config/env";

export default function FAQScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { user } = useAuthStore();

  // Query live profile to guarantee the most current user address and pincode
  const { data: profile } = useQuery({
    queryKey: ["userProfileFaqScreen"],
    queryFn: async () => {
      try {
        const authToken =
          useAuthStore.getState().token || (await AsyncStorage.getItem("token"));
        if (!authToken) return null;

        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) return null;
        return res.json();
      } catch (e) {
        return null;
      }
    },
  });

  // Resolve user pincode strictly
  const userPincode = useMemo(() => {
    const src = profile || user;
    if (!src) return "";
    if ((src as any).pincode && String((src as any).pincode).trim()) {
      return String((src as any).pincode).trim();
    }
    if (Array.isArray((src as any).serviceablePincodes) && (src as any).serviceablePincodes.length > 0) {
      const validPin = (src as any).serviceablePincodes.find((p: string) => p && p.trim().length > 0);
      if (validPin) return validPin.trim();
    }
    if (src.address) {
      const match = String(src.address).match(/\b\d{6}\b/);
      if (match) return match[0];
    }
    if ((src as any).address2) {
      const match = String((src as any).address2).match(/\b\d{6}\b/);
      if (match) return match[0];
    }
    return "";
  }, [profile, user]);

  // Fetch help and support contacts strictly filtered by user's pincode
  const { data: contacts = [], isLoading: isContactsLoading } = useHelpSupport(userPincode);

  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${cleanNumber}`).catch((err) =>
      console.warn("Failed to initiate call:", err)
    );
  };

  const FAQS = [
    {
      question: t("faq.place_order.question"),
      answer: t("faq.place_order.answer"),
    },
    {
      question: t("faq.track_order.question"),
      answer: t("faq.track_order.answer"),
    },
    {
      question: t("faq.cancel_order.question"),
      answer: t("faq.cancel_order.answer"),
    },
    {
      question: t("faq.contact_support.question"),
      answer: t("faq.contact_support.answer"),
    },
    {
      question: t("faq.service_booking.question"),
      answer: t("faq.service_booking.answer"),
    },
    {
      question: t("faq.rental_booking.question"),
      answer: t("faq.rental_booking.answer"),
    },
    {
      question: t("faq.payment_methods.question"),
      answer: t("faq.payment_methods.answer"),
    },
    {
      question: t("faq.update_profile.question"),
      answer: t("faq.update_profile.answer"),
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/settings/settings");
              }
            }}
            className="bg-white/20 rounded-full p-2.5 active:opacity-70"
          >
            <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>

          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-white text-center">
              {t("help_support")}
            </Text>
            <Text className="text-blue-100 mt-1 text-center text-xs">
              Direct Helplines & Assistance
            </Text>
          </View>

          <View className="w-[44px]" />
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Dynamic Help & Support Helpline Cards for User's Pincode */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <View className="flex-row items-center gap-1.5">
              <Headphones size={18} color="#2563EB" strokeWidth={2.5} />
              <Text className="text-base font-bold text-gray-900">
                Helpline & Enquiry Desk
              </Text>
            </View>
            {userPincode ? (
              <View className="flex-row items-center bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                <MapPin size={11} color="#2563EB" />
                <Text className="text-[11px] font-bold text-blue-700 ml-1">
                  Pincode {userPincode}
                </Text>
              </View>
            ) : null}
          </View>

          {isContactsLoading ? (
            <View className="p-6 bg-white rounded-2xl border border-gray-100 items-center justify-center">
              <ActivityIndicator size="small" color="#2563EB" />
              <Text className="text-xs text-gray-500 mt-2">Checking helplines for your area...</Text>
            </View>
          ) : contacts.length > 0 ? (
            <View className="gap-3">
              {contacts.map((item) => (
                <View
                  key={item._id}
                  className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center gap-1.5">
                        <Sparkles size={13} color="#2563EB" />
                        <Text className="text-base font-bold text-gray-900">
                          {item.title}
                        </Text>
                      </View>
                      {item.description ? (
                        <Text className="text-xs text-gray-500 mt-1 leading-4">
                          {item.description}
                        </Text>
                      ) : null}
                      <Text className="text-sm font-extrabold text-blue-600 mt-1.5 tracking-wide">
                        {item.phoneNumber}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleCall(item.phoneNumber)}
                      activeOpacity={0.85}
                      className="bg-emerald-600 px-4 py-2.5 rounded-xl flex-row items-center shadow-sm"
                    >
                      <PhoneCall size={16} color="#FFFFFF" strokeWidth={2.2} />
                      <Text className="text-white text-xs font-bold ml-1.5">
                        Call Now
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-4 border border-zinc-200">
              <Text className="font-semibold text-gray-800 text-sm">
                No dedicated helpline found for {userPincode ? `pincode ${userPincode}` : 'your location'}.
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                You can raise a complaint or request in the Complaints section.
              </Text>
            </View>
          )}
        </View>

        {/* Section Heading for FAQs */}
        <Text className="text-base font-bold text-gray-900 mb-3 px-1">
          {t("frequently_asked_questions")}
        </Text>

        {/* FAQ List */}
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <View
              key={index}
              className="bg-white rounded-2xl mb-3 overflow-hidden border border-gray-100 shadow-sm"
            >
              <Pressable
                onPress={() => toggleFAQ(index)}
                className="flex-row items-center px-4 py-4"
              >
                <Text className="flex-1 text-sm font-semibold text-gray-900 pr-3">
                  {faq.question}
                </Text>

                {isOpen ? (
                  <ChevronUp size={18} color="#6B7280" strokeWidth={2} />
                ) : (
                  <ChevronDown size={18} color="#6B7280" strokeWidth={2} />
                )}
              </Pressable>

              {isOpen && (
                <View className="px-4 pb-4 border-t border-gray-100">
                  <Text className="text-gray-600 text-xs leading-5 mt-2.5">
                    {faq.answer}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View className="mt-4 bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <Text className="text-blue-900 font-semibold mb-1 text-sm">
            {t("need_more_help")}
          </Text>
          <Text className="text-blue-700 text-xs leading-5">
            {t("contact_support_message")}
          </Text>
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
