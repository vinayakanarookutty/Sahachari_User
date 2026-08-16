import { LinearGradient } from "expo-linear-gradient";
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  Package,
  RefreshCw,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Image, Platform, Text, View } from "react-native";
import { getImageUrl } from "../../utils/image";
import { useAppFonts } from "../../hooks/useAppFonts";

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

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PLACED: "bg-yellow-100",
    ACCEPTED: "bg-blue-100",
    IN_PROGRESS: "bg-purple-100",
    COMPLETED: "bg-green-100",
    RETURNED: "bg-indigo-100",
    CANCELLED: "bg-red-100",
    REJECTED: "bg-red-100",
  };
  return colors[status] || "bg-gray-100";
};

export function BookingCard({ item, onPress }: any) {
  const { t } = useTranslation();
  const { styleRegular, styleBold, styleMedium } = useAppFonts();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isRental = item.bookingType === "RENTAL";
  const itemName = item.item?.itemName || "Booking Item";
  const imageUri = item.item?.images?.[0] ? getImageUrl(item.item.images[0]) : null;

  const statusConfig = STATUS_CONFIG[item.status] || DEFAULT_STATUS_CONFIG;
  const StatusIcon = statusConfig.icon;

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
            {/* Booking Type Pill */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <LinearGradient
                colors={isRental ? ["#EDE9FE", "#DDD6FE"] : ["#DBEAFE", "#BFDBFE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
                  borderWidth: 1, borderColor: "rgba(255,255,255,0.6)",
                }}
              >
                <Text style={[{
                  fontSize: 10,
                  color: isRental ? "#5B21B6" : "#1E40AF",
                  letterSpacing: 0.8, textTransform: "uppercase",
                }, styleBold]}>
                  {isRental ? (t("rental") || "Rental") : (t("service") || "Service")}
                </Text>
              </LinearGradient>
            </View>

            {/* Prominent Item Name */}
            <Text style={[{
              fontSize: 16, color: "#0F172A",
              letterSpacing: -0.2,
            }, styleBold]} numberOfLines={2}>
              {itemName}
            </Text>
          </View>

          {/* Status Badge with Gradient */}
          <LinearGradient
            colors={statusConfig.bgColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
              flexDirection: "row", alignItems: "center",
              borderWidth: 1, borderColor: "rgba(255,255,255,0.6)",
              ...Platform.select({
                ios: { shadowColor: statusConfig.iconColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
                android: { elevation: 2 },
              }),
            }}
          >
            <StatusIcon size={13} color={statusConfig.iconColor} strokeWidth={2.5} style={{ marginRight: 5 }} />
            <Text style={[{
              fontSize: 11, color: statusConfig.textColor,
              letterSpacing: 0.3, textTransform: "uppercase",
            }, styleBold]}>
              {item.status}
            </Text>
          </LinearGradient>
        </View>
      </LinearGradient>

      {/* ── Body Section ── */}
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
        <View style={{
          flexDirection: "row", alignItems: "center",
          backgroundColor: "#F8FAFC", borderRadius: 16, padding: 10,
          borderWidth: 1, borderColor: "#F1F5F9",
        }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{
                width: 52, height: 52, borderRadius: 14,
                backgroundColor: "#E2E8F0",
              }}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={isRental ? ["#EDE9FE", "#DDD6FE"] : ["#DBEAFE", "#BFDBFE"]}
              style={{
                width: 52, height: 52, borderRadius: 14,
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Package size={22} color={isRental ? "#7C3AED" : "#2563EB"} strokeWidth={2} />
            </LinearGradient>
          )}

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[{
              fontSize: 14, color: "#1E293B",
              letterSpacing: -0.1,
            }, styleBold]} numberOfLines={1}>
              {itemName}
            </Text>
            {item.item?.category && (
              <Text style={[{
                fontSize: 11, color: "#94A3B8", marginTop: 2,
              }, styleRegular]}>
                {t("category") || "Category"}: {item.item.category}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* ── Footer Info ── */}
      <View style={{
        borderTopWidth: 1, borderTopColor: "#F1F5F9",
        paddingHorizontal: 18, paddingVertical: 14, marginTop: 8,
      }}>
        {/* Total Amount */}
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
            <Text style={[{ fontSize: 13, color: "#64748B" }, styleMedium]}>
              {t("Total_Amount") || "Total Amount"}
            </Text>
          </View>
          <Text style={[{
            fontSize: 20, color: "#1D4ED8",
            letterSpacing: -0.5,
          }, styleBold]}>
            ₹{item.totalAmount?.toFixed ? item.totalAmount.toFixed(2) : item.totalAmount}
          </Text>
        </View>

        {/* Date Row */}
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
            <Text style={[{ fontSize: 13, color: "#64748B" }, styleMedium]}>
              {isRental ? (t("rental_period") || "Rental Period") : (t("service_date") || "Service Date")}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[{
              fontSize: 13, color: "#334155",
            }, styleBold]}>
              {item.startDate
                ? isRental && item.endDate
                  ? `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`
                  : formatDate(item.startDate)
                : formatDate(item.createdAt)}
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