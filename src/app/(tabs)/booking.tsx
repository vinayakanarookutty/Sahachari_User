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
  CalendarSearch,
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

  const FILTERS = [
    { label: t("all") || "All", value: "ALL" },
    { label: t("services") || "Services", value: "SERVICE" },
    { label: t("rentals") || "Rentals", value: "RENTAL" },
  ] as const;

  // ---------- LOADING STATE ----------
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <View className="flex-1 items-center justify-center">
          <View className="bg-white px-10 py-8 rounded-3xl shadow-sm border border-gray-100 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-4 text-gray-500 font-medium">
              {t("loading_bookings") || "Loading bookings..."}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- ERROR / EMPTY STATE ----------
  if (isError || !data.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#2563EB" }} edges={["top"]}>
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          style={{ paddingTop: insets.top + 6, paddingBottom: 28 }}
        >
          <View className="flex-row items-center px-4 pt-4">
            <Pressable
              onPress={() => router.back()}
              className="bg-white/15 p-2.5 rounded-full active:bg-white/25"
              hitSlop={8}
            >
              <ArrowLeft size={20} color="#fff" />
            </Pressable>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-white">
                {t("my_bookings")}
              </Text>
            </View>
            <View className="w-10" />
          </View>
        </LinearGradient>

        <View className="flex-1 bg-gray-50 items-center justify-center px-6 -mt-6">
          <View className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 items-center w-full max-w-sm">
            <View className={`${isError ? "bg-red-50" : "bg-blue-50"} w-20 h-20 rounded-full items-center justify-center mb-5`}>
              {isError ? (
                <AlertCircle size={36} color="#dc2626" />
              ) : (
                <Calendar size={36} color="#2563eb" />
              )}
            </View>

            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
              {isError ? t("failed_to_load_bookings") : t("no_bookings_yet") || "No Bookings Yet"}
            </Text>

            {isError && (
              <Text className="text-gray-500 text-center mb-6 leading-5 text-[15px]">
                {t("bookings_load_failed") || "Something went wrong while loading your bookings."}
              </Text>
            )}

            {isError && (
              <Pressable
                onPress={refetch}
                className="bg-blue-600 px-8 py-3.5 rounded-2xl active:bg-blue-700 flex-row items-center justify-center w-full"
                style={{
                  shadowColor: "#2563eb",
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 3,
                }}
              >
                <RefreshCw size={18} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-semibold text-base">
                  {t("retry")}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- MAIN STATE ----------
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#2563EB" }}>
      <View className="flex-1 bg-gray-50">

        {/* HEADER */}
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          style={{ paddingTop: insets.top + 6, paddingBottom: 20 }}
        >
          <View className="flex-row items-center px-4 pt-4">
            <Pressable
              onPress={() => router.back()}
              className="bg-white/15 p-2.5 rounded-full active:bg-white/25"
              hitSlop={8}
            >
              <ArrowLeft size={20} color="#fff" />
            </Pressable>

            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-white tracking-tight">
                {t("my_bookings")}
              </Text>
              <Text className="text-blue-100/90 text-xs font-medium mt-0.5">
                {filteredBookings.length} {filteredBookings.length === 1 ? t("booking") : t("bookings")}
              </Text>
            </View>

            <View className="w-10" />
          </View>

          {/* Search Bar */}
          <View
            className="flex-row items-center bg-white rounded-2xl pl-4 pr-1.5 py-1 mt-4 mx-4 border border-white/10"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <Search size={17} color="#6B7280" strokeWidth={2.25} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t("search") || "Search bookings..."}
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2.5 text-gray-900 text-sm font-medium py-2.5"
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                className="p-2 rounded-full active:bg-gray-100"
                hitSlop={6}
              >
                <X size={16} color="#6B7280" />
              </Pressable>
            )}
          </View>

          {/* Category Filter Pills */}
          <View className="flex-row items-center justify-center gap-2 px-4 mt-3.5">
            {FILTERS.map((tab) => {
              const isSelected = selectedFilter === tab.value;
              return (
                <Pressable
                  key={tab.value}
                  onPress={() => setSelectedFilter(tab.value as any)}
                  className={`px-5 py-2 rounded-full border ${
                    isSelected
                      ? "bg-white border-white"
                      : "bg-white/15 border-white/20 active:bg-white/25"
                  }`}
                  style={
                    isSelected
                      ? {
                          shadowColor: "#000",
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 1,
                        }
                      : undefined
                  }
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? "text-blue-700" : "text-white"
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
        {filteredBookings.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8 -mt-4">
            <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center w-full max-w-sm">
              <View className="bg-gray-50 w-16 h-16 rounded-full items-center justify-center mb-4">
                <CalendarSearch size={28} color="#9CA3AF" />
              </View>
              <Text className="text-gray-800 font-semibold text-base mb-1">
                {t("no_results_found") || "No matching bookings"}
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                {t("try_different_search") || "Try a different search or filter"}
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredBookings}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 16, paddingTop: 18, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
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
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                tintColor="#2563eb"
                colors={["#2563eb"]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}