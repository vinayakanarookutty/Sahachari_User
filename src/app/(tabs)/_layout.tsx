import { Redirect, Tabs } from "expo-router";
import {
  Home,
  Receipt,
  ShoppingBag,
  ShoppingCart
} from "lucide-react-native";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PolicyGuard } from "../../components/policy/PolicyGuard";
import { useAuthStore } from "../../store/auth.store";
import { Role } from "../../types/user";

import { useTranslation } from "react-i18next";

export default function TabsLayout() {
  const { token, user, hydrated } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

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

  return (
    <View style={{ flex: 1 }}>
      <PolicyGuard>
        <Tabs
          screenOptions={{
            headerShown: false,
            headerLeft: () => null,
            tabBarShowLabel: false,
            tabBarStyle: {
              // height: 64 + Math.min(insets.bottom, 30), // 👈 closer to nav bar
              height: 60 + insets.bottom, //
              paddingBottom: insets.bottom,
              // paddingBottom: Math.min(insets.bottom, 30),
              paddingTop: 6,
              borderTopWidth: 1,
              borderTopColor: "#e5e7eb",
              backgroundColor: "#fff",
              elevation: 8,
            },
          }}
        >
          {TABS.map(({ name, label, Icon }) => (
            <Tabs.Screen
              key={name}
              name={name}
              options={{
                tabBarIcon: ({ focused }) => (
                  <View className="items-center justify-center w-[64px] mt-2">
                    <Icon
                      size={24}
                      strokeWidth={focused ? 2.6 : 2}
                      color={focused ? "#2563eb" : "#6b7280"}
                    />
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className={`text-[11px] mt-1 ${focused ? "text-blue-600 font-semibold" : "text-gray-500"
                        }`}
                    >
                       {t(label)}
                    </Text>
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
  { name: "products", label: "services", Icon: ShoppingBag },
  { name: "cart", label: "cart", Icon: ShoppingCart },
  { name: "orders", label: "orders", Icon: Receipt },
  // { name: "services", label: "services", Icon: Wrench },
] as const;
