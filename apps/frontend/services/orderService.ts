// apps/frontend/services/orderService.ts

import axios from "../lib/axios";

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface CreateOrderData {
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry?: string;
  phone: string;
  email: string;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      description: string;
      price: number;
      category: string;
      mainCategory: string;
      brand: string;
      image: string;
    };
  }>;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// Create a new order
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  const response = await axios.post("/orders", orderData);
  return response.data.order;
};

// Get all orders for a user
export const getUserOrders = async (userId: number): Promise<Order[]> => {
  const response = await axios.get(`/orders/user/${userId}`);
  return response.data;
};

// Get a specific order by ID
export const getOrderById = async (orderId: number): Promise<Order> => {
  const response = await axios.get(`/orders/${orderId}`);
  return response.data;
};

// Update order status (admin)
export const updateOrderStatus = async (
  orderId: number,
  orderStatus?: string,
  paymentStatus?: string
): Promise<Order> => {
  const response = await axios.patch(`/orders/${orderId}/status`, {
    orderStatus,
    paymentStatus,
  });
  return response.data.order;
};

