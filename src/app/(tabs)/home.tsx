import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Briefcase,
  ChevronRight,
  Fish,
  HomeIcon,
  Leaf,
  Package,
  Phone,
  Plug,
  ShoppingCart,
  User,
  Utensils,
  Wrench,
} from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCarousel } from "../../hooks/useCarousel";
import { usePolicyAgreement } from "../../hooks/usePolicy";
import { useProducts } from "../../hooks/useProducts";
import { useProfile } from "../../hooks/useProfile";

const { width } = Dimensions.get("window");
// const CAROUSEL_IMAGES = [
//   require("../../../assets/WhatsApp Image 2026-02-11 at 10.13.48 AM.jpeg"),
//   require("../../../assets/WhatsApp Image 2026-02-11 at 5.19.25 PM.jpeg"),
//   require("../../../assets/WhatsApp Image 2026-02-11 at 11.25.36 AM.jpeg"),
//   require("../../../assets/pexels-jack-sparrow-4198972.jpg"),
//   require("../../../assets/im3.jpg"),
// ];

// Icon mapping for different categories
const CATEGORY_ICONS: Record<string, any> = {
  "Food": Utensils,
  "Vegetables and fruits": Leaf,
  "Groceries": ShoppingCart,
  "Home made": HomeIcon,
  "Service": Briefcase,
  "Fish meat": Fish,
  "rent": Wrench,
  "electronics": Plug,
  "default": Package,
};
// Premium white and blue color gradients
const CATEGORY_GRADIENTS: Record<
  string,
  { gradient: string[]; iconColor: string; shadowColor: string }
> = {
  "Food": {
    gradient: ["#FFFFFF", "#FFF7ED"],
    iconColor: "#9A3412",
    shadowColor: "#FDBA74",
  },

  "Vegetables and fruits": {
    gradient: ["#FFFFFF", "#ECFDF5"],
    iconColor: "#047857",
    shadowColor: "#6EE7B7",
  },

  "Groceries": {
    gradient: ["#FFFFFF", "#F0F9FF"],
    iconColor: "#0369A1",
    shadowColor: "#7DD3FC",
  },

  "Home made": {
    gradient: ["#FFFFFF", "#FFF1F2"],
    iconColor: "#9F1239",
    shadowColor: "#FDA4AF",
  },

  "Service": {
    gradient: ["#FFFFFF", "#ECFEFF"],
    iconColor: "#0E7490",
    shadowColor: "#67E8F9",
  },

  "Fish meat": {
    gradient: ["#FFFFFF", "#EFF6FF"],
    iconColor: "#1D4ED8",
    shadowColor: "#93C5FD",
  },
  "rent": {
    gradient: ["#FFFFFF", "#FEFCE8"],
    iconColor: "#CA8A04",
    shadowColor: "#FDE047",
  },

  "electronics": {
    gradient: ["#FFFFFF", "#F5F3FF"],
    iconColor: "#7C3AED",
    shadowColor: "#C4B5FD",
  },

  "default": {
    gradient: ["#FFFFFF", "#F1F5F9"],
    iconColor: "#475569",
    shadowColor: "#94A3B8",
  },
};


export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: carouselData = [] } = useCarousel();

  const { profile, refetch: refetchProfile } = useProfile();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, refetch: refetchProducts, } = useProducts(
    searchQuery ? { search: searchQuery } : undefined,
  );
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      await Promise.all([
        refetchProducts?.(),
        refetchProfile?.(),
      ]);
    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Extract unique categories from products data
  const categories = useMemo(() => {
    if (!data || data.length === 0) return [];

    const uniqueCategories = new Set<string>();
    data.forEach((product: any) => {
      if (product.category) {
        const cleanCategory = product.category.trim();
        uniqueCategories.add(cleanCategory);
      }
    });

    return Array.from(uniqueCategories).map((category, index) => {
      // const colors = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS["default"];
      // const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS["default"];
      const normalizedCategory = category.trim().toLowerCase();

      const iconMap: Record<string, any> = {
        "food": Utensils,
        "vegetables and fruits": Leaf,
        "groceries": ShoppingCart,
        "home made": HomeIcon,
        "service": Briefcase,
        "fish & meat": Fish,
        "rent": Wrench,
        "electronics": Plug,
      };

      const gradientMap: Record<string, any> = {
        "food": CATEGORY_GRADIENTS["Food"],
        "vegetables and fruits":
          CATEGORY_GRADIENTS["Vegetables and fruits"],
        "groceries": CATEGORY_GRADIENTS["Groceries"],
        "home made": CATEGORY_GRADIENTS["Home made"],
        "service": CATEGORY_GRADIENTS["Service"],
        "fish & meat": CATEGORY_GRADIENTS["Fish meat"],
        "rent": CATEGORY_GRADIENTS["rent"],
        "electronics": CATEGORY_GRADIENTS["electronics"],
      };

      const icon = iconMap[normalizedCategory] || Package;

      const colors =
        gradientMap[normalizedCategory] ||
        CATEGORY_GRADIENTS["default"];

      return {
        id: `category-${index}`,
        name: category,
        icon: icon,
        gradient: colors.gradient,
        iconColor: colors.iconColor,
        shadowColor: colors.shadowColor,
      };
    });
  }, [data]);

  const scaleAnims = useRef(
    Array(10).fill(0).map(() => new Animated.Value(1))
  ).current;

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / slideSize);
    setActiveSlide(activeIndex);
  };

  const handleCallHappy60 = () => {
    Linking.openURL("tel:9567771549");
  };

  const handleCategoryPressIn = (index: number) => {
    if (scaleAnims[index]) {
      Animated.spring(scaleAnims[index], {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleCategoryPressOut = (index: number) => {
    if (scaleAnims[index]) {
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: "/products",
      params: { category: categoryName },
    });
  };

  const S3_BASE_URL = process.env.EXPO_PUBLIC_S3_BASE_URL;

  return (
    <View className="flex-1" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Luxurious Blue Gradient Header */}
      <LinearGradient
        colors={["#1E3A8A", "#2563EB", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 24, paddingBottom: 32 }}
      >
        {/* Decorative overlay pattern */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
          }}
        >
          <View style={{
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: 'white',
            position: 'absolute',
            top: -50,
            right: -50,
          }} />
          <View style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: 'white',
            position: 'absolute',
            bottom: -30,
            left: -40,
          }} />
        </View>

        <View className="px-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">

                <Text
                  className="text-4xl font-black text-white ml-2"
                  style={{
                    letterSpacing: 1,
                    textShadowColor: 'rgba(0, 0, 0, 0.1)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }}
                >
                  Sahachari
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                <View className="w-12 h-0.5 bg-blue-200 mr-3 rounded-full" />
                <Text className="text-blue-50 text-sm font-semibold tracking-wide">
                  Premium Local Services
                </Text>
              </View>
            </View>

            {/* Luxurious Profile Icon */}
            <Pressable
              onPress={() => router.push("/settings/settings")}
              className="relative"
            >
              <View
                className="rounded-full"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  shadowColor: "#1E40AF",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 10,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#EFF6FF"]}
                  className="rounded-full p-1"
                  style={{
                    flex: 1,
                    borderRadius: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 4,
                  }}
                >
                  {profile?.image ? (
                    <Image
                      source={{ uri: `${S3_BASE_URL}/${profile.image}` }}
                      className="w-16 h-16 rounded-full"
                      style={{
                        borderWidth: 3,
                        borderColor: '#FFFFFF',
                      }}
                    />
                  ) : (
                    <View
                      className="w-16 h-16 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderWidth: 3,
                        borderColor: '#EFF6FF',
                      }}
                    >
                      <User size={28} color="#2563EB" strokeWidth={2.5} />
                    </View>
                  )}
                </LinearGradient>
              </View>
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
      >
        {/* Ultra Premium Carousel */}
        <View className="mt-8">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* {CAROUSEL_IMAGES.map((image, index) => ( */}
            {carouselData.map((item, index) => (
              <View
                key={index}
                style={{ width }}
                className="items-center px-6"
              >
                <View
                  className="rounded-3xl overflow-hidden bg-white"
                  style={{
                    shadowColor: "#2563EB",
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.18,
                    shadowRadius: 20,
                    elevation: 15,
                    borderWidth: 1,
                    borderColor: '#EFF6FF',
                  }}
                >
                  {/* <Image
                    // source={image}
                    source={{
                      uri:
                        item.imageUrl ||
                        `${S3_BASE_URL}/${item.image}`,
                    }}
                    // Keep your dimensions
                    style={{ width: width - 48, height: 220 }}
                    // CHANGE THIS LINE:
                    resizeMode="contain"
                  /> */}
                  {(item.imageUrl || item.image) && (
                    <Image
                      source={{
                        uri:
                          item.imageUrl ||
                          `${S3_BASE_URL}/${item.image}`,
                      }}
                      style={{
                        width: width - 48,
                        height: 220,
                      }}
                      resizeMode="contain"
                    />
                  )}
                  {/* Elegant overlay */}
                  <LinearGradient
                    colors={["transparent", "rgba(30, 58, 138, 0.2)"]}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 100,
                    }}
                  />
                  {/* Top shine effect */}
                  <LinearGradient
                    colors={["rgba(255, 255, 255, 0.3)", "transparent"]}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      height: 60,
                    }}
                  />
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Luxurious Pagination Dots */}
          <View className="flex-row justify-center items-center mt-6">
            {/* {CAROUSEL_IMAGES.map((_, index) => ( */}
            {carouselData.map((_, index) => (
              <View
                key={index}
                style={{
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 5,
                  width: activeSlide === index ? 32 : 8,
                  backgroundColor: activeSlide === index ? "#2563EB" : "#CBD5E1",
                  shadowColor: activeSlide === index ? "#2563EB" : "transparent",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.4,
                  shadowRadius: 6,
                  elevation: activeSlide === index ? 5 : 0,
                }}
              />
            ))}
          </View>
        </View>

        {/* Luxurious Happy 60 Card */}
        <Pressable
          onPress={handleCallHappy60}
          className="mx-6 mt-8"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <View
            className="rounded-3xl overflow-hidden bg-white"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 10,
              borderWidth: 1,
              borderColor: '#EFF6FF',
            }}
          >
            <LinearGradient
              colors={["#FFFFFF", "#EFF6FF", "#DBEAFE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 24 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-3">

                  </View>
                  <Text className="text-3xl font-black text-blue-900 mb-2" style={{ letterSpacing: 0.5 }}>
                    Happy 60
                  </Text>
                  <Text className="text-blue-600 text-sm font-semibold leading-5">
                    Exclusive for senior citizens
                  </Text>
                </View>

                <View
                  className="rounded-2xl"
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 20,
                    shadowColor: "#2563EB",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 8,
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-2xl p-5"
                    style={{
                      flex: 1,
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Phone size={26} color="#FFFFFF" strokeWidth={2.5} />
                  </LinearGradient>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Pressable>

        {/* Premium Categories Section */}
        <View className="mt-10 px-6">
          <View className="flex-row items-center justify-between mb-7">
            <View className="flex-1">
              <Text className="text-3xl font-black text-gray-900 tracking-tight" style={{ letterSpacing: 0.3 }}>
                Our Services
              </Text>
              <View className="flex-row items-center mt-2">
                <View className="w-8 h-0.5 bg-blue-500 rounded-full mr-2" />
                <Text className="text-blue-600 text-sm font-bold tracking-wide">
                  Discover Excellence
                </Text>
              </View>
            </View>
            <View
              className="bg-blue-50 rounded-2xl p-3"
              style={{
                shadowColor: "#2563EB",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
              }}
            >
              <ChevronRight size={22} color="#2563EB" strokeWidth={2.5} />
            </View>
          </View>

          {/* Loading State */}
          {isLoading && (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="text-blue-400 mt-6 font-semibold text-base">Loading services...</Text>
            </View>
          )}

          {/* Luxurious Categories Grid */}
          {!isLoading && categories.length > 0 && (
            <View className="flex-row flex-wrap justify-between">
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Animated.View
                    key={category.id}
                    style={{
                      transform: [{ scale: scaleAnims[index] || 1 }],
                      width: "48%",
                      marginBottom: 18,
                    }}
                  >
                    <Pressable
                      onPress={() => handleCategoryPress(category.name)}
                      onPressIn={() => handleCategoryPressIn(index)}
                      onPressOut={() => handleCategoryPressOut(index)}
                    >
                      <View
                        className="rounded-3xl overflow-hidden"
                        style={{
                          shadowColor: category.shadowColor,
                          shadowOffset: { width: 0, height: 6 },
                          shadowOpacity: 0.15,
                          shadowRadius: 14,
                          elevation: 8,
                          borderWidth: 1,
                          borderColor: '#F1F5F9',
                        }}
                      >
                        <LinearGradient
                          colors={category.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{ padding: 24 }}
                        >
                          <View className="items-center">
                            <View
                              className="rounded-2xl p-4 mb-4"
                              style={{
                                backgroundColor: '#FFFFFF',
                                shadowColor: category.iconColor,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                                elevation: 6,
                                borderWidth: 1,
                                borderColor: '#F1F5F9',
                              }}
                            >
                              <IconComponent
                                size={32}
                                color={category.iconColor}
                                strokeWidth={2.5}
                              />
                            </View>
                            <Text
                              className="text-gray-900 font-black text-base text-center"
                              numberOfLines={1}
                              style={{ letterSpacing: 0.5 }}
                            >
                              {category.name}
                            </Text>
                          </View>
                        </LinearGradient>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          )}

          {/* Premium Empty State */}

        </View>
      </ScrollView>
    </View>
  );
}