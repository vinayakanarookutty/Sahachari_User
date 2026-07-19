import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../store/auth.store";
import { getOrders } from "../services/orders.api";
import {
  requestNotificationPermissions,
  scheduleOrderNotification,
} from "../services/notification.service";

export function OrderNotificationObserver() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  // Request permissions and setup listeners on mount
  useEffect(() => {
    requestNotificationPermissions();

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        try {
          // Navigate to the orders screen when the user taps the notification
          router.push("/(tabs)/orders");
        } catch (error) {
          console.error("Failed to navigate to orders screen on notification press:", error);
        }
      }
    );

    return () => {
      responseSubscription.remove();
    };
  }, [router]);

  // Periodically check orders status updates
  useEffect(() => {
    if (!token) return;

    const checkOrders = async () => {
      try {
        const response = await getOrders();
        if (!response) return;

        // Support both array directly or object containing order array
        const ordersList = Array.isArray(response) ? response : (response.orders || []);

        const storedStatusesStr = await AsyncStorage.getItem("order_statuses");
        const storedStatuses = storedStatusesStr ? JSON.parse(storedStatusesStr) : null;

        if (!storedStatuses) {
          // Initialize storage with current statuses on first check
          const initialStatuses: Record<string, string> = {};
          ordersList.forEach((order: any) => {
            if (order._id && order.status) {
              initialStatuses[order._id] = order.status;
            }
          });
          await AsyncStorage.setItem("order_statuses", JSON.stringify(initialStatuses));
          return;
        }

        let hasChanges = false;
        const updatedStatuses = { ...storedStatuses };

        for (const order of ordersList) {
          const orderId = order._id;
          if (!orderId) continue;

          const prevStatus = storedStatuses[orderId];
          const currentStatus = order.status;

          if (!prevStatus) {
            // New order found!
            await scheduleOrderNotification(
              "New Order Placed 📦",
              `Order #${order.checkoutId || orderId.slice(-6)} has been placed successfully.`
            );
            updatedStatuses[orderId] = currentStatus;
            hasChanges = true;
          } else if (prevStatus !== currentStatus) {
            // Status changed!
            let title = "Order Update 📋";
            let body = `Order #${order.checkoutId || orderId.slice(-6)} status is now ${currentStatus}.`;

            if (currentStatus === "CONFIRMED") {
              title = "Order Confirmed ✅";
              body = `Order #${order.checkoutId || orderId.slice(-6)} has been confirmed!`;
            } else if (currentStatus === "SHIPPED") {
              title = "Order Shipped 🚚";
              body = `Order #${order.checkoutId || orderId.slice(-6)} is on the way!`;
            } else if (currentStatus === "DELIVERED") {
              title = "Order Delivered 🎉";
              body = `Order #${order.checkoutId || orderId.slice(-6)} has been delivered. Thank you!`;
            } else if (currentStatus === "CANCELLED") {
              title = "Order Cancelled ❌";
              body = `Order #${order.checkoutId || orderId.slice(-6)} has been cancelled.`;
            }

            await scheduleOrderNotification(title, body);
            updatedStatuses[orderId] = currentStatus;
            hasChanges = true;
          }
        }

        // Clean up stored order statuses for orders no longer in the list
        const currentOrderIds = new Set(ordersList.map((o: any) => o._id));
        for (const key of Object.keys(updatedStatuses)) {
          if (!currentOrderIds.has(key)) {
            delete updatedStatuses[key];
            hasChanges = true;
          }
        }

        if (hasChanges) {
          await AsyncStorage.setItem("order_statuses", JSON.stringify(updatedStatuses));
        }
      } catch (err) {
        console.error("Error during background order check:", err);
      }
    };

    // Run initial check
    checkOrders();

    // Check every 30 seconds
    const interval = setInterval(checkOrders, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [token]);

  return null;
}
