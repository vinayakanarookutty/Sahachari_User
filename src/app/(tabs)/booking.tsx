import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  RefreshCw,
  Search,
  X,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useBookings } from "../../hooks/useBookings";
import { BookingCard } from "../../components/bookings/BookingCard";

export default function BookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'SERVICE' | 'RENTAL'>('ALL');

  const { data = [], isLoading, isError, refetch } = useBookings();

  const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

  const filteredBookings = data.filter((booking: any) => {
    if (selectedFilter !== 'ALL' && booking.bookingType !== selectedFilter) {
      return false;
    }
    if (queryWords.length === 0) return true;
    const itemName = booking.item?.itemName?.toLowerCase() || "";
    const bookingType = booking.bookingType?.toLowerCase() || "";
    const status = booking.status?.toLowerCase() || "";
    const id = booking._id?.toLowerCase() || "";
    return queryWords.every((word) =>
      itemName.includes(word) ||
      bookingType.includes(word) ||
      status.includes(word) ||
      id.includes(word)
    );
  });

  // LOADING
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <View className="bg-white p-8 rounded-3xl shadow-xl items-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-4 text-gray-600 font-semibold">
            {t("loading_bookings") || "Loading bookings..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ERROR
  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 px-6">
        <View className="bg-white rounded-3xl shadow-2xl p-8 items-center">
          <AlertCircle size={48} color="#dc2626" />

          <Text className="text-xl font-bold text-gray-800 mt-4 text-center">
            {t("failed_to_load_bookings")}
          </Text>

          <Pressable
            onPress={refetch}
            className="mt-6 bg-blue-600 px-6 py-3 rounded-2xl flex-row items-center"
          >
            <RefreshCw size={18} color="white" />
            <Text className="text-white font-bold ml-2">
              {t("retry")}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // EMPTY STATE
  if (!data.length) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 px-6">
        <View className="bg-white rounded-3xl shadow-xl p-8 items-center">
          <Calendar size={48} color="#2563eb" />
          <Text className="text-xl font-bold text-gray-800 mt-4">
            {t("No Bookings Yet")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#2563EB" }}>
      <View className="flex-1 bg-gray-50">

        {/* HEADER (same style as Orders) */}
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          style={{ paddingTop: insets.top + 10, paddingBottom: 20 }}
        >
          <View className="flex-row items-center px-4 pt-4">
            <Pressable
              onPress={() => router.back()}
              className="bg-white/20 p-2 rounded-full"
            >
              <ArrowLeft size={22} color="#fff" />
            </Pressable>

            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-white">
                {t("my_bookings")}
              </Text>
              <Text className="text-blue-100 text-sm mt-1">
                {filteredBookings.length} {filteredBookings.length === 1 ? t("booking") : t("bookings")}
              </Text>
            </View>

            <View className="w-10" />
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white rounded-full pl-4 pr-1.5 py-1.5 mt-3 mx-4 shadow-md border border-gray-100/60">
            <Search size={18} color="#4B5563" strokeWidth={2.5} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t("search") || "Search..."}
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-gray-800 text-sm font-medium py-1"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} className="mr-3 p-1 rounded-full active:bg-gray-100">
                <X size={16} color="#6B7280" />
              </Pressable>
            )}
            <Pressable 
              onPress={() => Keyboard.dismiss()}
              className="bg-blue-600 rounded-full p-2.5 flex-row items-center justify-center active:bg-blue-700 shadow-sm"
            >
              <Search size={16} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Category Filter Pills */}
          <View className="flex-row items-center justify-center gap-2 px-4 mt-3.5">
            {[
              { label: "All", value: "ALL" },
              { label: "Services", value: "SERVICE" },
              { label: "Rentals", value: "RENTAL" },
            ].map((tab) => {
              const isSelected = selectedFilter === tab.value;
              return (
                <Pressable
                  key={tab.value}
                  onPress={() => setSelectedFilter(tab.value as any)}
                  className={`px-5 py-2 rounded-full border ${
                    isSelected
                      ? "bg-white border-white shadow-sm"
                      : "bg-white/15 border-white/20"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? "text-blue-700 font-extrabold" : "text-white"
                    }`}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>

        {/* LIST */}
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <BookingCard
              item={item}
              onPress={(booking: any) =>
                router.push(`/booking/${booking._id}`)
              }
            />
          )}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />
      </View>
    </SafeAreaView>
  );
}