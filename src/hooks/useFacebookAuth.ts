import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

// Facebook App ID from developers.facebook.com
const FACEBOOK_APP_ID = "3704948042987926";

export interface FacebookUserInfo {
  name: string;
  email: string;
  picture?: string;
}

export function useFacebookAuth() {
  const [userInfo, setUserInfo] = useState<FacebookUserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUri =
    Platform.OS === "web" && typeof window !== "undefined"
      ? window.location.origin
      : makeRedirectUri({ scheme: "customers" });

  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchFacebookProfile(authentication.accessToken);
      }
    } else if (response?.type === "error") {
      setError("Facebook sign-in failed. Please try again.");
      setLoading(false);
    } else if (response?.type === "dismiss") {
      setLoading(false);
    }
  }, [response]);

  const fetchFacebookProfile = async (accessToken: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://graph.facebook.com/me?fields=name,email,picture.type(large)&access_token=${accessToken}`
      );
      const data = await res.json();
      setUserInfo({
        name: data.name || "",
        email: data.email || "",
        picture: data.picture?.data?.url,
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch Facebook profile.");
      console.error("Facebook profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    setError(null);
    setLoading(true);
    try {
      await promptAsync();
    } catch (err) {
      setError("Facebook sign-in was cancelled.");
      setLoading(false);
    }
  };

  const reset = () => {
    setUserInfo(null);
    setError(null);
    setLoading(false);
  };

  return {
    signInWithFacebook,
    userInfo,
    loading,
    error,
    reset,
    isReady: !!request,
  };
}
