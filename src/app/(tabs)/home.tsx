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

  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: rentals = [], isLoading: rentalsLoading } = useRentals();

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
          tag: "EXCLUSIVES",
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
    <View style={{ flex: 1, backgroundColor: "#F5F6FA" }}>

      {/* ══════════════════════════════════════════════════════════
          HERO HEADER — Premium Gradient
      ══════════════════════════════════════════════════════════ */}
      <LinearGradient
        colors={["#1E3A8A", "#1E40AF", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ paddingTop: insets.top + 12, paddingBottom: 80 }}
      >
        {/* Ambient decorative orbs */}
        <View style={{
          position: 'absolute', top: -60, right: -50,
          width: 200, height: 200, borderRadius: 100,
          backgroundColor: 'rgba(96,165,250,0.07)',
        }} />
        <View style={{
          position: 'absolute', bottom: -10, left: -40,
          width: 140, height: 140, borderRadius: 70,
          backgroundColor: 'rgba(255,255,255,0.04)',
        }} />

        <View style={{ paddingHorizontal: horizontalPadding }}>

          {/* ── Top Bar: Logo + Brand + Profile ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            
            {/* Logo + Brand title */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                width: isSmall ? 40 : 46, height: isSmall ? 40 : 46,
                borderRadius: isSmall ? 13 : 15,
                borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                ...Platform.select({
                  ios: {
                    shadowColor: '#1E40AF', shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3, shadowRadius: 8,
                  },
                  android: { elevation: 6 },
                }),
              }}>
                <Image
                  source={require("../../../assets/logo.jpeg")}
                  style={{ width: isSmall ? 40 : 46, height: isSmall ? 40 : 46, borderRadius: isSmall ? 12 : 14 }}
                  resizeMode="cover"
                />
              </View>

              <View style={{ marginLeft: 11 }}>
                <Text style={[{
                  fontSize: isTablet ? 24 : isSmall ? 19 : 22, color: '#FFFFFF',
                  letterSpacing: 0.3,
                }, styleBold]}>
                  {t("sahachari")}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.13)',
                    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2.5,
                    flexDirection: 'row', alignItems: 'center',
                  }}>
                    <Star size={8} color="#FBBF24" fill="#FBBF24" style={{ marginRight: 3 }} />
                    <Text style={[{
                      fontSize: isSmall ? 8 : 9, color: 'rgba(255,255,255,0.85)',
                      letterSpacing: 0.8, textTransform: 'uppercase',
                    }, styleRegular]}>
                      {t("Premium_Local_Services")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Profile Avatar */}
            <Pressable
              onPress={() => router.push("/settings/settings")}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <View style={{
                width: isSmall ? 38 : 42, height: isSmall ? 38 : 42,
                borderRadius: isSmall ? 19 : 21,
                borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
                overflow: 'hidden', backgroundColor: '#1E3A8A',
                ...Platform.select({
                  ios: {
                    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2, shadowRadius: 6,
                  },
                  android: { elevation: 5 },
                }),
              }}>
                {profile?.image ? (
                  <Image
                    source={{ uri: S3_BASE_URL + "/" + profile.image }}
                    style={{ width: isSmall ? 38 : 42, height: isSmall ? 38 : 42, borderRadius: isSmall ? 19 : 21 }}
                  />
                ) : (
                  <LinearGradient
                    colors={["#3B82F6", "#1E40AF"]}
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <User size={isSmall ? 17 : 19} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                )}
              </View>
            </Pressable>
          </View>

          {/* ── Hero Brand Banner Image ── */}
         

          {/* ── Search Bar ── */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 14, paddingLeft: 14, paddingRight: 5,
            height: isTablet ? 52 : 46, marginTop: 14,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
            ...Platform.select({
              ios: {
                shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.12, shadowRadius: 16,
              },
              android: { elevation: 12 },
            }),
          }}>
            <Search size={17} color="#94A3B8" strokeWidth={2} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t("Search") || "Search products, services..."}
              placeholderTextColor="#A0AEC0"
              style={[{
                flex: 1, marginLeft: 10, color: '#1E293B',
                fontSize: isSmall ? 13 : 14, paddingVertical: 0,
              }, styleRegular]}
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  Keyboard.dismiss();
                  router.push({ pathname: "/product", params: { search: searchQuery.trim() } } as any);
                }
              }}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} style={{ padding: 6 }}>
                <X size={14} color="#94A3B8" />
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                if (searchQuery.trim()) {
                  Keyboard.dismiss();
                  router.push({ pathname: "/product", params: { search: searchQuery.trim() } } as any);
                }
              }}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                style={{
                  borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9,
                }}
              >
                <Text style={[{ color: '#FFFFFF', fontSize: isSmall ? 12 : 13, letterSpacing: 0.2 }, styleBold]}>
                  {t("Search") || "Search"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* ══════════════════════════════════════════════════════════
          BODY — Curved Content Sheet
      ══════════════════════════════════════════════════════════ */}
      <View style={{
        flex: 1, backgroundColor: '#F5F6FA',
        marginTop: -26, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        overflow: 'hidden',
      }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: contentPaddingBottom, paddingTop: 8 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} tintColor="#2563EB" />
          }
        >

          {/* ══════════════════════════════════════════════════════════
              FEATURED CAROUSEL BANNERS (UNDER SEARCH BAR)
          ══════════════════════════════════════════════════════════ */}
          <View style={{ marginTop: 16 }}>
            
            {/* Carousel Header */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: horizontalPadding, marginBottom: 12,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sparkles size={15} color="#2563EB" style={{ marginRight: 6 }} />
                <Text style={[{ fontSize: isSmall ? 15 : 16, color: '#0F172A', letterSpacing: 0.15 }, styleBold]}>
                  Featured Highlights
                </Text>
              </View>
              <View style={{
                backgroundColor: '#EEF2FF', borderRadius: 8,
                paddingHorizontal: 10, paddingVertical: 4,
              }}>
                <Text style={[{ fontSize: 10, color: '#4F46E5', letterSpacing: 0.6 }, styleMedium || styleBold]}>
                  SPECIAL OFFERS
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
                    borderRadius: 18,
                    overflow: 'hidden',
                    height: carouselImageHeight,
                    backgroundColor: '#0F172A',
                    ...Platform.select({
                      ios: {
                        shadowColor: '#0F172A',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.18,
                        shadowRadius: 18,
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

                    {/* Premium cinematic gradient overlay */}
                    <LinearGradient
                      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)', 'rgba(15,23,42,0.55)', 'rgba(15,23,42,0.88)']}
                      locations={[0, 0.3, 0.6, 1]}
                      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    />

                    {/* Top-left light reflection */}
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0.5, y: 0.5 }}
                      style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '55%', height: '35%',
                      }}
                    />

                    {/* Tag Badge Pill (Top-Left) */}
                    {item.tag && (
                      <View style={{
                        position: 'absolute', top: isSmall ? 10 : 14, left: isSmall ? 10 : 14,
                        backgroundColor: 'rgba(255,255,255,0.18)',
                        borderRadius: 20, paddingHorizontal: isSmall ? 8 : 10, paddingVertical: 4,
                        flexDirection: 'row', alignItems: 'center',
                        borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.25)',
                      }}>
                        <Sparkles size={9} color="#FBBF24" style={{ marginRight: 4 }} />
                        <Text style={[{ fontSize: isSmall ? 8 : 9, color: '#FFFFFF', letterSpacing: 1 }, styleBold]}>
                          {item.tag}
                        </Text>
                      </View>
                    )}

                    {/* Title & Subtitle (Bottom) */}
                    <View style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      paddingHorizontal: isSmall ? 14 : 18,
                      paddingBottom: isSmall ? 12 : 16,
                      paddingTop: 8,
                    }}>
                      {item.title && (
                        <Text numberOfLines={1} style={[{
                          fontSize: isTablet ? 18 : isSmall ? 14 : 16,
                          color: '#FFFFFF', letterSpacing: 0.2,
                        }, styleBold]}>
                          {item.title}
                        </Text>
                      )}
                      {item.subtitle && (
                        <Text numberOfLines={1} style={[{
                          fontSize: isTablet ? 13 : isSmall ? 11 : 12,
                          color: 'rgba(255,255,255,0.7)', marginTop: 3,
                        }, styleRegular]}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14 }}>
              {displayCarousel.map((_, index) => (
                <View key={index} style={{
                  height: 5,
                  borderRadius: 2.5,
                  marginHorizontal: 3,
                  width: activeSlide === index ? 22 : 5,
                  backgroundColor: activeSlide === index ? "#2563EB" : "#D1D5DB",
                }} />
              ))}
            </View>
          </View>

          {/* ── Exclusive Plan Banner: Happy 60 ── */}
          <Pressable
            onPress={handleCallHappy60}
            style={({ pressed }) => ({
              marginHorizontal: horizontalPadding, marginTop: 22,
              transform: [{ scale: pressed ? 0.98 : 1 }],
              opacity: pressed ? 0.95 : 1,
            })}
          >
            <View style={{
              borderRadius: 20, overflow: 'hidden',
              ...Platform.select({
                ios: {
                  shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.15, shadowRadius: 14,
                },
                android: { elevation: 6 },
              }),
            }}>
              <LinearGradient
                colors={["#1E3A8A", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: isSmall ? 18 : 22, borderRadius: 20 }}
              >
                {/* Background decorative orbs */}
                <View style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 100, height: 100, borderRadius: 50,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }} />
                <View style={{
                  position: 'absolute', bottom: -15, left: 30,
                  width: 60, height: 60, borderRadius: 30,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                }} />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 14 }}>
                    <View style={{
                      backgroundColor: 'rgba(251,191,36,0.12)',
                      borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3,
                      alignSelf: 'flex-start', marginBottom: 10,
                    }}>
                      <Text style={[{ color: '#FBBF24', fontSize: isSmall ? 9 : 10, letterSpacing: 1, textTransform: 'uppercase' }, styleBold]}>
                        ⭐ EXCLUSIVE CARE
                      </Text>
                    </View>

                    <Text style={[{ fontSize: isTablet ? 28 : isSmall ? 22 : 25, color: '#FFFFFF', letterSpacing: 0.2 }, styleBold]}>
                      {t("Happy_60")}
                    </Text>
                    
                    <Text style={[{ color: 'rgba(255,255,255,0.7)', fontSize: isSmall ? 12 : 13, marginTop: 5, lineHeight: 19 }, styleRegular]}>
                      {t("Exclusive_for_senior_citizens")}
                    </Text>
                  </View>

                  <View style={{
                    width: isSmall ? 48 : 54, height: isSmall ? 48 : 54, borderRadius: 17,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Phone size={isSmall ? 22 : 24} color="#FFFFFF" strokeWidth={2} />
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Pressable>

          {/* ══════════════════════════════════════════════════════════
              CATEGORIES GRID
          ══════════════════════════════════════════════════════════ */}
          <View style={{ marginTop: 28, paddingHorizontal: horizontalPadding }}>

            {/* Section Header */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
              <View>
                <Text style={[{ fontSize: isSmall ? 10 : 11, color: '#6366F1', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 3 }, styleBold]}>
                  EXPLORE
                </Text>
                <Text style={[{ fontSize: isTablet ? 24 : isSmall ? 20 : 22, color: '#0F172A', letterSpacing: 0.1 }, styleBold]}>
                  {t("Our_Services")}
                </Text>
              </View>

              <View style={{
                backgroundColor: '#EEF2FF', borderRadius: 8,
                paddingHorizontal: 10, paddingVertical: 4,
                marginBottom: 2,
              }}>
                <Text style={[{ color: '#6366F1', fontSize: isSmall ? 10 : 11, letterSpacing: 0.2 }, styleBold]}>
                  {t("Discover_Excellence")}
                </Text>
              </View>
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
                          borderRadius: 16,
                          overflow: 'hidden',
                          height: cardHeight,
                          backgroundColor: '#E2E8F0',
                          ...Platform.select({
                            ios: {
                              shadowColor: '#0F172A',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.1,
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

                          {/* Gradient Overlay */}
                          <LinearGradient
                            colors={['transparent', 'rgba(15,23,42,0.08)', 'rgba(15,23,42,0.78)']}
                            locations={[0, 0.45, 1]}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                          />

                          {/* Accent dot */}
                          <View style={{
                            position: 'absolute', top: 10, left: 10,
                            width: 7, height: 7, borderRadius: 3.5,
                            backgroundColor: category.accentColor,
                            borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)',
                            ...Platform.select({
                              ios: {
                                shadowColor: category.accentColor,
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.7, shadowRadius: 3,
                              },
                              android: { elevation: 3 },
                            }),
                          }} />

                          {/* Label */}
                          <View style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            paddingHorizontal: 10,
                            paddingVertical: isSmall ? 8 : 10,
                          }}>
                            <Text
                              numberOfLines={1}
                              style={[{
                                fontSize: isTablet ? 14 : isSmall ? 12 : 13,
                                color: '#FFFFFF',
                                letterSpacing: 0.15,
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
