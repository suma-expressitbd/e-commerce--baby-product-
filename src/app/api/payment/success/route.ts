// src/app/api/payment/success/route.ts
import { TCartItem } from "@/lib/features/cart/cartSlice";
import { trackPurchase } from "@/utils/gtm";
import { NextRequest, NextResponse } from "next/server";

/**
 * SSLCommerz success callback payload
 */
interface SSLCommerzSuccessPayload {
  tran_id: string; // transaction ID
  val_id: string; // validation ID
  amount: string;
  currency: string;
  status: "VALID" | "INVALID";
  tran_date: string;
  bank_tran_id: string;
  card_type: string;
  card_issuer?: string;
  cus_name?: string;
  cus_phone?: string;
  cus_email?: string;
  cus_add1?: string;
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
 * Full order payload (passed via base64 from initiate)
 */
interface OrderPayload {
  customer: CustomerData;
  items: TCartItem[];
  total: number;
  due?: number;
  delivery_area?: string;
  note?: string;
  delivery_charge?: number;
  paymentMethod: string;
  additional_discount_type?: "fixed";
  additional_discount_amount?: string;
  transactionId: string;
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
    const payload: SSLCommerzSuccessPayload = Object.fromEntries(
      formEntries
    ) as SSLCommerzSuccessPayload;

    // Validate essential fields
    const requiredFields: (keyof SSLCommerzSuccessPayload)[] = [
      "tran_id",
      "val_id",
      "amount",
      "status",
    ];
    const missingFields = requiredFields.filter((field) => !payload[field]);

    if (missingFields.length > 0) {
      console.error(
        "Missing required fields in SSLCommerz callback:",
        missingFields
      );
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

    if (payload.status !== "VALID") {
      console.warn("Payment not valid:", payload.status, payload.tran_id);
      return NextResponse.redirect(
        new URL(
          `/orderstatus?status=fail&error=${encodeURIComponent(
            "Payment validation failed"
          )}`,
          env.siteUrl
        ),
        303
      );
    }

    let orderData: OrderPayload | null = null;
    let transactionId = "";
    let businessOrderId = "";
    let backendOrderId = "";
    let additionalDiscountAmount = "0";

    // Reconstruct original order data from value_a-d
    const base64Chunks = [
      payload.value_a,
      payload.value_b,
      payload.value_c,
      payload.value_d,
    ]
      .filter(Boolean)
      .join("");
    if (!base64Chunks) {
      console.error("No order data found in value_a-d");
      return NextResponse.redirect(
        new URL(
          `/orderstatus?status=fail&error=${encodeURIComponent(
            "Order data missing"
          )}`,
          env.siteUrl
        ),
        303
      );
    }

    try {
      const decoded = Buffer.from(base64Chunks, "base64").toString("utf-8");
      const parsed: Partial<OrderPayload> = JSON.parse(decoded);

      // Validate critical structure
      if (
        !parsed.customer ||
        !parsed.items ||
        !Array.isArray(parsed.items) ||
        typeof parsed.total !== "number" ||
        !parsed.transactionId ||
        !parsed.businessOrderId ||
        !parsed.backendOrderId
      ) {
        console.error("Invalid or incomplete order data:", parsed);
        return NextResponse.redirect(
          new URL(
            `/orderstatus?status=fail&error=${encodeURIComponent(
              "Incomplete order data"
            )}`,
            env.siteUrl
          ),
          303
        );
      }

      orderData = parsed as OrderPayload;
      transactionId = orderData.transactionId;
      businessOrderId = orderData.businessOrderId;
      backendOrderId = orderData.backendOrderId || "";
      additionalDiscountAmount = orderData.additional_discount_amount || "0";
    } catch (e) {
      console.error("Failed to decode or parse order data:", e);
      return NextResponse.redirect(
        new URL(
          `/orderstatus?status=fail&error=${encodeURIComponent(
            "Corrupted payment data"
          )}`,
          env.siteUrl
        ),
        303
      );
    }

    // Ensure transaction ID matches
    if (transactionId !== payload.tran_id) {
      console.warn("Transaction ID mismatch:", {
        expected: transactionId,
        received: payload.tran_id,
      });
      return NextResponse.redirect(
        new URL(
          `/orderstatus?status=fail&error=${encodeURIComponent(
            "Transaction ID mismatch"
          )}`,
          env.siteUrl
        ),
        303
      );
    }

    const paymentDetails = {
      amount: payload.amount,
      currency: payload.currency,
      card_type: payload.card_type || "mobile",
      bank_transaction_id: payload.bank_tran_id,
      transaction_date: payload.tran_date,
      card_issuer: payload.card_issuer || "bkash",
      sslcommerz_val_id: payload.val_id,
    };

    // ✅ Update existing order using backendOrderId (_id) and transactionId
    if (!backendOrderId) {
      console.error("Missing backendOrderId (_id) for payment update");
      return NextResponse.redirect(
        new URL(
          `/orderstatus?status=fail&error=${encodeURIComponent(
            "Order not found"
          )}`,
          env.siteUrl
        ),
        303
      );
    }

    const updateUrl = `${env.apiBaseUrl}/public/${env.ownerId}/${env.businessId}/${backendOrderId}/${transactionId}/online-order-payment-update`;

    const updateResponse = await fetch(updateUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment_status: "completed",
        payment_details: paymentDetails,
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse
        .text()
        .catch(() => "Unknown error");
      console.error("Order update failed:", errorText);
      return NextResponse.redirect(
        new URL(
          `/orderstatus?status=fail&error=${encodeURIComponent(
            "Failed to confirm payment"
          )}`,
          env.siteUrl
        ),
        303
      );
    }

    trackPurchase(
      backendOrderId,
      orderData.items,
      orderData.total,
      orderData.delivery_charge,
      orderData.customer.name,
      orderData.customer.phone,
      orderData.customer.address,
      orderData.delivery_area,
      orderData.paymentMethod,
      orderData.note
    );

    console.log(
      "Payment successfully completed and order updated:",
      businessOrderId
    );

    // ✅ Build success redirect URL with all data
    const successUrl = new URL("/orderstatus", env.siteUrl);
    successUrl.searchParams.set("status", "success");
    successUrl.searchParams.set("orderId", businessOrderId);
    successUrl.searchParams.set("_id", backendOrderId);
    successUrl.searchParams.set(
      "customerName",
      encodeURIComponent(orderData.customer.name)
    );
    successUrl.searchParams.set(
      "customerPhone",
      encodeURIComponent(orderData.customer.phone)
    );
    successUrl.searchParams.set(
      "customerAddress",
      encodeURIComponent(orderData.customer.address || "")
    );
    successUrl.searchParams.set("total", orderData.total.toString());
    successUrl.searchParams.set(
      "deliveryCharge",
      (orderData.delivery_charge || 0).toString()
    );
    successUrl.searchParams.set("itemCount", orderData.items.length.toString());
    successUrl.searchParams.set("tranId", encodeURIComponent(transactionId));
    successUrl.searchParams.set("amount", payload.amount);
    // successUrl.searchParams.set("paymentMethod", payload.card_type);
    successUrl.searchParams.set(
      "cardIssuer",
      encodeURIComponent(payload.card_issuer as string)
    );
    successUrl.searchParams.set("additionalDiscount", additionalDiscountAmount);

    console.log(payload);
    // Add product details
    orderData.items.forEach((item, index) => {
      successUrl.searchParams.set(
        `itemName${index}`,
        encodeURIComponent(item.name)
      );
      successUrl.searchParams.set(`itemPrice${index}`, item.price.toString());
      successUrl.searchParams.set(`itemQty${index}`, item.quantity.toString());
    });

    return NextResponse.redirect(successUrl, 303);
  } catch (error) {
    console.error("Critical error in payment success handler:", error);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const errorUrl = new URL("/orderstatus", siteUrl);
    errorUrl.searchParams.set("status", "fail");
    errorUrl.searchParams.set(
      "error",
      encodeURIComponent(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during payment processing."
      )
    );

    return NextResponse.redirect(errorUrl, 303);
  }
}
