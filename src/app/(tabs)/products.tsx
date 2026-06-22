import { useStoreStatus } from "@/hooks/useStore";
import { useAuthStore } from "@/store/auth.store";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Search, ShoppingBag, Store, X } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCategoryStores } from "../../hooks/Usecategorystores";
import { useProducts } from "../../hooks/useProducts";
import { useStoreProducts } from "../../hooks/useStoreProducts";

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
  status: string; // ACTIVE | CLOSED
}

export default function ProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  // const categoryFilter = params.category as string | undefined;
  const categoryFilter = params.category as string | undefined;
  const activeCategory = categoryFilter ?? "Service";

  const storeId = params.storeId as string | undefined;
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuthStore();

  const isDefaultServiceMode = !params.category;

  const isStoreMode = !!categoryFilter && !storeId;
  const isProductMode = !!storeId;

  const AUTH_TOKEN = token;
  const S3_BASE_URL = process.env.EXPO_PUBLIC_S3_BASE_URL;

  // Fetch category stores when category is provided but no storeId
  const { data: stores = [], isLoading: isLoadingStores, refetch: refetchStores, } = useCategoryStores(
    isStoreMode
      ? activeCategory
      : isDefaultServiceMode
        ? "Service"
        : undefined,
    AUTH_TOKEN
  );

  // Fetch products by search query or all products
  // const { data: allProducts, isLoading: isLoadingAllProducts } = useProducts(
  //   searchQuery ? { search: searchQuery } : undefined
  // );

  const effectiveCategory = categoryFilter ?? "Service";
  const { data: allProducts = [], isLoading: isLoadingAllProducts, refetch: refetchProducts, } =
    useProducts({
      category: effectiveCategory,
      search: searchQuery || undefined,
    });


  const { data: storeProducts, isLoading: isLoadingStoreProducts, refetch: refetchStoreProducts, } = useStoreProducts(storeId);
  const {
    data: storeStatuses = [],
    isLoading: isLoadingStoreStatus,
    error: storeStatusError,
  } = useStoreStatus(token);

  console.log("storeStatuses", storeStatuses);
  console.log("storeStatusError", storeStatusError);


  //filter products based on category
  const filteredProducts = (storeProducts ?? allProducts ?? []).filter(
    (p) =>
      activeCategory
        ? p.category === activeCategory
        : true
  );
  // Determine which products to show
  // const displayProducts = storeId ? storeProducts : allProducts;
  // const displayProducts = storeId ? filteredProducts : allProducts;
  const allowedStoreIds = stores.map((s) => s._id);

  const displayProducts = storeId
    ? filteredProducts
    : allProducts.filter((p) =>
      allowedStoreIds.includes(p.storeId || "")
    );

  // const isLoadingProducts = storeId
  //   ? isLoadingStoreProducts
  //   : isLoadingAllProducts;
  const isLoadingProducts = storeId
    ? !!isLoadingStoreProducts
    : !!isLoadingAllProducts;

  // refresh page
  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        refetchProducts?.(),
        refetchStoreProducts?.(),
        refetchStores?.(),
      ]);
    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };


  const handleStorePress = (selectedStoreId: string) => {
    router.push({
      pathname: "/products",
      params: {
        category: categoryFilter,
        storeId: selectedStoreId,
      },
    } as any);
  };

  const handleProductPress = (product: any) => {
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
  // translate category name
  const categoryKey = categoryFilter
    ?.toLowerCase()
    .replace(/&/g, "")
    .replace(/\s+/g, "_");

  const translatedCategory = categoryKey
    ? t(`categories.${categoryKey}`)
    : "";

  const renderStore = ({ item }: { item: Store }) => {
    const isStoreActive = item.status === "ACTIVE";

    return (
      <Pressable
        // disabled={!isStoreActive}
        onPress={() => handleStorePress(item._id)}
        className="mb-4 mx-4 rounded-3xl overflow-hidden bg-white active:scale-[0.98]"
        style={{
          opacity: isStoreActive ? 1 : 0.65,
          backgroundColor: isStoreActive ? "#FFFFFF" : "#F3F4F6",
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
                />{!isStoreActive && (
                  <View
                    className="absolute inset-0"
                    style={{
                      backgroundColor: "rgba(128,128,128,0.65)",
                    }}
                  />
                )}
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
                  colors={isStoreActive
                    ? ["#10B981", "#059669"] : ["#9CA3AF", "#6B7280"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    {t("Verified")}
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Status Badge */}
            {/* <View className="absolute bottom-2 right-2">
              <View
                className={`px-2 py-1 rounded-full ${item.status === "ACTIVE" ? "bg-green-500" : "bg-gray-500"
                  }`}
              >
                <Text className="text-white text-xs font-semibold">
                  {item.status}
                </Text>
              </View>
            </View> */}
            <View className="absolute bottom-2 right-2">
              <View
                className={`px-3 py-1 rounded-full ${isStoreActive ? "bg-green-500" : "bg-black"
                  }`}
              >
                <Text className="text-white text-xs font-semibold">
                  {isStoreActive ? t("Open") : t("Closed")}
                </Text>
              </View>
            </View>
          </View>

          {/* Store Details */}
          <View className="flex-1 p-4 justify-between">
            <View>
              <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                {item.name}
              </Text>
              <Text
                className={`text-sm ${isStoreActive ? "text-gray-500" : "text-gray-400"
                  }`}
              >
                📍 {item.address}
              </Text>
              <Text className="text-sm text-gray-400 mt-1" numberOfLines={1}>
                ✉️ {item.email}
              </Text>
            </View>
            <View className="mt-3">
              {/* <View className="bg-blue-50 self-start px-4 py-2 rounded-full">
                <Text className="text-xs text-blue-700 font-semibold">
                  {t("View_Products")}
                </Text>
              </View> */}
              <View
                className={`self-start px-4 py-2 rounded-full ${isStoreActive ? "bg-blue-50" : "bg-gray-200"
                  }`}
              >
                <Text
                  className={`text-xs font-semibold ${isStoreActive ? "text-blue-700" : "text-gray-500"
                    }`}
                >
                  {t("View_Products")}
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

    const currentStore = Array.isArray(storeStatuses)
      ? storeStatuses.find(
        (s) => String(s.storeId) === String(item.storeId)
      )
      : null;

    const isStoreActive = currentStore?.status === 'ACTIVE';
    console.log("Product Store ID:", item.storeId);
    console.log("stores", stores);
    console.log("Store Statuses:", storeStatuses);

    const extractPrice = (value: any) => {
      if (!value) return 0;

      const match = String(value).match(/\d+(\.\d+)?/);

      return match ? Number(match[0]) : 0;
    };

    const originalPrice = extractPrice(item.price);

    const finalPrice = item.finalPrice ?? originalPrice;

    const hasDiscount = finalPrice < originalPrice;
    const discountPercent = hasDiscount
      ? Math.round(
        ((originalPrice - finalPrice) / originalPrice) * 100
      )
      : 0;

    const displayPrice = finalPrice;

    const unit =
      typeof item.price === "string" &&
        item.price.includes("/")
        ? item.price.split("/")[1].trim()
        : "";

    const imageUrl = item.images?.[0]?.startsWith("http")
      ? item.images[0]
      : `${S3_BASE_URL?.replace(/\/$/, "")}/${item.images?.[0]}`;

    return (
      <Pressable
        disabled={!isStoreActive}
        onPress={() => handleProductPress(item)}
        className="mb-4 mx-4 rounded-3xl overflow-hidden bg-white active:scale-[0.98]"
        style={{
          shadowColor: "#000",
          opacity: isStoreActive ? 1 : 0.65,
          backgroundColor: isStoreActive ? "#FFFFFF" : "#F3F4F6",
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
                  source={{ uri: imageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                {!isStoreActive && (
                  <View
                    className="absolute inset-0"
                    style={{
                      backgroundColor: "rgba(128,128,128,0.65)",
                    }}
                  />
                )}
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

            {isService && (
              <View className="absolute top-2 left-2">
                <LinearGradient
                  colors={isStoreActive
                    ? ["#3B82F6", "#2563EB"]
                    : ["#9CA3AF", "#6B7280"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    {t("Service")}
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* {!isService && hasDiscount && discountPercent > 0 && ( */}
            {hasDiscount && discountPercent > 0 && (
              <View className="absolute top-2 right-2">
                <LinearGradient
                  colors={isStoreActive ? ["#EF4444", "#DC2626"] : ["#9CA3AF", "#6B7280"]}
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
            <View>
              <Text
                className={`text-lg font-bold ${isStoreActive ? "text-gray-900" : "text-gray-500"
                  }`}
              >
                {item.name}
              </Text>
              <Text
                className={`text-sm ${isStoreActive ? "text-gray-500" : "text-gray-400"
                  }`}
              >
                {item.description}
              </Text>
            </View>

            <View className="mt-3">
              <View className="flex-row items-baseline">
                <View className="flex-row items-end">
                  <Text
                    className={`text-2xl font-bold ${isStoreActive ? "text-blue-600" : "text-gray-500"
                      }`}
                  >
                    ₹{displayPrice}
                  </Text>

                  {isService ? (
                    <Text className="text-xs text-gray-600 ml-1 mb-1">
                      /hr
                    </Text>
                  ) : unit ? (
                    <Text className="text-xs text-gray-600 ml-1 mb-1">
                      /{unit}
                    </Text>
                  ) : null}
                </View>
                {/* {!isService && hasDiscount && item.finalPrice && ( */}
                {hasDiscount && (
                  <Text className="text-sm text-gray-400 line-through ml-2">
                    {/* ₹{item.price} */}
                    ₹{originalPrice}
                  </Text>
                )}
              </View>

              {!isService && (
                <View className="mt-2">
                  {item.quantity > 0 ? (
                    <View
                      className={`self-start px-3 py-1 rounded-full ${isStoreActive ? "bg-green-50" : "bg-gray-200"
                        }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${isStoreActive ? "text-green-700" : "text-gray-600"
                          }`}
                      >
                        {t("In_Stock")} ({item.quantity})
                      </Text>
                    </View>
                  ) : (
                    <View
                      className={`self-start px-3 py-1 rounded-full ${isStoreActive ? "bg-red-50" : "bg-gray-200"
                        }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${isStoreActive ? "text-red-700" : "text-gray-600"
                          }`}
                      >
                        {t("Out_of_Stock")}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {isService && (
                <View className="mt-2">
                  <View
                    className={`self-start px-3 py-1 rounded-full ${isStoreActive ? "bg-blue-50" : "bg-gray-200"
                      }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${isStoreActive ? "text-blue-700" : "text-gray-600"
                        }`}
                    >
                      {t("Available")}
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

  const showingStores = categoryFilter && !storeId;
  // const showingProducts = storeId || !categoryFilter;
  const showingProducts =
    !!storeId || (!categoryFilter && !isLoadingStores);

  const isService = effectiveCategory?.toLowerCase() === "service";

  const pageTitle = showingStores
    ? `${translatedCategory} ${t("Stores")}`
    : isService
      ? t("All_Services")
      : t("All_Products");

  return (
    <View className="flex-1 bg-gray-50">
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
                {showingStores
                  ? `${translatedCategory} ${t("Stores")}`
                  : isService
                    ? t("All_Services")
                    : t("All_Products")}
              </Text>
              {showingStores && stores.length > 0 && (
                <Text className="text-blue-100 text-sm mt-0.5">
                  {stores.length}{" "}
                  {stores.length === 1 ? t("store") : t("stores")}
                </Text>
              )}
              {showingProducts && displayProducts && displayProducts.length > 0 && (
                <Text className="text-blue-100 text-sm mt-0.5">
                  {displayProducts.length}{" "}
                  {displayProducts.length === 1 ? t("item") : t("items")}
                </Text>
              )}
            </View>
            <View className="w-12" />
          </View>

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
                placeholder={t('Search_products')}
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
                {/* {categoryFilter} */}
                {translatedCategory}
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
                {t("store_products")}
              </Text>
              <X size={16} color="#D97706" strokeWidth={3} />
            </Pressable>
          )}
        </View>
      )}

      {showingStores && (
        <>
          {isLoadingStores ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="text-gray-500 mt-4 font-medium">
                {t("Loading_stores")}
              </Text>
            </View>
          ) : stores.length > 0 ? (
            <FlatList
              data={stores}
              renderItem={renderStore}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#2563EB"]}
                />
              }
            />
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <View className="bg-white rounded-3xl p-8 items-center shadow-lg">
                <Text className="text-7xl mb-4">🏪</Text>
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  {t("No_stores_found")}
                </Text>
                {/* <Text className="text-gray-500 text-center text-base leading-6">
                  No stores available in "{categoryFilter}" category
                </Text> */}
                <Text className="text-gray-500 text-center text-base leading-6">
                  {t("noStoresInCategory", {
                    category: translatedCategory,
                  })}
                </Text>
              </View>
            </View>
          )}
        </>
      )}

      {showingProducts && (
        <>
          {isLoadingProducts ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="text-gray-500 mt-4 font-medium">
                Loading products...
              </Text>
            </View>
          ) : displayProducts && displayProducts.length > 0 ? (
            <FlatList
              data={displayProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item._id || item.id}
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#2563EB"]}
                />
              }
            />
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <View className="bg-white rounded-3xl p-8 items-center shadow-lg">
                <Text className="text-7xl mb-4">📦</Text>
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  {/* No products found */}
                  No services found
                </Text>
                <Text className="text-gray-500 text-center text-base leading-6">
                  {searchQuery
                    ? "Try searching with different keywords"
                    // : "No products available at the moment"}
                    : "No services available at the moment"}
                </Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}