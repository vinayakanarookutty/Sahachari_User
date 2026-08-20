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
  MapPin,
  AlertCircle,
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
  Modal,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCarousel } from "../../hooks/useCarousel";
import { useProducts } from "../../hooks/useProducts";
import { useProfile } from "../../hooks/useProfile";
import { useRentals } from "../../hooks/useRentals";
import { useServices } from "../../hooks/useServices";
import { useHappy60 } from "../../hooks/useHappy60";
import { useCategories } from "../../hooks/useCategories";

import { useTranslation } from "react-i18next";
import { useAppFonts } from "../../hooks/useAppFonts";
import { S3_BASE_URL } from "@/config/env";

import { resolveCategoryRoute } from "../market/utils/marketplaceRouter";

// Category curated high-definition images with full alias & keyword support
const CATEGORY_IMAGES: Record<string, any> = {
  // 1. Food
  food:                    { uri: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=90" },
  foods:                   { uri: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=90" },
  restaurant:              { uri: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=90" },

  // 2. Vegetables & Fruits
  "vegetables & fruits":   { uri: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=90" },
  "vegetables and fruits": { uri: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=90" },
  "vegetables_and_fruits": { uri: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=90" },
  "vegetables & fruit":    { uri: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=90" },
  "vegetables":            { uri: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=90" },
  "fruits":                { uri: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1000&q=90" },
  "fruits & vegetables":   { uri: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=90" },
  "fruits and vegetables": { uri: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=90" },

  // 3. Groceries
  groceries:               { uri: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=90" },
  grocery:                 { uri: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=90" },
  supermarket:             { uri: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=90" },
  provisions:              { uri: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=90" },

  // 4. Home Made
  "home made":             { uri: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=90" },
  "homemade":              { uri: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=90" },
  "home_made":             { uri: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=90" },
  "home-made":             { uri: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=90" },

  // 5. Fish & Meat
  "fish & meat":           { uri: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=90" },
  "fish and meat":         { uri: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=90" },
  "fish_meat":             { uri: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=90" },
  "meat & fish":           { uri: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=90" },
  "meat and fish":         { uri: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=90" },
  fish:                    { uri: "https://images.unsplash.com/photo-1534948216015-843149f72be3?auto=format&fit=crop&w=1000&q=90" },
  meat:                    { uri: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1000&q=90" },
  chicken:                 { uri: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=1000&q=90" },
  seafood:                 { uri: "https://images.unsplash.com/photo-1534948216015-843149f72be3?auto=format&fit=crop&w=1000&q=90" },

  // Services
  service:                 { uri: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=90" },
  services:                { uri: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=90" },

  // Rentals
  rent:                    { uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=90" },
  rental:                  { uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=90" },
  rentals:                 { uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=90" },

  // Electronics
  electronics:             { uri: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=90" },
  electronic:              { uri: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=90" },

  // Snacks
  snacks:                  { uri: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1000&q=90" },
  snack:                   { uri: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1000&q=90" },

  // Fast food
  "fast food":             { uri: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=90" },
  "fastfood":              { uri: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=90" },
  "fast_food":             { uri: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=90" },

  // Beverages
  beverages:               { uri: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=90" },
  beverage:                { uri: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=90" },
  drinks:                  { uri: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=90" },

  // Default fallback for any custom or new category
  default:                 { uri: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=90" },
};

const CATEGORY_ACCENTS: Record<string, string> = {
  food:                    "#FF6B35",
  "vegetables and fruits": "#10B981",
  "vegetables & fruits":   "#10B981",
  groceries:               "#3B82F6",
  "home made":             "#EC4899",
  service:                 "#0EA5E9",
  "fish & meat":           "#6366F1",
  "fish and meat":         "#6366F1",
  rent:                    "#F59E0B",
  electronics:             "#8B5CF6",
  snacks:                  "#F97316",
  "fast food":             "#EF4444",
  beverages:               "#06B6D4",
  default:                 "#64748B",
};

// Intelligent helper to guarantee an image and translation key for any category name
const resolveCategoryMeta = (categoryName: string) => {
  const raw = (categoryName || "").trim();
  const normalized = raw.toLowerCase();

  // 1. Direct match in dictionary
  if (CATEGORY_IMAGES[normalized]) {
    const key = normalized.replace(/\s*&\s*/g, "_").replace(/\s+/g, "_");
    return {
      image: CATEGORY_IMAGES[normalized],
      accent: CATEGORY_ACCENTS[normalized] || CATEGORY_ACCENTS.default,
      translationKey: key,
    };
  }

  // 2. Fuzzy substring detection for main categories
  if (normalized.includes("veg") || normalized.includes("fruit")) {
    return {
      image: CATEGORY_IMAGES["vegetables & fruits"],
      accent: "#10B981",
      translationKey: "vegetables_and_fruits",
    };
  }
  if (
    normalized.includes("fish") ||
    normalized.includes("meat") ||
    normalized.includes("seafood") ||
    normalized.includes("chicken") ||
    normalized.includes("mutton") ||
    normalized.includes("beef") ||
    normalized.includes("pork")
  ) {
    return {
      image: CATEGORY_IMAGES["fish & meat"],
      accent: "#6366F1",
      translationKey: "fish_meat",
    };
  }
  if (normalized.includes("home") || normalized.includes("made")) {
    return {
      image: CATEGORY_IMAGES["home made"],
      accent: "#EC4899",
      translationKey: "home_made",
    };
  }
  if (
    normalized.includes("groc") ||
    normalized.includes("supermarket") ||
    normalized.includes("provis") ||
    normalized.includes("essential")
  ) {
    return {
      image: CATEGORY_IMAGES["groceries"],
      accent: "#3B82F6",
      translationKey: "groceries",
    };
  }
    if (normalized.includes("bakery") || normalized.includes("cake") || normalized.includes("bread") || normalized.includes("pastry")) {
    return {
      image: CATEGORY_IMAGES.default,
      accent: "#D97706",
      translationKey: "bakery",
    };
  }
  if (normalized === "food" || normalized.startsWith("food ") || normalized.includes("meal") || normalized.includes("dine")) {
    return {
      image: CATEGORY_IMAGES["food"],
      accent: "#FF6B35",
      translationKey: "food",
    };
  }
  if (normalized.includes("serv")) {
    return {
      image: CATEGORY_IMAGES["service"],
      accent: "#0EA5E9",
      translationKey: "service",
    };
  }
  if (normalized.includes("rent")) {
    return {
      image: CATEGORY_IMAGES["rent"],
      accent: "#F59E0B",
      translationKey: "rent",
    };
  }
  if (normalized.includes("electr") || normalized.includes("gadget") || normalized.includes("appliance")) {
    return {
      image: CATEGORY_IMAGES["electronics"],
      accent: "#8B5CF6",
      translationKey: "electronics",
    };
  }
  if (normalized.includes("snack") || normalized.includes("sweet") || normalized.includes("chip")) {
    return {
      image: CATEGORY_IMAGES["snacks"],
      accent: "#F97316",
      translationKey: "snacks",
    };
  }
  if (normalized.includes("fast") || normalized.includes("burg") || normalized.includes("pizz")) {
    return {
      image: CATEGORY_IMAGES["fast food"],
      accent: "#EF4444",
      translationKey: "fast_food",
    };
  }
  if (normalized.includes("bev") || normalized.includes("drink") || normalized.includes("juice") || normalized.includes("tea") || normalized.includes("coffee")) {
    return {
      image: CATEGORY_IMAGES["beverages"],
      accent: "#06B6D4",
      translationKey: "beverages",
    };
  }

  // 3. Fallback to default high quality market image
  return {
    image: CATEGORY_IMAGES.default,
    accent: CATEGORY_ACCENTS.default,
    translationKey: normalized.replace(/\s*&\s*/g, "_").replace(/\s+/g, "_"),
  };
};

// High-definition local featured banners for carousel under search bar
const FEATURED_BANNERS = [
  {
    id: "banner-1",
    source: require("../../../assets/im1.jpeg"),
    title: "Quality Local Services",
    subtitle: "Book verified local experts & artisans near you",
    tag: "FEATURED",
    category: "Service",
  },
  {
    id: "banner-2",
    source: require("../../../assets/im2.jpeg"),
    title: "Fresh Vegetables & Fruits",
    subtitle: "Farm fresh produce delivered straight to your door",
    tag: "POPULAR",
    category: "vegetables and fruits",
  },
  {
    id: "banner-3",
    source: require("../../../assets/im3.jpg"),
    title: "Authentic Homemade Foods",
    subtitle: "Delicious regional snacks & home cooked delicacies",
    tag: "SPECIAL",
    category: "home made",
  },
  {
    id: "banner-4",
    source: require("../../../assets/im4.jpg"),
    title: "Rentals & Electronics",
    subtitle: "Affordable rates & flexible short-term rentals",
    tag: "TOP RATED",
    category: "rent",
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
  const carouselImageHeight = isTablet ? 320 : isMedium ? 275 : isSmall ? 220 : 255;

  const { data: carouselData = [] } = useCarousel();
  const { profile, refetch: refetchProfile } = useProfile();

  // Check if profile phone or address is missing/dummy after login
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [hasPromptedProfile, setHasPromptedProfile] = useState(false);

  const missingInfo = useMemo(() => {
    if (!profile) return { address: false, phone: false, any: false };
    const isAddressMissing =
      !profile.address ||
      profile.address === "NOT_SET" ||
      profile.address === "DUMMY_ADDRESS" ||
      profile.address.trim() === "";
    const isPhoneMissing =
      !profile.mobileNumber || profile.mobileNumber.trim() === "";

    return {
      address: isAddressMissing,
      phone: isPhoneMissing,
      any: isAddressMissing || isPhoneMissing,
    };
  }, [profile]);

  useEffect(() => {
    if (profile && missingInfo.any && !hasPromptedProfile) {
      setProfileModalVisible(true);
      setHasPromptedProfile(true);
    }
  }, [profile, missingInfo.any, hasPromptedProfile]);

  const userPincode = useMemo(() => {
    if (!profile) return "";
    if ((profile as any).pincode && String((profile as any).pincode).trim()) {
      return String((profile as any).pincode).trim();
    }
    if (Array.isArray(profile.serviceablePincodes) && profile.serviceablePincodes.length > 0) {
      const validPin = profile.serviceablePincodes.find((p: string) => p && p.trim().length > 0);
      if (validPin) return validPin.trim();
    }
    if (profile.address) {
      const match = String(profile.address).match(/\b\d{6}\b/);
      if (match) return match[0];
    }
    if ((profile as any).address2) {
      const match = String((profile as any).address2).match(/\b\d{6}\b/);
      if (match) return match[0];
    }
    return "";
  }, [profile]);

  const { data: happy60Data } = useHappy60(userPincode);
  const { data: backendCategories = [], refetch: refetchCategories } = useCategories(userPincode);
  const isHappy60Enabled = happy60Data?.isEnabled !== false;
  const happy60PhoneNumber = happy60Data?.phoneNumber || "7025548470";

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
          tag: (item as any).tag || FEATURED_BANNERS[idx % FEATURED_BANNERS.length].tag,
          category: (item as any).category || FEATURED_BANNERS[idx % FEATURED_BANNERS.length].category,
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
        refetchCategories?.(),
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
      if (item.category && item.category.trim()) {
        uniqueCategories.add(item.category.trim());
      }
    });

    if (services.length > 0) {
      uniqueCategories.add("Service");
    }

    if (rentals.length > 0) {
      uniqueCategories.add("Rent");
    }

    // Also include backend categories that match user's pincode or universal
    backendCategories.forEach((bCat) => {
      if (bCat.isActive !== false && bCat.name && bCat.name.trim()) {
        const catPins = (bCat.pincode || "").split(',').map((p: string) => p.trim()).filter(Boolean);
        if (Array.isArray(bCat.pincodes)) {
          bCat.pincodes.forEach((p: string) => { if (p && p.trim()) catPins.push(p.trim()); });
        }
        const matchesPincode = catPins.length === 0 || !userPincode || catPins.includes(userPincode.trim());
        if (matchesPincode) {
          uniqueCategories.add(bCat.name.trim());
        }
      }
    });

    return Array.from(uniqueCategories).map((category, index) => {
      const meta = resolveCategoryMeta(category);

      // Check for matching backend category for this pincode/name
      const matchedBackendCategory = backendCategories.find(
        (bCat) =>
          bCat.isActive !== false &&
          bCat.name &&
          bCat.name.trim().toLowerCase() === category.trim().toLowerCase() &&
          (() => {
          const catPins = (bCat.pincode || "").split(',').map((p: string) => p.trim()).filter(Boolean);
          if (Array.isArray(bCat.pincodes)) {
            bCat.pincodes.forEach((p: string) => { if (p && p.trim()) catPins.push(p.trim()); });
          }
          return catPins.length === 0 || !userPincode || catPins.includes(userPincode.trim());
        })()
      );

      // If matched and custom Data URL image exists, use it!
      const categoryImage =
        matchedBackendCategory && matchedBackendCategory.image
          ? { uri: matchedBackendCategory.image }
          : meta.image;

      const finalName = matchedBackendCategory?.name || category;
      return {
        id: "category-" + index,
        name: finalName,
        displayName: finalName,
        translationKey: meta.translationKey,
        categoryImage,
        accentColor: meta.accent,
        isCustom: !!matchedBackendCategory,
      };
    });
  }, [products, services, rentals, backendCategories, userPincode]);

  const scaleAnims = useRef(
    Array(64).fill(0).map(() => new Animated.Value(1))
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
    Linking.openURL("tel:" + happy60PhoneNumber);
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
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 8, paddingBottom: 18, zIndex: 10 }}
      >

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
                overflow: 'hidden', backgroundColor: '#1D4ED8',
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
          <View style={{ marginTop: 12 }}>
            
            {/* Carousel Section Header */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: horizontalPadding, marginBottom: 12,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[{ fontSize: isTablet ? 19 : isSmall ? 15 : 17, color: '#0F172A', letterSpacing: -0.3 }, styleBold]}>
                  {t("Featured Highlights") || "Featured Highlights"}
                </Text>
                <View style={{
                  marginLeft: 8, backgroundColor: '#EFF6FF',
                  paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
                  borderWidth: 1, borderColor: '#DBEAFE',
                }}>
               
                </View>
              </View>

              {/* Slide Counter indicator */}
              <View style={{
                backgroundColor: 'rgba(241,245,249,0.9)',
                borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3,
                borderWidth: 1, borderColor: '#E2E8F0',
              }}>
                <Text style={[{ fontSize: 11, color: '#64748B' }, styleMedium]}>
                  {activeSlide + 1} / {displayCarousel.length}
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
                  <Pressable
                    onPress={() => {
                      if (item.category) {
                        handleCategoryPress(item.category);
                      } else {
                        router.push("/(tabs)/market");
                      }
                    }}
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.99 : 1 }],
                      opacity: pressed ? 0.96 : 1,
                    })}
                  >
                    <View style={{
                      borderRadius: 24,
                      overflow: 'hidden',
                      height: carouselImageHeight,
                      backgroundColor: '#EFF6FF',
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.06)',
                      ...Platform.select({
                        ios: {
                          shadowColor: '#1D4ED8',
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.18,
                          shadowRadius: 18,
                        },
                        android: { elevation: 8 },
                      }),
                    }}>
                      {/* Banner Image — Clean pure image without text or overlays */}
                      <Image
                        source={item.source}
                        style={{ width: width - horizontalPadding * 2, height: carouselImageHeight }}
                        resizeMode="cover"
                      />
                    </View>
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            {/* Pagination Indicators — Sleek animated pill indicators */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
              {displayCarousel.map((_, index) => (
                <View key={index} style={{
                  height: 5,
                  borderRadius: 3,
                  marginHorizontal: 3,
                  width: activeSlide === index ? 24 : 6,
                  backgroundColor: activeSlide === index ? "#2563EB" : "#CBD5E1",
                }} />
              ))}
            </View>
          </View>

          {/* ── Exclusive Plan Banner: Happy 60 (Ultra-Responsive & Attractive) ── */}
          {isHappy60Enabled && (
            <Pressable
              onPress={handleCallHappy60}
              style={({ pressed }) => ({
                marginHorizontal: horizontalPadding,
                marginTop: 18,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: pressed ? 0.95 : 1,
              })}
            >
              <View style={{
                borderRadius: 24,
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: 'rgba(59,130,246,0.2)',
                ...Platform.select({
                  ios: {
                    shadowColor: '#1D4ED8',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.18,
                    shadowRadius: 18,
                  },
                  android: { elevation: 6 },
                }),
              }}>
                <LinearGradient
                  colors={["#1E40AF", "#2563EB", "#3B82F6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: isSmall ? 18 : 22, borderRadius: 24 }}
                >
                  {/* Decorative glowing background circles for visual depth */}
                  <View style={{
                    position: 'absolute', right: -30, top: -30,
                    width: 140, height: 140, borderRadius: 70,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }} />
                  <View style={{
                    position: 'absolute', right: 60, bottom: -40,
                    width: 100, height: 100, borderRadius: 50,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                  }} />

                  {/* Top Pill Tag */}
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
                    marginBottom: 12,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
                  }}>
                    <Sparkles size={10} color="#FBBF24" style={{ marginRight: 5 }} />
                    <Text style={[{
                      fontSize: isSmall ? 9 : 10, color: '#FFFFFF',
                      letterSpacing: 0.8, textTransform: 'uppercase',
                    }, styleBold]}>
                      {t("SENIOR CITIZEN CARE") || "SENIOR CITIZEN CARE"}
                    </Text>
                  </View>

                  {/* Main Content Area */}
                  <View style={{
                    flexDirection: isSmall ? 'column' : 'row',
                    alignItems: isSmall ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[{
                        fontSize: isTablet ? 26 : isSmall ? 21 : 24,
                        color: '#FFFFFF', letterSpacing: -0.3,
                      }, styleBold]}>
                        {t("Happy_60") || "Happy 60"}
                      </Text>
                      
                      <Text style={[{
                        color: 'rgba(255,255,255,0.88)',
                        fontSize: isSmall ? 12 : 13,
                        marginTop: 4, lineHeight: 19,
                      }, styleRegular]}>
                        {t("Exclusive_for_senior_citizens") || "Priority support & doorstep delivery for elders"} 
                      </Text>
                    </View>

                    {/* Interactive Call Button (No raw phone number shown) */}
                    <View style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 18,
                      paddingHorizontal: isSmall ? 16 : 20,
                      paddingVertical: isSmall ? 11 : 13,
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: isSmall ? 'stretch' : 'auto',
                      justifyContent: 'center',
                      ...Platform.select({
                        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
                        android: { elevation: 4 },
                      }),
                    }}>
                      <View style={{
                        width: 30, height: 30, borderRadius: 15,
                        backgroundColor: '#EFF6FF',
                        alignItems: 'center', justifyContent: 'center',
                        marginRight: 8,
                      }}>
                        <Phone size={16} color="#2563EB" strokeWidth={2.5} />
                      </View>
                      <Text style={[{
                        fontSize: isSmall ? 13 : 14, color: '#1E40AF',
                        letterSpacing: 0.2,
                      }, styleBold]}>
                        {t("Call Now") || "Call Helpline"}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </Pressable>
          )}

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
                          backgroundColor: '#EFF6FF',
                          borderWidth: 1,
                          borderColor: 'rgba(37,99,235,0.12)',
                          ...Platform.select({
                            ios: {
                              shadowColor: '#1D4ED8',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.10,
                              shadowRadius: 8,
                            },
                            android: { elevation: 4 },
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
                              backgroundColor: '#DBEAFE',
                            }} />
                          )}

                          {/* Clean blue gradient overlay */}
                          <LinearGradient
                            colors={['transparent', 'rgba(29,78,216,0.15)', 'rgba(30,64,175,0.85)']}
                            locations={[0, 0.45, 1]}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                          />



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
                              }, styleBold]}
                            >
                              {(() => {
                                const standardKeys = ["food", "vegetables_and_fruits", "vegetables_fruits", "groceries", "home_made", "fish_meat", "service", "rent"];
                                if (category.translationKey && standardKeys.includes(category.translationKey) && !category.isCustom) {
                                  return t("categories." + category.translationKey, { defaultValue: category.displayName || category.name });
                                }
                                return category.displayName || category.name;
                              })()}
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

      {/* Complete Profile Reminder Modal */}
      <Modal
        visible={profileModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-2xl">
            <View className="w-16 h-16 rounded-full bg-amber-50 items-center justify-center mb-4 border border-amber-100">
              <MapPin size={32} color="#D97706" strokeWidth={2.5} />
            </View>

            <Text className="text-xl font-bold text-gray-900 text-center mb-2" style={styleBold}>
              {t("Kindly Complete Your Profile") || "Complete Your Profile"}
            </Text>

            <Text className="text-sm text-gray-600 text-center mb-6 leading-relaxed" style={styleRegular}>
              {missingInfo.address && missingInfo.phone
                ? (t("Please add your mobile number and delivery address to complete your account setup.") || "Please add your mobile number and delivery address to complete your account setup.")
                : missingInfo.address
                ? (t("please_add_address") || "Please add your delivery address to complete your profile.")
                : (t("please_add_phone") || "Please add your mobile number to complete your profile.")}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setProfileModalVisible(false);
                router.push("/settings/settings");
              }}
              className="w-full bg-blue-600 rounded-xl py-3.5 items-center justify-center mb-3 shadow-md active:bg-blue-700"
            >
              <Text className="text-white font-semibold text-base" style={styleBold}>
                {t("Update Profile Now") || "Update Profile Now"}
              </Text>
            </TouchableOpacity>

            <Pressable
              onPress={() => setProfileModalVisible(false)}
              className="py-2 px-4 active:opacity-70"
            >
              <Text className="text-gray-400 font-medium text-sm">
                {t("Maybe Later") || "Maybe Later"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
