export type BookingStatus =
    | "PLACED"
    | "ACCEPTED"
    | "REJECTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "RETURNED"
    | "CANCELLED";

export type BookingType =
    | "SERVICE"
    | "RENTAL";

export interface Booking {
    _id: string;

    bookingType: BookingType;

    status: BookingStatus;

    totalAmount: number;

    startDate: string;

    endDate?: string;

    createdAt: string;

    item: {
        itemId: string;
        itemName: string;
        description?: string;
        images?: string[];

        category: string;

        unit: string;

        price: number;

        quantity: number;
    };

    bookingAddress: {
        street: string;
        city: string;
        zipCode: string;
        place: string;
        phone: string;
        notes?: string;
    };
}