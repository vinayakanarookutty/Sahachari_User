import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
} from "react-native";

import { useRegister } from "../../hooks/useAuth";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import { useFacebookAuth } from "../../hooks/useFacebookAuth";
import { Role } from "../../types/user";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Eye, EyeOff, ChevronDown, Check, Search, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE_URL } from "@/config/env";

export default function Register() {
  const insets = useSafeAreaInsets();
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  // Pincode modal
  const [modalVisible, setModalVisible] = useState(false);
  const [pincodeSearch, setPincodeSearch] = useState("");
  const [selectedPincodes, setSelectedPincodes] = useState<string[]>([]);
  const [availablePincodes, setAvailablePincodes] = useState<string[]>([
    "670562", "670563", "670567", "682022", "688532"
  ]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/super-admin/auth/public/pincodes`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load pincodes");
        return res.json();
      })
      .then((pins: string[]) => {
        if (Array.isArray(pins) && pins.length > 0) {
          setAvailablePincodes(pins);
        }
      })
      .catch((err) => {
        console.log("Could not fetch SuperAdmin pincodes:", err?.message);
      });
  }, []);

  // Social auth hooks
  const googleAuth = useGoogleAuth();
  const facebookAuth = useFacebookAuth();

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When Google/Facebook returns user info, pre-fill name & email
  useEffect(() => {
    if (googleAuth.userInfo) {
      setForm((prev) => ({
        ...prev,
        name: googleAuth.userInfo!.name || prev.name,
        email: googleAuth.userInfo!.email || prev.email,
      }));
      setErrorMsg(null);
    }
  }, [googleAuth.userInfo]);

  useEffect(() => {
    if (facebookAuth.userInfo) {
      setForm((prev) => ({
        ...prev,
        name: facebookAuth.userInfo!.name || prev.name,
        email: facebookAuth.userInfo!.email || prev.email,
      }));
      setErrorMsg(null);
    }
  }, [facebookAuth.userInfo]);

  // Show social auth errors
  useEffect(() => {
    if (googleAuth.error) setErrorMsg(googleAuth.error);
  }, [googleAuth.error]);

  useEffect(() => {
    if (facebookAuth.error) setErrorMsg(facebookAuth.error);
  }, [facebookAuth.error]);

  const submit = () => {
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      selectedPincodes.length === 0
    ) {
      setErrorMsg(t("please_fill_all_fields") || "Please fill all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setErrorMsg(t("invalid_email") || "Please enter a valid email address");
      return;
    }

    if (form.password.length < 6) {
      setErrorMsg(t("password_min_length") || "Password must be at least 6 characters");
      return;
    }

    register.mutate(
      {
        name: form.name,
        email: form.email,
        address: "NOT_SET",
        serviceablePincodes: selectedPincodes,
        password: form.password,
        role: Role.USER,
      },
      {
        onSuccess: () => router.replace("/(tabs)/home"),
        onError: (err: any) => {
          console.error("[Register Error]:", err?.response?.data || err);
          const backendMsg = err?.response?.data?.message;
          if (Array.isArray(backendMsg)) {
            setErrorMsg(backendMsg.join(", "));
          } else if (typeof backendMsg === "string") {
            setErrorMsg(backendMsg);
          } else if (err?.message) {
            setErrorMsg(err.message);
          } else {
            setErrorMsg("Registration failed. Try again.");
          }
        },
      },
    );
  };

  const socialLoading = googleAuth.loading || facebookAuth.loading;

  return (
    <View className="flex-1 bg-white">
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
          {/* Header */}
          <View className="items-center mb-6">
            <Image
              source={require("../../../assets/sahachari.jpeg")}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
            <View className="w-12 h-1 bg-blue-600 mb-4 rounded-full" />
            <Text className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {t("create_account") || "Create Account"}
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              {t("fill_details_to_get_started") || "Fill in details to get started"}
            </Text>
          </View>

          {/* Social Signed In Alert */}
          {(googleAuth.userInfo || facebookAuth.userInfo) && (
            <View className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
              <Text className="text-blue-800 text-xs font-medium">
                {t("signed_in_as") || "Signed in with social account:"}{" "}
                <Text className="font-bold">{form.email}</Text>
              </Text>
            </View>
          )}

          {/* Form Fields */}
          <View className="mb-6 space-y-4">
            {/* Full Name */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                {t("full_name") || "Full Name"}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder={t("enter_your_full_name") || "Enter your full name"}
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
                {t("email") || "Email"}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder={t("enter_your_email") || "Enter your email"}
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



            {/* Serviceable Pincodes */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                {t("serviceable_pincodes") || "Serviceable Pincodes"}
              </Text>

              <Pressable
                onPress={() => setModalVisible(true)}
                className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 min-h-[54px]"
              >
                {selectedPincodes.length === 0 ? (
                  <Text className="text-base text-gray-400">
                    {t("Select Pincodes") || "Select serviceable pincodes"}
                  </Text>
                ) : (
                  <View className="flex-row flex-wrap gap-1.5 flex-1 mr-2">
                    {selectedPincodes.map((pin) => (
                      <View key={pin} className="flex-row items-center bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1">
                        <Text className="text-xs font-semibold text-blue-700 mr-1.5">{pin}</Text>
                        <Pressable
                          onPress={() => {
                            setSelectedPincodes(selectedPincodes.filter((p) => p !== pin));
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <X size={12} color="#1D4ED8" strokeWidth={2.5} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
                <ChevronDown size={20} color="#6B7280" />
              </Pressable>
            </View>

            {/* Password */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                {t("password") || "Password"}
              </Text>

              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-base text-gray-900"
                  placeholder={t("create_a_password") || "Create a password"}
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
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <Text className="text-red-600 text-sm font-medium">
                  {errorMsg}
                </Text>
              </View>
            )}

            {/* Submit Register Button */}
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
                  {t("create_account") || "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="px-4 text-xs text-gray-400 font-medium">
                {t("or") || "or"}
              </Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Separate Google & Facebook Sign-In Buttons */}
            <View className="space-y-3">
              {/* Google Sign-In Button */}
              <TouchableOpacity
                className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl py-3.5 px-4 mb-3"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={googleAuth.signInWithGoogle}
                disabled={socialLoading || !googleAuth.isReady || register.isPending}
                activeOpacity={0.7}
              >
                {googleAuth.loading ? (
                  <ActivityIndicator size="small" color="#4285F4" />
                ) : (
                  <>
                    <Image
                      source={{ uri: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" }}
                      style={{ width: 20, height: 20, marginRight: 12 }}
                    />
                    <Text className="text-base font-semibold text-gray-700">
                      {t("Google") || "Continue with Google"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Facebook Sign-In Button */}
              <TouchableOpacity
                className="flex-row items-center justify-center bg-[#1877F2] rounded-xl py-3.5 px-4"
                style={{
                  shadowColor: "#1877F2",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={facebookAuth.signInWithFacebook}
                disabled={socialLoading || !facebookAuth.isReady || register.isPending}
                activeOpacity={0.7}
              >
                {facebookAuth.loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-white text-lg font-bold mr-3">f</Text>
                    <Text className="text-base font-semibold text-white">
                      {t("Facebook") || "Continue with Facebook"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="items-center mt-6">
              <Pressable
                onPress={() => router.push("/(auth)/login")}
                className="active:opacity-70"
              >
                <Text className="text-gray-600 text-sm">
                  {t("already_have_account") || "Already have an account?"}{" "}
                  <Text className="text-blue-600 font-semibold">
                    {t("log_in") || "Log In"}
                  </Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Pincode Multi-Select Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View
            className="bg-white rounded-t-3xl h-[65%] px-6 pt-5 shadow-2xl"
            style={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 32 }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">
                {t("Select Pincodes") || "Select Pincodes"}
              </Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                className="bg-gray-100 p-2 rounded-full active:bg-gray-200"
              >
                <X size={18} color="#4B5563" />
              </Pressable>
            </View>

            {/* Modal Search Bar */}
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 mb-4">
              <Search size={18} color="#9CA3AF" />
              <TextInput
                value={pincodeSearch}
                onChangeText={setPincodeSearch}
                placeholder={t("search_pincode") || "Search pincode..."}
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-gray-800 text-base py-1.5"
                keyboardType="numeric"
              />
              {pincodeSearch.length > 0 && (
                <Pressable onPress={() => setPincodeSearch("")}>
                  <X size={16} color="#9CA3AF" />
                </Pressable>
              )}
            </View>

            {/* Pincode List */}
            <FlatList
              data={availablePincodes.filter((pin) =>
                pin.includes(pincodeSearch)
              )}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedPincodes.includes(item);
                return (
                  <Pressable
                    onPress={() => {
                      if (isSelected) {
                        setSelectedPincodes(selectedPincodes.filter((p) => p !== item));
                      } else {
                        setSelectedPincodes([...selectedPincodes, item]);
                      }
                      setErrorMsg(null);
                    }}
                    className={`flex-row justify-between items-center py-3.5 px-4 rounded-xl mb-2 border ${
                      isSelected
                        ? "bg-blue-50/50 border-blue-200"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <Text className={`text-base font-medium ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                      {item}
                    </Text>
                    {isSelected && <Check size={18} color="#2563EB" strokeWidth={3} />}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View className="items-center justify-center py-10">
                  <Text className="text-gray-400 text-sm">
                    {t("no_matching_pincodes") || "No matching pincodes found"}
                  </Text>
                </View>
              }
            />

            {/* Done Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-blue-600 rounded-xl py-3.5 items-center justify-center mt-4 active:bg-blue-700"
            >
              <Text className="text-white text-base font-semibold">
                {t("done") || "Done"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}