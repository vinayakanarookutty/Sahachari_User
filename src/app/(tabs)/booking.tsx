import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  RefreshCw,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useBookings } from "../../hooks/useBookings";
import { BookingCard } from "../../components/bookings/BookingCard";

export default function BookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { data = [], isLoading, isError, refetch } = useBookings();

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
            {t("no_bookings_yet")}
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
                {data.length} {data.length === 1 ? t("booking") : t("bookings")}
              </Text>
            </View>

            <View className="w-10" />
          </View>
        </LinearGradient>

        {/* LIST */}
        <FlatList
          data={data}
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