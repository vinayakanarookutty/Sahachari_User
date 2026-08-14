import { makeRedirectUri } from "expo-auth-session";
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
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // REDIRECT URI
  // ---------------------------------------------------------

  const redirectUri = makeRedirectUri({
    scheme: "customers",
    path: "redirect",
  });

  console.log("[GoogleAuth] Platform:", Platform.OS);

  console.log("[GoogleAuth] Redirect URI:", redirectUri);

  // ---------------------------------------------------------
  // GOOGLE AUTH REQUEST
  // ---------------------------------------------------------

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    redirectUri,
  });

  console.log("[GoogleAuth] Request:", request);

  // ---------------------------------------------------------
  // HANDLE GOOGLE RESPONSE
  // ---------------------------------------------------------

  useEffect(() => {
    if (!response) {
      return;
    }

    console.log("[GoogleAuth] Response:", response);

    // -------------------------------------------------------
    // SUCCESS
    // -------------------------------------------------------

    if (response.type === "success") {
      const accessToken = response.authentication?.accessToken;

      console.log("[GoogleAuth] Authentication success");

      console.log(
        "[GoogleAuth] Access token:",
        accessToken ? "RECEIVED" : "MISSING",
      );

      if (!accessToken) {
        setError(
          "Google authentication succeeded but no access token was received.",
        );

        setLoading(false);

        return;
      }

      fetchGoogleProfile(accessToken);

      return;
    }

    // -------------------------------------------------------
    // ERROR
    // -------------------------------------------------------

    if (response.type === "error") {
      console.error("[GoogleAuth] OAuth error:", response.error);

      console.error("[GoogleAuth] OAuth params:", response.params);

      setError(response.error?.message || "Google sign-in failed.");

      setLoading(false);

      return;
    }

    // -------------------------------------------------------
    // CANCEL / DISMISS
    // -------------------------------------------------------

    if (response.type === "dismiss" || response.type === "cancel") {
      console.log("[GoogleAuth] Google login cancelled");

      setLoading(false);
    }
  }, [response]);

  // ---------------------------------------------------------
  // FETCH GOOGLE PROFILE
  // ---------------------------------------------------------

  const fetchGoogleProfile = async (accessToken: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("[GoogleAuth] Fetching Google profile...");

      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("[GoogleAuth] Profile response:", res.status);

      if (!res.ok) {
        throw new Error(`Google profile request failed: ${res.status}`);
      }

      const data = await res.json();

      console.log("[GoogleAuth] Google user:", data);

      // -----------------------------------------------------
      // GET NAME
      // -----------------------------------------------------

      const name = typeof data.name === "string" ? data.name : "";

      // -----------------------------------------------------
      // GET EMAIL
      // -----------------------------------------------------

      const email = typeof data.email === "string" ? data.email : "";

      // -----------------------------------------------------
      // EMAIL REQUIRED
      // -----------------------------------------------------

      if (!email) {
        throw new Error("Google account email was not received.");
      }

      // -----------------------------------------------------
      // SAVE USER INFO
      // -----------------------------------------------------

      const googleUser: GoogleUserInfo = {
        name,
        email,
        picture: typeof data.picture === "string" ? data.picture : undefined,
      };

      console.log("[GoogleAuth] User info:", googleUser);

      setUserInfo(googleUser);

      setError(null);
    } catch (err) {
      console.error("[GoogleAuth] Profile error:", err);

      setUserInfo(null);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch Google profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // SIGN IN WITH GOOGLE
  // ---------------------------------------------------------

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      console.log("[GoogleAuth] Starting Google login...");

      console.log("[GoogleAuth] Redirect URI:", redirectUri);

      // -----------------------------------------------------
      // CHECK REQUEST
      // -----------------------------------------------------

      if (!request) {
        console.log("[GoogleAuth] Request is not ready");

        setLoading(false);

        setError("Google authentication is not ready. Please wait a moment.");

        return;
      }

      // -----------------------------------------------------
      // OPEN GOOGLE LOGIN
      // -----------------------------------------------------

      const result = await promptAsync();

      console.log("[GoogleAuth] Prompt result:", result);
    } catch (err) {
      console.error("[GoogleAuth] Sign-in error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Google sign-in failed.");
      }

      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // RESET
  // ---------------------------------------------------------

  const reset = () => {
    setUserInfo(null);
    setError(null);
    setLoading(false);
  };

  // ---------------------------------------------------------
  // RETURN
  // ---------------------------------------------------------

  return {
    signInWithGoogle,
    userInfo,
    loading,
    error,
    reset,
    isReady: !!request,
    redirectUri,
  };
}
