import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useAppFonts } from "@/hooks/useAppFonts";

// ─── Status Utility Maps ───
const STATUS_CONFIG: Record<string, {
  bgColors: [string, string];
  textColor: string;
  iconColor: string;
  icon: any;
}> = {
  PLACED: {
    bgColors: ["#FEF3C7", "#FDE68A"],
    textColor: "#92400E",
    iconColor: "#D97706",
    icon: Clock,
  },
  ACCEPTED: {
    bgColors: ["#DBEAFE", "#BFDBFE"],
    textColor: "#1E40AF",
    iconColor: "#2563EB",
    icon: CheckCircle,
  },
  IN_PROGRESS: {
    bgColors: ["#EDE9FE", "#DDD6FE"],
    textColor: "#5B21B6",
    iconColor: "#7C3AED",
    icon: Wrench,
  },
  COMPLETED: {
    bgColors: ["#D1FAE5", "#A7F3D0"],
    textColor: "#065F46",
    iconColor: "#059669",
    icon: CheckCircle,
  },
  RETURNED: {
    bgColors: ["#E0E7FF", "#C7D2FE"],
    textColor: "#3730A3",
    iconColor: "#4F46E5",
    icon: RefreshCw,
  },
  CANCELLED: {
    bgColors: ["#FEE2E2", "#FECACA"],
    textColor: "#991B1B",
    iconColor: "#DC2626",
    icon: XCircle,
  },
  REJECTED: {
    bgColors: ["#FEE2E2", "#FECACA"],
    textColor: "#991B1B",
    iconColor: "#DC2626",
    icon: XCircle,
  },
};

const DEFAULT_STATUS_CONFIG = {
  bgColors: ["#F1F5F9", "#E2E8F0"] as [string, string],
  textColor: "#475569",
  iconColor: "#64748B",
  icon: Package,
};

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { styleRegular, styleBold, styleMedium } = useAppFonts();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data;
    },
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusConfig = data ? (STATUS_CONFIG[data.status] || DEFAULT_STATUS_CONFIG) : DEFAULT_STATUS_CONFIG;
  const StatusIcon = statusConfig.icon;
  const isRental = data?.bookingType === "RENTAL";

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
              {t("booking_details") || "Booking Details"}
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
              {t("loading_details") || "Loading details..."}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (isError || !data) {
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
            paddingHorizontal: 18, paddingTop: 16,
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
                {t("booking_details") || "Booking Details"}
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
              backgroundColor: "#FEF2F2",
            }}>
              <LinearGradient
                colors={["#FEE2E2", "#FECACA"]}
                style={{ width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" }}
              >
                <XCircle size={36} color="#DC2626" />
              </LinearGradient>
            </View>

            <Text style={[{ fontSize: 20, color: "#0F172A", marginBottom: 8, textAlign: "center" }, styleBold]}>
              {t("failed_to_load_booking") || "Failed to Load Booking"}
            </Text>

            <Pressable
              onPress={() => refetch()}
              style={({ pressed }) => ({
                width: "100%", marginTop: 12,
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
                <RefreshCw size={18} color="white" style={{ marginRight: 8 }} />
                <Text style={[{ color: "#FFFFFF", fontSize: 15 }, styleBold]}>
                  {t("retry") || "Try Again"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

      {/* ══════════════════════════════════════════════════════════
          HERO HEADER — Premium Gradient
      ══════════════════════════════════════════════════════════ */}
      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 10, paddingBottom: 22, zIndex: 10 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18 }}>
          {/* Back Button */}
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

          {/* Title + Pill */}
          <View style={{ flex: 1, alignItems: "center", marginHorizontal: 8 }}>
            <Text style={[{
              fontSize: 19, color: "#FFFFFF", letterSpacing: -0.2,
            }, styleBold]} numberOfLines={1}>
              {data.item?.itemName || "Booking Details"}
            </Text>

            <View style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
              flexDirection: "row", alignItems: "center", marginTop: 4,
              borderWidth: 0.5, borderColor: "rgba(255,255,255,0.2)",
            }}>
              <Sparkles size={8} color="#FBBF24" style={{ marginRight: 4 }} />
              <Text style={[{
                fontSize: 10, color: "rgba(255,255,255,0.9)",
                letterSpacing: 0.5,
              }, styleMedium]}>
                {isRental ? (t("rental_booking") || "Rental Booking") : (t("service_booking") || "Service Booking")}
              </Text>
            </View>
          </View>

          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* ══════════════════════════════════════════════════════════
          BODY — Curved Content Sheet
      ══════════════════════════════════════════════════════════ */}
      <View style={{
        flex: 1, backgroundColor: "#F8FAFC",
        marginTop: -12, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        overflow: "hidden",
      }}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: 18 }}
        >

          {/* ── Item Info Card ── */}
          <View style={{
            marginHorizontal: 18, backgroundColor: "#FFFFFF",
            borderRadius: 24, overflow: "hidden",
            borderWidth: 1, borderColor: "#F1F5F9",
            ...Platform.select({
              ios: { shadowColor: "#1D4ED8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
              android: { elevation: 4 },
            }),
          }}>
            <LinearGradient
              colors={["#F8FAFC", "#F1F5F9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <Text style={[{
                  fontSize: 20, color: "#0F172A", letterSpacing: -0.3, flex: 1, marginRight: 10,
                }, styleBold]}>
                  {data.item?.itemName}
                </Text>

                <LinearGradient
                  colors={isRental ? ["#EDE9FE", "#DDD6FE"] : ["#DBEAFE", "#BFDBFE"]}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14,
                    borderWidth: 1, borderColor: "rgba(255,255,255,0.6)",
                  }}
                >
                  <Text style={[{
                    fontSize: 11, color: isRental ? "#5B21B6" : "#1E40AF",
                    letterSpacing: 0.5, textTransform: "uppercase",
                  }, styleBold]}>
                    {data.bookingType}
                  </Text>
                </LinearGradient>
              </View>

              {data.item?.description && (
                <Text style={[{
                  fontSize: 13, color: "#64748B", lineHeight: 20, marginBottom: 12,
                }, styleRegular]}>
                  {data.item.description}
                </Text>
              )}

              <View style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0",
              }}>
                <Text style={[{ fontSize: 13, color: "#94A3B8" }, styleMedium]}>
                  {t("Total_Amount") || "Total Amount"}
                </Text>
                <Text style={[{
                  fontSize: 24, color: "#1D4ED8", letterSpacing: -0.5,
                }, styleBold]}>
                  ₹{data.totalAmount}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* ── Status Card ── */}
          <View style={{
            marginHorizontal: 18, marginTop: 14, backgroundColor: "#FFFFFF",
            borderRadius: 24, padding: 20,
            borderWidth: 1, borderColor: "#F1F5F9",
            ...Platform.select({
              ios: { shadowColor: "#1D4ED8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
              android: { elevation: 4 },
            }),
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <LinearGradient
                  colors={["#D1FAE5", "#A7F3D0"]}
                  style={{
                    width: 36, height: 36, borderRadius: 12,
                    alignItems: "center", justifyContent: "center", marginRight: 12,
                  }}
                >
                  <Package size={18} color="#059669" strokeWidth={2.5} />
                </LinearGradient>
                <Text style={[{ fontSize: 16, color: "#0F172A", letterSpacing: -0.2 }, styleBold]}>
                  {t("booking_status") || "Booking Status"}
                </Text>
              </View>

              <LinearGradient
                colors={statusConfig.bgColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
                  flexDirection: "row", alignItems: "center",
                  borderWidth: 1, borderColor: "rgba(255,255,255,0.6)",
                }}
              >
                <StatusIcon size={13} color={statusConfig.iconColor} strokeWidth={2.5} style={{ marginRight: 5 }} />
                <Text style={[{
                  fontSize: 12, color: statusConfig.textColor, letterSpacing: 0.3, textTransform: "uppercase",
                }, styleBold]}>
                  {data.status}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* ── Booked Date Card ── */}
          <View style={{
            marginHorizontal: 18, marginTop: 14, backgroundColor: "#FFFFFF",
            borderRadius: 24, padding: 20,
            borderWidth: 1, borderColor: "#F1F5F9",
            ...Platform.select({
              ios: { shadowColor: "#1D4ED8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
              android: { elevation: 4 },
            }),
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <LinearGradient
                colors={["#EDE9FE", "#DDD6FE"]}
                style={{
                  width: 36, height: 36, borderRadius: 12,
                  alignItems: "center", justifyContent: "center", marginRight: 12,
                }}
              >
                <Calendar size={18} color="#7C3AED" strokeWidth={2.5} />
              </LinearGradient>
              <Text style={[{ fontSize: 16, color: "#0F172A", letterSpacing: -0.2 }, styleBold]}>
                {isRental ? (t("rental_period") || "Rental Period") : (t("service_date") || "Service Date")}
              </Text>
            </View>

            <View style={{
              backgroundColor: "#F8FAFC", borderRadius: 16, padding: 14,
              borderWidth: 1, borderColor: "#F1F5F9",
            }}>
              <Text style={[{ fontSize: 14, color: "#1E293B" }, styleBold]}>
                {data.startDate
                  ? isRental && data.endDate
                    ? `${formatDate(data.startDate)} - ${formatDate(data.endDate)}`
                    : formatDate(data.startDate)
                  : formatDate(data.createdAt)}
              </Text>
            </View>
          </View>

          {/* ── Service Address ── */}
          {data.bookingAddress && (
            <View style={{
              marginHorizontal: 18, marginTop: 14, backgroundColor: "#FFFFFF",
              borderRadius: 24, padding: 20,
              borderWidth: 1, borderColor: "#F1F5F9",
              ...Platform.select({
                ios: { shadowColor: "#1D4ED8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
                android: { elevation: 4 },
              }),
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                <LinearGradient
                  colors={["#FEE2E2", "#FECACA"]}
                  style={{
                    width: 36, height: 36, borderRadius: 12,
                    alignItems: "center", justifyContent: "center", marginRight: 12,
                  }}
                >
                  <MapPin size={18} color="#EF4444" strokeWidth={2.5} />
                </LinearGradient>
                <Text style={[{ fontSize: 16, color: "#0F172A", letterSpacing: -0.2 }, styleBold]}>
                  {t("service_address") || "Service Address"}
                </Text>
              </View>

              <View style={{
                backgroundColor: "#F8FAFC", borderRadius: 16, padding: 14,
                borderWidth: 1, borderColor: "#F1F5F9",
              }}>
                <Text style={[{ fontSize: 14, color: "#1E293B", lineHeight: 22, marginBottom: 4 }, styleMedium]}>
                  {data.bookingAddress?.street}
                </Text>
                <Text style={[{ fontSize: 13, color: "#475569", marginBottom: 2 }, styleRegular]}>
                  {data.bookingAddress?.city} - {data.bookingAddress?.zipCode}
                </Text>
                {data.bookingAddress?.place && (
                  <Text style={[{ fontSize: 13, color: "#475569" }, styleRegular]}>
                    {data.bookingAddress?.place}
                  </Text>
                )}

                {/* Phone */}
                {data.bookingAddress?.phone && (
                  <View style={{
                    marginTop: 12, paddingTop: 12,
                    borderTopWidth: 1, borderTopColor: "#E2E8F0",
                    flexDirection: "row", alignItems: "center",
                  }}>
                    <LinearGradient
                      colors={["#DBEAFE", "#BFDBFE"]}
                      style={{
                        width: 28, height: 28, borderRadius: 9,
                        alignItems: "center", justifyContent: "center", marginRight: 10,
                      }}
                    >
                      <Phone size={13} color="#2563EB" strokeWidth={2.5} />
                    </LinearGradient>
                    <Text style={[{ fontSize: 13, color: "#1E293B" }, styleBold]}>
                      {data.bookingAddress.phone}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── Payment Summary Card (Royal Blue Gradient) ── */}
          <View style={{
            marginHorizontal: 18, marginTop: 14,
            borderRadius: 24, overflow: "hidden",
            ...Platform.select({
              ios: { shadowColor: "#1D4ED8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20 },
              android: { elevation: 8 },
            }),
          }}>
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 22, borderRadius: 24 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={[{ fontSize: 14, color: "rgba(255,255,255,0.75)" }, styleRegular]}>
                  {t("payment_status") || "Payment Status"}
                </Text>
                <Text style={[{ fontSize: 15, color: "#FFFFFF", textTransform: "capitalize" }, styleBold]}>
                  {data.paymentStatus || "Completed"}
                </Text>
              </View>

              {data.paymentMethod && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <Text style={[{ fontSize: 14, color: "rgba(255,255,255,0.75)" }, styleRegular]}>
                    {t("payment_method") || "Payment Method"}
                  </Text>
                  <Text style={[{ fontSize: 15, color: "#FFFFFF", textTransform: "capitalize" }, styleBold]}>
                    {data.paymentMethod}
                  </Text>
                </View>
              )}

              {/* Divider */}
              <View style={{
                borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)",
                paddingTop: 16, flexDirection: "row",
                alignItems: "center", justifyContent: "space-between",
              }}>
                <View>
                  <Text style={[{
                    fontSize: 11, color: "rgba(255,255,255,0.6)",
                    letterSpacing: 0.5, textTransform: "uppercase",
                  }, styleMedium]}>
                    {t("Total_Amount") || "Total Amount"}
                  </Text>
                  <Text style={[{
                    fontSize: 28, color: "#FFFFFF", marginTop: 4, letterSpacing: -0.5,
                  }, styleBold]}>
                    ₹{data.totalAmount}
                  </Text>
                </View>

                <View style={{
                  width: 46, height: 46, borderRadius: 23,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <CreditCard size={22} color="white" strokeWidth={1.8} />
                </View>
              </View>
            </LinearGradient>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}