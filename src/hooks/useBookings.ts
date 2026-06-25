import { useQuery } from "@tanstack/react-query";
import { bookingService } from "../services/booking.service";

export function useBookings() {
    return useQuery({
        queryKey: ["bookings"],
        queryFn: bookingService.getBookings,
    });
}