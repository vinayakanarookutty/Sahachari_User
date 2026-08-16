// app/(tabs)/orders/index.tsx
import { useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Filter,
  PackageSearch,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
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
import { OrderCard } from "../../components/orders/OrderCard";
import { OrderDetailsModal } from "../../components/orders/OrderDetailsModal";
import { useOrders } from "../../hooks/useOrders";
import { useAppFonts } from "../../hooks/useAppFonts";

const STATUS_FILTERS = ["All", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_FILTER_COLORS: Record<string, { bg: string; text: string; activeBg: string[] }> = {
  All:       { bg: "rgba(255,255,255,0.15)", text: "#fff",    activeBg: ["#FFFFFF", "#F1F5F9"] },
  PLACED:    { bg: "rgba(251,191,36,0.15)",  text: "#FDE68A", activeBg: ["#FEF3C7", "#FDE68A"] },
  CONFIRMED: { bg: "rgba(96,165,250,0.15)",  text: "#BFDBFE", activeBg: ["#DBEAFE", "#BFDBFE"] },
  SHIPPED:   { bg: "rgba(167,139,250,0.15)", text: "#DDD6FE", activeBg: ["#EDE9FE", "#DDD6FE"] },
  DELIVERED: { bg: "rgba(52,211,153,0.15)",  text: "#A7F3D0", activeBg: ["#D1FAE5", "#A7F3D0"] },
  CANCELLED: { bg: "rgba(248,113,113,0.15)", text: "#FECACA", activeBg: ["#FEE2E2", "#FECACA"] },
};

const STATUS_ACTIVE_TEXT: Record<string, string> = {
  All: "#1E293B",
  PLACED: "#92400E",
  CONFIRMED: "#1E40AF",
  SHIPPED: "#5B21B6",
  DELIVERED: "#065F46",
  CANCELLED: "#991B1B",
};

export default function Orders() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { styleRegular, styleBold, styleMedium } = useAppFonts();
  const {
    orders, isLoading, error, selectedOrder, isLoadingDetails,
    showDetailsModal, isCancelling, handleOrderPress, handleCancelOrder,
    handleCloseModal, refetch
  } = useOrders();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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

  const filteredOrders = orders.filter((order: any) => {
    // Status filter
    if (activeFilter !== "All" && order.status !== activeFilter) return false;
    // Search filter
    if (queryWords.length === 0) return true;
    const checkoutId = order.checkoutId?.toLowerCase() || "";
    const id = order._id?.toLowerCase() || "";
    const status = order.status?.toLowerCase() || "";
    return queryWords.every((word) =>
      checkoutId.includes(word) ||
      id.includes(word) ||
      status.includes(word) ||
      order.items?.some((item: any) =>
        item.productId?.name?.toLowerCase().includes(word)
      )
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
              {t("my_orders")}
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
              {t("loading_orders")}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ---------- ERROR / EMPTY STATE ----------
  if (error || !orders?.length) {
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
                {t("my_orders")}
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
              backgroundColor: error ? "#FEF2F2" : "#EFF6FF",
            }}>
              <LinearGradient
                colors={error ? ["#FEE2E2", "#FECACA"] : ["#DBEAFE", "#BFDBFE"]}
                style={{ width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" }}
              >
                {error ? (
                  <AlertCircle size={36} color="#DC2626" />
                ) : (
                  <ShoppingBag size={36} color="#2563EB" />
                )}
              </LinearGradient>
            </View>

            <Text style={[{ fontSize: 20, color: "#0F172A", marginBottom: 8, textAlign: "center" }, styleBold]}>
              {error ? t("oops_something_went_wrong") : t("no_orders_yet")}
            </Text>

            <Text style={[{ color: "#64748B", textAlign: "center", marginBottom: 24, lineHeight: 22, fontSize: 14 }, styleRegular]}>
              {error ? t("orders_load_failed") : t("start_shopping_orders")}
            </Text>

            <Pressable
              onPress={() => (error ? refetch() : router.push("/(tabs)/home"))}
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
                {error && <RefreshCw size={18} color="white" style={{ marginRight: 8 }} />}
                <Text style={[{ color: "#FFFFFF", fontSize: 15 }, styleBold]}>
                  {error ? t("try_again") : t("start_shopping")}
                </Text>
                {!error && <ChevronRight size={18} color="white" style={{ marginLeft: 4 }} />}
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
          HERO HEADER — Premium Gradient (matches Home)
      ══════════════════════════════════════════════════════════ */}
      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 8, paddingBottom: 22, zIndex: 10 }}
      >
        <View style={{ paddingHorizontal: horizontalPadding }}>

          {/* ── Top Bar: Back + Title + Order Count ── */}
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
                {t("my_orders")}
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
                  {filteredOrders.length}{" "}
                  {filteredOrders.length === 1 ? t("order") : t("orders")}
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
              placeholder={t("search") || "Search orders..."}
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

          {/* ── Status Filter Chips ── */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={STATUS_FILTERS}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingTop: 14, gap: 8 }}
            renderItem={({ item: status }) => {
              const isActive = activeFilter === status;
              const colors = STATUS_FILTER_COLORS[status] || STATUS_FILTER_COLORS.All;
              return (
                <Pressable
                  onPress={() => setActiveFilter(status)}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={colors.activeBg as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                        borderWidth: 1, borderColor: "rgba(255,255,255,0.5)",
                        ...Platform.select({
                          ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
                          android: { elevation: 3 },
                        }),
                      }}
                    >
                      <Text style={[{
                        fontSize: 12, color: STATUS_ACTIVE_TEXT[status] || "#1E293B",
                        letterSpacing: 0.3,
                      }, styleBold]}>
                        {status === "All" ? t("all") || "All" : status}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={{
                      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: colors.bg,
                      borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
                    }}>
                      <Text style={[{
                        fontSize: 12, color: colors.text,
                        letterSpacing: 0.3,
                      }, styleMedium]}>
                        {status === "All" ? t("all") || "All" : status}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </LinearGradient>

      {/* ══════════════════════════════════════════════════════════
          BODY — Curved Content Sheet (matches Home)
      ══════════════════════════════════════════════════════════ */}
      <View style={{
        flex: 1, backgroundColor: "#F8FAFC",
        marginTop: -12, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        overflow: "hidden",
      }}>
        {filteredOrders.length === 0 ? (
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
                  <PackageSearch size={28} color="#94A3B8" />
                </LinearGradient>
              </View>
              <Text style={[{ color: "#1E293B", fontSize: 16, marginBottom: 4 }, styleBold]}>
                {t("no_results_found") || "No matching orders"}
              </Text>
              <Text style={[{ color: "#94A3B8", fontSize: 13, textAlign: "center" }, styleRegular]}>
                {t("try_different_search") || "Try a different search term"}
              </Text>
            </View>
          </View>
        ) : (
          /* ── Order List ── */
          <FlatList
            data={filteredOrders}
            contentContainerStyle={{
              padding: horizontalPadding,
              paddingTop: 22,
              paddingBottom: 100,
            }}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <Animated.View style={{ transform: [{ scale: scaleAnims[index] || 1 }] }}>
                <Pressable
                  onPressIn={() => handleCardPressIn(index)}
                  onPressOut={() => handleCardPressOut(index)}
                  onPress={() => handleOrderPress(item._id)}
                >
                  <OrderCard item={item} onPress={handleOrderPress} />
                </Pressable>
              </Animated.View>
            )}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
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

        <OrderDetailsModal
          visible={showDetailsModal}
          order={selectedOrder}
          isLoading={isLoadingDetails}
          onClose={handleCloseModal}
          onCancel={handleCancelOrder}
          isCancelling={isCancelling}
        />
      </View>
    </View>
  );
}