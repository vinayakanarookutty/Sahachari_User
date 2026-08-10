import { LinearGradient } from "expo-linear-gradient";
import { X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAppFonts } from "../../hooks/useAppFonts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface EditProfileModalProps {
  visible: boolean;
  field: "name" | "mobileNumber" | "address" | "address2" | "serviceablePincodes" | null;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  isPending?: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  name: "full_name",
  mobileNumber: "mobile_number",
  address: "primary_address",
  address2: "secondary_address",
  serviceablePincodes: "serviceable_pincodes",
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  name: "enter_full_name",
  mobileNumber: "enter_mobile_number",
  address: "enter_primary_address",
  address2: "enter_secondary_address",
  serviceablePincodes: "enter_pincodes",
};

export function EditProfileModal({
  visible,
  field,
  value,
  onChange,
  onClose,
  onSave,
  isPending = false,
}: EditProfileModalProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { styleRegular, styleBold } = useAppFonts();
  const getFieldLabel = () => (field ? t(FIELD_LABELS[field]) : "");
  const isMultiline = field === "address" || field === "address2";
  const keyboardType =
    field === "mobileNumber"
      ? "phone-pad"
      : field === "serviceablePincodes"
      ? "numeric"
      : "default";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-4"
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
            style={{
              elevation: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900" style={styleBold}>
                {t("edit")} {getFieldLabel()}
              </Text>
              <Pressable
                onPress={onClose}
                className="bg-gray-100 rounded-full p-2"
              >
                <X size={18} color="#1F2937" strokeWidth={2.5} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
              {/* Input Field */}
              <View className="p-5">
                <Text className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider" style={styleBold}>
                  {getFieldLabel()}
                </Text>
                
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder={t(FIELD_PLACEHOLDERS[field!])}
                  placeholderTextColor="#9CA3AF"
                  multiline={isMultiline}
                  numberOfLines={isMultiline ? 3 : 1}
                  keyboardType={keyboardType}
                  editable={!isPending}
                  autoFocus={true}
                  className={`bg-gray-50 rounded-2xl px-4 border border-gray-200 text-base text-gray-900 ${
                    isMultiline ? "py-3 min-h-[90px]" : "py-3.5"
                  }`}
                  style={[
                    isMultiline ? { textAlignVertical: "top" } : undefined,
                    styleRegular,
                  ]}
                />

                {field === "serviceablePincodes" && (
                  <Text className="text-xs text-gray-500 mt-2" style={styleRegular}>
                    {t("enter_pincodes")}
                  </Text>
                )}
              </View>

              {/* Action Buttons */}
              <View className="px-5 pb-5 gap-2.5">
                <Pressable
                  onPress={onSave}
                  disabled={isPending}
                  className={`rounded-2xl overflow-hidden ${
                    isPending ? "opacity-50" : ""
                  }`}
                >
                  <LinearGradient
                    colors={["#2563EB", "#1D4ED8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingVertical: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isPending ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text className="text-white font-bold text-base" style={styleBold}>
                        {t("save_changes")}
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={onClose}
                  disabled={isPending}
                  className="bg-gray-100 py-3.5 rounded-2xl"
                >
                  <Text className="text-center text-gray-700 font-semibold text-sm" style={styleBold}>
                    {t("cancel")}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}