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
  const { styleRegular, styleBold } = useAppFonts();

  // Dynamic layout calculations for screen responsiveness
  const numColumns = width > 768 ? 4 : width > 480 ? 3 : 2;
  const horizontalPadding = Math.min(24, Math.max(16, width * 0.045));
  const gridGap = 14;
  const cardWidth = (width - horizontalPadding * 2 - (numColumns - 1) * gridGap) / numColumns;
  const cardHeight = Math.max(145, Math.min(185, cardWidth * 0.98));
  const heroImageHeight = Math.min(210, Math.max(150, width * 0.46));
  const carouselImageHeight = Math.min(215, Math.max(160, width * 0.48));

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
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>

      {/* ══════════════════════════════════════════════════════════
          HERO HEADER — Royal Sapphire Blue Gradient
      ══════════════════════════════════════════════════════════ */}
      <LinearGradient
        colors={["#1D4ED8", "#2563EB", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 14, paddingBottom: 85 }}
      >
        {/* Ambient Glowing Background Orbs */}
        <View style={{
          position: 'absolute', top: -50, right: -40,
          width: 220, height: 220, borderRadius: 110,
          backgroundColor: 'rgba(255,255,255,0.08)',
        }} />
        <View style={{
          position: 'absolute', bottom: -20, left: -40,
          width: 160, height: 160, borderRadius: 80,
          backgroundColor: 'rgba(255,255,255,0.05)',
        }} />

        <View style={{ paddingHorizontal: horizontalPadding }}>

          {/* ── Top Bar: Logo + Brand + Profile ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            
            {/* Logo + Brand title */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 48, height: 48, borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#60A5FA', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
                overflow: 'hidden',
              }}>
                <Image
                  source={require("../../../assets/logo.jpeg")}
                  style={{ width: 48, height: 48, borderRadius: 15 }}
                  resizeMode="cover"
                />
              </View>

              <View style={{ marginLeft: 12 }}>
                <Text style={[{
                  fontSize: 23, color: '#FFFFFF', letterSpacing: 0.5,
                  textShadowColor: 'rgba(0,0,0,0.25)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                }, styleBold]}>
                  {t("sahachari")}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
                    flexDirection: 'row', alignItems: 'center',
                    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.3)',
                  }}>
                    <Star size={9} color="#FCD34D" fill="#FCD34D" style={{ marginRight: 3 }} />
                    <Text style={[{
                      fontSize: 9, color: '#FFFFFF',
                      letterSpacing: 1.2, textTransform: 'uppercase',
                    }, styleBold]}>
                      {t("Premium_Local_Services")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Profile Avatar with Gold Border */}
            <Pressable onPress={() => router.push("/settings/settings")}>
              <View style={{
                width: 44, height: 44, borderRadius: 22,
                borderWidth: 2, borderColor: '#FBBF24',
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
                overflow: 'hidden', backgroundColor: '#1E293B',
              }}>
                {profile?.image ? (
                  <Image
                    source={{ uri: S3_BASE_URL + "/" + profile.image }}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                  />
                ) : (
                  <LinearGradient
                    colors={["#3B82F6", "#1D4ED8"]}
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <User size={20} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                )}
              </View>
            </Pressable>
          </View>

          {/* ── Hero Brand Banner Image ── */}
          <View style={{
            borderRadius: 22, overflow: 'hidden',
            borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
            shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3, shadowRadius: 18, elevation: 12,
            backgroundColor: '#1E293B',
          }}>
            <Image
              source={require("../../../assets/SAHACHARIIMAGE.png")}
              style={{ width: width - horizontalPadding * 2, height: heroImageHeight }}
              resizeMode="cover"
            />
            
            {/* Glossy Overlay & Bottom Vignette */}
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "transparent", "rgba(15,23,42,0.75)"]}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Tagline Overlay */}
            <View style={{
              position: 'absolute', bottom: 12, left: 14, right: 14,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <View style={{
                backgroundColor: 'rgba(15,23,42,0.65)',
                borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
                flexDirection: 'row', alignItems: 'center',
              }}>
                <Sparkles size={12} color="#FCD34D" style={{ marginRight: 5 }} />
                <Text style={[{ fontSize: 12, color: '#FFFFFF', letterSpacing: 0.3 }, styleBold]}>
                  എല്ലാ സേവനങ്ങളും ഒരോട്ട ആപ്പിൽ
                </Text>
              </View>
            </View>
          </View>

          {/* ── Search Bar (Glassmorphism) ── */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.96)',
            borderRadius: 16, paddingLeft: 14, paddingRight: 6,
            paddingVertical: 5, marginTop: 14,
            shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.22, shadowRadius: 20, elevation: 16,
            borderWidth: 1.5, borderColor: '#FFFFFF',
          }}>
            <Search size={18} color="#2563EB" strokeWidth={2.5} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t("Search") || "Search products, services..."}
              placeholderTextColor="#94A3B8"
              style={[{
                flex: 1, marginLeft: 10, color: '#1E293B',
                fontSize: 14, paddingVertical: 7,
              }, styleRegular]}
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  Keyboard.dismiss();
                  router.push({ pathname: "/product", params: { search: searchQuery.trim() } } as any);
                }
              }}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} style={{ padding: 4, marginRight: 4 }}>
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
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                style={{
                  borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9,
                  shadowColor: '#2563EB', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
                }}
              >
                <Text style={[{ color: '#FFFFFF', fontSize: 13, letterSpacing: 0.3 }, styleBold]}>
                  {t("Search") || "Search"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {/* ══════════════════════════════════════════════════════════
          BODY — Curved White Sheet Layer
      ══════════════════════════════════════════════════════════ */}
      <View style={{
        flex: 1, backgroundColor: '#F8FAFC',
        marginTop: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30,
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
          <View style={{ marginTop: 14 }}>
            
            {/* Carousel Header */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: horizontalPadding, marginBottom: 10,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sparkles size={16} color="#2563EB" style={{ marginRight: 6 }} />
                <Text style={[{ fontSize: 16, color: '#0F172A', letterSpacing: 0.2 }, styleBold]}>
                  Featured Highlights
                </Text>
              </View>
              <View style={{
                backgroundColor: '#EFF6FF', borderRadius: 10,
                paddingHorizontal: 10, paddingVertical: 4,
                borderWidth: 1, borderColor: '#BFDBFE',
              }}>
                <Text style={[{ fontSize: 10, color: '#2563EB', letterSpacing: 0.8 }, styleBold]}>
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
                    borderRadius: 22,
                    overflow: 'hidden',
                    height: carouselImageHeight,
                    shadowColor: "#1E3A8A",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.2,
                    shadowRadius: 16,
                    elevation: 10,
                    borderWidth: 1.5,
                    borderColor: 'rgba(255,255,255,0.9)',
                    backgroundColor: '#1E293B',
                  }}>
                    {/* Banner Image */}
                    <Image
                      source={item.source}
                      style={{ width: width - horizontalPadding * 2, height: carouselImageHeight }}
                      resizeMode="cover"
                    />

                    {/* Dark Vignette Overlay for High Readability */}
                    <LinearGradient
                      colors={['rgba(0,0,0,0.08)', 'rgba(15,23,42,0.2)', 'rgba(15,23,42,0.85)']}
                      locations={[0, 0.45, 1]}
                      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    />

                    {/* Tag Badge Pill (Top-Left) */}
                    {item.tag && (
                      <View style={{
                        position: 'absolute', top: 12, left: 14,
                        backgroundColor: 'rgba(37,99,235,0.9)',
                        borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
                        borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
                        flexDirection: 'row', alignItems: 'center',
                      }}>
                        <Tag size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={[{ fontSize: 10, color: '#FFFFFF', letterSpacing: 0.8 }, styleBold]}>
                          {item.tag}
                        </Text>
                      </View>
                    )}

                    {/* Title & Subtitle Glass Bar Overlay (Bottom) */}
                    <View style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      backgroundColor: 'rgba(15, 23, 42, 0.65)',
                      borderTopWidth: 1,
                      borderTopColor: 'rgba(255, 255, 255, 0.25)',
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                    }}>
                      <View style={{
                        position: 'absolute', top: 0, left: 14, right: 14, height: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                      }} />
                      {item.title && (
                        <Text numberOfLines={1} style={[{ fontSize: 15, color: '#FFFFFF', letterSpacing: 0.3, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }, styleBold]}>
                          {item.title}
                        </Text>
                      )}
                      {item.subtitle && (
                        <Text numberOfLines={1} style={[{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }, styleRegular]}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
              {displayCarousel.map((_, index) => (
                <View key={index} style={{
                  height: 6,
                  borderRadius: 3,
                  marginHorizontal: 3,
                  width: activeSlide === index ? 26 : 6,
                  backgroundColor: activeSlide === index ? "#2563EB" : "#CBD5E1",
                }} />
              ))}
            </View>
          </View>

          {/* ── Exclusive Plan Banner: Happy 60 ── */}
          <Pressable
            onPress={handleCallHappy60}
            style={({ pressed }) => ({
              marginHorizontal: horizontalPadding, marginTop: 20,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View style={{
              borderRadius: 24, overflow: 'hidden',
              shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.2, shadowRadius: 18, elevation: 10,
              borderWidth: 1.5, borderColor: '#DBEAFE',
            }}>
              <LinearGradient
                colors={["#1E3A8A", "#2563EB", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 20, borderRadius: 24 }}
              >
                {/* Background Accent Circle */}
                <View style={{
                  position: 'absolute', top: -30, right: -30,
                  width: 140, height: 140, borderRadius: 70,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                }} />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 14 }}>
                    <View style={{
                      backgroundColor: 'rgba(252,211,77,0.2)',
                      borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
                      alignSelf: 'flex-start', marginBottom: 8,
                      borderWidth: 1, borderColor: 'rgba(252,211,77,0.4)',
                    }}>
                      <Text style={[{ color: '#FCD34D', fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' }, styleBold]}>
                        ⭐ EXCLUSIVE CARE
                      </Text>
                    </View>

                    <Text style={[{ fontSize: 26, color: '#FFFFFF', letterSpacing: 0.3 }, styleBold]}>
                      {t("Happy_60")}
                    </Text>
                    
                    <Text style={[{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, lineHeight: 18 }, styleRegular]}>
                      {t("Exclusive_for_senior_citizens")}
                    </Text>
                  </View>

                  <View style={{
                    width: 58, height: 58, borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2, shadowRadius: 6, elevation: 6,
                  }}>
                    <Phone size={26} color="#FFFFFF" strokeWidth={2.2} />
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Pressable>

          {/* ══════════════════════════════════════════════════════════
              CATEGORIES GRID — Glassmorphism Cards with Images
          ══════════════════════════════════════════════════════════ */}
          <View style={{ marginTop: 28, paddingHorizontal: horizontalPadding }}>

            {/* Section Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <View>
                <Text style={[{ fontSize: 11, color: '#2563EB', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }, styleBold]}>
                  EXPLORE COLLECTION
                </Text>
                <Text style={[{ fontSize: 23, color: '#0F172A', letterSpacing: 0.2 }, styleBold]}>
                  {t("Our_Services")}
                </Text>
              </View>

              <View style={{
                backgroundColor: '#EFF6FF', borderRadius: 12,
                paddingHorizontal: 12, paddingVertical: 6,
                borderWidth: 1, borderColor: '#BFDBFE',
              }}>
                <Text style={[{ color: '#2563EB', fontSize: 11, letterSpacing: 0.3 }, styleBold]}>
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
                        {/* Luxury Glassmorphism Image Card */}
                        <View style={{
                          borderRadius: 22,
                          overflow: 'hidden',
                          height: cardHeight,
                          shadowColor: category.accentColor,
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.28,
                          shadowRadius: 14,
                          elevation: 10,
                          borderWidth: 1.2,
                          borderColor: 'rgba(255,255,255,0.4)',
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

                          {/* Dual Gradient Overlay */}
                          <LinearGradient
                            colors={['rgba(255,255,255,0.15)', 'rgba(15,23,42,0.2)', 'rgba(15,23,42,0.85)']}
                            locations={[0, 0.45, 1]}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                          />

                          {/* Accent Color Badge Dot (Top-Left) */}
                          <View style={{
                            position: 'absolute', top: 12, left: 12,
                            width: 10, height: 10, borderRadius: 5,
                            backgroundColor: category.accentColor,
                            borderWidth: 1.5, borderColor: '#FFFFFF',
                            shadowColor: category.accentColor,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.9, shadowRadius: 6,
                            elevation: 6,
                          }} />

                          {/* Frosted Glass Bottom Label Bar */}
                          <View style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.65)',
                            borderTopWidth: 1,
                            borderTopColor: 'rgba(255, 255, 255, 0.25)',
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                          }}>
                            {/* Glass Highlight Sheen Line */}
                            <View style={{
                              position: 'absolute', top: 0, left: 12, right: 12, height: 1,
                              backgroundColor: 'rgba(255, 255, 255, 0.4)',
                            }} />

                            <Text
                              numberOfLines={1}
                              style={[{
                                fontSize: 13,
                                color: '#FFFFFF',
                                letterSpacing: 0.3,
                                textShadowColor: 'rgba(0,0,0,0.6)',
                                textShadowOffset: { width: 0, height: 1 },
                                textShadowRadius: 4,
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
