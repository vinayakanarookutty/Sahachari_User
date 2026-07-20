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
  Modal,
  FlatList,
} from "react-native";

import { useRegister } from "../../hooks/useAuth";
import { Role } from "../../types/user";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Eye, EyeOff, ChevronDown, Check, Search, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";

const AVAILABLE_PINCODES = [
  "670562","670563","670567"
];

export default function Register() {
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const {t} = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [pincodeSearch, setPincodeSearch] = useState("");
  const [selectedPincodes, setSelectedPincodes] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = () => {
    if (
      !form.name ||
      !form.email ||
      !form.address ||
      !form.password ||
      selectedPincodes.length === 0
    ) {
      setErrorMsg("Please fill all fields");
      return;
    }

    register.mutate(
      {
        name: form.name,
        email: form.email,
        address: form.address,
        serviceablePincodes: selectedPincodes,
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
              {t("create_account")}
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              {t("sign_up_to_get_started")}
            </Text>
          </View>

          {/* Form Fields */}
          <View className="mb-6 space-y-4">
            {/* Full Name */}
            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                {t("full_name")}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder={t("enter_your_full_name")}
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
                {t("email")}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder={t("enter_your_email")}
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
                {t("delivery_address")}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder={t("enter_your_delivery_address")}
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
                {t("serviceable_pincodes")}
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


            <View>
              <Text className="text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                {t("password")}
              </Text>

              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-base text-gray-900"
                  placeholder={t("create_a_password")}
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
                  {t("create_account")}
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="px-4 text-xs text-gray-400 font-medium">
                {t("or")}
              </Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Login Link */}
            <View className="items-center">
              <Pressable
                onPress={() => router.push("/(auth)/login")}
                className="active:opacity-70"
              >
                <Text className="text-gray-600 text-sm">
                  {t("already_have_account")}{" "}
                  <Text className="text-blue-600 font-semibold">
                    {t("log_in")}
                  </Text>
                </Text>
              </Pressable>
            </View>
          </View>
          {/* </ScrollView>
    </KeyboardAvoidingView> */}
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
          <View className="bg-white rounded-t-3xl h-[65%] px-6 pt-5 pb-8 shadow-2xl">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">
                {t("select_pincodes") || "Select Pincodes"}
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
              data={AVAILABLE_PINCODES.filter((pin) =>
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
    </View >
  );
}