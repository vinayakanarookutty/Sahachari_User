import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BanIcon,
  Camera,
  ChevronRight,
  HelpCircle,
  Languages,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings as SettingsIcon,
  User,
} from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EditProfileModal } from "../../components/settings/EditProfileModal";
import { changeLanguage } from "../../i18n";
import i18n from "../../i18n";
import { useAuthStore } from "../../store/auth.store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const S3_BASE_URL =
  process.env.EXPO_PUBLIC_S3_BASE_URL ||
  "https://sahachari-uploads.s3.ap-south-1.amazonaws.com";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role?: string;
  address?: string;
  address2?: string;
  mobileNumber?: string;
  serviceablePincodes?: string[];
  image?: string;
}

export default function Settings() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<
    "name" | "mobileNumber" | "address" | "address2" | "serviceablePincodes" | null
  >(null);
  const [editValue, setEditValue] = useState("");

  // change app language
  // translate language
  const toggleLanguage = async () => {
    const nextLanguage =
      i18n.resolvedLanguage === "ml" ? "en" : "ml";

    await changeLanguage(nextLanguage);
  };

  // Fetch user profile
  const { data: profile, isLoading } = useQuery<UserProfile, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const authToken = await useAuthStore.getState().token;
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch user data");
      return response.json();
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({
      field,
      value,
    }: {
      field: string;
      value: string | string[];
    }) => {
      const authToken = await useAuthStore.getState().token;;
      const body: any = {};

      if (field === "serviceablePincodes") {
        body[field] =
          typeof value === "string"
            ? value
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p.length > 0)
            : value;
      } else {
        body[field] = value;
      }

      const response = await fetch(`${API_BASE_URL}/users/update-me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t("failed_to_update_profile"));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      setShowEditModal(false);

      if (Platform.OS === "android") {
        ToastAndroid.show(t("profile_updated_successfully"), ToastAndroid.SHORT);
      } else {
        Alert.alert(t("success"), t("profile_updated_successfully"));
      }
    },
    onError: (error: any) => {
      Alert.alert(t("error"), error.message || t("failed_to_update_profile"));
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (imageUri: string) => {
      const authToken = await useAuthStore.getState().token;

      // Clean the URI
      let cleanPath = imageUri.split(":http")[0];
      cleanPath = cleanPath.replace("blob:", "");

      // Extract extension
      const extensionMatch = cleanPath.match(/\.([a-zA-Z0-9]+)$/);
      const fileExtension = extensionMatch
        ? extensionMatch[1].toLowerCase()
        : "jpg";

      // Generate clean filename
      const randomId = Math.random().toString(36).substring(7);
      const fileName = `avatar_${Date.now()}_${randomId}.${fileExtension}`;

      // Set valid MIME type
      const fileType =
        fileExtension === "png"
          ? "image/png"
          : fileExtension === "webp"
            ? "image/webp"
            : "image/jpeg";

      // Get presigned URL
      const presignedResponse = await fetch(`${API_BASE_URL}/s3/presigned-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fileName,
          fileType,
          folder: "avatars",
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error("Failed to get presigned URL");
      }

      const { url: presignedUrl, key } = await presignedResponse.json();

      // Convert image URI to blob
      const imageResponse = await fetch(imageUri);
      const blob = await imageResponse.blob();

      // Upload to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": fileType,
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload avatar to S3");
      }

      // Update user profile with key
      const updateResponse = await fetch(`${API_BASE_URL}/users/update-me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ image: key }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update profile with avatar");
      }

      return updateResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      if (Platform.OS === "android") {
        ToastAndroid.show(t("profile_picture_updated"), ToastAndroid.SHORT);
      } else {
        Alert.alert(t("success"), t("profile_picture_updated"));
      }
    },
    onError: (error: any) => {
      console.error("Avatar upload error:", error);
      Alert.alert("Error", error.message || t("failed_to_upload_avatar"));
    },
  });

  const openEditModal = (
    field: "name" | "mobileNumber" | "address" | "address2" | "serviceablePincodes",
    currentValue?: string
  ) => {
    let value = "";
    if (profile) {
      if (field === "serviceablePincodes" && profile.serviceablePincodes) {
        value = profile.serviceablePincodes.join(", ");
      } else {
        value = (profile[field] as string) || "";
      }
    }
    setEditField(field);
    setEditValue(currentValue || value || "");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditField(null);
    setEditValue("");
  };

  const handleSave = () => {
    if (editField) {
      updateProfileMutation.mutate({ field: editField, value: editValue });
    }
  };

  const handleChangeAvatar = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          t("permission_needed"),
          t("please_grant_permission_to_access_photos")
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        uploadAvatarMutation.mutate(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(t("error"), t("failed_to_pick_image"));
    }
  };

  // const handleLogout = () => {
  //   window.alert("TEST ALERT");
  //   Alert.alert("Logout", "Are you sure you want to logout?", [
  //     { text: "Cancel", style: "cancel" },
  //     {
  //       text: "Logout",
  //       style: "destructive",
  //       onPress: async () => {
  //         // testing
  //         console.log("BEFORE LOGOUT:", useAuthStore.getState());
  //         await logout();
  //         console.log("AFTER LOGOUT:", useAuthStore.getState());
  //         // testing
  //         router.replace("/(auth)/login");
  //         console.log("FINAL STATE:", useAuthStore.getState());
  //       },
  //     },
  //   ]);
  // };

  const handleLogout = async () => {
    try {
      const doLogout = async () => {
        // console.log("BEFORE LOGOUT:", useAuthStore.getState()); 

        await logout();

        // console.log("AFTER LOGOUT:", useAuthStore.getState());

        router.replace("/(auth)/login");
      };

      if (Platform.OS === "web") {
        const confirm = window.confirm(t("are_you_sure_you_want_to_logout"));
        if (confirm) await doLogout();
        return;
      }

      Alert.alert(t("logout"), t("are_you_sure_you_want_to_logout"), [
        { text: t("cancel"), style: "cancel" },
        { text: t("logout"), style: "destructive", onPress: doLogout },
      ]);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-500 mt-4 font-medium">
          {t("loading_profile")}
        </Text>
      </View>
    );
  }

  const SettingItem = ({
    icon: Icon,
    label,
    value,
    field,
  }: {
    icon: any;
    label: string;
    value?: string;
    field?: "name" | "mobileNumber" | "address" | "address2" | "serviceablePincodes";
  }) => (
    <Pressable
      onPress={() => field && openEditModal(field, value)}
      className="flex-row items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50"
      disabled={!field}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
          <Icon size={20} color="#2563EB" strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs mb-1">{label}</Text>
          <Text
            className="text-gray-800 font-semibold text-base"
            numberOfLines={1}
          >
            {value || "Not set"}
          </Text>
        </View>
      </View>
      {field && <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
      >
        <View className="px-6">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/home"); // navigate to home screen
                }
              }}
              className="bg-white/20 rounded-full p-2.5 backdrop-blur-sm"
            >
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
            <Text className="text-2xl font-bold text-white flex-1 text-center">
              {t("settings")}
            </Text>
            <View className="w-12" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white mx-4 mt-6 rounded-3xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <LinearGradient
            colors={["#2563EB", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 24, paddingVertical: 32 }}
          >
            <View className="items-center">
              <Pressable
                onPress={handleChangeAvatar}
                disabled={uploadAvatarMutation.isPending}
                className="relative"
              >
                {uploadAvatarMutation.isPending ? (
                  <View className="w-28 h-28 rounded-full bg-white/20 items-center justify-center border-4 border-white">
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  </View>
                ) : profile?.image ? (
                  <Image
                    source={{ uri: `${S3_BASE_URL}/${profile.image}` }}
                    className="w-28 h-28 rounded-full border-4 border-white"
                  />
                ) : (
                  <View className="w-28 h-28 rounded-full bg-white items-center justify-center border-4 border-white">
                    <User size={48} color="#2563EB" strokeWidth={2} />
                  </View>
                )}
                <View className="absolute bottom-0 right-0 bg-white rounded-full p-2.5 border-4 border-blue-600">
                  <Camera size={18} color="#2563EB" strokeWidth={2.5} />
                </View>
              </Pressable>
              <Text className="text-white font-bold text-2xl mt-4">
                {profile?.name || "User"}
              </Text>
              {profile?.email && (
                <Text className="text-blue-100 text-sm mt-1">
                  {profile.email}
                </Text>
              )}
              {profile?.role && (
                <View className="bg-white/20 px-4 py-1.5 rounded-full mt-2">
                  <Text className="text-white text-xs font-semibold">
                    {profile.role}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>

          {/* Profile Details */}
          <View className="p-4">
            <Text className="text-base font-bold text-gray-900 mb-3 px-2">
              {t("personal_information")}
            </Text>
            <SettingItem
              icon={User}
              label={t("full_name")}
              value={profile?.name}
              field="name"
            />
            <SettingItem icon={Mail} label={t("email")} value={profile?.email} />
            <SettingItem
              icon={Phone}
              label={t("mobile_number")}
              value={profile?.mobileNumber}
              field="mobileNumber"
            />
          </View>
        </View>

        {/* Address Section */}
        <View className="bg-white mx-4 mt-4 rounded-3xl shadow-lg overflow-hidden">
          <View className="p-4">
            <Text className="text-base font-bold text-gray-900 mb-3 px-2">
              {t("address_details")}
            </Text>
            <SettingItem
              icon={MapPin}
              label={t("primary_address")}
              value={profile?.address}
              field="address"
            />
            <SettingItem
              icon={MapPin}
              label={t("secondary_address")}
              value={profile?.address2}
              field="address2"
            />
            {profile?.serviceablePincodes && (
              <SettingItem
                icon={MapPin}
                label={t("serviceable_pincodes")}
                value={profile.serviceablePincodes.join(", ")}
                field="serviceablePincodes"
              />
            )}
          </View>
        </View>

        {/* Actions Section */}
        <View className="mx-4 mt-4 gap-3">
          <Pressable className="bg-white rounded-2xl shadow-sm overflow-hidden active:opacity-80">
            <View className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <SettingsIcon size={20} color="#2563EB" strokeWidth={2} />
              </View>
              <Text className="text-gray-900 font-semibold flex-1">
                {t("settings")}
              </Text>
              <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
            </View>
          </Pressable>
          {/* <Pressable
            onPress={handleLanguageChange}
            className="bg-white rounded-2xl shadow-sm overflow-hidden active:opacity-80"
          >
            <View className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Languages size={20} color="#2563EB" strokeWidth={2} />
              </View>

              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">
                  Language
                </Text>

                <Text className="text-xs text-gray-500">
                  {i18n.resolvedLanguage === "ml"
                    ? t("malayalam")
                    : t("english")}
                </Text>
              </View>

              <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
            </View>
          </Pressable> */}
          <Pressable
            onPress={toggleLanguage}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <View className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Languages size={20} color="#2563EB" />
              </View>

              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">
                  {t("language")}
                </Text>

                <Text className="text-xs text-gray-500">
                  {i18n.resolvedLanguage === "ml"
                    ? "മലയാളം"
                    : "English"}
                </Text>
              </View>

              <Switch
                value={i18n.resolvedLanguage === "ml"}
                onValueChange={toggleLanguage}
              />
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push("/settings/complaints")}
            className="bg-white rounded-2xl shadow-sm overflow-hidden active:opacity-80">
            <View className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <BanIcon size={20} color="#2563EB" strokeWidth={2} />
              </View>
              <Text className="text-gray-900 font-semibold flex-1">
                {t("complaints")}
              </Text>
              <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
            </View>
          </Pressable>

          <Pressable className="bg-white rounded-2xl shadow-sm overflow-hidden active:opacity-80">
            <View className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <HelpCircle size={20} color="#2563EB" strokeWidth={2} />
              </View>
              <Text className="text-gray-900 font-semibold flex-1">
                {t("help_support")}
              </Text>
              <ChevronRight size={18} color="#9CA3AF" strokeWidth={2} />
            </View>
          </Pressable>

          {/* Logout Button */}
          <Pressable
            // onPress={handleLogout}

            onPress={() => {
              // console.log("HANDLE CALLED");
              handleLogout();
            }}

            className="rounded-2xl overflow-hidden shadow-lg active:scale-[0.98]"
          >
            <LinearGradient
              colors={["#EF4444", "#DC2626"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogOut size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text className="text-white font-bold text-base ml-2">
                {t("logout")}
              </Text>
            </LinearGradient>
          </Pressable>

        </View>

        {/* Bottom Spacing */}
        <View className="h-24" />
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        field={editField}
        value={editValue}
        onChange={setEditValue}
        onClose={closeEditModal}
        onSave={handleSave}
        isPending={updateProfileMutation.isPending}
      />
    </View>
  );
}