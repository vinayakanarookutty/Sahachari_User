import { api } from "./api";

export type BookingType =
    | "PRODUCT"
    | "SERVICE"
    | "RENTAL";

export interface AddressPayload {
    street: string;
    city: string;
    zipCode: string;
    phone: string;
    place?: string;
    notes?: string;
    paymentMethod: string;
}

export interface ProductOrderPayload
    extends AddressPayload {
    productId: string;
    quantity: number;
}

export interface ServiceBookingPayload {
    serviceId: string;

    startDate?: string;
    endDate?: string;

    bookingAddress: {
        name?: string;
        street: string;
        city: string;
        zipCode: string;
        place: string;
        phone: string;
        notes?: string;
    };
}

export interface RentalBookingPayload {
    rentalId: string;
    quantity?: number;

    startDate?: string;
    endDate?: string;

    bookingAddress: {
        name?: string;
        street: string;
        city: string;
        zipCode: string;
        place: string;
        phone: string;
        notes?: string;
    };
}

export async function createBooking(
    type: BookingType,
    payload:
        | ProductOrderPayload
        | ServiceBookingPayload
        | RentalBookingPayload
) {
    let response;

    switch (type) {
        case "PRODUCT":
            response = await api.post(
                "/customer/single-order",
                payload
            );
            break;

        case "SERVICE":
            response = await api.post(
                "/bookings/service",
                payload
            );
            break;

        case "RENTAL":
            response = await api.post(
                "/bookings/rental",
                payload
            );
            break;

        default:
            throw new Error("Invalid booking type");
    }

    return response.data;
}