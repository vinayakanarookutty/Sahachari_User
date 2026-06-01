import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";

import { useRegister } from "../../hooks/useAuth";
import { Role } from "../../types/user";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Eye, EyeOff } from "lucide-react-native";

export default function Register() {
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    pincodesInput: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = () => {
    if (
      !form.name ||
      !form.email ||
      !form.address ||
      !form.password ||
      !form.pincodesInput
    ) {
      setErrorMsg("Please fill all fields");
      return;
    }

    const serviceablePincodes = form.pincodesInput
      .split(",")
      .map((p) => p.trim())
      .filter((p) => /^\d{6}$/.test(p));

    if (serviceablePincodes.length === 0) {
      setErrorMsg("Enter at least one valid 6-digit pincode (comma separated)");
      return;
    }

    register.mutate(
      {
        name: form.name,
        email: form.email,
        address: form.address,
        serviceablePincodes,
        password: form.password,
        role: Role.USER,
      },
      {
        onSuccess: () => router.replace("/(auth)/login"),
        onError: (err: any) =>
          setErrorMsg(
            err?.response?.data?.message || "Registration failed. Try again.",
          ),
      },
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
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 32,
        }}
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Compact Header */}
          <View className="items-center mb-8">
            {/* logo */}
            <Image
              source={require("../../../assets/sahachari.jpeg")}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
            <View className="w-12 h-1 bg-blue-600 mb-6 rounded-full" />
            <Text className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Create Account
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Sign up to get started
            </Text>
          </View>

          {/* Form Fields */}
          <View className="mb-6 space-y-4">
            {/* Full Name */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                Full Name
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={form.name}
                onChangeText={(v) => {
                  setForm({ ...form, name: v });
                  setErrorMsg(null);
                }}
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                Email
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(v) => {
                  setForm({ ...form, email: v });
                  setErrorMsg(null);
                }}
              />
            </View>

            {/* Address */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                Delivery Address
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder="Enter your delivery address"
                placeholderTextColor="#9CA3AF"
                value={form.address}
                onChangeText={(v) => {
                  setForm({ ...form, address: v });
                  setErrorMsg(null);
                }}
              />
            </View>

            {/* Pincodes */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                Serviceable Pincodes
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder="e.g., 110001, 110002"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={form.pincodesInput}
                onChangeText={(v) => {
                  setForm({ ...form, pincodesInput: v });
                  setErrorMsg(null);
                }}
              />
              <Text className="text-[10px] text-gray-400 mt-1 ml-1">
                Comma separated 6-digit codes
              </Text>
            </View>

            {/* Password */}
            {/* <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                Password
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={form.password}
                onChangeText={(v) => {
                  setForm({ ...form, password: v });
                  setErrorMsg(null);
                }}
              />
            </View>
          </View> */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                Password
              </Text>

              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-base text-gray-900"
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={form.password}
                  onChangeText={(v) => {
                    setForm({ ...form, password: v });
                    setErrorMsg(null);
                  }}
                />

                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </Pressable>
              </View>
            </View>
            {/* Error Message */}
            {errorMsg && (
              <View className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <Text className="text-red-600 text-sm font-medium">
                  {errorMsg}
                </Text>
              </View>
            )}

            {/* Register Button */}
            <TouchableOpacity
              className={`rounded-xl py-4 items-center justify-center ${register.isPending ? "bg-blue-400" : "bg-blue-600"
                }`}
              onPress={submit}
              disabled={register.isPending}
              activeOpacity={0.8}
            >
              {register.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="px-4 text-xs text-gray-400 font-medium">or</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Login Link */}
            <View className="items-center">
              <Pressable
                onPress={() => router.push("/(auth)/login")}
                className="active:opacity-70"
              >
                <Text className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Text className="text-blue-600 font-semibold">Log In</Text>
                </Text>
              </Pressable>
            </View>
          </View>
          {/* </ScrollView>
    </KeyboardAvoidingView> */}
        </View>
      </KeyboardAwareScrollView>
    </View >
  );
}