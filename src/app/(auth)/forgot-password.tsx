import { router } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, KeyRound, AlertCircle, Sparkles, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApi, resetPasswordApi } from "../../services/auth.api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function ForgotPassword() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (emailVal: string) => forgotPasswordApi(emailVal),
    onSuccess: () => {
      showAlert(
        t("successTitle") || "Success",
        t("otpSentSuccess") || "OTP has been sent to your email successfully"
      );
      setStep(2);
      setErrorMsg(null);
    },
    onError: (error: any) => {
      setErrorMsg(
        error?.response?.data?.message || error?.message || "Failed to send OTP. Please try again."
      );
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (payload: { email: string; otp: string; newPass: string }) =>
      resetPasswordApi(payload),
    onSuccess: () => {
      showAlert(
        t("successTitle") || "Success",
        t("passwordResetSuccess") || "Password reset successfully!"
      );
      router.replace("/(auth)/login");
    },
    onError: (error: any) => {
      setErrorMsg(
        error?.response?.data?.message || error?.message || "Failed to reset password. Please try again."
      );
    },
  });

  const handleSendOtp = () => {
    setErrorMsg(null);
    if (!email.trim()) {
      setErrorMsg(t("please_enter_email") || "Please enter your email address");
      return;
    }
    forgotPasswordMutation.mutate(email.trim());
  };

  const handleResetPassword = () => {
    setErrorMsg(null);
    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrorMsg(t("Please fill in all required fields") || "Please fill in all required fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(t("passwords_dont_match") || "Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg(t("password_too_short") || "Password must be at least 6 characters long");
      return;
    }
    resetPasswordMutation.mutate({
      email: email.trim(),
      otp: otp.trim(),
      newPass: newPassword,
    });
  };

  const isPending = forgotPasswordMutation.isPending || resetPasswordMutation.isPending;

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
              paddingTop: Math.max(insets.top, 16) + 12,
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

            {/* Top Bar */}
            <View className="flex-row items-center justify-between mb-3">
              <Pressable
                onPress={() => {
                  if (step === 2) {
                    setStep(1);
                    setErrorMsg(null);
                  } else {
                    router.back();
                  }
                }}
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center active:bg-white/30"
                disabled={isPending}
              >
                <ArrowLeft size={20} color="#FFFFFF" />
              </Pressable>
              <View className="flex-row items-center bg-white/20 px-3.5 py-1.5 rounded-full">
                {step === 1 ? (
                  <Sparkles size={13} color="#FDE047" />
                ) : (
                  <ShieldCheck size={13} color="#34D399" />
                )}
                <Text className="text-xs font-semibold text-white ml-1.5">
                  {step === 1 ? "Account Recovery" : "Step 2 of 2"}
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
                {step === 1
                  ? t("forgotPasswordTitle") || "Forgot Password"
                  : "Reset Password"}
              </Text>
              <Text className="text-[13px] text-blue-100 text-center mt-1.5 max-w-[280px] leading-5">
                {step === 1
                  ? t("enterEmailSubtitle") || "Enter your registered email to receive a verification code"
                  : `Enter the OTP sent to ${email}`}
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
              {step === 1 ? (
                /* Step 1: Email */
                <View className="mb-2">
                  <Text className="text-[11px] font-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                    {t("email") || "Registered Email"}
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
                      onChangeText={(v) => {
                        setEmail(v);
                        setErrorMsg(null);
                      }}
                      editable={!isPending}
                    />
                  </View>
                </View>
              ) : (
                /* Step 2: OTP + Passwords */
                <>
                  <View className="mb-4">
                    <Text className="text-[11px] font-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                      {t("otpPlaceholder") || "6-Digit OTP Code"}
                    </Text>
                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5">
                      <KeyRound size={17} color="#94A3B8" />
                      <TextInput
                        className="flex-1 text-[15px] text-gray-900 ml-3 tracking-[6px]"
                        placeholder="0 0 0 0 0 0"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        maxLength={6}
                        value={otp}
                        onChangeText={(v) => {
                          setOtp(v);
                          setErrorMsg(null);
                        }}
                        editable={!isPending}
                      />
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="text-[11px] font-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                      {t("newPasswordPlaceholder") || "New Password"}
                    </Text>
                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5">
                      <Lock size={17} color="#94A3B8" />
                      <TextInput
                        className="flex-1 text-[15px] text-gray-900 ml-3 pr-2"
                        placeholder="Enter new password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showPassword}
                        value={newPassword}
                        onChangeText={(v) => {
                          setNewPassword(v);
                          setErrorMsg(null);
                        }}
                        editable={!isPending}
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

                  <View className="mb-2">
                    <Text className="text-[11px] font-bold text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                      Confirm Password
                    </Text>
                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5">
                      <Lock size={17} color="#94A3B8" />
                      <TextInput
                        className="flex-1 text-[15px] text-gray-900 ml-3"
                        placeholder="Confirm new password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={(v) => {
                          setConfirmPassword(v);
                          setErrorMsg(null);
                        }}
                        editable={!isPending}
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <View className="bg-red-50 border border-red-100 rounded-2xl p-3 flex-row items-center my-3">
                  <AlertCircle size={16} color="#EF4444" />
                  <Text className="text-red-600 text-xs font-semibold ml-2 flex-1">
                    {errorMsg}
                  </Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                className={`rounded-2xl py-4 items-center justify-center mt-4 ${
                  isPending ? "bg-blue-400" : "bg-blue-600"
                }`}
                style={{
                  shadowColor: "#2563EB",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 4,
                }}
                onPress={step === 1 ? handleSendOtp : handleResetPassword}
                disabled={isPending}
                activeOpacity={0.85}
              >
                {isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-[15px] font-bold tracking-wide">
                    {step === 1
                      ? t("sendOtpBtn") || "Send OTP Code"
                      : t("resetPasswordBtn") || "Reset Password"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Back to Login Link */}
            <View className="items-center mt-6 mb-4">
              <Pressable
                onPress={() => router.replace("/(auth)/login")}
                disabled={isPending}
                className="active:opacity-70 py-2"
              >
                <Text className="text-gray-500 text-sm">
                  Remember your password?{" "}
                  <Text className="text-blue-600 font-bold">Log In</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
