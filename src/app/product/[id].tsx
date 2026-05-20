import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Package,
  Plus,
  Share2,
  ShoppingCart,
  XCircle
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddToCartModal } from "../../components/cart/AddToCartModal";
import { CheckoutModal } from "../../components/cart/CheckoutModal";
import { SuccessModal } from "../../components/cart/SuccessModal";
import { useProductActions } from "../../hooks/useProductActions";
import { useProduct } from "../../hooks/useProducts";

export const unstable_settings = {
  presentation: "card",
  headerShown: false,
};

const { width } = Dimensions.get("window");

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: product, isLoading, error, refetch } = useProduct(id);
  const {
    loading,
    address,
    setAddress,
    showAddressModal,
    setShowAddressModal,
    showSuccessModal,
    setShowSuccessModal,
    showQuantityModal,
    setShowQuantityModal,
    handleAddToCart,
    handleBuyNow,
  } = useProductActions(product);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);
  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  // Check if product is a service
  const isService = product?.category === "Service";

  const isRental = product?.category === "Rent";

  const isBookable = isService || isRental;
  const isPurchasable = !isBookable;

  const handleImageScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / slideSize);
    setActiveImageIndex(activeIndex);
  };

  const scrollToImage = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  const handleFavoritePress = () => {
    setIsFavorite(!isFavorite);
    Animated.sequence([
      Animated.timing(heartScaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heartScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleShareProduct = async () => {
    try {
      await Share.share({
        // message: `Check out ${product?.name} - ₹${finalPrice}${isService ? ' per hour' : ''}`,
        message: `Check out ${product?.name} - ₹${finalPrice}${isBookable ? ' per hour' : ''}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const incrementQuantity = () => {
    if (product?.quantity && quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCartClick = () => {
    // For services, automatically use quantity 1
    // if (isService) {
    if (isBookable) {
      handleAddToCart(1).then((success) => {
        if (success) {
          router.push("/(tabs)/cart");
        }
      });
    } else {
      setShowQuantityModal(true);
    }
  };

  const handleAddToCartConfirm = async (selectedQuantity: number) => {
    const success = await handleAddToCart(selectedQuantity);
    if (success) {
      // Redirect to cart page on success
      router.push("/(tabs)/cart");
    }
    return success;
  };

  const handleBuyNowClick = () => {
    setShowAddressModal(true);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
        {/* <Text className="text-gray-500 mt-4 font-medium">Loading {isService ? 'service' : 'product'}...</Text> */}
        <Text className="text-gray-500 mt-4 font-medium">
          Loading {isBookable ? 'booking item' : 'product'}...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="bg-white rounded-3xl p-8 items-center shadow-lg">
          <Text className="text-6xl mb-4">😔</Text>
          <Text className="text-xl font-bold text-gray-900 mb-2">
            {/* Unable to load {isService ? 'service' : 'product'} */}
            Unable to load {isBookable ? 'booking item' : 'product'}
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            Something went wrong. Please try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="rounded-full overflow-hidden"
          >
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingHorizontal: 24, paddingVertical: 12 }}
            >
              <Text className="text-white font-bold">Retry</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    );
  }

  const originalPrice = Number(product.price);
  const finalPrice = product.finalPrice ?? originalPrice;
  const hasDiscount = finalPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;
  const totalPrice = finalPrice * quantity;

  return (
    <View className="flex-1 bg-white">
      {/* Floating Header */}
      <View
        className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-6"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Pressable
          onPress={() => router.back() ?? router.push("/(tabs)/products")}
          className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg"
        >
          <ArrowLeft size={24} color="#1F2937" strokeWidth={2.5} />
        </Pressable>
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleShareProduct}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg"
          >
            <Share2 size={22} color="#1F2937" strokeWidth={2.5} />
          </Pressable>
          <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
            <Pressable
              onPress={handleFavoritePress}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg"
            >
              <Heart
                size={22}
                color={isFavorite ? "#EF4444" : "#1F2937"}
                fill={isFavorite ? "#EF4444" : "transparent"}
                strokeWidth={2.5}
              />
            </Pressable>
          </Animated.View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View className="bg-gray-50">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            scrollEventThrottle={16}
          >
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <View key={index} style={{ width }}>
                  <Image
                    source={{ uri: image }}
                    style={{ width, height: 400 }}
                    resizeMode="cover"
                  />
                </View>
              ))
            ) : (
              <View style={{ width, height: 400 }} className="bg-gray-200 items-center justify-center">
                <Package size={64} color="#9CA3AF" strokeWidth={1.5} />
                <Text className="text-gray-400 mt-4">No image available</Text>
              </View>
            )}
          </ScrollView>

          {/* Discount Badge on Image */}
          {hasDiscount && discountPercent > 0 && (
            <View className="absolute bottom-6 left-6">
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Text className="text-white text-lg font-bold">
                  {discountPercent}% OFF
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Service Badge on Image */}
          {/* {isService && ( */}
          {isBookable && (
            <View className="absolute top-6 left-6">
              <LinearGradient
                colors={["#3B82F6", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Text className="text-white text-lg font-bold">
                  Service
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Image Indicators */}
          {product.images && product.images.length > 1 && (
            <View className="absolute bottom-6 right-6 flex-row gap-2">
              {product.images.map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => scrollToImage(index)}
                  className={`h-2 rounded-full ${activeImageIndex === index
                    ? "bg-white w-8"
                    : "bg-white/50 w-2"
                    }`}
                />
              ))}
            </View>
          )}

          {/* Navigation Arrows */}
          {product.images && product.images.length > 1 && (
            <>
              {activeImageIndex > 0 && (
                <Pressable
                  onPress={() => scrollToImage(activeImageIndex - 1)}
                  className="absolute left-4 top-1/2 -mt-6 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
                >
                  <ChevronLeft size={24} color="#1F2937" strokeWidth={2.5} />
                </Pressable>
              )}
              {activeImageIndex < product.images.length - 1 && (
                <Pressable
                  onPress={() => scrollToImage(activeImageIndex + 1)}
                  className="absolute right-4 top-1/2 -mt-6 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
                >
                  <ChevronRight size={24} color="#1F2937" strokeWidth={2.5} />
                </Pressable>
              )}
            </>
          )}
        </View>

        {/* Product Info */}
        <View className="px-6 pt-6">
          {/* Product Name */}
          <Text className="text-3xl font-bold text-gray-900 leading-tight">
            {product.name}
          </Text>

          {/* Price Section */}
          <View className="mt-6 bg-blue-50 rounded-3xl p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-gray-600 text-sm mb-1">
                  {/* {isService ? 'Rate' : 'Price'} */}
                  {isBookable ? 'Rate' : 'Price'}
                </Text>
                <View className="flex-row items-baseline">
                  <Text className="text-4xl font-bold text-blue-600">
                    ₹{finalPrice}
                  </Text>
                  {/* {isService && ( */}
                  {isBookable && (
                    <Text className="text-lg text-gray-600 ml-2">
                      per hour
                    </Text>
                  )}
                  {/* {!isService && hasDiscount && ( */}

                  {!isBookable && hasDiscount && (
                    <Text className="text-xl text-gray-400 line-through ml-3">
                      ₹{originalPrice}
                    </Text>
                  )}
                </View>
                {/* {!isService && hasDiscount && ( */}
                {!isBookable && hasDiscount && (
                  <Text className="text-green-600 font-semibold mt-1">
                    You save ₹{(originalPrice - finalPrice).toFixed(2)}
                  </Text>
                )}
              </View>

              {/* Stock Status - Only for Products */}
              {/* {!isService && ( */}
              {isPurchasable && (
                <View>
                  {product.quantity && product.quantity > 0 ? (
                    <View className="bg-green-100 px-4 py-2 rounded-full flex-row items-center">
                      <CheckCircle size={18} color="#16A34A" strokeWidth={2.5} />
                      <Text className="text-green-700 font-bold ml-2">
                        In Stock
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-red-100 px-4 py-2 rounded-full flex-row items-center">
                      <XCircle size={18} color="#DC2626" strokeWidth={2.5} />
                      <Text className="text-red-700 font-bold ml-2">
                        Out of Stock
                      </Text>
                    </View>
                  )}
                  {product.quantity && product.quantity > 0 && (
                    <Text className="text-gray-500 text-sm mt-2 text-right">
                      {product.quantity} units available
                    </Text>
                  )}
                </View>
              )}

              {/* Service Availability Badge */}
              {/* {!isPurchasable && ( */}
              {isService && (
                <View className="bg-green-100 px-4 py-2 rounded-full flex-row items-center">
                  <CheckCircle size={18} color="#16A34A" strokeWidth={2.5} />
                  <Text className="text-green-700 font-bold ml-2">
                    Available
                  </Text>
                </View>
              )}

              {/* Rental Quantity */}
              {isRental && (
                <View>
                  <View className="bg-green-100 px-4 py-2 rounded-full flex-row items-center">
                    <CheckCircle size={18} color="#16A34A" strokeWidth={2.5} />
                    <Text className="text-green-700 font-bold ml-2">
                      Available
                    </Text>
                  </View>

                  {product.quantity && (
                    <Text className="text-gray-500 text-sm mt-2 text-right">
                      {product.quantity} units available
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Quantity Selector - Only for Products with Buy Now */}
          {/* {!isService && product.quantity && product.quantity > 0 && ( */}
          {isPurchasable && product.quantity && product.quantity > 0 && (
            <View className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Quantity (for Buy Now)
              </Text>

              <View className="flex-row items-center justify-between">
                {/* Decrease */}
                <Pressable
                  onPress={decrementQuantity}
                  disabled={quantity <= 1}
                  className={`w-12 h-12 items-center justify-center rounded-full bg-gray-100 ${quantity <= 1 ? "opacity-40" : ""
                    }`}
                >
                  <Minus size={20} color="#1F2937" strokeWidth={2.5} />
                </Pressable>

                {/* Quantity Display */}
                <View className="px-8 py-3 bg-blue-50 rounded-2xl">
                  <Text className="text-2xl font-bold text-blue-600">
                    {quantity}
                  </Text>
                </View>

                {/* Increase */}
                <Pressable
                  onPress={incrementQuantity}
                  disabled={quantity >= product.quantity}
                  className={`w-12 h-12 items-center justify-center rounded-full bg-gray-100 ${quantity >= product.quantity ? "opacity-40" : ""
                    }`}
                >
                  <Plus size={20} color="#1F2937" strokeWidth={2.5} />
                </Pressable>
              </View>

              {/* Total */}
              <View className="mt-4 pt-4 border-t border-gray-100 flex-row justify-between items-center">
                <Text className="text-gray-600">Total Amount</Text>
                <Text className="text-lg font-bold text-blue-600">
                  ₹{totalPrice.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {/* Description */}
          <View className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Description
            </Text>

            <Text className="text-gray-600 leading-7 text-base">
              {product.description}
            </Text>
          </View>
        </View>

        {/* Bottom Spacing for FAB */}
        <View className="h-40" />
      </ScrollView>

      {/* Floating Action Buttons */}
      {/* Show for services (always available) or products with stock */}
      {/* {(isService || (product.quantity && product.quantity > 0)) && ( */}
      {(isBookable || (isPurchasable && product.quantity && product.quantity > 0)) && (
        // <View
        //   className="absolute bottom-0 left-0 right-0 px-6 bg-white border-t border-gray-100"
        //   style={{
        //     paddingBottom: insets.bottom + 16,
        //     paddingTop: 16,
        //     shadowColor: "#000",
        //     shadowOffset: { width: 0, height: -4 },
        //     shadowOpacity: 0.1,
        //     shadowRadius: 12,
        //     elevation: 10,
        //   }}
        // >
        //   <View className="flex-row gap-3"> 
        //     <Pressable
        //       disabled={loading}
        //       onPress={handleAddToCartClick}
        //       className={`flex-1 rounded-2xl overflow-hidden ${loading ? "opacity-50" : ""
        //         }`}
        //     >
        //       <View className="bg-gray-100 py-4 flex-row items-center justify-center">
        //         <ShoppingCart size={20} color="#1F2937" strokeWidth={2.5} />
        //         <Text className="text-gray-900 font-bold text-base ml-2">
        //           Add to Cart
        //         </Text>
        //       </View>
        //     </Pressable>

        //     <Pressable
        //       disabled={loading}
        //       onPress={handleBuyNowClick}
        //       className={`flex-1 rounded-2xl overflow-hidden ${loading ? "opacity-50" : ""
        //         }`}
        //     >
        //       <LinearGradient
        //         colors={["#EA580C", "#DC2626"]}
        //         start={{ x: 0, y: 0 }}
        //         end={{ x: 1, y: 1 }}
        //         style={{
        //           paddingVertical: 16,
        //           flexDirection: "row",
        //           alignItems: "center",
        //           justifyContent: "center",
        //         }}
        //       >
        //         {loading ? (
        //           <ActivityIndicator color="#FFFFFF" />
        //         ) : (
        //           <>
        //             <Package size={20} color="#FFFFFF" strokeWidth={2.5} />
        //             <Text className="text-white font-bold text-base ml-2">
        //               {isService ? 'Book Now' : 'Buy Now'}
        //             </Text>
        //           </>
        //         )}
        //       </LinearGradient>
        //     </Pressable>
        //   </View>
        // </View>
        <View
          className="absolute bottom-0 left-0 right-0 px-6 bg-white border-t border-gray-100"
          style={{
            paddingBottom: insets.bottom + 16,
            paddingTop: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* PRODUCTS */}
          {isPurchasable ? (
            <View className="flex-row gap-3">
              <Pressable
                disabled={loading}
                onPress={handleAddToCartClick}
                className={`flex-1 rounded-2xl overflow-hidden ${loading ? "opacity-50" : ""
                  }`}
              >
                <View className="bg-gray-100 py-4 flex-row items-center justify-center">
                  <ShoppingCart size={20} color="#1F2937" strokeWidth={2.5} />
                  <Text className="text-gray-900 font-bold text-base ml-2">
                    Add to Cart
                  </Text>
                </View>
              </Pressable>

              <Pressable
                disabled={loading}
                onPress={handleBuyNowClick}
                className={`flex-1 rounded-2xl overflow-hidden ${loading ? "opacity-50" : ""
                  }`}
              >
                <LinearGradient
                  colors={["#EA580C", "#DC2626"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Package size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <Text className="text-white font-bold text-base ml-2">
                    Buy Now
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            /* SERVICES + RENTALS */
            <Pressable
              disabled={loading}
              onPress={handleBuyNowClick}
              className={`rounded-2xl overflow-hidden ${loading ? "opacity-50" : ""
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
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Package size={20} color="#FFFFFF" strokeWidth={2.5} />
                    <Text className="text-white font-bold text-base ml-2">
                      Book Now
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          )}

          {/* Self Pickup Note */}
          {isBookable && (
            <View className="mt-3 bg-blue-50 rounded-2xl p-3">
              <Text className="text-blue-700 text-center font-semibold text-sm">
                Self Pickup Only
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Add to Cart Modal - Only for Products */}
      {/* {!isService && ( */}
      {isPurchasable && (
        <AddToCartModal
          visible={showQuantityModal}
          onClose={() => setShowQuantityModal(false)}
          onConfirm={handleAddToCartConfirm}
          product={{
            name: product.name,
            finalPrice: finalPrice,
            quantity: product.quantity || 0,
            images: product.images,
          }}
          isPending={loading}
        />
      )}

      {/* Buy Now Checkout Modal */}
      <CheckoutModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        address={address}
        setAddress={setAddress}
        // onConfirm={() => handleBuyNow(isService ? 1 : quantity)}
        onConfirm={() => handleBuyNow(isBookable ? 1 : quantity)}
        isPending={loading}
        // total={isService ? finalPrice : totalPrice}
        // itemSCount={isService ? 1 : quantity}
        total={isBookable ? finalPrice : totalPrice}
        itemSCount={isBookable ? 1 : quantity}
        isBookable={isBookable}
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/orders");
        }}
      />
    </View>
  );
}