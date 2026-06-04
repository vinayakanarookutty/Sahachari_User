import { useAuthStore } from "@/store/auth.store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const showAlert = (
  title: string,
  message: string,
  onOk?: () => void
) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, [
      {
        text: "OK",
        onPress: onOk,
      },
    ]);
  }
};

export default function ComplaintsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {t} = useTranslation();

  const [category, setCategory] = useState("OTHER");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    "PAYMENT",
    "DELIVERY",
    "PRODUCT",
    "STORE",
    "REFUND",
    "OTHER",
  ];

  const orderId = params.orderId as string;
  const complaintCategory = params.category as string;
  const isOrderCancellation =
    complaintCategory === "ORDER_CANCELLATION" &&
    !!orderId;

  useEffect(() => {
    if (isOrderCancellation) {
      setCategory("ORDER_CANCELLATION");

      setSubject(
        `Cancellation Request for Order #${orderId}`
      );

      setDescription(
        "Reason for cancellation: "
      );
    }
  }, []);

  const loadComplaints = async () => {
    try {
      setLoadingComplaints(true);

      const token =
        useAuthStore.getState().token;

      const response = await fetch(
        `${API_BASE_URL}/complaints/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to load complaints"
        );
      }

      setComplaints(data);
    } catch (error: any) {
      showAlert(
        "Error",
        error.message || "Failed to load complaints"
      );
    } finally {
      setLoadingComplaints(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadComplaints();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const submitComplaint = async () => {
    try {
      if (!subject.trim()) {
        showAlert(
          "Validation",
          "Please enter subject"
        );;
        return;
      }

      if (!description.trim()) {
        showAlert(
          "Validation",
          "Please enter description"
        );
        return;
      }

      setLoading(true);

      const token =
        useAuthStore.getState().token;

      const response = await fetch(
        `${API_BASE_URL}/complaints`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category,
            subject,
            description,
            orderId: isOrderCancellation
              ? orderId
              : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to create complaint"
        );
      }

      showAlert(
        "Success",
        isOrderCancellation
          ? "Cancellation request submitted successfully"
          : "Complaint submitted successfully",
        () => {
          if (isOrderCancellation) {
            router.replace("/orders");
          } else {
            setSubject("");
            setDescription("");
            setCategory("OTHER");
            // loadComplaints();
            onRefresh();
          }
        }
      );

    } catch (error: any) {
      showAlert(
        "Error",
        error.message || "Failed to submit complaint"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={{
          padding: 20,
        }}
      >
        <View className="flex-row items-center mb-6">
          <Pressable
            // onPress={() => router.back()}
            onPress={() =>
              isOrderCancellation
                ? router.replace("/orders")
                : router.replace("/settings/settings")
            }
          >
            <ArrowLeft size={24} />
          </Pressable>

          <Text className="text-2xl font-bold ml-4">
            {t("complaints")}
          </Text>
        </View>
        {/* {category === "ORDER_CANCELLATION" && orderId && ( */}
        {isOrderCancellation && (
          <View className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
            <Text className="text-orange-700 font-bold text-lg">
              {t("order_cancellation_request")}
            </Text>

            <Text className="text-orange-600 mt-1">
              {t("order_id")}: {orderId}
            </Text>

            <Text className="text-orange-500 mt-2">
              {t("why_cancel_order1")}
              {t("why_cancel_order2")}
            </Text>
          </View>
        )}
        <View className="bg-white rounded-2xl p-4 mb-6">
          <Text className="text-center text-white font-bold">
            {category === "ORDER_CANCELLATION"
              ? t("cancel_request")
              : t("submit_complaint")}
          </Text>

          {/* {category !== "ORDER_CANCELLATION" && ( */}
          {!isOrderCancellation && (
            <>
              <Text className="font-semibold mb-2">
                Category
              </Text>

              <View className="flex-row flex-wrap mb-4">
                {categories.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(item)}
                    className={`px-4 py-2 rounded-full mr-2 mb-2 ${category === item
                      ? "bg-blue-600"
                      : "bg-gray-200"
                      }`}
                  >
                    <Text
                      className={
                        category === item
                          ? "text-white"
                          : "text-black"
                      }
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          <Text className="font-semibold mb-2">
            {t("subject")}
          </Text>

          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Complaint subject"
            className="border border-gray-300 rounded-xl p-4 mb-4"
          />

          <Text className="font-semibold mb-2">
            {t("description")}
          </Text>

          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder={
              isOrderCancellation
                ? t("cancel_reason")
                : t("issue")
            }
            className="border border-gray-300 rounded-xl p-4 min-h-[140px] mb-4"
          />

          <Pressable
            onPress={submitComplaint}
            disabled={loading}
            className="bg-blue-600 rounded-xl py-4"
          >
            {loading ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text className="text-center text-white font-bold">
                {t("submit_complaint")}
              </Text>
            )}
          </Pressable>
        </View>

        <View className="bg-white rounded-2xl p-4">
          <Text className="font-bold text-lg mb-4">
            {t("my_complaints")}
          </Text>

          {loadingComplaints ? (
            <ActivityIndicator />
          ) : complaints.length === 0 ? (
            <Text className="text-gray-500">
              {t("no_complaints_found")}
            </Text>
          ) : (
            complaints.map((item) => (
              <View
                key={item._id}
                className="border border-gray-200 rounded-xl p-4 mb-3"
              >
                <Text className="font-bold">
                  {item.subject}
                </Text>

                <Text className="text-sm text-gray-500 mt-1">
                  {item.category}
                </Text>

                <Text className="mt-2">
                  {item.description}
                </Text>

                <Text className="mt-3 font-semibold text-blue-600">
                  {t("status")}: {item.status}
                </Text>

                {item.adminReply ? (
                  <View className="mt-3 bg-green-50 p-3 rounded-lg">
                    <Text className="font-semibold text-green-700">
                      {t("admin_reply")}
                    </Text>

                    <Text className="text-green-700 mt-1">
                      {item.adminReply}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}