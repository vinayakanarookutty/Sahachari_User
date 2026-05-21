import { api } from "./api";

export const addToCart = (dto: { productId: string; quantity: number }) =>
  api.post("/customer/cart", dto).then((r) => r.data);

export const placeSingleOrder = (dto: {
  productId: string;
  quantity: number;
  deliveryAddress: any;
  place: string;
}) => api.post("/customer/single-order", dto).then((r) => r.data);

export const getCart = () => api.get("/customer/cart").then((r) => r.data);
export const getOrders = () => api.get("/customer/orders").then((r) => r.data);
export const getOrderById = async (orderId: string) => {
  const response = await api.get(`/customer/orders/${orderId}`);
  return response.data;
};

export const cancelOrder = async (orderId: string) => {
  const response = await api.post(`/customer/orders/${orderId}/cancel`);
  return response.data;
};
// Add these functions to your services/orders.api.ts file

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const response = await api.patch(`/customer/cart/${itemId}`, { quantity });
  return response.data;
}

export async function removeCartItem(itemId: string) {
  const response = await api.delete(`/customer/cart/${itemId}`);
  return response.data;
}
export async function placeOrder(orderData: {
  street: string;
  city: string;
  zipCode: string;
  phone: string;
  notes: string;
}) {
  const response = await api.post("/customer/orders", orderData);
  return response.data;
}