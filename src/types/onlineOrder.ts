import { TCartItem } from "./cart";

export interface OnlineOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_area: string;
  products: TCartItem[];
  note?: string;
  due: string;
  payment_method?: string;
  transaction_id?: string;
  payment_status?: string;
}

export interface OnlineOrderResponse {
  success: boolean;
  orderId?: string;
  message?: string;
}
