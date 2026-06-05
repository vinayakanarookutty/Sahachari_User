// /home/user/Desktop/Sahachari-Customer/src/app/(auth)/login.tsx

import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {t}= useTranslation();

  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  // if already logged in, skip login screen
  useEffect(() => {
    if (hydrated && token) {
      router.replace("/(tabs)/home");
    }
  }, [hydrated, token]);

  const submit = () => {
    setErrorMsg(null);

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.replace("/(tabs)/home");
        },
        onError: (err: any) => {
          setErrorMsg(
            err?.response?.data?.message ||
            err?.message ||
            "Invalid credentials or server error"
          );
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1" 
      >      
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      > */}
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={40}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Premium Header */}
          <View className="items-center mb-12">
            {/* logo */}
            <Image
              source={require("../../../assets/sahachari.jpeg")}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
            {/* Accent Line */}
            <View className="w-16 h-1 bg-blue-600 mb-10 rounded-full" />

            {/* Title */}
            <Text className="text-[42px] font-bold text-gray-900 mb-3 tracking-tight">
              {t("welcome_back")}
            </Text>

            {/* Subtitle */}
            <Text className="text-base text-gray-500 text-center font-normal">
              {t("sign_in_to_access_account")}
            </Text>
          </View>

          {/* Form Section */}
          <View className="mb-6">
            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                {t("email")}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={(v: string) => {
                  setEmail(v);
                  setErrorMsg(null);
                }}
              />
            </View>

            {/* Password Input */}
            {/* <View className="mb-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-semibold text-gray-700 ml-1">
                  Password
                </Text>

              </View>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={(v: string) => {
                  setPassword(v);
                  setErrorMsg(null);
                }}
              />
            </View>
          </View> */}
            <View className="mb-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-semibold text-gray-700 ml-1">
                  {t("password")}
                </Text>
              </View>

              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-12 text-base text-gray-900"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(v: string) => {
                    setPassword(v);
                    setErrorMsg(null);
                  }}
                />

                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  {showPassword ? (
                    <EyeOff size={22} color="#6B7280" />
                  ) : (
                    <Eye size={22} color="#6B7280" />
                  )}
                </Pressable>
              </View>
            </View>
            {/* Error Message */}
            {errorMsg && (
              <View className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <Text className="text-red-600 text-sm font-medium">
                  {errorMsg}
                </Text>
              </View>
            )}

            {/* Login Button */}
            <View className="mb-8">
              <TouchableOpacity
                className={`rounded-xl py-4 items-center justify-center ${isLoading ? 'bg-blue-400' : 'bg-blue-600'
                  }`}
                onPress={submit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="flex-row items-center mb-8">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="px-4 text-sm text-gray-400 font-medium">
                or
              </Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Sign Up Section */}
            <View className="items-center">
              <View className="flex-row items-center">
                <Text className="text-gray-600 text-base">
                  Do not have an account?{" "}
                </Text>
                <Pressable
                  onPress={() => router.push("/(auth)/register")}
                  className="active:opacity-70"
                >
                  <Text className="text-blue-600 font-semibold text-base">
                    Sign Up
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Bottom Spacing */}
            <View className="h-8" />
          </View>
          {/* </ScrollView>
      </KeyboardAvoidingView> */}
      </View>
      </KeyboardAwareScrollView>
    </View >
  );
}