import { useAuthStore } from "@/store/auth.store";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Search, ShoppingBag, Store, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCategoryStores } from "../../hooks/Usecategorystores";
// import { useProducts } from "../../hooks/useProducts";
import { useStoreProducts } from "../../hooks/useStoreProducts";
import {
  Briefcase,
  ChevronRight,
  Fish,
  Utensils,
  HomeIcon,
  Leaf,
  Package,
  ShoppingCart,
} from "lucide-react-native";

import { Animated } from "react-native";
import { useMemo, useRef } from "react";
import { useProducts } from "../../hooks/useProducts";
interface Store {
  _id: string;
  name: string;
  email: string;
  address: string;
  status: string;
  isVerified: boolean;
  image: string;
}

interface Product {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  category: string;
  price: string;
  finalPrice?: number;
  images: string[];
  quantity: number;
  offers: any[];
  storeId?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  Food: Utensils,
  "Vegetables and fruits": Leaf,
  Groceries: ShoppingCart,
  "Home made": HomeIcon,
  Service: Briefcase,
  "Fish meat": Fish,
  default: Package,
};

const CATEGORY_GRADIENTS: Record<
  string,
  { gradient: string[]; iconColor: string; shadowColor: string }
> = {
  Food: {
    gradient: ["#FFFFFF", "#FFF7ED"],
    iconColor: "#9A3412",
    shadowColor: "#FDBA74",
  },

  "Vegetables and fruits": {
    gradient: ["#FFFFFF", "#ECFDF5"],
    iconColor: "#047857",
    shadowColor: "#6EE7B7",
  },

  Groceries: {
    gradient: ["#FFFFFF", "#F0F9FF"],
    iconColor: "#0369A1",
    shadowColor: "#7DD3FC",
  },

  "Home made": {
    gradient: ["#FFFFFF", "#FFF1F2"],
    iconColor: "#9F1239",
    shadowColor: "#FDA4AF",
  },

  Service: {
    gradient: ["#FFFFFF", "#ECFEFF"],
    iconColor: "#0E7490",
    shadowColor: "#67E8F9",
  },

  "Fish meat": {
    gradient: ["#FFFFFF", "#EFF6FF"],
    iconColor: "#1D4ED8",
    shadowColor: "#93C5FD",
  },

  default: {
    gradient: ["#FFFFFF", "#F1F5F9"],
    iconColor: "#475569",
    shadowColor: "#94A3B8",
  },
};

export default function ProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const categoryFilter = params.category as string | undefined;
  const storeId = params.storeId as string | undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuthStore();
  // Your auth token - replace with actual token from your auth system
  const AUTH_TOKEN = token
  const S3_BASE_URL = process.env.EXPO_PUBLIC_S3_BASE_URL
  // Fetch category stores when category is provided but no storeId
  const { data: stores = [], isLoading: isLoadingStores } = useCategoryStores(
    categoryFilter && !storeId ? categoryFilter : undefined,
    AUTH_TOKEN
  );

  // Fetch products by storeId if provided, otherwise fetch all products
  // const { data: allProducts, isLoading: isLoadingAllProducts } = useProducts(
  //   searchQuery ? { search: searchQuery } : undefined
  // );

  const { data: storeProducts, isLoading: isLoadingStoreProducts } = useStoreProducts(storeId);

  // Determine which products to show
  // const displayProducts = storeId ? storeProducts : allProducts;
  // const isLoadingProducts = storeId ? isLoadingStoreProducts : isLoadingAllProducts;

  // const displayProducts = storeProducts || [];
  const displayProducts = useMemo(() => {
    if (!storeProducts) return [];

    // filter by selected category
    let filtered = storeProducts;

    if (categoryFilter) {
      filtered = filtered.filter(
        (item: Product) => item.category === categoryFilter
      );
    }

    // filter by search
    if (searchQuery.trim()) {
      filtered = filtered.filter((item: Product) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [storeProducts, categoryFilter, searchQuery]);
  const isLoadingProducts = isLoadingStoreProducts;

  const handleStorePress = (selectedStoreId: string) => {
    router.push({
      pathname: "/products",
      params: {
        category: categoryFilter,
        storeId: selectedStoreId
      }
    } as any);
  };

  const handleProductPress = (product: any) => {
    // Use _id if available, fallback to id
    const productId = product._id || product.id;
    router.push(`/product/${productId}` as any);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearCategoryFilter = () => {
    router.setParams({ category: undefined, storeId: undefined });
  };

  const clearStoreFilter = () => {
    router.setParams({ storeId: undefined });
  };

  const renderStore = ({ item }: { item: Store }) => {
    return (
      <Pressable
        onPress={() => handleStorePress(item._id)}
        className="mb-4 mx-4 rounded-3xl overflow-hidden bg-white active:scale-[0.98]"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        <View className="flex-row">
          {/* Store Image */}
          <View className="w-32 h-32 relative">
            {item.image ? (
              <>
                <Image
                  source={{ uri: `${S3_BASE_URL}/${item.image}` }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.3)"]}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 40,
                  }}
                />
              </>
            ) : (
              <View className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
                <Store size={32} color="#D1D5DB" strokeWidth={1.5} />
              </View>
            )}

            {/* Verified Badge */}
            {item.isVerified && (
              <View className="absolute top-2 left-2">
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    ✓ Verified
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Status Badge */}
            <View className="absolute bottom-2 right-2">
              <View
                className={`px-2 py-1 rounded-full ${item.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'
                  }`}
              >
                <Text className="text-white text-xs font-semibold">
                  {item.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Store Details */}
          <View className="flex-1 p-4 justify-between">
            {/* Name and Address */}
            <View>
              <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
                📍 {item.address}
              </Text>
              <Text className="text-sm text-gray-400 mt-1" numberOfLines={1}>
                ✉️ {item.email}
              </Text>
            </View>

            {/* View Products Button */}
            <View className="mt-3">
              <View className="bg-blue-50 self-start px-4 py-2 rounded-full">
                <Text className="text-xs text-blue-700 font-semibold">
                  View Products →
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isService = item.category === "Service";
    const hasDiscount = item.offers && item.offers.length > 0;

    // Calculate final price - use finalPrice if it exists, otherwise use price
    const displayPrice = item.finalPrice || parseFloat(item.price);
    const originalPrice = parseFloat(item.price);

    const discountPercent = hasDiscount && item.finalPrice
      ? Math.round(((originalPrice - item.finalPrice) / originalPrice) * 100)
      : 0;

    return (
      <Pressable
        onPress={() => handleProductPress(item)}
        className="mb-4 mx-4 rounded-3xl overflow-hidden bg-white active:scale-[0.98]"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        <View className="flex-row">
          {/* Product Image */}
          <View className="w-32 h-32 relative">
            {item.images && item.images.length > 0 ? (
              <>
                <Image
                  source={{ uri: `${S3_BASE_URL}/${item.images[0]}` }}
                  // source={{ uri: item.images[0] }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                {/* Gradient Overlay on Image */}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.3)"]}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 40,
                  }}
                />
                {/* Multiple Images Indicator */}
                {item.images.length > 1 && (
                  <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">
                      +{item.images.length - 1}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
                <ShoppingBag size={32} color="#D1D5DB" strokeWidth={1.5} />
              </View>
            )}

            {/* Service Badge */}
            {isService && (
              <View className="absolute top-2 left-2">
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    Service
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Discount Badge - Only for Products */}
            {!isService && hasDiscount && discountPercent > 0 && (
              <View className="absolute top-2 left-2">
                <LinearGradient
                  colors={["#EF4444", "#DC2626"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    -{discountPercent}%
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Product Details */}
          <View className="flex-1 p-4 justify-between">
            {/* Name and Description */}
            <View>
              <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
                {item.description}
              </Text>
            </View>

            {/* Price and Stock/Availability */}
            <View className="mt-3">
              <View className="flex-row items-baseline">
                <Text className="text-2xl font-bold text-blue-600">
                  ₹{displayPrice}
                </Text>
                {isService && (
                  <Text className="text-xs text-gray-600 ml-1">
                    /hr
                  </Text>
                )}
                {!isService && hasDiscount && item.finalPrice && (
                  <Text className="text-sm text-gray-400 line-through ml-2">
                    ₹{item.price}
                  </Text>
                )}
              </View>

              {/* Stock Status - Only for Products */}
              {!isService && (
                <View className="mt-2">
                  {item.quantity > 0 ? (
                    <View className="bg-green-50 self-start px-3 py-1 rounded-full">
                      <Text className="text-xs text-green-700 font-semibold">
                        ✓ In Stock ({item.quantity})
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-red-50 self-start px-3 py-1 rounded-full">
                      <Text className="text-xs text-red-700 font-semibold">
                        ✗ Out of Stock
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Availability Badge - Only for Services */}
              {isService && (
                <View className="mt-2">
                  <View className="bg-blue-50 self-start px-3 py-1 rounded-full">
                    <Text className="text-xs text-blue-700 font-semibold">
                      ✓ Available
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  // Determine what to show based on params
  // const showingStores = categoryFilter && !storeId;
  // const showingProducts = storeId || !categoryFilter;
  const showingStores = !!categoryFilter && !storeId;
  const showingProducts = !!storeId;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingBottom: 20 }}
      >
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
              onPress={() => router.back()}
              className="bg-white/20 rounded-full p-2.5 backdrop-blur-sm"
            >
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-white">
                {/* {showingStores
                  ? `${categoryFilter} Stores`
                  : storeId
                    ? "Products"
                    : "All Products"
                } */}
                {showingStores
                  ? `${categoryFilter} Stores`
                  : showingProducts
                    ? "Services"
                    : "All Services"
                }
              </Text>
              {showingStores && stores.length > 0 && (
                <Text className="text-blue-100 text-sm mt-0.5">
                  {stores.length} stores
                </Text>
              )}
              {showingProducts && displayProducts && displayProducts.length > 0 && (
                <Text className="text-blue-100 text-sm mt-0.5">
                  {displayProducts.length} items
                </Text>
              )}
            </View>
            <View className="w-12" />
          </View>

          {/* Premium Search Bar - Only show for products */}
          {showingProducts && (
            <View
              className="bg-white rounded-2xl flex-row items-center px-4 py-3.5"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Search size={20} color="#9CA3AF" strokeWidth={2} />
              <TextInput
                // placeholder="Search products..."
                placeholder="Search services..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-3 text-gray-900 text-base"
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={clearSearch}
                  className="bg-gray-100 rounded-full p-1"
                >
                  <X size={16} color="#6B7280" strokeWidth={2.5} />
                </Pressable>
              )}
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Breadcrumb Filters */}
      {(categoryFilter || storeId) && (
        <View className="px-4 pt-4 pb-2 flex-row flex-wrap gap-2">
          {categoryFilter && (
            <Pressable
              onPress={clearCategoryFilter}
              className="flex-row items-center px-4 py-2.5 rounded-full"
              style={{
                backgroundColor: "#DBEAFE",
                shadowColor: "#2563EB",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text className="text-blue-700 font-semibold mr-2">
                {categoryFilter}
              </Text>
              <X size={16} color="#1D4ED8" strokeWidth={3} />
            </Pressable>
          )}

          {storeId && (
            <Pressable
              onPress={clearStoreFilter}
              className="flex-row items-center px-4 py-2.5 rounded-full"
              style={{
                backgroundColor: "#FEF3C7",
                shadowColor: "#F59E0B",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text className="text-amber-700 font-semibold mr-2">
                Store Products
              </Text>
              <X size={16} color="#D97706" strokeWidth={3} />
            </Pressable>
          )}
        </View>
      )}

      {/* Stores List */}
      {/* Categories Grid */}
      {!categoryFilter && !storeId && (
        <View className="flex-1 px-6 pt-6">

          {/* Categories */}
          <View className="flex-row flex-wrap justify-between">
            {Object.keys(CATEGORY_ICONS).filter(
              (category) => category !== "default"
            ).map((category, index) => {
              const IconComponent =
                CATEGORY_ICONS[category] || CATEGORY_ICONS.default;

              const colors =
                CATEGORY_GRADIENTS[category] ||
                CATEGORY_GRADIENTS.default;

              return (
                <Animated.View
                  key={category}
                  style={{
                    width: "48%",
                    marginBottom: 18,
                  }}
                >
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/products",
                        params: { category },
                      } as any)
                    }
                  >
                    <View
                      className="rounded-3xl overflow-hidden"
                      style={{
                        shadowColor: colors.shadowColor,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.15,
                        shadowRadius: 14,
                        elevation: 8,
                        borderWidth: 1,
                        borderColor: "#F1F5F9",
                      }}
                    >
                      <LinearGradient
                        colors={colors.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ padding: 24 }}
                      >
                        <View className="items-center">
                          <View
                            className="rounded-2xl p-4 mb-4"
                            style={{
                              backgroundColor: "#FFFFFF",
                              shadowColor: colors.iconColor,
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.2,
                              shadowRadius: 8,
                              elevation: 6,
                              borderWidth: 1,
                              borderColor: "#F1F5F9",
                            }}
                          >
                            <IconComponent
                              size={32}
                              color={colors.iconColor}
                              strokeWidth={2.5}
                            />
                          </View>

                          <Text
                            className="text-gray-900 font-black text-base text-center"
                            numberOfLines={1}
                            style={{ letterSpacing: 0.5 }}
                          >
                            {category}
                          </Text>
                        </View>
                      </LinearGradient>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>
      )}

      {showingStores && (
        <>
          {isLoadingStores ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="text-gray-500 mt-4 font-medium">Loading stores...</Text>
            </View>
          ) : stores.length > 0 ? (
            <FlatList
              data={stores}
              renderItem={renderStore}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <View className="bg-white rounded-3xl p-8 items-center shadow-lg">
                <Text className="text-7xl mb-4">🏪</Text>
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  No stores found
                </Text>
                <Text className="text-gray-500 text-center text-base leading-6">
                  No stores available in "{categoryFilter}" category
                </Text>
              </View>
            </View>
          )}
        </>
      )}

      {/* Products List */}
      {showingProducts && (
        <>
          {isLoadingProducts ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="text-gray-500 mt-4 font-medium">Loading products...</Text>
            </View>
          ) : displayProducts && displayProducts.length > 0 ? (
            <FlatList
              data={displayProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item._id || item.id}
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <View className="bg-white rounded-3xl p-8 items-center shadow-lg">
                <Text className="text-7xl mb-4">📦</Text>
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  {/* No products found */}
                  "No services found"
                </Text>
                <Text className="text-gray-500 text-center text-base leading-6">
                  {searchQuery
                    ? "Try searching with different keywords"
                    : "No services available at the moment"
                    // : "No products available at the moment"
                  }
                </Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}