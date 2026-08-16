import { useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarDays,
  CalendarSearch,
  ChevronRight,
  RefreshCw,
  Search,
  Sparkles,
  Wrench,
  X,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useBookings } from "../../hooks/useBookings";
import { BookingCard } from "../../components/bookings/BookingCard";
import { useAppFonts } from "../../hooks/useAppFonts";

const FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Services", value: "SERVICE" },
  { label: "Rentals", value: "RENTAL" },
] as const;

export default function BookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { styleRegular, styleBold, styleMedium } = useAppFonts();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "SERVICE" | "RENTAL">("ALL");

  const { data = [], isLoading, isError, refetch } = useBookings();

  const isSmall = width <= 360;
  const isTablet = width > 768;
  const horizontalPadding = isTablet ? 32 : isSmall ? 14 : 18;

  // Scale animation for cards
  const scaleAnims = useRef(
    Array(50).fill(0).map(() => new Animated.Value(1))
  ).current;

  const handleCardPressIn = (index: number) => {
    if (scaleAnims[index]) {
      Animated.spring(scaleAnims[index], { toValue: 0.97, useNativeDriver: true }).start();
    }
  };

  const handleCardPressOut = (index: number) => {
    if (scaleAnims[index]) {
      Animated.spring(scaleAnims[index], { toValue: 1, friction: 4, tension: 45, useNativeDriver: true }).start();
    }
  };

  const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

  const filteredBookings = data.filter((booking: any) => {
    if (selectedFilter !== "ALL" && booking.bookingType !== selectedFilter) {
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

  // ---------- LOADING STATE ----------
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 8, paddingBottom: 28 }}
        >
          <View style={{ alignItems: "center", paddingTop: 16 }}>
            <Text style={[{ fontSize: 20, color: "#FFFFFF", letterSpacing: -0.2 }, styleBold]}>
              {t("my_bookings") || "My Bookings"}
            </Text>
          </View>
        </LinearGradient>

        <View style={{
          flex: 1, alignItems: "center", justifyContent: "center",
          marginTop: -16, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          backgroundColor: "#F8FAFC",
        }}>
          <View style={{
            backgroundColor: "#FFFFFF", paddingHorizontal: 48, paddingVertical: 40,
            borderRadius: 28, alignItems: "center",
            borderWidth: 1, borderColor: "#F1F5F9",
            ...Platform.select({
              ios: { shadowColor: "#1D4ED8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24 },
              android: { elevation: 6 },
            }),
          }}>
            <View style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
            <Text style={[{ color: "#64748B", fontSize: 14 }, styleMedium]}>
              {t("loading_bookings") || "Loading bookings..."}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ---------- ERROR / EMPTY STATE ----------
  if (isError || !data.length) {
    return (
      <View style={{ flex: 1, backgroundColor: "#2563EB" }}>
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 8, paddingBottom: 32 }}
        >
          <View style={{
            flexDirection: "row", alignItems: "center",
            paddingHorizontal: horizontalPadding, paddingTop: 16,
          }}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                padding: 10, borderRadius: 16,
                borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
              })}
              hitSlop={8}
            >
              <ArrowLeft size={20} color="#fff" />
            </Pressable>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={[{ fontSize: 20, color: "#FFFFFF", letterSpacing: -0.2 }, styleBold]}>
                {t("my_bookings") || "My Bookings"}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <View style={{
          flex: 1, backgroundColor: "#F8FAFC", alignItems: "center",
          justifyContent: "center", paddingHorizontal: 24,
          marginTop: -16, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        }}>
          <View style={{
            backgroundColor: "#FFFFFF", borderRadius: 28, padding: 32,
            alignItems: "center", width: "100%", maxWidth: 360,
            borderWidth: 1, borderColor: "#F1F5F9",
            ...Platform.select({
              ios: { shadowColor: "#1D4ED8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24 },
              android: { elevation: 6 },
            }),
          }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center",
              marginBottom: 20,
              backgroundColor: isError ? "#FEF2F2" : "#EFF6FF",
            }}>
              <LinearGradient
                colors={isError ? ["#FEE2E2", "#FECACA"] : ["#DBEAFE", "#BFDBFE"]}
                style={{ width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" }}
              >
                {isError ? (
                  <AlertCircle size={36} color="#DC2626" />
                ) : (
                  <CalendarDays size={36} color="#2563EB" />
                )}
              </LinearGradient>
            </View>

            <Text style={[{ fontSize: 20, color: "#0F172A", marginBottom: 8, textAlign: "center" }, styleBold]}>
              {isError ? (t("failed_to_load_bookings") || "Failed to Load Bookings") : (t("no_bookings_yet") || "No Bookings Yet")}
            </Text>

            <Text style={[{ color: "#64748B", textAlign: "center", marginBottom: 24, lineHeight: 22, fontSize: 14 }, styleRegular]}>
              {isError ? (t("bookings_load_failed") || "Something went wrong while loading your bookings.") : (t("explore_services_rentals") || "Explore our top-rated services and rental equipment today.")}
            </Text>

            <Pressable
              onPress={() => (isError ? refetch() : router.push("/(tabs)/market"))}
              style={({ pressed }) => ({
                width: "100%",
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <LinearGradient
                colors={["#3B82F6", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 16, borderRadius: 18,
                  flexDirection: "row", alignItems: "center", justifyContent: "center",
                  ...Platform.select({
                    ios: { shadowColor: "#2563EB", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
                    android: { elevation: 6 },
                  }),
                }}
              >
                {isError && <RefreshCw size={18} color="white" style={{ marginRight: 8 }} />}
                <Text style={[{ color: "#FFFFFF", fontSize: 15 }, styleBold]}>
                  {isError ? (t("retry") || "Try Again") : (t("explore_services") || "Explore Services")}
                </Text>
                {!isError && <ChevronRight size={18} color="white" style={{ marginLeft: 4 }} />}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ---------- MAIN STATE ----------
  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

      {/* ══════════════════════════════════════════════════════════
          HERO HEADER — Premium Gradient (matches Home & Orders)
      ══════════════════════════════════════════════════════════ */}
      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 8, paddingBottom: 22, zIndex: 10 }}
      >
        <View style={{ paddingHorizontal: horizontalPadding }}>

          {/* ── Top Bar: Back + Title + Booking Count ── */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                padding: 10, borderRadius: 16,
                borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
              })}
              hitSlop={8}
            >
              <ArrowLeft size={20} color="#fff" />
            </Pressable>

            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={[{
                fontSize: isTablet ? 22 : isSmall ? 18 : 20,
                color: "#FFFFFF", letterSpacing: -0.2,
              }, styleBold]}>
                {t("my_bookings") || "My Bookings"}
              </Text>

              <View style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
                flexDirection: "row", alignItems: "center", marginTop: 4,
                borderWidth: 0.5, borderColor: "rgba(255,255,255,0.2)",
              }}>
                <Sparkles size={8} color="#FBBF24" style={{ marginRight: 4 }} />
                <Text style={[{
                  fontSize: isSmall ? 9 : 10, color: "rgba(255,255,255,0.9)",
                  letterSpacing: 0.5,
                }, styleMedium]}>
                  {filteredBookings.length}{" "}
                  {filteredBookings.length === 1 ? (t("booking") || "booking") : (t("bookings") || "bookings")}
                </Text>
              </View>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* ── Luxury Glassmorphic Search Bar ── */}
          <View style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.98)",
            borderRadius: 18, paddingLeft: 8, paddingRight: 5,
            height: isTablet ? 50 : 44,
            borderWidth: 1, borderColor: "rgba(255,255,255,0.9)",
            ...Platform.select({
              ios: {
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.16, shadowRadius: 16,
              },
              android: { elevation: 10 },
            }),
          }}>
            {/* Search Icon Badge */}
            <View style={{
              width: 30, height: 30, borderRadius: 15,
              backgroundColor: "#EFF6FF",
              alignItems: "center", justifyContent: "center", marginLeft: 4,
            }}>
              <Search size={16} color="#2563EB" strokeWidth={2.5} />
            </View>

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t("search") || "Search bookings..."}
              placeholderTextColor="#94A3B8"
              style={[{
                flex: 1, marginLeft: 10, color: "#0F172A",
                fontSize: isSmall ? 13 : 14, paddingVertical: 0,
              }, styleRegular]}
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                style={{ padding: 6 }}
              >
                <X size={14} color="#94A3B8" />
              </Pressable>
            )}
          </View>

          {/* ── Category Filter Pills ── */}
          <View style={{
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            gap: 10, marginTop: 14,
          }}>
            {FILTERS.map((tab) => {
              const isSelected = selectedFilter === tab.value;
              return (
                <Pressable
                  key={tab.value}
                  onPress={() => setSelectedFilter(tab.value as any)}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={["#FFFFFF", "#F1F5F9"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
                        borderWidth: 1, borderColor: "rgba(255,255,255,0.6)",
                        ...Platform.select({
                          ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
                          android: { elevation: 3 },
                        }),
                      }}
                    >
                      <Text style={[{
                        fontSize: 12, color: "#1D4ED8",
                        letterSpacing: 0.3,
                      }, styleBold]}>
                        {t(tab.label.toLowerCase()) || tab.label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={{
                      paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
                    }}>
                      <Text style={[{
                        fontSize: 12, color: "#FFFFFF",
                        letterSpacing: 0.3,
                      }, styleMedium]}>
                        {t(tab.label.toLowerCase()) || tab.label}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </LinearGradient>

      {/* ══════════════════════════════════════════════════════════
          BODY — Curved Content Sheet (matches Home & Orders)
      ══════════════════════════════════════════════════════════ */}
      <View style={{
        flex: 1, backgroundColor: "#F8FAFC",
        marginTop: -12, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        overflow: "hidden",
      }}>
        {filteredBookings.length === 0 ? (
          /* ── Empty Search Results ── */
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
            <View style={{
              backgroundColor: "#FFFFFF", borderRadius: 28, padding: 32,
              alignItems: "center", width: "100%", maxWidth: 340,
              borderWidth: 1, borderColor: "#F1F5F9",
              ...Platform.select({
                ios: { shadowColor: "#1D4ED8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 16 },
                android: { elevation: 4 },
              }),
            }}>
              <View style={{
                width: 64, height: 64, borderRadius: 32, marginBottom: 16,
              }}>
                <LinearGradient
                  colors={["#F1F5F9", "#E2E8F0"]}
                  style={{ width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" }}
                >
                  <CalendarSearch size={28} color="#94A3B8" />
                </LinearGradient>
              </View>
              <Text style={[{ color: "#1E293B", fontSize: 16, marginBottom: 4 }, styleBold]}>
                {t("no_results_found") || "No matching bookings"}
              </Text>
              <Text style={[{ color: "#94A3B8", fontSize: 13, textAlign: "center" }, styleRegular]}>
                {t("try_different_search") || "Try a different search or filter"}
              </Text>
            </View>
          </View>
        ) : (
          /* ── Bookings List ── */
          <FlatList
            data={filteredBookings}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{
              padding: horizontalPadding,
              paddingTop: 22,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
            renderItem={({ item, index }) => (
              <Animated.View style={{ transform: [{ scale: scaleAnims[index] || 1 }] }}>
                <Pressable
                  onPressIn={() => handleCardPressIn(index)}
                  onPressOut={() => handleCardPressOut(index)}
                  onPress={() => router.push(`/booking/${item._id}`)}
                >
                  <BookingCard
                    item={item}
                    onPress={(booking: any) => router.push(`/booking/${booking._id}`)}
                  />
                </Pressable>
              </Animated.View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                tintColor="#2563EB"
                colors={["#2563EB"]}
              />
            }
          />
        )}
      </View>
    </View>
  );
}