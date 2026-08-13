import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { router } from "expo-router";
import { Eye, EyeOff, Mail, Lock, AlertCircle, LogIn, Sparkles, ChevronRight } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Login() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && token) {
      router.replace("/(tabs)/home");
    }
  }, [hydrated, token]);

  const submit = () => {
    if (!email || !password) {
      setErrorMsg(t("please_fill_all_fields") || "Please fill all required fields");
      return;
    }
    setErrorMsg(null);
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => router.replace("/(tabs)/home"),
        onError: (err: any) => {
          const msg = err?.response?.data?.message;
          if (Array.isArray(msg)) {
            setErrorMsg(msg.join(", "));
          } else if (typeof msg === "string") {
            setErrorMsg(msg);
          } else {
            setErrorMsg(err?.message || "Invalid credentials or server error");
          }
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Blue Header Section */}
          <View
            className="bg-blue-600 pb-20 px-6 rounded-b-[40px] relative overflow-hidden"
            style={{
              paddingTop: Math.max(insets.top, 16) + 16,
              shadowColor: "#1E3A8A",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            {/* Decorative circles */}
            <View className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/8" />
            <View className="absolute top-24 -left-14 w-36 h-36 rounded-full bg-white/8" />
            <View className="absolute bottom-4 right-8 w-20 h-20 rounded-full bg-blue-400/25" />

            {/* Badge */}
            <View className="flex-row items-center justify-center mb-3">
              <View className="flex-row items-center bg-white/20 px-3.5 py-1.5 rounded-full">
                <Sparkles size={13} color="#FDE047" />
                <Text className="text-xs font-semibold text-white ml-1.5">
                  Welcome Back
                </Text>
              </View>
            </View>

            {/* Logo & Title */}
            <View className="items-center mt-1">
              <View
                className="w-[72px] h-[72px] bg-white rounded-2xl p-2 mb-4 items-center justify-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                <Image
                  source={require("../../../assets/sahachari.jpeg")}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              </View>
              <Text className="text-[26px] font-bold text-white tracking-tight text-center">
                {t("welcome_back") || "Welcome Back"}
              </Text>
              <Text className="text-[13px] text-blue-100 text-center mt-1.5 max-w-[260px] leading-5">
                {t("sign_in_to_access_account") || "Sign in to your Sahachari account"}
              </Text>
            </View>
          </View>

          {/* White Form Card (overlaps blue header) */}
          <View className="w-full max-w-md self-center px-5 -mt-10">
            <View
              className="bg-white rounded-3xl p-6 border border-gray-100"
              style={{
                shadowColor: "#1E3A8A",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.08,
                shadowRadius: 20,
                elevation: 6,
              }}
            >
              {/* Email Field */}
              <View className="mb-4">
                <Text className="text-[11px] font-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                  {t("email") || "Email Address"}
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5">
                  <Mail size={17} color="#94A3B8" />
                  <TextInput
                    className="flex-1 text-[15px] text-gray-900 ml-3"
                    placeholder={t("enter_your_email") || "Enter your email"}
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(v: string) => {
                      setEmail(v);
                      setErrorMsg(null);
                    }}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View className="mb-3">
                <Text className="text-[11px] font-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                  {t("password") || "Password"}
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5">
                  <Lock size={17} color="#94A3B8" />
                  <TextInput
                    className="flex-1 text-[15px] text-gray-900 ml-3 pr-2"
                    placeholder={t("enter_your_password") || "Enter your password"}
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(v: string) => {
                      setPassword(v);
                      setErrorMsg(null);
                    }}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showPassword ? (
                      <EyeOff size={17} color="#94A3B8" />
                    ) : (
                      <Eye size={17} color="#94A3B8" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Forgot Password */}
              <View className="items-end mb-5">
                <Pressable
                  onPress={() => router.push("/(auth)/forgot-password" as any)}
                  className="active:opacity-60 py-1"
                >
                  <Text className="text-blue-600 font-bold text-xs">
                    {t("forgot_password") || "Forgot Password?"}
                  </Text>
                </Pressable>
              </View>

              {/* Error Alert */}
              {errorMsg && (
                <View className="bg-red-50 border border-red-100 rounded-2xl p-3 flex-row items-center mb-4">
                  <AlertCircle size={16} color="#EF4444" />
                  <Text className="text-red-600 text-xs font-semibold ml-2 flex-1">
                    {errorMsg}
                  </Text>
                </View>
              )}

              {/* Sign In Button */}
              <TouchableOpacity
                className={`rounded-2xl py-4 items-center justify-center flex-row ${
                  isLoading ? "bg-blue-400" : "bg-blue-600"
                }`}
                style={{
                  shadowColor: "#2563EB",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 4,
                }}
                onPress={submit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <LogIn size={17} color="#FFFFFF" />
                    <Text className="text-white text-[15px] font-bold tracking-wide ml-2">
                      {t("sign_in") || "Sign In"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="items-center mt-6 mb-4">
              <Pressable
                onPress={() => router.push("/(auth)/register")}
                className="flex-row items-center active:opacity-70 py-2"
              >
                <Text className="text-gray-500 text-sm">
                  {t("do_not_have_account") || "Don't have an account?"}{" "}
                </Text>
                <Text className="text-blue-600 font-bold text-sm">
                  {t("sign_up") || "Sign Up"}
                </Text>
                <ChevronRight size={14} color="#2563EB" />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}