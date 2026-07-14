import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
} from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FAQScreen() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const router = useRouter()

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
                        className="bg-white/20 rounded-full p-2.5"
                    >
                        <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
                    </Pressable>

                    <View className="flex-1 items-center">
                        <Text className="text-2xl font-bold text-white text-center">
                            {t("help_support")}
                        </Text>

                        <Text className="text-blue-100 mt-1 text-center">
                            {t("frequently_asked_questions")}
                        </Text>
                    </View>

                    {/* Same width as back button area */}
                    <View className="w-[44px]" />
                </View>
            </LinearGradient>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    padding: 16,
                }}
            >
                {/* FAQ List */}
                {FAQS.map((faq, index) => {
                    const isOpen = openIndex === index;

                    return (
                        <View
                            key={index}
                            className="bg-white rounded-2xl mb-3 overflow-hidden border border-gray-100"
                        >
                            <Pressable
                                onPress={() => toggleFAQ(index)}
                                className="flex-row items-center px-4 py-4"
                            >
                                <Text className="flex-1 text-base font-semibold text-gray-900 pr-3">
                                    {faq.question}
                                </Text>

                                {isOpen ? (
                                    <ChevronUp
                                        size={20}
                                        color="#6B7280"
                                        strokeWidth={2}
                                    />
                                ) : (
                                    <ChevronDown
                                        size={20}
                                        color="#6B7280"
                                        strokeWidth={2}
                                    />
                                )}
                            </Pressable>

                            {isOpen && (
                                <View className="px-4 pb-4 border-t border-gray-100">
                                    <Text className="text-gray-600 leading-6 mt-3">
                                        {faq.answer}
                                    </Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* Footer */}
                <View className="mt-4 bg-blue-50 rounded-2xl p-4 border border-blue-100">
                    <Text className="text-blue-900 font-semibold mb-2">
                        {t("need_more_help")}
                    </Text>

                    <Text className="text-blue-700 leading-5">
                        {t("contact_support_message")}
                    </Text>
                </View>

                <View className="h-6" />
            </ScrollView>
        </View>
    );
}