import { useLocalSearchParams, useRouter } from "expo-router";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import {
    ArrowLeft,
    MapPin,
    Phone,
    CreditCard,
    Package,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function BookingDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["booking", id],
        queryFn: async () => {
            const res = await api.get(`/bookings/${id}`);
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-3 text-gray-600">Loading details...</Text>
            </SafeAreaView>
        );
    }

    if (isError || !data) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
                <Text className="text-red-500">Failed to load booking</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                style={{ paddingTop: 50, paddingBottom: 18 }}
            >
                <View className="flex-row items-center px-4">
                    <Pressable
                        onPress={() => router.back()}
                        className="bg-white/20 p-2 rounded-full"
                    >
                        <ArrowLeft size={22} color="#fff" />
                    </Pressable>

                    <View className="flex-1 items-center">
                        <Text className="text-white text-xl font-bold">
                            Booking Details
                        </Text>
                        <Text className="text-blue-100 text-sm mt-1">
                            Track your service
                        </Text>
                    </View>

                    <View className="w-10" />
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            >
                {/* STATUS CARD */}
                <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-green-100 p-2 rounded-lg mr-3">
                            <Package size={20} color="#10B981" />
                        </View>

                        <Text className="font-bold text-lg">Booking Status</Text>
                    </View>

                    <Text className="text-green-600 font-semibold">
                        {data.status}
                    </Text>
                </View>

                {/* SERVICE INFO */}
                <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
                    <Text className="font-bold text-lg">
                        {data.item?.itemName}
                    </Text>

                    <Text className="text-gray-500 mt-1">
                        {data.bookingType}
                    </Text>

                    <Text className="text-blue-600 font-bold text-xl mt-3">
                        ₹{data.totalAmount}
                    </Text>
                </View>

                {/* ADDRESS */}
                <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-red-100 p-2 rounded-lg mr-3">
                            <MapPin size={18} color="#EF4444" />
                        </View>

                        <Text className="font-bold text-lg">
                            Service Address
                        </Text>
                    </View>

                    <Text className="text-gray-700">
                        {data.bookingAddress?.street}
                    </Text>
                    <Text className="text-gray-700">
                        {data.bookingAddress?.city} - {data.bookingAddress?.zipCode}
                    </Text>
                    <Text className="text-gray-700">
                        {data.bookingAddress?.place}
                    </Text>
                </View>

                {/* CONTACT */}
                <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Phone size={18} color="#3B82F6" />
                        </View>

                        <Text className="font-bold text-lg">
                            Contact
                        </Text>
                    </View>

                    <Text className="text-gray-700">
                        {data.bookingAddress?.phone}
                    </Text>
                </View>

                {/* PAYMENT */}
                <View className="bg-white rounded-2xl p-5 shadow-sm">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-purple-100 p-2 rounded-lg mr-3">
                            <CreditCard size={18} color="#8B5CF6" />
                        </View>

                        <Text className="font-bold text-lg">
                            Payment
                        </Text>
                    </View>

                    <Text className="text-gray-700">
                        Status: {data.paymentStatus}
                    </Text>

                    <Text className="text-gray-700">
                        Method: {data.paymentMethod}
                    </Text>

                    <Text className="text-blue-600 font-bold mt-2 text-lg">
                        ₹{data.totalAmount}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}