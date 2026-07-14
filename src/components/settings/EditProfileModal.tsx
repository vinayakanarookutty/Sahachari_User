import { LinearGradient } from "expo-linear-gradient";
import { X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAppFonts } from "../../hooks/useAppFonts";

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
  const { t } = useTranslation();
  const { styleRegular, styleBold } = useAppFonts();
  
  const getFieldLabel = () => field ? t(FIELD_LABELS[field]) : "";
  const isMultiline = field === "address" || field === "address2";
  const keyboardType = field === "mobileNumber" ? "phone-pad" : "default";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-t-3xl"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
            <Text style={[{ fontSize: 20, fontWeight: "900", color: "#1E293B" }, styleBold]}>
              {t("edit")} {getFieldLabel()}
            </Text>
            <Pressable
              onPress={onClose}
              className="bg-gray-100 rounded-full p-2"
            >
              <X size={20} color="#1F2937" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Input Field */}
          <View className="p-6">
            <Text style={[{ fontSize: 13, fontWeight: "700", color: "#64748B", marginBottom: 8 }, styleBold]}>
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
              style={[
                isMultiline ? { textAlignVertical: "top", minHeight: 100 } : undefined,
                styleRegular
              ]}
              className={`bg-gray-50 rounded-2xl px-4 border border-gray-200 text-base text-gray-900 ${
                isMultiline ? "py-4" : "py-4"
              }`}
            />

            {field === "serviceablePincodes" && (
              <Text style={[{ fontSize: 11, color: "#94A3B8", marginTop: 8 }, styleRegular]}>
                {t("enter_pincodes")}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View className="p-6 gap-3">
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
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[{ color: "#FFFFFF", fontWeight: "800", fontSize: 16 }, styleBold]}>
                    {t("save_changes")}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={onClose}
              disabled={isPending}
              className="bg-gray-100 py-4 rounded-2xl"
            >
              <Text style={[{ textAlign: "center", color: "#475569", fontWeight: "700", fontSize: 15 }, styleBold]}>
                {t("cancel")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}