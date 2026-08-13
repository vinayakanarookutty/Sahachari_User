import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID =
  "208738624417-7l2hgkjfu3nfkhcjt0vhkvao9c4vqids.apps.googleusercontent.com";

const GOOGLE_ANDROID_CLIENT_ID =
  "208738624417-g1uoibql59kcpc8t8jjeac8d9hpro23l.apps.googleusercontent.com";

export interface GoogleUserInfo {
  name: string;
  email: string;
  picture?: string;
}

export function useGoogleAuth() {
  const [userInfo, setUserInfo] =
    useState<GoogleUserInfo | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [request, response, promptAsync] =
    Google.useAuthRequest({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    });

  console.log(
    "[GoogleAuth] Platform:",
    Platform.OS
  );

  console.log(
    "[GoogleAuth] Android Client:",
    GOOGLE_ANDROID_CLIENT_ID
  );

  console.log(
    "[GoogleAuth] Request:",
    request
  );

  useEffect(() => {
    if (!response) return;

    console.log(
      "[GoogleAuth] Response:",
      response
    );

    if (response.type === "success") {
      const accessToken =
        response.authentication?.accessToken;

      if (accessToken) {
        fetchGoogleProfile(accessToken);
      } else {
        setError(
          "Google authentication succeeded but no access token was received."
        );
        setLoading(false);
      }

      return;
    }

    if (response.type === "error") {
      console.error(
        "[GoogleAuth] OAuth error:",
        response.error
      );

      console.error(
        "[GoogleAuth] OAuth params:",
        response.params
      );

      setError(
        response.error?.message ||
          "Google sign-in failed."
      );

      setLoading(false);

      return;
    }

    if (
      response.type === "dismiss" ||
      response.type === "cancel"
    ) {
      setLoading(false);
    }
  }, [response]);

  const fetchGoogleProfile =
    async (accessToken: string) => {
      try {
        setLoading(true);

        const res = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(
            `Google profile request failed: ${res.status}`
          );
        }

        const data = await res.json();

        setUserInfo({
          name: data.name || "",
          email: data.email || "",
          picture: data.picture,
        });

        setError(null);
      } catch (err) {
        console.error(
          "[GoogleAuth] Profile error:",
          err
        );

        setError(
          "Failed to fetch Google profile."
        );
      } finally {
        setLoading(false);
      }
    };

  const signInWithGoogle =
    async () => {
      try {
        setError(null);
        setLoading(true);

        if (!request) {
          throw new Error(
            "Google authentication is not ready."
          );
        }

        await promptAsync();
      } catch (err) {
        console.error(
          "[GoogleAuth] Sign-in error:",
          err
        );

        setError(
          "Google sign-in failed."
        );

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