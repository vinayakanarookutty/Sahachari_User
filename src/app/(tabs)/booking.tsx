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

        {/* Premium Header */}
        <LinearGradient
          colors={["#1E3A8A", "#2563EB", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 10, paddingBottom: 24 }}
        >
          {/* Decorative overlay */}
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.08 }}>
            <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: "white", position: "absolute", top: -40, right: -30 }} />
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "white", position: "absolute", bottom: -20, left: -20 }} />
          </View>

          <View className="flex-row items-center px-5 pt-4">
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)",
                padding: 10,
                borderRadius: 16,
              })}
            >
              <ArrowLeft size={22} color="#fff" strokeWidth={2.5} />
            </Pressable>

            <View className="flex-1 items-center">
              <Text style={{ fontSize: 22, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 }}>
                {t("my_bookings")}
              </Text>
              <Text style={{ fontSize: 13, color: "#BFDBFE", fontWeight: "600", marginTop: 4 }}>
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