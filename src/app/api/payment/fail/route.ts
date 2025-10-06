// app/api/payment/fail/route.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * SSLCommerz fail callback payload
 */
interface SSLCommerzFailPayload {
  tran_id: string;
  status: string;
  error?: string;
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
  businessOrderId: string;
  backendOrderId?: string;
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

    // Parse form data
    const formData = await req.formData();
    const formEntries = Array.from(formData.entries()).map(([key, value]) => [
      key,
      value.toString(),
    ]);
    const payload: SSLCommerzFailPayload = Object.fromEntries(
      formEntries
    ) as SSLCommerzFailPayload;

    // Validate essential fields
    if (!payload.tran_id) {
      console.error("Missing tran_id in fail callback");
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

    const errorMessage = payload.error || "Payment failed. Please try again.";

    let orderData: OrderPayload | null = null;
    let businessOrderId = "";
    let backendOrderId = "";

    // Reconstruct order data from value_a-d
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

        if (
          parsed.customer &&
          parsed.items &&
          Array.isArray(parsed.items) &&
          typeof parsed.total === "number" &&
          parsed.transactionId === payload.tran_id
        ) {
          orderData = parsed as OrderPayload;
          businessOrderId = orderData.businessOrderId;
          backendOrderId = orderData.backendOrderId || "";
        }
      } catch (e) {
        console.warn("Failed to decode or parse order data in fail route:", e);
      }
    }

    // Build redirect URL
    const errorUrl = new URL("/orderstatus", env.siteUrl);
    errorUrl.searchParams.set("status", "fail");
    errorUrl.searchParams.set("error", encodeURIComponent(errorMessage));
    errorUrl.searchParams.set("tranId", encodeURIComponent(payload.tran_id));

    if (orderData) {
      errorUrl.searchParams.set("orderId", businessOrderId);
      errorUrl.searchParams.set("_id", backendOrderId);
      errorUrl.searchParams.set(
        "customerName",
        encodeURIComponent(orderData.customer.name)
      );
      errorUrl.searchParams.set(
        "customerPhone",
        encodeURIComponent(orderData.customer.phone)
      );
      errorUrl.searchParams.set(
        "customerAddress",
        encodeURIComponent(orderData.customer.address || "")
      );
      errorUrl.searchParams.set("total", orderData.total.toString());
      errorUrl.searchParams.set(
        "deliveryCharge",
        (orderData.delivery_charge || 0).toString()
      );
      errorUrl.searchParams.set("itemCount", orderData.items.length.toString());
      errorUrl.searchParams.set(
        "additionalDiscount",
        orderData.additional_discount_amount || "0"
      );

      orderData.items.forEach((item, i) => {
        errorUrl.searchParams.set(
          `itemName${i}`,
          encodeURIComponent(item.name)
        );
        errorUrl.searchParams.set(`itemPrice${i}`, item.price.toString());
        errorUrl.searchParams.set(`itemQty${i}`, item.quantity.toString());
      });
    }

    // JSON response for API clients
    if (req.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          transactionId: payload.tran_id,
          orderId: businessOrderId,
          backendOrderId,
          redirectUrl: errorUrl.toString(),
        },
        { status: 200 }
      );
    }

    return NextResponse.redirect(errorUrl, 303);
  } catch (error) {
    console.error("Critical error in payment fail handler:", error);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const errorUrl = new URL("/orderstatus", siteUrl);
    errorUrl.searchParams.set("status", "fail");
    errorUrl.searchParams.set(
      "error",
      encodeURIComponent(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during payment failure processing."
      )
    );

    return NextResponse.redirect(errorUrl, 303);
  }
}
