import { useEffect, useRef } from "react";
import { Redirect, Tabs } from "expo-router";
import {
  CalendarDays,
  Home,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Briefcase
} from "lucide-react-native";
import { ActivityIndicator, Text, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";

import { PolicyGuard } from "../../components/policy/PolicyGuard";
import { useAuthStore } from "../../store/auth.store";
import { Role } from "../../types/user";

import { useTranslation } from "react-i18next";

export default function TabsLayout() {
  const { token, user, hydrated } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const isConfigured = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "android" || isConfigured.current) return;

    const runConfig = async () => {
      isConfigured.current = true;
      try {
        if (insets.bottom >= 30) {
          // Software menu bar enabled device - make app above the menu bar
          await NavigationBar.setPositionAsync("relative");
          await NavigationBar.setBackgroundColorAsync("#ffffff");
          await NavigationBar.setButtonStyleAsync("dark");
        } else {
          // Menubar-less device (gestures/physical buttons) - full screen
          await NavigationBar.setPositionAsync("absolute");
          await NavigationBar.setBackgroundColorAsync("#ffffff00");
          await NavigationBar.setButtonStyleAsync("dark");
        }
      } catch (err) {
        console.warn("Failed to configure navigation bar:", err);
      }
    };

    if (insets.bottom > 0) {
      runConfig();
    } else {
      const timer = setTimeout(() => {
        if (!isConfigured.current) {
          runConfig();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [insets.bottom]);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token || user?.role !== Role.USER) {
    return <Redirect href="/(auth)/login" />;
  }

  const bottomInset = Platform.OS === "android"
    ? (insets.bottom >= 30 ? 0 : insets.bottom)
    : insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <PolicyGuard>
        <Tabs
          screenOptions={{
            headerShown: false,
            headerLeft: () => null,
            tabBarShowLabel: false,
            tabBarStyle: {
              height: 70 + bottomInset,
              paddingBottom: bottomInset,
              paddingTop: 8,
              borderTopWidth: 0,
              backgroundColor: "#FFFFFF",
              shadowColor: "#1E3A8A",
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 20,
            },
          }}
        >
          {TABS.map(({ name, label, Icon }) => (
            <Tabs.Screen
              key={name}
              name={name}
              options={{
                tabBarIcon: ({ focused }) => (
                  <View style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: 56,
                    paddingTop: 4,
                  }}>
                    <View style={{
                      backgroundColor: focused ? "#EFF6FF" : "transparent",
                      borderRadius: 16,
                      padding: 8,
                      marginBottom: 2,
                    }}>
                      <Icon
                        size={22}
                        strokeWidth={focused ? 2.6 : 1.8}
                        color={focused ? "#2563EB" : "#94A3B8"}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        fontSize: 10,
                        fontWeight: focused ? "700" : "500",
                        color: focused ? "#2563EB" : "#94A3B8",
                        letterSpacing: 0.3,
                        marginTop: 1,
                      }}
                    >
                      {t(label)}
                    </Text>
                    {focused && (
                      <View style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "#2563EB",
                        marginTop: 3,
                      }} />
                    )}
                  </View>
                ),
              }}
            />
          ))}
        </Tabs>
      </PolicyGuard>
    </View>
  );
}

const TABS = [
  { name: "home", label: "home", Icon: Home },
  // { name: "products", label: "Products", Icon: ShoppingBag },
  { name: "market", label: "Market", Icon: ShoppingBag},
  { name: "cart", label: "cart", Icon: ShoppingCart },
  { name: "orders", label: "orders", Icon: Receipt },
  { name: "booking", label: "Bookings", Icon: CalendarDays },
  // { name: "services", label: "services", Icon: Briefcase,},
] as const;
