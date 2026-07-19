import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure how notifications are handled when the app is in the foreground
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

const ORDER_STATUSES_KEY = "order_statuses";

/**
 * Requests notification permissions from the user.
 * On Android, also configures the custom notification channel.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permissions not granted!");
      return false;
    }

    // Set up Android channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("order_updates", {
        name: "Order Updates",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#2563EB",
      });
    }

    return true;
  } catch (error) {
    console.error("Error setting up notifications:", error);
    return false;
  }
}

/**
 * Immediately triggers a system notification for the user.
 */
export async function scheduleOrderNotification(
  title: string,
  body: string,
  data?: any
): Promise<string | undefined> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        const notification = new Notification(title, { body });
        notification.onclick = () => {
          window.focus();
          window.dispatchEvent(new CustomEvent("notification-clicked", { detail: data }));
        };
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const notification = new Notification(title, { body });
          notification.onclick = () => {
            window.focus();
            window.dispatchEvent(new CustomEvent("notification-clicked", { detail: data }));
          };
        }
      }
    }
    return "web-notification";
  }

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // trigger immediately
    });
    return identifier;
  } catch (error) {
    console.error("Failed to schedule local notification:", error);
  }
}

/**
 * Registers a specific order ID and status in local storage.
 * This prevents the periodic check from triggering duplicate "New Order Placed"
 * notifications for orders that were just created by the user in this session.
 */
export async function registerOrderStatus(
  orderId: string,
  status: string
): Promise<void> {
  if (!orderId) return;

  try {
    const storedStatusesStr = await AsyncStorage.getItem(ORDER_STATUSES_KEY);
    const storedStatuses = storedStatusesStr ? JSON.parse(storedStatusesStr) : {};
    
    storedStatuses[orderId] = status;
    
    await AsyncStorage.setItem(ORDER_STATUSES_KEY, JSON.stringify(storedStatuses));
  } catch (error) {
    console.error("Failed to register order status locally:", error);
  }
}
