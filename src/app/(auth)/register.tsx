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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useRegister } from "../../hooks/useAuth";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import { Role } from "../../types/user";
import {
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  Search,
  X,
  User,
  Mail,
  Lock,
  MapPin,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE_URL } from "@/config/env";

export default function Register() {
  const insets = useSafeAreaInsets();
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  // Wizard Step (1: Name & Email, 2: Pincode & Password)
  const [step, setStep] = useState<1 | 2>(1);

  // Pincode modal
  const [modalVisible, setModalVisible] = useState(false);
  const [pincodeSearch, setPincodeSearch] = useState("");
  const [selectedPincodes, setSelectedPincodes] = useState<string[]>([]);
  const [availablePincodes, setAvailablePincodes] = useState<string[]>([
    "670562",
    "670563",
    "670567",
    "682022",
    "688532",
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

  // Social auth hook (Google only)
  const googleAuth = useGoogleAuth();

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When Google returns user info, pre-fill name & email and go to step 2
  useEffect(() => {
    if (googleAuth.userInfo) {
      setForm((prev) => ({
        ...prev,
        name: googleAuth.userInfo!.name || prev.name,
        email: googleAuth.userInfo!.email || prev.email,
      }));
      setErrorMsg(null);
      setStep(2);
    }
  }, [googleAuth.userInfo]);

  // Show social auth errors
  useEffect(() => {
    if (googleAuth.error) setErrorMsg(googleAuth.error);
  }, [googleAuth.error]);

  const goToStep2 = () => {
    if (!form.name || !form.email) {
      setErrorMsg(t("please_fill_all_fields") || "Please fill all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setErrorMsg(t("invalid_email") || "Please enter a valid email address");
      return;
    }

    setErrorMsg(null);
    setStep(2);
  };

  const submit = () => {
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      selectedPincodes.length === 0
    ) {
      setErrorMsg(t("please_fill_all_fields") || "Please fill all required fields");
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
      }
    );
  };

  const socialLoading = googleAuth.loading;

  // Password strength logic
  const getPasswordStrength = () => {
    if (!form.password) return null;
    if (form.password.length < 6) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
    if (form.password.length < 10) return { label: "Good", color: "bg-amber-500", width: "w-2/3" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  const pwdStrength = getPasswordStrength();

  return (
    <View className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          }}
        >
          {/* Top Decorative Background Header */}
          <View
            className="bg-blue-600 pb-16 px-6 rounded-b-[36px] shadow-lg relative overflow-hidden"
            style={{
              paddingTop: Math.max(insets.top, 16) + 16,
            }}
          >
            {/* Decorative soft circles */}
            <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
            <View className="absolute top-20 -left-12 w-32 h-32 rounded-full bg-white/10" />

            {/* Top Bar Navigation */}
            <View className="flex-row items-center justify-between mb-4">
              <Pressable
                onPress={() => {
                  if (step === 2) {
                    setStep(1);
                    setErrorMsg(null);
                  } else {
                    router.replace("/(auth)/login");
                  }
                }}
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md active:bg-white/30"
              >
                <ArrowLeft size={20} color="#FFFFFF" />
              </Pressable>
              <View className="flex-row items-center bg-white/20 px-3 py-1 rounded-full">
                <Sparkles size={14} color="#FDE047" />
                <Text className="text-xs font-semibold text-white ml-1.5">
                  {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
                </Text>
              </View>
            </View>

            {/* Header Content */}
            <View className="items-center mt-2">
              <View className="w-20 h-20 bg-white rounded-2xl p-2 shadow-md mb-3 items-center justify-center">
                <Image
                  source={require("../../../assets/sahachari.jpeg")}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              </View>
              <Text className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-center">
                {step === 1
                  ? t("create_account") || "Create Account"
                  : t("Complete Setup") || "Complete Setup"}
              </Text>
              <Text className="text-xs sm:text-sm text-blue-100 text-center mt-1 max-w-[280px]">
                {step === 1
                  ? t("Sign up to explore local services") || "Sign up to explore local services & rentals"
                  : t("Enter your area pincodes and password") || "Enter your pincode and set a password"}
              </Text>

              {/* Progress Bar */}
              <View className="w-48 h-1.5 bg-white/20 rounded-full mt-4 overflow-hidden">
                <View
                  className={`h-full bg-yellow-400 rounded-full transition-all ${
                    step === 1 ? "w-1/2" : "w-full"
                  }`}
                />
              </View>
            </View>
          </View>

          {/* Form Card Overlay - Responsive Width Wrapper */}
          <View className="w-full max-w-md self-center px-4 sm:px-6 -mt-8">
            <View
              className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100"
              style={{
                shadowColor: "#1E3A8A",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 4,
              }}
            >
              {/* STEP 1: Name and Email */}
              {step === 1 && (
                <View className="space-y-4">
                  {/* Full Name */}
                  <View className="mb-3">
                    <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                      {t("full_name") || "Full Name"} <Text className="text-red-500">*</Text>
                    </Text>
                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                      <User size={18} color="#6B7280" />
                      <TextInput
                        className="flex-1 text-base text-gray-900 ml-2.5 py-0.5"
                        placeholder={t("enter_your_full_name") || "Enter your full name"}
                        placeholderTextColor="#9CA3AF"
                        value={form.name}
                        onChangeText={(v) => {
                          setForm({ ...form, name: v });
                          setErrorMsg(null);
                        }}
                      />
                    </View>
                  </View>

                  {/* Email Address */}
                  <View className="mb-4">
                    <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                      {t("email") || "Email Address"} <Text className="text-red-500">*</Text>
                    </Text>
                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                      <Mail size={18} color="#6B7280" />
                      <TextInput
                        className="flex-1 text-base text-gray-900 ml-2.5 py-0.5"
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
                  </View>

                  {/* Error Message */}
                  {errorMsg && (
                    <View className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex-row items-center mb-3">
                      <AlertCircle size={18} color="#EF4444" />
                      <Text className="text-red-600 text-xs font-semibold ml-2.5 flex-1">
                        {errorMsg}
                      </Text>
                    </View>
                  )}

                  {/* Next Step Button */}
                  <TouchableOpacity
                    className="rounded-2xl py-4 items-center justify-center flex-row bg-blue-600 active:bg-blue-700 shadow-md"
                    style={{
                      shadowColor: "#2563EB",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                    onPress={goToStep2}
                    activeOpacity={0.85}
                  >
                    <Text className="text-white text-base font-bold tracking-wide mr-2">
                      {t("next") || "Next Step"}
                    </Text>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Divider */}
                  <View className="flex-row items-center my-4">
                    <View className="flex-1 h-px bg-gray-200" />
                    <Text className="px-3 text-xs text-gray-400 font-semibold uppercase">
                      {t("or") || "or continue with"}
                    </Text>
                    <View className="flex-1 h-px bg-gray-200" />
                  </View>

                  {/* Social Sign-In Buttons */}
                  <View className="space-y-3">
                    {/* Google Sign-In Button */}
                    <TouchableOpacity
                      className="flex-row items-center justify-center bg-white border border-gray-200 rounded-2xl py-3.5 px-4 mb-3"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 1,
                      }}
                      onPress={googleAuth.signInWithGoogle}
                      disabled={socialLoading || !googleAuth.isReady || register.isPending}
                      activeOpacity={0.75}
                    >
                      {googleAuth.loading ? (
                        <ActivityIndicator size="small" color="#4285F4" />
                      ) : (
                        <>
                          <Image
                            source={{ uri: "https://cdn-icons-png.flaticon.com/512/300/300221.png" }}
                            style={{ width: 20, height: 20, marginRight: 10 }}
                          />
                          <Text className="text-sm font-semibold text-gray-700">
                            {t("Google") || "Continue with Google"}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Login Link */}
                  <View className="items-center mt-5">
                    <Pressable
                      onPress={() => router.replace("/(auth)/login")}
                      className="active:opacity-70 py-1"
                    >
                      <Text className="text-gray-600 text-sm">
                        {t("already_have_account") || "Already have an account?"}{" "}
                        <Text className="text-blue-600 font-bold">
                          {t("log_in") || "Log In"}
                        </Text>
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* STEP 2: Pincode and Password */}
              {step === 2 && (
                <View className="space-y-4">
                  {/* Account Badge Notification */}
                  <View className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 mb-2 flex-row items-center">
                    <ShieldCheck size={20} color="#2563EB" />
                    <View className="ml-2.5 flex-1">
                      <Text className="text-blue-900 text-xs font-medium">
                        {googleAuth.userInfo
                          ? "Authenticated via Google"
                          : "Registering Account"}
                      </Text>
                      <Text className="text-blue-950 text-sm font-bold truncate">
                        {form.name} ({form.email})
                      </Text>
                    </View>
                  </View>


                  {/* Field 1: Serviceable Pincodes */}
                  <View className="mb-3">
                    <View className="flex-row justify-between items-center mb-1.5 ml-1">
                      <Text className="text-xs font-semibold text-gray-700">
                        {t("serviceable_pincodes") || "Serviceable Pincodes"} <Text className="text-red-500">*</Text>
                      </Text>
                      {selectedPincodes.length > 0 && (
                        <Text className="text-xs font-semibold text-blue-600">
                          {selectedPincodes.length} selected
                        </Text>
                      )}
                    </View>

                    <Pressable
                      onPress={() => setModalVisible(true)}
                      className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 min-h-[54px]"
                    >
                      <View className="flex-row items-center flex-1 mr-2">
                        <MapPin size={18} color="#6B7280" />
                        {selectedPincodes.length === 0 ? (
                          <Text className="text-base text-gray-400 ml-2.5">
                            {t("Select Pincodes") || "Select serviceable pincodes"}
                          </Text>
                        ) : (
                          <View className="flex-row flex-wrap gap-1.5 flex-1 ml-2.5">
                            {selectedPincodes.map((pin) => (
                              <View
                                key={pin}
                                className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1"
                              >
                                <Text className="text-xs font-semibold text-blue-700 mr-1.5">
                                  {pin}
                                </Text>
                                <Pressable
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    setSelectedPincodes(
                                      selectedPincodes.filter((p) => p !== pin)
                                    );
                                  }}
                                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                  <X size={12} color="#1D4ED8" strokeWidth={2.5} />
                                </Pressable>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                      <ChevronDown size={18} color="#6B7280" />
                    </Pressable>
                  </View>

                  {/* Field 2: Password */}
                  <View className="mb-4">
                    <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                      {t("password") || "Password"} <Text className="text-red-500">*</Text>
                    </Text>

                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                      <Lock size={18} color="#6B7280" />
                      <TextInput
                        className="flex-1 text-base text-gray-900 ml-2.5 py-0.5 pr-2"
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
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color="#6B7280" />
                        ) : (
                          <Eye size={18} color="#6B7280" />
                        )}
                      </Pressable>
                    </View>

                    {/* Password Strength Indicator */}
                    {pwdStrength && (
                      <View className="mt-2 ml-1">
                        <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                          <View className={`h-full ${pwdStrength.color} ${pwdStrength.width}`} />
                        </View>
                        <Text className="text-[11px] font-medium text-gray-500">
                          Password Strength:{" "}
                          <Text className="font-bold text-gray-800">{pwdStrength.label}</Text>
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Error Message */}
                  {errorMsg && (
                    <View className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex-row items-center mb-3">
                      <AlertCircle size={18} color="#EF4444" />
                      <Text className="text-red-600 text-xs font-semibold ml-2.5 flex-1">
                        {errorMsg}
                      </Text>
                    </View>
                  )}

                  {/* Complete Registration Button */}
                  <TouchableOpacity
                    className={`rounded-2xl py-4 items-center justify-center shadow-md ${
                      register.isPending ? "bg-blue-400" : "bg-blue-600 active:bg-blue-700"
                    }`}
                    style={{
                      shadowColor: "#2563EB",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                    onPress={submit}
                    disabled={register.isPending}
                    activeOpacity={0.85}
                  >
                    {register.isPending ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="text-white text-base font-bold tracking-wide">
                        {t("complete_registration") || "Complete Registration"}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Back to Step 1 */}
                  <View className="items-center mt-3">
                    <Pressable
                      onPress={() => {
                        setStep(1);
                        setErrorMsg(null);
                      }}
                      className="active:opacity-70 py-1"
                    >
                      <Text className="text-blue-600 font-semibold text-xs">
                        ← {t("change_email_or_name") || "Edit Name or Email"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Pincode Multi-Select Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View
            className="bg-white rounded-t-[32px] h-[70%] px-6 pt-4 shadow-2xl"
            style={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 16 : 28 }}
          >
            {/* Modal Handle */}
            <View className="items-center mb-3">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-lg font-bold text-gray-900">
                  {t("Select Pincodes") || "Select Serviceable Areas"}
                </Text>
                <Text className="text-xs text-gray-500">
                  Choose pincodes where you want service
                </Text>
              </View>
              <Pressable
                onPress={() => setModalVisible(false)}
                className="bg-gray-100 p-2 rounded-full active:bg-gray-200"
              >
                <X size={18} color="#4B5563" />
              </Pressable>
            </View>

            {/* Modal Search Bar */}
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-3 py-1 mb-4">
              <Search size={18} color="#9CA3AF" />
              <TextInput
                value={pincodeSearch}
                onChangeText={setPincodeSearch}
                placeholder={t("search_pincode") || "Search pincode..."}
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-gray-800 text-base py-2"
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
                    className={`flex-row justify-between items-center py-3.5 px-4 rounded-2xl mb-2.5 border ${
                      isSelected
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <MapPin
                        size={18}
                        color={isSelected ? "#2563EB" : "#9CA3AF"}
                        className="mr-3"
                      />
                      <Text
                        className={`text-base font-semibold ${
                          isSelected ? "text-blue-700" : "text-gray-800"
                        }`}
                      >
                        {item}
                      </Text>
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center border ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View className="items-center justify-center py-12">
                  <Text className="text-gray-400 text-sm">
                    {t("no_matching_pincodes") || "No matching pincodes found"}
                  </Text>
                </View>
              }
            />

            {/* Done Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-blue-600 rounded-2xl py-3.5 items-center justify-center mt-3 active:bg-blue-700 shadow-md"
            >
              <Text className="text-white text-base font-bold">
                {t("done") || "Done"} ({selectedPincodes.length} Selected)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}