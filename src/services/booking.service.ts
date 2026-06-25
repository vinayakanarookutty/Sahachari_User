import { api } from "./api";

export const bookingService = {
  getBookings: async () => {
    const response = await api("/bookings");
    return response.data;
  },

  getBooking: async (id: string) => {
    const response = await api(`/bookings/${id}`);
    return response.data;
  },

  cancelBooking: async (id: string) => {
    const response = await api(`/bookings/${id}/cancel`, {
      method: "PATCH",
    });
    return response.data;
  },
};