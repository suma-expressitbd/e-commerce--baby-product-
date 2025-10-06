// src/app/api/payment/initiate/route.ts
import { NextResponse } from "next/server";
import querystring from "querystring";

/**
 * Interface for individual order items
 */
interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

/**
 * Payload expected from frontend to initiate payment
 */
interface PaymentInitiationPayload {
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  delivery_area: string;
  items: OrderItem[];
  total: number;
  note?: string;
  due?: number;
  delivery_charge: number;
  additional_discount_type: "fixed";
  additional_discount_amount: string;
  transactionId: string;
  paymentMethod: "bkash" | "nagad" | "card";
  businessOrderId: string; // Business-readable order ID
  backendOrderId?: string; // Optional: MongoDB _id from backend
}

/**
 * Splits a long string into chunks for SSLCommerz's value_a, value_b, etc.
 */
function splitDataForSSLCommerz(data: string) {
  const maxLength = 255;
  const chunks: string[] = [];
  for (let i = 0; i < data.length; i += maxLength) {
    chunks.push(data.substring(i, i + maxLength));
  }
  // SSLCommerz expects exactly 4 fields
  while (chunks.length < 4) {
    chunks.push("");
  }
  return {
    value_a: chunks[0],
    value_b: chunks[1],
    value_c: chunks[2],
    value_d: chunks[3],
  };
}

/**
 * Validates environment variables
 */
function validateEnv() {
  const required = {
    storeId: process.env.SSLCOMMERZ_STORE_ID,
    storePass: process.env.SSLCOMMERZ_STORE_PASSWORD,
    apiURL: process.env.SSLCOMMERZ_API_URL,
    siteURL: process.env.NEXT_PUBLIC_SITE_URL,
  };

  const missing = Object.keys(required).filter(
    (key) => !required[key as keyof typeof required]
  );
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  return {
    storeId: required.storeId!,
    storePass: required.storePass!,
    apiURL: required.apiURL!,
    siteURL: required.siteURL!,
  };
}

export async function POST(req: Request) {
  try {
    const env = validateEnv();
    const payload: PaymentInitiationPayload = await req.json();

    // Validate required fields
    const requiredFields: (keyof PaymentInitiationPayload)[] = [
      "total_amount",
      "customer_name",
      "customer_phone",
      "customer_address",
      "delivery_area",
      "items",
      "total",
      "delivery_charge",
      "transactionId",
      "businessOrderId",
      "backendOrderId",
      "paymentMethod",
    ];
    const missingFields = requiredFields.filter((field) => {
      const value = payload[field];
      return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      );
    });
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Prepare order data
    const orderData = {
      customer: {
        name: payload.customer_name,
        phone: payload.customer_phone,
        email: payload.customer_email || "customer@example.com",
        address: payload.customer_address,
      },
      items: payload.items,
      total: payload.total,
      due: payload.due ?? payload.total,
      delivery_area: payload.delivery_area,
      note: payload.note || "",
      delivery_charge: payload.delivery_charge,
      additional_discount_type: payload.additional_discount_type,
      additional_discount_amount: payload.additional_discount_amount,
      transactionId: payload.transactionId,
      businessOrderId: payload.businessOrderId,
      backendOrderId: payload.backendOrderId,
    };
    const orderDataBase64 = Buffer.from(JSON.stringify(orderData)).toString(
      "base64"
    );
    const valueFields = splitDataForSSLCommerz(orderDataBase64);

    // Prepare SSLCommerz request parameters
    const params = {
      store_id: env.storeId,
      store_passwd: env.storePass,
      total_amount: payload.total_amount.toFixed(2),
      currency: "BDT",
      tran_id: payload.transactionId,
      success_url: `${env.siteURL}/api/payment/success`,
      fail_url: `${env.siteURL}/api/payment/fail`,
      cancel_url: `${env.siteURL}/api/payment/cancel`,
      ipn_url: `${env.siteURL}/api/payment/ipn`,
      cus_name: payload.customer_name,
      cus_phone: payload.customer_phone,
      cus_email: payload.customer_email || "customer@example.com",
      cus_add1: payload.customer_address,
      cus_city: payload.delivery_area,
      cus_country: "Bangladesh",
      ship_name: payload.customer_name,
      ship_add1: payload.customer_address,
      ship_city: payload.delivery_area,
      ship_country: "Bangladesh",
      ship_postcode: "1000",
      product_name: "Order Payment",
      product_category: "General",
      product_profile: "physical-goods",
      multi_card_name:
        payload.paymentMethod === "card"
          ? "mastercard,visacard,amexcard"
          : payload.paymentMethod,
      shipping_method: "Courier",
      emi_option: "0",
      ...valueFields,
    };

    // Send request to SSLCommerz
    const response = await fetch(env.apiURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: querystring.stringify(params),
    });
    const result = await response.json();

    if (result.status !== "SUCCESS") {
      return NextResponse.json(
        {
          error:
            result.failedreason ||
            "Payment initiation failed. Please try again.",
        },
        { status: 400 }
      );
    }

    // Gateway selection logic
    const supportedGateways: Record<string, string[]> = {
      bkash: ["bkash"],
      nagad: ["nagad"],
      card: ["mastercard", "visacard", "amexcard"],
    };
    const gatewayNames = supportedGateways[payload.paymentMethod] || [];
    let redirectUrl = null;
    if (payload.paymentMethod === "card") {
      redirectUrl = result.directPaymentURL;
    } else if (Array.isArray(result.desc) && gatewayNames.length > 0) {
      const paymentMethodOption = result.desc.find((method: any) =>
        gatewayNames.includes((method.gw || "").toLowerCase())
      );
      if (paymentMethodOption && paymentMethodOption.redirectGatewayURL) {
        redirectUrl = paymentMethodOption.redirectGatewayURL;
      }
    }

    if (!redirectUrl) {
      return NextResponse.json(
        {
          error: `${
            payload.paymentMethod.charAt(0).toUpperCase() +
            payload.paymentMethod.slice(1)
          } payment is currently unavailable. Please try another method or later.`,
        },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      redirectUrl,
      sessionKey: result.sessionkey,
      transactionId: payload.transactionId,
      businessOrderId: payload.businessOrderId,
      backendOrderId: payload.backendOrderId,
    });
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }
    if (error.message?.includes("Missing environment variables")) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
