// app/api/payment/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * SSLCommerz cancel callback payload
 */
interface SSLCommerzCancelPayload {
  tran_id: string;
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;
  [key: string]: string | undefined;
}

/**
 * Customer info
 */
interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  address: string;
}

/**
 * Order item
 */
interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

/**
 * Full order payload (passed via base64 from initiate)
 */
interface OrderPayload {
  customer: CustomerData;
  items: OrderItem[];
  total: number;
  due?: number;
  delivery_area?: string;
  note?: string;
  delivery_charge?: number;
  additional_discount_type?: "fixed";
  additional_discount_amount?: string;
  transactionId: string;
  paymentMethod: "cashOnDelivery" | "bkash" | "nagad" | "card";
  businessOrderId: string; // human-readable
  backendOrderId?: string; // MongoDB _id
}

/**
 * Validates required environment variables
 */
function validateEnv() {
  const required = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    ownerId: process.env.NEXT_PUBLIC_OWNER_ID,
    businessId: process.env.NEXT_PUBLIC_BUSINESS_ID,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  };

  const missing = Object.keys(required).filter(
    (key) => !required[key as keyof typeof required]
  );
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  return {
    apiBaseUrl: required.apiBaseUrl!,
    ownerId: required.ownerId!,
    businessId: required.businessId!,
    siteUrl: required.siteUrl!,
  };
}

export async function POST(req: NextRequest) {
  try {
    // Validate environment
    const env = validateEnv();

    // Parse form data from SSLCommerz
    const formData = await req.formData();
    const formEntries = Array.from(formData.entries()).map(([key, value]) => [
      key,
      value.toString(),
    ]);
    const payload: SSLCommerzCancelPayload = Object.fromEntries(
      formEntries
    ) as SSLCommerzCancelPayload;

    // Validate essential field
    if (!payload.tran_id) {
      console.error("Missing tran_id in cancel callback");
      return NextResponse.redirect(
        new URL(
          `/orderstatus?status=fail&error=${encodeURIComponent(
            "Invalid payment response"
          )}`,
          env.siteUrl
        ),
        303
      );
    }

    const errorMessage = "Payment was canceled by the user.";

    let orderData: OrderPayload | null = null;
    let paymentMethod = "";
    let transactionId = "";
    let businessOrderId = "";
    let backendOrderId = "";

    // Reconstruct original order data from value_a-d
    const base64Chunks = [
      payload.value_a,
      payload.value_b,
      payload.value_c,
      payload.value_d,
    ]
      .filter(Boolean)
      .join("");
    if (base64Chunks) {
      try {
        const decoded = Buffer.from(base64Chunks, "base64").toString("utf-8");
        const parsed: Partial<OrderPayload> = JSON.parse(decoded);

        // Validate critical structure
        if (
          parsed.customer &&
          parsed.items &&
          Array.isArray(parsed.items) &&
          typeof parsed.total === "number" &&
          parsed.transactionId &&
          parsed.businessOrderId
        ) {
          orderData = parsed as OrderPayload;
          paymentMethod = orderData.paymentMethod;
          transactionId = orderData.transactionId;
          businessOrderId = orderData.businessOrderId;
          backendOrderId = orderData.backendOrderId || "";
        }
      } catch (e) {
        console.warn(
          "Failed to decode or parse order data in cancel route:",
          e
        );
      }
    }

    // Ensure transaction ID matches (if order data exists)
    if (orderData && transactionId !== payload.tran_id) {
      console.warn("Transaction ID mismatch in cancel route:", {
        expected: transactionId,
        received: payload.tran_id,
      });
    }

    // Build redirect URL
    const redirectUrl = new URL("/orderstatus", env.siteUrl);
    redirectUrl.searchParams.set("status", "fail");
    redirectUrl.searchParams.set("error", encodeURIComponent(errorMessage));
    redirectUrl.searchParams.set("tranId", encodeURIComponent(payload.tran_id));

    if (orderData) {
      redirectUrl.searchParams.set("orderId", businessOrderId);
      redirectUrl.searchParams.set("_id", backendOrderId);
      redirectUrl.searchParams.set(
        "customerName",
        encodeURIComponent(orderData.customer.name)
      );
      redirectUrl.searchParams.set(
        "customerPhone",
        encodeURIComponent(orderData.customer.phone)
      );
      redirectUrl.searchParams.set(
        "customerAddress",
        encodeURIComponent(orderData.customer.address || "")
      );
      redirectUrl.searchParams.set("total", orderData.total.toString());
      redirectUrl.searchParams.set(
        "deliveryCharge",
        (orderData.delivery_charge || 0).toString()
      );
      redirectUrl.searchParams.set(
        "itemCount",
        orderData.items.length.toString()
      );
      redirectUrl.searchParams.set(
        "additionalDiscount",
        orderData.additional_discount_amount || "0"
      );

      // Add product details
      orderData.items.forEach((item, index) => {
        redirectUrl.searchParams.set(
          `itemName${index}`,
          encodeURIComponent(item.name)
        );
        redirectUrl.searchParams.set(
          `itemPrice${index}`,
          item.price.toString()
        );
        redirectUrl.searchParams.set(
          `itemQty${index}`,
          item.quantity.toString()
        );
      });
    }

    // Return JSON for API clients
    if (req.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          transactionId: payload.tran_id,
          orderId: businessOrderId,
          backendOrderId,
          redirectUrl: redirectUrl.toString(),
        },
        { status: 200 }
      );
    }

    // Redirect browser
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error("Critical error in payment cancel handler:", error);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const errorUrl = new URL("/orderstatus", siteUrl);
    errorUrl.searchParams.set("status", "fail");
    errorUrl.searchParams.set(
      "error",
      encodeURIComponent(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during payment cancellation."
      )
    );

    return NextResponse.redirect(errorUrl, 303);
  }
}
