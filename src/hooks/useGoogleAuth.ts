import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

// Google Web Client ID from Firebase google-services.json
const GOOGLE_WEB_CLIENT_ID =
  "208738624417-7l2hgkjfu3nfkhcjt0vhkvao9c4vqids.apps.googleusercontent.com";

export interface GoogleUserInfo {
  name: string;
  email: string;
  picture?: string;
}

export function useGoogleAuth() {
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUri =
    Platform.OS === "web" && typeof window !== "undefined"
      ? window.location.origin
      : makeRedirectUri({ scheme: "customers" });

  // Always log the redirect URI so we know what to whitelist
  console.log("[GoogleAuth] Platform:", Platform.OS, "| Redirect URI:", redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchGoogleProfile(authentication.accessToken);
      }
    } else if (response?.type === "error") {
      setError("Google sign-in failed. Please try again.");
      setLoading(false);
    } else if (response?.type === "dismiss") {
      setLoading(false);
    }
  }, [response]);

  const fetchGoogleProfile = async (accessToken: string) => {
    try {
      setLoading(true);
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setUserInfo({
        name: data.name || "",
        email: data.email || "",
        picture: data.picture,
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch Google profile.");
      console.error("Google profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await promptAsync();
    } catch (err) {
      setError("Google sign-in was cancelled.");
      setLoading(false);
    }
  };

  const reset = () => {
    setUserInfo(null);
    setError(null);
    setLoading(false);
  };

  return {
    signInWithGoogle,
    userInfo,
    loading,
    error,
    reset,
    isReady: !!request,
  };
}
