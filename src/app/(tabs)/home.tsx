import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  Coffee,
  Cookie,
  Fish,
  HomeIcon,
  Leaf,
  Package,
  Phone,
  Plug,
  Sandwich,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  User,
  Utensils,
  Wrench,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCarousel } from "../../hooks/useCarousel";
import { useProducts } from "../../hooks/useProducts";
import { useProfile } from "../../hooks/useProfile";
import { useRentals } from "../../hooks/useRentals";
import { useServices } from "../../hooks/useServices";

import { useTranslation } from "react-i18next";
import { useAppFonts } from "../../hooks/useAppFonts";
import { S3_BASE_URL } from "@/config/env";

import { resolveCategoryRoute } from "../market/utils/marketplaceRouter";

// Category styles with local images
const CATEGORY_IMAGES: Record<string, any> = {
  food:                    require("../../../assets/categories/food.png"),
  "vegetables and fruits": require("../../../assets/categories/vegetables.png"),
  groceries:               require("../../../assets/categories/groceries.png"),
  "home made":             require("../../../assets/categories/homemade.png"),
  service:                 require("../../../assets/categories/service.png"),
  "fish & meat":           require("../../../assets/categories/fish.png"),
  rent:                    require("../../../assets/categories/rent.png"),
  electronics:             require("../../../assets/categories/electronics.png"),
  snacks:                  require("../../../assets/categories/snacks.png"),
  "fast food":             require("../../../assets/categories/fastfood.png"),
  beverages:               require("../../../assets/categories/beverages.png"),
};

const CATEGORY_ACCENTS: Record<string, string> = {
  food:                    "#FF6B35",
  "vegetables and fruits": "#10B981",
  groceries:               "#3B82F6",
  "home made":             "#EC4899",
  service:                 "#0EA5E9",
  "fish & meat":           "#6366F1",
  rent:                    "#F59E0B",
  electronics:             "#8B5CF6",
  snacks:                  "#F97316",
  "fast food":             "#EF4444",
  beverages:               "#06B6D4",
  default:                 "#64748B",
};

// High-definition local featured banners for carousel under search bar
const FEATURED_BANNERS = [
  {
    id: "banner-1",
    source: require("../../../assets/im1.jpeg"),
    title: "Quality Local Services",
    subtitle: "Book verified local experts & artisans near you",
    tag: "FEATURED",
  },
  {
    id: "banner-2",
    source: require("../../../assets/im2.jpeg"),
    title: "Fresh Vegetables & Groceries",
    subtitle: "Farm fresh produce delivered straight to your door",
    tag: "POPULAR",
  },
  {
    id: "banner-3",
    source: require("../../../assets/im3.jpg"),
    title: "Authentic Homemade Foods",
    subtitle: "Delicious regional snacks & home cooked delicacies",
    tag: "SPECIAL",
  },
  {
    id: "banner-4",
    source: require("../../../assets/im4.jpg"),
    title: "Rentals & Electronics",
    subtitle: "Affordable rates & flexible short-term rentals",
    tag: "TOP RATED",
  },
];

export default function Home() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { styleRegular, styleBold, styleMedium } = useAppFonts();

  // Responsive breakpoints
  const isTablet = width > 768;
  const isMedium = width > 480;
  const isSmall = width <= 360;

  // Dynamic layout calculations for screen responsiveness
  const numColumns = isTablet ? 4 : isMedium ? 3 : 2;
  const horizontalPadding = isTablet ? 32 : isMedium ? 24 : isSmall ? 14 : 18;
  const gridGap = isTablet ? 16 : 12;
  const cardWidth = (width - horizontalPadding * 2 - (numColumns - 1) * gridGap) / numColumns;
  const cardHeight = Math.max(135, Math.min(195, cardWidth * 1.02));
  const heroImageHeight = isTablet ? 240 : Math.min(210, Math.max(150, width * 0.46));
  const carouselImageHeight = isTablet ? 230 : Math.min(215, Math.max(155, width * 0.47));

  const { data: carouselData = [] } = useCarousel();
  const { profile, refetch: refetchProfile } = useProfile();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useProducts(
    searchQuery ? { search: searchQuery } : undefined
  );

  const { data: services = [], isLoading: servicesLoading } = useServices(
    searchQuery ? { search: searchQuery } : undefined
  );
  const { data: rentals = [], isLoading: rentalsLoading } = useRentals(
    searchQuery ? { search: searchQuery } : undefined
  );

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const prodItems = (products || []).map((p: any) => ({ ...p, itemType: "product" }));
    const servItems = (services || []).map((s: any) => ({ ...s, itemType: "service" }));
    const rentItems = (rentals || []).map((r: any) => ({ ...r, itemType: "rental" }));
    return [...prodItems, ...servItems, ...rentItems].slice(0, 8);
  }, [searchQuery, products, services, rentals]);

  const isLoading = productsLoading || servicesLoading || rentalsLoading;
  const [refreshing, setRefreshing] = useState(false);

  // Seamless carousel data formatting (API items or Local High-Def Banners)
  const displayCarousel = useMemo(() => {
    if (carouselData && carouselData.length > 0) {
      return carouselData.map((item, idx) => {
        let src = null;
        if (item.imageUrl) {
          src = { uri: item.imageUrl };
        } else if (item.image) {
          const uri = item.image.startsWith("http")
            ? item.image
            : (S3_BASE_URL + "/" + item.image);
          src = { uri };
        } else {
          src = FEATURED_BANNERS[idx % FEATURED_BANNERS.length].source;
        }

        return {
          id: item._id || ("api-carousel-" + idx),
          source: src,
          title: item.title || FEATURED_BANNERS[idx % FEATURED_BANNERS.length].title,
          subtitle: item.subtitle || FEATURED_BANNERS[idx % FEATURED_BANNERS.length].subtitle,
        
        };
      });
    }
    return FEATURED_BANNERS;
  }, [carouselData]);

  // Carousel Auto-Scroll Timer
  useEffect(() => {
    if (displayCarousel.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prevSlide) => {
        const nextSlide = (prevSlide + 1) % displayCarousel.length;
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: nextSlide * width, animated: true });
        }
        return nextSlide;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [displayCarousel.length, width]);

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

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();

    products.forEach((item: any) => {
      if (item.category) {
        uniqueCategories.add(item.category.trim());
      }
    });

    if (services.length > 0) {
      uniqueCategories.add("Service");
    }

    if (rentals.length > 0) {
      uniqueCategories.add("Rent");
    }

    return Array.from(uniqueCategories).map((category, index) => {
      const normalizedCategory = category.trim().toLowerCase();
      const img = CATEGORY_IMAGES[normalizedCategory];
      const accent = CATEGORY_ACCENTS[normalizedCategory] || CATEGORY_ACCENTS["default"];
      return {
        id: "category-" + index,
        name: category,
        translationKey: normalizedCategory.replace(/\s*&\s*/g, "_").replace(/\s+/g, "_"),
        categoryImage: img || null,
        accentColor: accent,
      };
    });
  }, [products, services, rentals]);

  const scaleAnims = useRef(
    Array(24).fill(0).map(() => new Animated.Value(1))
  ).current;

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / slideSize);
    setActiveSlide(activeIndex);
  };

  const handleCategoryPressIn = (index: number) => {
    if (scaleAnims[index]) {
      Animated.spring(scaleAnims[index], { toValue: 0.94, useNativeDriver: true }).start();
    }
  };

  const handleCategoryPressOut = (index: number) => {
    if (scaleAnims[index]) {
      Animated.spring(scaleAnims[index], { toValue: 1, friction: 4, tension: 45, useNativeDriver: true }).start();
    }
  };

  const handleCallHappy60 = () => {
    Linking.openURL("tel:7025548470");
  };

  const handleCategoryPress = (categoryName: string) => {
    const route = resolveCategoryRoute(categoryName);
    if (route === "services") { router.push("/services"); return; }
    if (route === "rentals") { router.push("/rentals"); return; }
    router.push({ pathname: "/product", params: { category: categoryName } });
  };

  const TAB_BAR_HEIGHT = 65;
  const contentPaddingBottom = TAB_BAR_HEIGHT + insets.bottom + 36;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

      {/* ══════════════════════════════════════════════════════════
          HERO HEADER — Premium Gradient
      ══════════════════════════════════════════════════════════ */}
      <LinearGradient
        colors={["#0B132B", "#1C2541", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={{ paddingTop: insets.top + 8, paddingBottom: 18, zIndex: 10 }}
      >
        {/* Ambient decorative background glows */}
        <View style={{
          position: 'absolute', top: -50, right: -40,
          width: 160, height: 160, borderRadius: 80,
          backgroundColor: 'rgba(99,102,241,0.10)',
        }} />

        <View style={{ paddingHorizontal: horizontalPadding }}>

          {/* ── Top Bar: Logo + Brand Title + Profile ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            
            {/* Logo + Brand title */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                width: isSmall ? 36 : 40, height: isSmall ? 36 : 40,
                borderRadius: isSmall ? 11 : 13,
                borderWidth: 1.8, borderColor: 'rgba(255,255,255,0.4)',
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                ...Platform.select({
                  ios: {
                    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35, shadowRadius: 10,
                  },
                  android: { elevation: 7 },
                }),
              }}>
                <Image
                  source={require("../../../assets/logo.jpeg")}
                  style={{ width: isSmall ? 36 : 40, height: isSmall ? 36 : 40, borderRadius: isSmall ? 10 : 12 }}
                  resizeMode="cover"
                />
              </View>

              <View style={{ marginLeft: 10 }}>
                <Text style={[{
                  fontSize: isTablet ? 21 : isSmall ? 17 : 19, color: '#FFFFFF',
                  letterSpacing: -0.2,
                }, styleBold]}>
                  {t("sahachari")}
                </Text>
                
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2,
                  flexDirection: 'row', alignItems: 'center', marginTop: 3,
                  alignSelf: 'flex-start',
                  borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
                }}>
                  <Sparkles size={8} color="#FBBF24" style={{ marginRight: 4 }} />
                  <Text style={[{
                    fontSize: isSmall ? 8 : 9, color: 'rgba(255,255,255,0.9)',
                    letterSpacing: 0.5, textTransform: 'uppercase',
                  }, styleMedium]}>
                    {t("Your Local Marketplace") || "Your Local Marketplace"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Profile Avatar */}
            <Pressable
              onPress={() => router.push("/settings/settings")}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <View style={{
                width: isSmall ? 34 : 38, height: isSmall ? 34 : 38,
                borderRadius: isSmall ? 17 : 19,
                borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)',
                overflow: 'hidden', backgroundColor: '#1E1B4B',
                ...Platform.select({
                  ios: {
                    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25, shadowRadius: 8,
                  },
                  android: { elevation: 6 },
                }),
              }}>
                {profile?.image ? (
                  <Image
                    source={{ uri: S3_BASE_URL + "/" + profile.image }}
                    style={{ width: isSmall ? 34 : 38, height: isSmall ? 34 : 38, borderRadius: isSmall ? 17 : 19 }}
                  />
                ) : (
                  <LinearGradient
                    colors={["#3B82F6", "#1E40AF"]}
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <User size={isSmall ? 15 : 17} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                )}
              </View>
            </Pressable>
          </View>

          {/* ── Luxury Glassmorphic Search Bar ── */}
          <View
            style={{
              marginTop: 2,
              zIndex: 999,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.98)",
                borderRadius: 18,
                paddingLeft: 8,
                paddingRight: 5,
                height: isTablet ? 50 : 44,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.9)",
                ...Platform.select({
                  ios: {
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.16,
                    shadowRadius: 16,
                  },
                  android: {
                    elevation: 10,
                  },
                }),
              }}
            >
              {/* Search Icon Badge */}
              <View style={{
                width: 30, height: 30, borderRadius: 15,
                backgroundColor: '#EFF6FF',
                alignItems: 'center', justifyContent: 'center',
                marginLeft: 4,
              }}>
                <Search size={16} color="#2563EB" strokeWidth={2.5} />
              </View>

              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t("Search") || "Search products, services..."}
                placeholderTextColor="#94A3B8"
                style={[
                  {
                    flex: 1,
                    marginLeft: 10,
                    color: "#0F172A",
                    fontSize: isSmall ? 13 : 14,
                    paddingVertical: 0,
                  },
                  styleRegular,
                ]}
                onSubmitEditing={() => {
                  if (searchQuery.trim()) {
                    Keyboard.dismiss();
                    router.push({
                      pathname: "/product",
                      params: { search: searchQuery.trim() },
                    } as any);
                  }
                }}
              />

              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  style={{ padding: 6 }}
                >
                  <X size={14} color="#94A3B8" />
                </Pressable>
              )}

              <Pressable
                onPress={() => {
                  if (searchQuery.trim()) {
                    Keyboard.dismiss();
                    router.push({
                      pathname: "/product",
                      params: { search: searchQuery.trim() },
                    } as any);
                  }
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <LinearGradient
                  colors={["#3B82F6", "#1D4ED8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 14,
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                  }}
                >
                  <Text
                    style={[
                      {
                        color: "#FFFFFF",
                        fontSize: isSmall ? 12 : 13,
                        letterSpacing: 0.3,
                      },
                      styleBold,
                    ]}
                  >
                    {t("Search") || "Search"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>

  {/* Search Suggestions */}
  {searchQuery.trim().length > 0 && searchSuggestions.length > 0 && (
    <View
      style={{
        position: "absolute",
        top: isTablet ? 58 : 52,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginTop: 6,
        maxHeight: 280,
        overflow: "hidden",
        zIndex: 9999,
        ...Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
          },
          android: {
            elevation: 15,
          },
        }),
      }}
    >
      {searchSuggestions.map((item: any) => (
        <Pressable
          key={item._id || item.id}
          onPress={() => {
            setSearchQuery(item.name || item.title || "");
            Keyboard.dismiss();

            if (item.itemType === "service") {
              router.push(`/services/${item._id}`);
            } else if (item.itemType === "rental") {
              router.push(`/rentals/${item._id}`);
            } else {
              router.push({
                pathname: "/product",
                params: {
                  search: item.name,
                },
              } as any);
            }
          }}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#F3F4F6" : "#FFFFFF",
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: "#F1F5F9",
          })}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Search size={16} color="#64748B" />
              <Text
                style={[
                  {
                    marginLeft: 10,
                    fontSize: 15,
                    color: "#1E293B",
                  },
                  styleMedium,
                ]}
                numberOfLines={1}
              >
                {item.name || item.title}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: "#94A3B8", textTransform: "capitalize", marginLeft: 8 }}>
              {item.itemType}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  )}
</View>
</View> 
      </LinearGradient>
   
      {/* ══════════════════════════════════════════════════════════
          BODY — Curved Content Sheet
      ══════════════════════════════════════════════════════════ */}
      <View style={{
        flex: 1, backgroundColor: '#F8FAFC',
        marginTop: -12, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        overflow: 'hidden',
      }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: contentPaddingBottom, paddingTop: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} tintColor="#2563EB" />
          }
        >

          {/* ══════════════════════════════════════════════════════════
              FEATURED CAROUSEL BANNERS (UNDER SEARCH BAR)
          ══════════════════════════════════════════════════════════ */}
          <View style={{ marginTop: 10 }}>
            
            {/* Carousel Section Header */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: horizontalPadding, marginBottom: 10,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[{ fontSize: isSmall ? 14 : 16, color: '#0F172A', letterSpacing: -0.2 }, styleBold]}>
                  Featured Highlights
                </Text>
              </View>

             
            </View>

            {/* Horizontal Scroll Carousel */}
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {displayCarousel.map((item, index) => (
                <View key={item.id || index} style={{ width, paddingHorizontal: horizontalPadding }}>
                  <View style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    height: carouselImageHeight,
                    backgroundColor: '#0F172A',
                    ...Platform.select({
                      ios: {
                        shadowColor: '#0F172A',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.2,
                        shadowRadius: 16,
                      },
                      android: { elevation: 8 },
                    }),
                  }}>
                    {/* Banner Image */}
                    <Image
                      source={item.source}
                      style={{ width: width - horizontalPadding * 2, height: carouselImageHeight }}
                      resizeMode="cover"
                    />

                    {/* Premium cinematic multi-stop gradient overlay */}
                    <LinearGradient
                      colors={['transparent', 'rgba(15,23,42,0.15)', 'rgba(15,23,42,0.7)', 'rgba(15,23,42,0.94)']}
                      locations={[0, 0.35, 0.7, 1]}
                      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    />

                    {/* Top-left Glassmorphic Tag Badge Pill */}
                    {item.tag && (
                      <View style={{
                        position: 'absolute', top: isSmall ? 10 : 14, left: isSmall ? 10 : 14,
                        backgroundColor: 'rgba(15,23,42,0.65)',
                        borderRadius: 20, paddingHorizontal: isSmall ? 8 : 10, paddingVertical: 4,
                        flexDirection: 'row', alignItems: 'center',
                        borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
                      }}>
                        <Sparkles size={9} color="#FBBF24" style={{ marginRight: 4 }} />
                        <Text style={[{ fontSize: isSmall ? 8 : 9, color: '#FFFFFF', letterSpacing: 1 }, styleBold]}>
                          {item.tag}
                        </Text>
                      </View>
                    )}

                    {/* Title & Subtitle + Action Button (Bottom) */}
                    {(item.title || item.subtitle) && (
                      <View style={{
                        position: 'absolute', bottom: isSmall ? 10 : 14,
                        left: isSmall ? 12 : 16, right: isSmall ? 12 : 16,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          {item.title && (
                            <Text style={[{ color: '#FFFFFF', fontSize: isSmall ? 14 : 16, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 }, styleBold]} numberOfLines={1}>
                              {item.title}
                            </Text>
                          )}
                          {item.subtitle && (
                            <Text style={[{ color: 'rgba(255,255,255,0.85)', fontSize: isSmall ? 10 : 12, marginTop: 2 }, styleRegular]} numberOfLines={1}>
                              {item.subtitle}
                            </Text>
                          )}
                        </View>

                        <View style={{
                          width: 32, height: 32, borderRadius: 16,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          alignItems: 'center', justifyContent: 'center',
                          borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
                        }}>
                          <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Pagination Indicators */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
              {displayCarousel.map((_, index) => (
                <View key={index} style={{
                  height: 4,
                  borderRadius: 2,
                  marginHorizontal: 3,
                  width: activeSlide === index ? 20 : 4,
                  backgroundColor: activeSlide === index ? "#3B82F6" : "#D1D5DB",
                }} />
              ))}
            </View>
          </View>

          {/* ── Exclusive Plan Banner: Happy 60 ── */}
          <Pressable
            onPress={handleCallHappy60}
            style={({ pressed }) => ({
              marginHorizontal: horizontalPadding, marginTop: 16,
              transform: [{ scale: pressed ? 0.98 : 1 }],
              opacity: pressed ? 0.95 : 1,
            })}
          >
            <View style={{
              borderRadius: 20, overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              borderWidth: 1, borderColor: '#E2E8F0',
              ...Platform.select({
                ios: {
                  shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08, shadowRadius: 12,
                },
                android: { elevation: 4 },
              }),
            }}>
              <LinearGradient
                colors={["#0B132B", "#1C2541"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: isSmall ? 16 : 20, borderRadius: 20 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 14 }}>
                    <Text style={[{ fontSize: isTablet ? 26 : isSmall ? 20 : 23, color: '#FFFFFF', letterSpacing: -0.3 }, styleBold]}>
                      {t("Happy_60")}
                    </Text>
                    
                    <Text style={[{ color: 'rgba(255,255,255,0.65)', fontSize: isSmall ? 11 : 12.5, marginTop: 4, lineHeight: 18 }, styleRegular]}>
                      {t("Exclusive_for_senior_citizens")}
                    </Text>
                  </View>

                  <View style={{
                    width: isSmall ? 44 : 50, height: isSmall ? 44 : 50, borderRadius: 25,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Phone size={isSmall ? 20 : 22} color="#FFFFFF" strokeWidth={1.8} />
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Pressable>

          {/* ══════════════════════════════════════════════════════════
              CATEGORIES GRID
          ══════════════════════════════════════════════════════════ */}
          <View style={{ marginTop: 20, paddingHorizontal: horizontalPadding }}>

            {/* Section Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View>
                <Text style={[{ fontSize: isSmall ? 10 : 11, color: '#94A3B8', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }, styleMedium]}>
                  EXPLORE
                </Text>
                <Text style={[{ fontSize: isTablet ? 22 : isSmall ? 18 : 20, color: '#0F172A', letterSpacing: -0.2 }, styleBold]}>
                  {t("Our_Services")}
                </Text>
              </View>

              <Pressable style={{ paddingVertical: 4, paddingHorizontal: 6 }}>
                <Text style={[{ color: '#3B82F6', fontSize: isSmall ? 11 : 12, letterSpacing: 0.1 }, styleMedium]}>
                  {t("Discover_Excellence")}
                </Text>
              </Pressable>
            </View>

            {/* Loading Indicator */}
            {isLoading && (
              <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={[{ color: '#64748B', marginTop: 12, fontSize: 13 }, styleRegular]}>
                  {t("Loading_services")}
                </Text>
              </View>
            )}

            {/* Responsive Categories Grid */}
            {!isLoading && categories.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: gridGap }}>
                {categories.map((category, index) => {
                  return (
                    <Animated.View
                      key={category.id}
                      style={{
                        transform: [{ scale: scaleAnims[index] || 1 }],
                        width: cardWidth,
                      }}
                    >
                      <Pressable
                        onPress={() => handleCategoryPress(category.name)}
                        onPressIn={() => handleCategoryPressIn(index)}
                        onPressOut={() => handleCategoryPressOut(index)}
                      >
                        {/* Category Card */}
                        <View style={{
                          borderRadius: 20,
                          overflow: 'hidden',
                          height: cardHeight,
                          backgroundColor: '#0F172A',
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.15)',
                          ...Platform.select({
                            ios: {
                              shadowColor: '#0F172A',
                              shadowOffset: { width: 0, height: 6 },
                              shadowOpacity: 0.16,
                              shadowRadius: 10,
                            },
                            android: { elevation: 5 },
                          }),
                        }}>
                          {/* Category Image */}
                          {category.categoryImage ? (
                            <Image
                              source={category.categoryImage}
                              style={{ width: '100%', height: '100%', position: 'absolute' }}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={{
                              width: '100%', height: '100%', position: 'absolute',
                              backgroundColor: '#1E293B',
                            }} />
                          )}

                          {/* Multi-step Premium Dark Gradient Overlay */}
                          <LinearGradient
                            colors={['transparent', 'rgba(15,23,42,0.2)', 'rgba(15,23,42,0.88)']}
                            locations={[0, 0.45, 1]}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                          />

                          {/* Accent Indicator Dot */}
                          <View style={{
                            position: 'absolute', top: 10, right: 10,
                            width: 8, height: 8, borderRadius: 4,
                            backgroundColor: category.accentColor || '#3B82F6',
                            borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
                          }} />

                          {/* Label */}
                          <View style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            paddingHorizontal: 12,
                            paddingVertical: isSmall ? 10 : 12,
                          }}>
                            <Text
                              numberOfLines={1}
                              style={[{
                                fontSize: isTablet ? 14 : isSmall ? 11.5 : 13,
                                color: '#FFFFFF',
                                letterSpacing: 0.2,
                                textShadowColor: 'rgba(0,0,0,0.8)',
                                textShadowOffset: { width: 0, height: 1 },
                                textShadowRadius: 3,
                              }, styleBold]}
                            >
                              {t("categories." + category.translationKey)}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            )}

          </View>

        </ScrollView>
      </View>
    </View>
  );
}
