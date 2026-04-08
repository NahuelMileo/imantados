export interface Pack {
  id: string;
  name: string;
  quantity: number;
  priceUYU: number;
  description: string;
  bullets: string[];
  image: string;
}

export type OrderImage = {
  id: string;
  originalName: string;
  key: string;
  url?: string;
  status: "uploaded";
};

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
}

export interface DeliveryData {
  type: "retiro" | "envio";
  address?: {
    street: string;
    city: string;
    state: string;
  };
  shippingNote: string;
}

export interface Order {
  id: string;
  packId: string;
  packSnapshot: {
    name: string;
    quantity: number;
    priceUYU: number;
  };
  customer: CustomerData;
  delivery: DeliveryData;
  notes?: string;
  images: OrderImage[];
  createdAtISO: string;
  paymentStatus: "pending";
  orderStatus: "created" | "paid" | "production" | "shipped" | "delivered";
}
