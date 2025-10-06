// lib/paymentApi.ts (RTK Query API)
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface PaymentRequestPayload {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_area: string;
  customer_note?: string;
  products: Array<{ productId: string; quantity: number }>;
  due: string;
  total_amount: number;
}

interface PaymentResponse {
  sessionKey: string;
  gatewayUrl: string;
  redirectUrl: string;
}

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/payment",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createPaymentRequest: builder.mutation<PaymentResponse, PaymentRequestPayload>({
      query: (payload) => ({
        url: "/initiate",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const { useCreatePaymentRequestMutation } = paymentApi;
