import { router } from "expo-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
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
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApi, resetPasswordApi } from "../../services/auth.api";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (emailVal: string) => {
      return forgotPasswordApi(emailVal);
    },
    onSuccess: () => {
      showAlert(t("successTitle") || "Success", t("otpSentSuccess") || "OTP has been sent to your email successfully");
      setStep(2);
      setErrorMsg(null);
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || error?.message || "Failed to send OTP. Please try again.";
      setErrorMsg(errMsg);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (payload: { email: string; otp: string; newPass: string }) => {
      return resetPasswordApi(payload);
    },
    onSuccess: () => {
      showAlert(t("successTitle") || "Success", t("passwordResetSuccess") || "Password reset successfully!");
      router.replace("/(auth)/login");
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || error?.message || "Failed to reset password. Please try again.";
      setErrorMsg(errMsg);
    },
  });

  const handleSendOtp = () => {
    setErrorMsg(null);
    if (!email.trim()) {
      setErrorMsg(t("please_enter_email") || "Please enter your email");
      return;
    }
    forgotPasswordMutation.mutate(email.trim());
  };

  const handleResetPassword = () => {
    setErrorMsg(null);
    if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrorMsg(t("please_fill_all_fields") || "Please fill in all fields");
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
    <View className="flex-1 bg-white">
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={40}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => {
              if (step === 2) {
                setStep(1);
                setErrorMsg(null);
              } else {
                router.back();
              }
            }}
            className="absolute left-6 top-12 p-2 rounded-full bg-gray-50 border border-gray-100"
            disabled={isPending}
          >
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>

          {/* Header */}
          <View className="items-center mb-12 mt-12">
            <Text className="text-[36px] font-bold text-gray-900 mb-3 tracking-tight text-center">
              {step === 1 ? (t("forgotPasswordTitle") || "Forgot Password") : "Reset Password"}
            </Text>
            <Text className="text-base text-gray-500 text-center font-normal px-4">
              {step === 1 
                ? (t("enterEmailSubtitle") || "Enter your email to receive an OTP") 
                : `Enter the code we sent to ${email}`}
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            {step === 1 ? (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  {t("email")}
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
                  placeholder={t("enter_your_email")}
                  placeholderTextColor="#9CA3AF"
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
            ) : (
              <>
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    {t("otpPlaceholder") || "OTP (6-digit)"}
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#9CA3AF"
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

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    {t("newPasswordPlaceholder") || "New Password"}
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pr-12 text-base text-gray-900"
                      placeholder="Enter new password"
                      placeholderTextColor="#9CA3AF"
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

                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Confirm New Password
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
                    placeholder="Confirm new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={(v) => {
                      setConfirmPassword(v);
                      setErrorMsg(null);
                    }}
                    editable={!isPending}
                  />
                </View>
              </>
            )}

            {/* Error Message */}
            {errorMsg && (
              <View className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <Text className="text-red-600 text-sm font-medium">
                  {errorMsg}
                </Text>
              </View>
            )}

            {/* Button */}
            <View className="mb-8">
              <TouchableOpacity
                className={`rounded-xl py-4 items-center justify-center ${isPending ? 'bg-blue-400' : 'bg-blue-600'}`}
                onPress={step === 1 ? handleSendOtp : handleResetPassword}
                disabled={isPending}
                activeOpacity={0.8}
              >
                {isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    {step === 1 ? (t("sendOtpBtn") || "Send OTP") : (t("resetPasswordBtn") || "Reset Password")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Back to Login */}
            <View className="items-center">
              <Pressable
                onPress={() => router.replace("/(auth)/login")}
                disabled={isPending}
                className="active:opacity-70"
              >
                <Text className="text-blue-600 font-semibold text-base">
                  {t("backToLogin") || "Back to Login"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
