// components/orders/OrderCard.tsx
import { LinearGradient } from "expo-linear-gradient";
import {
  Calendar,
  ChevronRight,
  CreditCard,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Gift,
  XCircle,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Image, Platform, Text, View } from "react-native";
import { getImageUrl } from "@/utils/image";

// ─── Status Utility Maps ───
const STATUS_CONFIG: Record<string, {
  bgColors: [string, string];
  textColor: string;
  iconColor: string;
  icon: any;
  label: string;
}> = {
  PLACED: {
    bgColors: ["#FEF3C7", "#FDE68A"],
    textColor: "#92400E",
    iconColor: "#D97706",
    icon: Clock,
    label: "Placed",
  },
  CONFIRMED: {
    bgColors: ["#DBEAFE", "#BFDBFE"],
    textColor: "#1E40AF",
    iconColor: "#2563EB",
    icon: CheckCircle,
    label: "Confirmed",
  },
  SHIPPED: {
    bgColors: ["#EDE9FE", "#DDD6FE"],
    textColor: "#5B21B6",
    iconColor: "#7C3AED",
    icon: Truck,
    label: "Shipped",
  },
  DELIVERED: {
    bgColors: ["#D1FAE5", "#A7F3D0"],
    textColor: "#065F46",
    iconColor: "#059669",
    icon: Gift,
    label: "Delivered",
  },
  CANCELLED: {
    bgColors: ["#FEE2E2", "#FECACA"],
    textColor: "#991B1B",
    iconColor: "#DC2626",
    icon: XCircle,
    label: "Cancelled",
  },
};

const DEFAULT_STATUS_CONFIG = {
  bgColors: ["#F1F5F9", "#E2E8F0"] as [string, string],
  textColor: "#475569",
  iconColor: "#64748B",
  icon: Package,
  label: "Unknown",
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PLACED: "bg-yellow-100",
    CONFIRMED: "bg-blue-100",
    SHIPPED: "bg-purple-100",
    DELIVERED: "bg-green-100",
    CANCELLED: "bg-red-100",
  };
  return colors[status] || "bg-gray-100";
};

export function OrderCard({ item, onPress }: any) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const { t } = useTranslation();

  const config = STATUS_CONFIG[item.status] || DEFAULT_STATUS_CONFIG;
  const StatusIcon = config.icon;

  return (
    <View style={{
      backgroundColor: "#FFFFFF",
      borderRadius: 24,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#F1F5F9",
      ...Platform.select({
        ios: {
          shadowColor: "#1D4ED8",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
        },
        android: { elevation: 5 },
      }),
    }}>

      {/* ── Header Section with subtle gradient ── */}
      <LinearGradient
        colors={["#F8FAFC", "#F1F5F9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 18, paddingBottom: 14 }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{
              fontSize: 10, fontWeight: "600", color: "#94A3B8",
              letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4,
            }}>
              {t("order_id")}
            </Text>
            <Text style={{
              fontSize: 16, fontWeight: "800", color: "#0F172A",
              letterSpacing: -0.2,
            }} numberOfLines={1}>
              #{item.checkoutId}
            </Text>
          </View>

          {/* Status Badge with Gradient */}
          <LinearGradient
            colors={config.bgColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
              flexDirection: "row", alignItems: "center",
              borderWidth: 1, borderColor: "rgba(255,255,255,0.6)",
              ...Platform.select({
                ios: { shadowColor: config.iconColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
                android: { elevation: 2 },
              }),
            }}
          >
            <StatusIcon size={13} color={config.iconColor} strokeWidth={2.5} style={{ marginRight: 5 }} />
            <Text style={{
              fontWeight: "700", fontSize: 11, color: config.textColor,
              letterSpacing: 0.3, textTransform: "uppercase",
            }}>
              {item.status}
            </Text>
          </LinearGradient>
        </View>
      </LinearGradient>

      {/* ── Items Section ── */}
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
        {/* Items count header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <LinearGradient
            colors={["#D1FAE5", "#A7F3D0"]}
            style={{
              width: 32, height: 32, borderRadius: 10,
              alignItems: "center", justifyContent: "center", marginRight: 10,
            }}
          >
            <Package size={15} color="#059669" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={{
            fontSize: 14, fontWeight: "700", color: "#1E293B", letterSpacing: -0.1,
          }}>
            {item.items?.length} {item.items?.length === 1 ? "Item" : "Items"}
          </Text>
        </View>

        {/* Product rows */}
        {item.items?.slice(0, 2).map((orderItem: any, idx: number) => (
          <View key={idx} style={{
            flexDirection: "row", alignItems: "center", marginBottom: 10,
            backgroundColor: "#F8FAFC", borderRadius: 16, padding: 10,
            borderWidth: 1, borderColor: "#F1F5F9",
          }}>
            <Image
              source={{ uri: getImageUrl(orderItem.productId?.images?.[0]) }}
              style={{
                width: 48, height: 48, borderRadius: 14,
                backgroundColor: "#E2E8F0",
              }}
              resizeMode="cover"
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{
                fontSize: 13, fontWeight: "600", color: "#1E293B",
                letterSpacing: -0.1,
              }} numberOfLines={1}>
                {orderItem.productId?.name}
              </Text>
              <Text style={{
                fontSize: 11, color: "#94A3B8", marginTop: 2,
                fontWeight: "500",
              }}>
                {t("qty")}: {orderItem.quantity}
              </Text>
            </View>
            <Text style={{
              fontSize: 14, fontWeight: "700", color: "#2563EB",
              letterSpacing: -0.2,
            }}>
              ₹{(orderItem.quantity * orderItem.price).toFixed(2)}
            </Text>
          </View>
        ))}

        {item.items?.length > 2 && (
          <View style={{ alignItems: "center", marginTop: 2, marginBottom: 4 }}>
            <View style={{
              backgroundColor: "#EFF6FF", borderRadius: 12,
              paddingHorizontal: 12, paddingVertical: 5,
              flexDirection: "row", alignItems: "center",
            }}>
              <Text style={{
                fontSize: 11, fontWeight: "600", color: "#3B82F6",
                letterSpacing: 0.2,
              }}>
                +{item.items.length - 2} {t("more_items")}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Footer — Amount + Date + Arrow ── */}
      <View style={{
        borderTopWidth: 1, borderTopColor: "#F1F5F9",
        paddingHorizontal: 18, paddingVertical: 14,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <LinearGradient
              colors={["#DBEAFE", "#BFDBFE"]}
              style={{
                width: 32, height: 32, borderRadius: 10,
                alignItems: "center", justifyContent: "center", marginRight: 10,
              }}
            >
              <CreditCard size={14} color="#2563EB" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "500" }}>
              {t("Total_Amount")}
            </Text>
          </View>
          <Text style={{
            fontSize: 20, fontWeight: "800", color: "#1D4ED8",
            letterSpacing: -0.5,
          }}>
            ₹{item.totalAmount?.toFixed(2)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <LinearGradient
              colors={["#EDE9FE", "#DDD6FE"]}
              style={{
                width: 32, height: 32, borderRadius: 10,
                alignItems: "center", justifyContent: "center", marginRight: 10,
              }}
            >
              <Calendar size={14} color="#7C3AED" strokeWidth={2.5} />
            </LinearGradient>
            <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "500" }}>
              {t("order_date")}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{
              fontSize: 13, fontWeight: "600", color: "#334155",
            }}>
              {formatDate(item.createdAt)}
            </Text>
            <View style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: "#F1F5F9", alignItems: "center",
              justifyContent: "center", marginLeft: 10,
            }}>
              <ChevronRight size={14} color="#94A3B8" strokeWidth={2.5} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}