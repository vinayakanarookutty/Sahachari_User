import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

// WEB OAuth Client ID
const GOOGLE_WEB_CLIENT_ID =
  "208738624417-7l2hgkjfu3nfkhcjt0vhkvao9c4vqids.apps.googleusercontent.com";

// ANDROID OAuth Client ID
const GOOGLE_ANDROID_CLIENT_ID =
  "208738624417-g1uoibql59kcpc8t8jjeac8d9hpro23l.apps.googleusercontent.com";

// IOS OAuth Client ID
//const GOOGLE_IOS_CLIENT_ID =
// process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export interface GoogleUserInfo {
  name: string;
  email: string;
  picture?: string;
}

export function useGoogleAuth() {
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * WEB:
   *   http://localhost:8081
   *
   * ANDROID:
   *   customers://
   *
   * IOS:
   *   customers://
   */
  const redirectUri =
    Platform.OS === "web"
      ? window.location.origin
      : makeRedirectUri({
          native: "customers://",
        });

  console.log(
    "[GoogleAuth] Platform:",
    Platform.OS,
    "| Redirect URI:",
    redirectUri,
  );

  console.log("[GoogleAuth] Android Client:", GOOGLE_ANDROID_CLIENT_ID);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,

    androidClientId: GOOGLE_ANDROID_CLIENT_ID,

    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;

      if (authentication?.accessToken) {
        fetchGoogleProfile(authentication.accessToken);
      }
    } else if (response?.type === "error") {
      console.error("[GoogleAuth] OAuth error:", response.error);

      setError(
        response.error?.message || "Google sign-in failed. Please try again.",
      );

      setLoading(false);
    } else if (response?.type === "dismiss") {
      setLoading(false);
    }
  }, [response]);

  const fetchGoogleProfile = async (accessToken: string) => {
    try {
      setLoading(true);

      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Google profile request failed: ${res.status}`);
      }

      const data = await res.json();

      setUserInfo({
        name: data.name || "",
        email: data.email || "",
        picture: data.picture,
      });

      setError(null);
    } catch (err) {
      console.error("[GoogleAuth] Google profile error:", err);

      setError("Failed to fetch Google profile.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!request) {
        throw new Error("Google authentication is not ready.");
      }

      await promptAsync();
    } catch (err) {
      console.error("[GoogleAuth] Sign-in error:", err);

      setError("Google sign-in failed.");
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
