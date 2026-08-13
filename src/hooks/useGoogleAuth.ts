import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

/**
 * ================================
 * GOOGLE OAUTH CLIENT IDS
 * ================================
 */

// WEB OAuth Client
const GOOGLE_WEB_CLIENT_ID =
  "208738624417-7l2hgkjfu3nfkhcjt0vhkvao9c4vqids.apps.googleusercontent.com";

// ANDROID OAuth Client
const GOOGLE_ANDROID_CLIENT_ID =
  "208738624417-g1uoibql59kcpc8t8jjeac8d9hpro23l.apps.googleusercontent.com";

// Add this later when iOS OAuth is configured
// const GOOGLE_IOS_CLIENT_ID =
//   "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com";


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


  /**
   * ================================
   * REDIRECT URI
   * ================================
   *
   * WEB:
   * http://localhost:8081
   *
   * ANDROID:
   * customers://
   *
   */

  const redirectUri =
    Platform.OS === "web"
      ? window.location.origin
      : makeRedirectUri({
          native: "customers://",
        });


  /**
   * ================================
   * DEBUG
   * ================================
   */

  console.log(
    "[GoogleAuth] Platform:",
    Platform.OS
  );

  console.log(
    "[GoogleAuth] Redirect URI:",
    redirectUri
  );

  console.log(
    "[GoogleAuth] Web Client:",
    GOOGLE_WEB_CLIENT_ID
  );

  console.log(
    "[GoogleAuth] Android Client:",
    GOOGLE_ANDROID_CLIENT_ID
  );


  /**
   * ================================
   * GOOGLE AUTH REQUEST
   * ================================
   */

  const [request, response, promptAsync] =
    Google.useAuthRequest({
      webClientId:
        GOOGLE_WEB_CLIENT_ID,

      androidClientId:
        GOOGLE_ANDROID_CLIENT_ID,

      redirectUri,
    });


  /**
   * ================================
   * HANDLE GOOGLE RESPONSE
   * ================================
   */

  useEffect(() => {

    if (!response) {
      return;
    }

    console.log(
      "[GoogleAuth] Response:",
      response
    );


    /**
     * SUCCESS
     */

    if (response.type === "success") {

      const { authentication } =
        response;

      console.log(
        "[GoogleAuth] Authentication:",
        authentication
      );


      if (
        authentication?.accessToken
      ) {

        fetchGoogleProfile(
          authentication.accessToken
        );

      } else {

        setError(
          "Google authentication succeeded but no access token was received."
        );

        setLoading(false);
      }

      return;
    }


    /**
     * ERROR
     */

    if (response.type === "error") {

      console.error(
        "[GoogleAuth] OAuth Error:",
        response.error
      );

      console.error(
        "[GoogleAuth] OAuth Params:",
        response.params
      );

      setError(
        response.error?.message ||
          "Google sign-in failed. Please try again."
      );

      setLoading(false);

      return;
    }


    /**
     * DISMISSED
     */

    if (response.type === "dismiss") {

      console.log(
        "[GoogleAuth] Google login dismissed."
      );

      setLoading(false);

      return;
    }


    /**
     * CANCELLED
     */

    if (response.type === "cancel") {

      console.log(
        "[GoogleAuth] Google login cancelled."
      );

      setLoading(false);

      return;
    }

  }, [response]);


  /**
   * ================================
   * GET GOOGLE USER PROFILE
   * ================================
   */

  const fetchGoogleProfile =
    async (
      accessToken: string
    ) => {

      try {

        setLoading(true);

        console.log(
          "[GoogleAuth] Fetching Google profile..."
        );


        const res =
          await fetch(
            "https://www.googleapis.com/userinfo/v2/me",
            {
              method: "GET",

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


        const data =
          await res.json();


        console.log(
          "[GoogleAuth] Google profile:",
          data
        );


        const googleUser:
          GoogleUserInfo = {

          name:
            data.name || "",

          email:
            data.email || "",

          picture:
            data.picture,
        };


        setUserInfo(
          googleUser
        );

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


  /**
   * ================================
   * SIGN IN WITH GOOGLE
   * ================================
   */

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


  /**
   * ================================
   * RESET
   * ================================
   */

  const reset = () => {

    setUserInfo(null);

    setError(null);

    setLoading(false);
  };


  /**
   * ================================
   * RETURN
   * ================================
   */

  return {

    signInWithGoogle,

    userInfo,

    loading,

    error,

    reset,

    isReady:
      !!request,

    redirectUri,
  };
}