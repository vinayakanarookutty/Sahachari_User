import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { WifiOff, Wifi, RefreshCw } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useAppFonts } from "../hooks/useAppFonts";

export function NetworkStatusNotifier() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { styleBold, styleRegular, styleMedium } = useAppFonts();

  const [isOffline, setIsOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const wasOfflineRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animated slide from top
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const showNotification = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        bounciness: 6,
        speed: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideNotification = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback?.();
    });
  };

  useEffect(() => {
    const handleNetworkChange = (state: NetInfoState) => {
      // On Web, NetInfo's reachability test (fetch) gets blocked by CORS, causing isInternetReachable to falsely report false.
      // Therefore, on Web we rely on navigator.onLine and state.isConnected.
      const offline =
        Platform.OS === "web"
          ? state.isConnected === false || (typeof navigator !== "undefined" && !navigator.onLine)
          : state.isConnected === false ||
            (state.isConnected === true && state.isInternetReachable === false);

      if (offline) {
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
        wasOfflineRef.current = true;
        setIsOffline(true);
        setShowRestored(false);
        showNotification();
      } else {
        if (wasOfflineRef.current) {
          // Came back online after being offline
          wasOfflineRef.current = false;
          setIsOffline(false);
          setShowRestored(true);
          showNotification();

          // Auto-hide restored banner after 3 seconds
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          hideTimerRef.current = setTimeout(() => {
            hideNotification(() => {
              setShowRestored(false);
            });
          }, 3000);
        } else {
          setIsOffline(false);
          setShowRestored(false);
        }
      }
    };

    // Initial check
    NetInfo.fetch().then(handleNetworkChange);

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    // On Web, also listen to native browser online/offline events for instant response
    let handleWebOnline: (() => void) | null = null;
    let handleWebOffline: (() => void) | null = null;

    if (Platform.OS === "web" && typeof window !== "undefined") {
      handleWebOnline = () => {
        handleNetworkChange({
          isConnected: true,
          isInternetReachable: true,
          type: "other" as any,
          details: null as any,
        });
      };
      handleWebOffline = () => {
        handleNetworkChange({
          isConnected: false,
          isInternetReachable: false,
          type: "none" as any,
          details: null as any,
        });
      };
      window.addEventListener("online", handleWebOnline);
      window.addEventListener("offline", handleWebOffline);
    }

    return () => {
      unsubscribe();
      if (Platform.OS === "web" && typeof window !== "undefined") {
        if (handleWebOnline) window.removeEventListener("online", handleWebOnline);
        if (handleWebOffline) window.removeEventListener("offline", handleWebOffline);
      }
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleRetry = async () => {
    if (isChecking) return;
    setIsChecking(true);
    try {
      if (Platform.OS === "web") {
        const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
        if (isOnline) {
          wasOfflineRef.current = false;
          setIsOffline(false);
          setShowRestored(true);
          showNotification();

          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          hideTimerRef.current = setTimeout(() => {
            hideNotification(() => {
              setShowRestored(false);
            });
          }, 3000);
        }
      } else {
        const state = await NetInfo.fetch();
        const offline =
          state.isConnected === false ||
          (state.isConnected === true && state.isInternetReachable === false);

        if (!offline) {
          wasOfflineRef.current = false;
          setIsOffline(false);
          setShowRestored(true);
          showNotification();

          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          hideTimerRef.current = setTimeout(() => {
            hideNotification(() => {
              setShowRestored(false);
            });
          }, 3000);
        }
      }
    } catch (e) {
      console.log("NetInfo check failed:", e);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOffline && !showRestored) {
    return null;
  }

  const topPosition = Platform.OS === "ios" ? Math.max(insets.top, 20) : Math.max(insets.top + 6, 16);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: topPosition,
        left: 14,
        right: 14,
        zIndex: 99999,
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <View
        style={{
          backgroundColor: isOffline ? "#DC2626" : "#059669",
          borderRadius: 18,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          shadowColor: isOffline ? "#DC2626" : "#059669",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 12,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            {isOffline ? (
              <WifiOff size={20} color="#FFFFFF" strokeWidth={2.4} />
            ) : (
              <Wifi size={20} color="#FFFFFF" strokeWidth={2.4} />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={[
                {
                  color: "#FFFFFF",
                  fontSize: 14,
                  letterSpacing: -0.2,
                },
                styleBold,
              ]}
              numberOfLines={1}
            >
              {isOffline
                ? t("no_internet_title", { defaultValue: "No Internet Connection" })
                : t("back_online_title", { defaultValue: "Back Online" })}
            </Text>
            <Text
              style={[
                {
                  color: "rgba(255,255,255,0.88)",
                  fontSize: 11.5,
                  marginTop: 1,
                },
                styleRegular,
              ]}
              numberOfLines={1}
            >
              {isOffline
                ? t("no_internet_msg", { defaultValue: "Please check your network settings" })
                : t("back_online_msg", { defaultValue: "Your connection has been restored" })}
            </Text>
          </View>
        </View>

        {isOffline && (
          <Pressable
            onPress={handleRetry}
            disabled={isChecking}
            style={({ pressed }) => ({
              backgroundColor: "rgba(255,255,255,0.22)",
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              opacity: pressed ? 0.75 : 1,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            })}
          >
            {isChecking ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <RefreshCw size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                <Text style={[{ color: "#FFFFFF", fontSize: 12 }, styleMedium]}>
                  {t("retry", { defaultValue: "Retry" })}
                </Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
