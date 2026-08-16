import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  CreditCard,
  Gift,
  MapPin,
  Package,
  Phone,
  StickyNote,
  Sparkles,
  Truck,
  X,
  XCircle,
} from "lucide-react-native";

import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getStatusColor } from "./OrderCard";
import { getImageUrl } from "@/utils/image";
import { useAppFonts } from "@/hooks/useAppFonts";

// ─── Status Config ───
const STATUS_CONFIG: Record<string, {
  bgColors: [string, string];
  textColor: string;
  iconColor: string;
  icon: any;
}> = {
  PLACED:    { bgColors: ["#FEF3C7", "#FDE68A"], textColor: "#92400E", iconColor: "#D97706", icon: Clock },
  CONFIRMED: { bgColors: ["#DBEAFE", "#BFDBFE"], textColor: "#1E40AF", iconColor: "#2563EB", icon: CheckCircle },
  SHIPPED:   { bgColors: ["#EDE9FE", "#DDD6FE"], textColor: "#5B21B6", iconColor: "#7C3AED", icon: Truck },
  DELIVERED: { bgColors: ["#D1FAE5", "#A7F3D0"], textColor: "#065F46", iconColor: "#059669", icon: Gift },
  CANCELLED: { bgColors: ["#FEE2E2", "#FECACA"], textColor: "#991B1B", iconColor: "#DC2626", icon: XCircle },
};

const DEFAULT_STATUS = {
  bgColors: ["#F1F5F9", "#E2E8F0"] as [string, string],
  textColor: "#475569",
  iconColor: "#64748B",
  icon: Package,
};

export function OrderDetailsModal({
  visible,
  order,
  isLoading,
  onClose,
  onCancel,
  isCancelling,
}: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { styleRegular, styleBold, styleMedium } = useAppFonts();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusConfig = order ? (STATUS_CONFIG[order.status] || DEFAULT_STATUS) : DEFAULT_STATUS;
  const StatusIcon = statusConfig.icon;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

        {/* ══════════════════════════════════════════════════════════
            HERO HEADER — Premium Gradient
        ══════════════════════════════════════════════════════════ */}
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 12, paddingBottom: 24, zIndex: 10 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18 }}>
            {/* BACK BUTTON */}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                padding: 10, borderRadius: 16,
                borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
              })}
            >
              <ChevronLeft size={22} color="#fff" />
            </Pressable>

            {/* TITLE */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={[{
                fontSize: 20, color: "#FFFFFF", letterSpacing: -0.2,
              }, styleBold]}>
                {t("order_details")}
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
                  {t("track_order")}
                </Text>
              </View>
            </View>

            <View style={{ width: 42 }} />
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
          {!order || isLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
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
                  backgroundColor: "#EFF6FF", alignItems: "center",
                  justifyContent: "center", marginBottom: 16,
                }}>
                  <ActivityIndicator size="large" color="#2563EB" />
                </View>
                <Text style={[{ color: "#64748B", fontSize: 14 }, styleMedium]}>
                  {t("loading_details")}
                </Text>
              </View>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: 18 }}
            >

              {/* ── Order ID + Status Card ── */}
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
                  {/* Order ID */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={[{
                      fontSize: 10, color: "#94A3B8",
                      letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
                    }, styleMedium]}>
                      {t("order_id")}
                    </Text>
                    <Text style={[{
                      fontSize: 18, color: "#0F172A", letterSpacing: -0.3,
                    }, styleBold]} numberOfLines={1}>
                      #{order.checkoutId}
                    </Text>
                  </View>

                  {/* Status */}
                  <View>
                    <Text style={[{
                      fontSize: 10, color: "#94A3B8",
                      letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8,
                    }, styleMedium]}>
                      {t("order_status")}
                    </Text>
                    <LinearGradient
                      colors={statusConfig.bgColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                        flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
                        borderWidth: 1, borderColor: "rgba(255,255,255,0.6)",
                        ...Platform.select({
                          ios: { shadowColor: statusConfig.iconColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
                          android: { elevation: 2 },
                        }),
                      }}
                    >
                      <StatusIcon size={16} color={statusConfig.iconColor} strokeWidth={2.5} style={{ marginRight: 6 }} />
                      <Text style={[{
                        fontSize: 13, color: statusConfig.textColor, letterSpacing: 0.3,
                      }, styleBold]}>
                        {order.status}
                      </Text>
                    </LinearGradient>
                  </View>

                  {/* Order Date */}
                  {order.createdAt && (
                    <View style={{
                      flexDirection: "row", alignItems: "center",
                      marginTop: 16, paddingTop: 14,
                      borderTopWidth: 1, borderTopColor: "#E2E8F0",
                    }}>
                      <LinearGradient
                        colors={["#EDE9FE", "#DDD6FE"]}
                        style={{
                          width: 32, height: 32, borderRadius: 10,
                          alignItems: "center", justifyContent: "center", marginRight: 10,
                        }}
                      >
                        <Calendar size={14} color="#7C3AED" strokeWidth={2.5} />
                      </LinearGradient>
                      <Text style={[{ fontSize: 12, color: "#94A3B8", marginRight: 6 }, styleRegular]}>
                        {t("order_date")}
                      </Text>
                      <Text style={[{ fontSize: 13, color: "#334155" }, styleBold]}>
                        {formatDate(order.createdAt)}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </View>

              {/* ── Order Items Card ── */}
              <View style={{
                marginHorizontal: 18, marginTop: 14, backgroundColor: "#FFFFFF",
                borderRadius: 24, padding: 20,
                borderWidth: 1, borderColor: "#F1F5F9",
                ...Platform.select({
                  ios: { shadowColor: "#1D4ED8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
                  android: { elevation: 4 },
                }),
              }}>
                {/* Section Header */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                  <LinearGradient
                    colors={["#D1FAE5", "#A7F3D0"]}
                    style={{
                      width: 36, height: 36, borderRadius: 12,
                      alignItems: "center", justifyContent: "center", marginRight: 12,
                    }}
                  >
                    <Package size={18} color="#059669" strokeWidth={2.5} />
                  </LinearGradient>
                  <Text style={[{ fontSize: 18, color: "#0F172A", letterSpacing: -0.2 }, styleBold]}>
                    {t("order_items")}
                  </Text>
                </View>

                {/* Item rows */}
                {order.items?.map((item: any, idx: number) => (
                  <View key={idx} style={{
                    flexDirection: "row", alignItems: "center",
                    backgroundColor: "#F8FAFC", borderRadius: 18, padding: 12,
                    marginBottom: idx < order.items.length - 1 ? 10 : 0,
                    borderWidth: 1, borderColor: "#F1F5F9",
                  }}>
                    <Image
                      source={{ uri: getImageUrl(item.productId?.images?.[0]) }}
                      style={{
                        width: 72, height: 72, borderRadius: 16,
                        backgroundColor: "#E2E8F0",
                      }}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1, marginLeft: 14, justifyContent: "center" }}>
                      <Text style={[{
                        fontSize: 14, color: "#1E293B", marginBottom: 3,
                      }, styleBold]} numberOfLines={2}>
                        {item.productId?.name}
                      </Text>
                      <Text style={[{
                        fontSize: 12, color: "#94A3B8",
                      }, styleRegular]}>
                        {t("qty")}: {item.quantity}
                      </Text>
                      <Text style={[{
                        fontSize: 16, color: "#1D4ED8", marginTop: 4,
                      }, styleBold]}>
                        ₹{(item.quantity * item.price)?.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* ── Delivery Address Card ── */}
              <View style={{
                marginHorizontal: 18, marginTop: 14, backgroundColor: "#FFFFFF",
                borderRadius: 24, padding: 20,
                borderWidth: 1, borderColor: "#F1F5F9",
                ...Platform.select({
                  ios: { shadowColor: "#1D4ED8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
                  android: { elevation: 4 },
                }),
              }}>
                {/* Section Header */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                  <LinearGradient
                    colors={["#FEE2E2", "#FECACA"]}
                    style={{
                      width: 36, height: 36, borderRadius: 12,
                      alignItems: "center", justifyContent: "center", marginRight: 12,
                    }}
                  >
                    <MapPin size={18} color="#EF4444" strokeWidth={2.5} />
                  </LinearGradient>
                  <Text style={[{ fontSize: 18, color: "#0F172A", letterSpacing: -0.2 }, styleBold]}>
                    {t("delivery_address")}
                  </Text>
                </View>

                {/* Address body */}
                <View style={{
                  backgroundColor: "#F8FAFC", borderRadius: 18, padding: 16,
                  borderWidth: 1, borderColor: "#F1F5F9",
                }}>
                  <Text style={[{
                    fontSize: 14, color: "#1E293B", lineHeight: 22, marginBottom: 6,
                  }, styleMedium]}>
                    {order.deliveryAddress?.street}
                  </Text>

                  <Text style={[{ fontSize: 13, color: "#475569", marginBottom: 4 }, styleRegular]}>
                    {order.deliveryAddress?.place}
                  </Text>

                  <Text style={[{ fontSize: 13, color: "#475569", marginBottom: 12 }, styleRegular]}>
                    {order.deliveryAddress?.city},{" "}
                    {order.deliveryAddress?.zipCode}
                  </Text>

                  {/* Phone */}
                  <View style={{
                    paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0",
                    flexDirection: "row", alignItems: "center",
                  }}>
                    <LinearGradient
                      colors={["#DBEAFE", "#BFDBFE"]}
                      style={{
                        width: 32, height: 32, borderRadius: 10,
                        alignItems: "center", justifyContent: "center", marginRight: 10,
                      }}
                    >
                      <Phone size={14} color="#2563EB" strokeWidth={2.5} />
                    </LinearGradient>
                    <Text style={[{ fontSize: 14, color: "#1E293B" }, styleBold]}>
                      {order.deliveryAddress?.phone}
                    </Text>
                  </View>

                  {/* Notes */}
                  {order.deliveryAddress?.notes && (
                    <View style={{
                      marginTop: 12, paddingTop: 12,
                      borderTopWidth: 1, borderTopColor: "#E2E8F0",
                    }}>
                      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                        <LinearGradient
                          colors={["#FEF3C7", "#FDE68A"]}
                          style={{
                            width: 28, height: 28, borderRadius: 8,
                            alignItems: "center", justifyContent: "center", marginRight: 10,
                          }}
                        >
                          <StickyNote size={13} color="#D97706" strokeWidth={2.5} />
                        </LinearGradient>
                        <View style={{ flex: 1 }}>
                          <Text style={[{
                            fontSize: 9, color: "#94A3B8",
                            letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 3,
                          }, styleMedium]}>
                            {t("delivery_note")}
                          </Text>
                          <Text style={[{
                            fontSize: 13, color: "#475569", fontStyle: "italic", lineHeight: 20,
                          }, styleRegular]}>
                            {order.deliveryAddress.notes}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* ── Total Summary Card ── */}
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
                  style={{ padding: 24, borderRadius: 24 }}
                >
                  {/* Items subtotal */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <Text style={[{ fontSize: 14, color: "rgba(255,255,255,0.7)" }, styleRegular]}>
                      {t("items_subtotal")}
                    </Text>
                    <Text style={[{ fontSize: 16, color: "#FFFFFF" }, styleBold]}>
                      ₹{order.itemsSubtotal?.toFixed(2)}
                    </Text>
                  </View>

                  {/* Delivery charge */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <Text style={[{ fontSize: 14, color: "rgba(255,255,255,0.7)" }, styleRegular]}>
                      {t("Delivery_Charge")}
                    </Text>
                    <Text style={[{ fontSize: 16, color: "#FFFFFF" }, styleBold]}>
                      ₹{order.deliveryCharge?.toFixed(2)}
                    </Text>
                  </View>

                  {/* Divider */}
                  <View style={{
                    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)",
                    paddingTop: 18, flexDirection: "row",
                    alignItems: "center", justifyContent: "space-between",
                  }}>
                    <View>
                      <Text style={[{
                        fontSize: 11, color: "rgba(255,255,255,0.6)",
                        letterSpacing: 0.5, textTransform: "uppercase",
                      }, styleMedium]}>
                        {t("Total_Amount")}
                      </Text>
                      <Text style={[{
                        fontSize: 30, color: "#FFFFFF", marginTop: 4, letterSpacing: -0.5,
                      }, styleBold]}>
                        ₹{order.totalAmount?.toFixed(2)}
                      </Text>
                    </View>

                    <View style={{
                      width: 48, height: 48, borderRadius: 24,
                      backgroundColor: "rgba(255,255,255,0.12)",
                      borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <CreditCard size={22} color="white" strokeWidth={1.8} />
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* ── Cancel Button ── */}
              {(order.status?.toUpperCase() === "PLACED" ||
                order.status?.toUpperCase() === "READY" ||
                order.status?.toUpperCase() === "ACCEPTED") && (
                <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 20 }}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/settings/complaints",
                        params: {
                          orderId: order._id,
                          category: "ORDER_CANCELLATION",
                        },
                      })
                    }
                    disabled={isCancelling}
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                      opacity: pressed ? 0.9 : 1,
                    })}
                  >
                    <LinearGradient
                      colors={["#EF4444", "#DC2626"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        paddingVertical: 16, borderRadius: 20,
                        flexDirection: "row", alignItems: "center", justifyContent: "center",
                        ...Platform.select({
                          ios: { shadowColor: "#DC2626", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
                          android: { elevation: 6 },
                        }),
                      }}
                    >
                      {isCancelling ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <X size={20} color="white" strokeWidth={2.5} />
                          <Text style={[{
                            color: "#FFFFFF", fontSize: 16, marginLeft: 8,
                          }, styleBold]}>
                            {t("cancel_order")}
                          </Text>
                        </View>
                      )}
                    </LinearGradient>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}