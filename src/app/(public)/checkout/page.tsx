"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/atoms/button";
import { useBusiness } from "@/hooks/useBusiness";
import { useCart } from "@/hooks/useCart";
import { usePreorderCart } from "@/hooks/usePreorderCart";
import { useCreateOnlineOrderMutation } from "@/lib/api/publicApi";
import { useCreatePaymentRequestMutation } from "@/lib/api/paymentApi";
import type { TCartItem } from "@/lib/features/cart/cartSlice";
import { formatCurrency } from "@/utils/formatCurrency";
import { trackBeginCheckout, trackPurchase } from "@/utils/gtm";
import { v4 as uuidv4 } from "uuid";
import DeliveryInfoForm from "./_components/DeliveryInfoForm";
import { CartSummary } from "./_components/CartSummary";
import { BkashCashbackModal } from "@/components/bkashCashbackModal";
import PromotionBikashText from "./_components/PromotionBikashText";

interface OnlineOrderResponse {
  status: number;
  success: boolean;
  message: string;
  data?: {
    _id: string;
    orderId: string;
    message?: string;
  };
}

interface PaymentRequestPayload {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_area: string;
  customer_note?: string;
  products: Array<{ productId: string; quantity: number }>;
  additional_discount_type: "fixed";
  additional_discount_amount: string;
  due: string;
  total_amount: number;
  items: Array<TCartItem>;
  total: number;
  delivery_charge: number;
  paymentMethod: string;
  transactionId: string;
  businessOrderId: string;
  backendOrderId: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { businessData } = useBusiness();
  const { items, clearCart, subtotal, removeItem, updateItemQuantity } = useCart();
  const { item: preorderItem, clearCart: clearPreorderCart, updateItemQuantity: updatePreorderQuantity, itemCount, subtotal: preorderSubtotal } = usePreorderCart();
  const [createOnlineOrder] = useCreateOnlineOrderMutation();
  const [createPaymentRequest] = useCreatePaymentRequestMutation();
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    delivery_area: "" as "inside_dhaka" | "sub_dhaka" | "outside_dhaka" | "",
    note: "",
    paymentMethod: "cashOnDelivery" as "cashOnDelivery" | "bkash" | "nagad" | "card",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
    address: "",
    delivery_area: "",
    note: "",
  });

  // Business-driven constants
  const insideFee = businessData?.insideDhaka ?? 0;
  const outsideFee = businessData?.outsideDhaka ?? 0;
  const subDhakaFee = businessData?.subDhaka ?? 0;
  const defaultCourier = businessData?.defaultCourier ?? "";
  const currency = businessData?.currency?.[0] ?? "BDT";

  // Check if this is a preorder checkout
  const isPreorderCheckout = !!(preorderItem && itemCount > 0);

  // Determine which items to display and calculate totals
  const displayItems = isPreorderCheckout ? [preorderItem] : items;

  // Debug: Log preorder item price information
  if (isPreorderCheckout && preorderItem) {
    console.log("🔍 Checkout Preorder Item Debug:", {
      preorderItemId: preorderItem._id,
      preorderItemName: preorderItem.name,
      preorderItemPrice: preorderItem.price,
      preorderItemPriceType: typeof preorderItem.price,
      preorderItemPriceIsNaN: isNaN(preorderItem.price),
      preorderItemPriceIsZero: preorderItem.price === 0,
      preorderSubtotal,
      preorderSubtotalIsNaN: isNaN(preorderSubtotal),
      preorderSubtotalIsZero: preorderSubtotal === 0,
    });
  }

  // Map preorder item to include required CartItem properties for display
  const mappedDisplayItems = isPreorderCheckout && preorderItem
    ? [{
      ...preorderItem,
      sellingPrice: preorderItem.price, // Use price as sellingPrice for preorder
      isWithinOffer: false, // Preorder items don't have offers
      variantLabel: preorderItem.variantValues?.join(" / ") || "",
    }]
    : displayItems;
  const currentSubtotal = isPreorderCheckout ? preorderSubtotal : subtotal;

  // Derived values
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const discountAmount = useMemo(
    () => (formData.paymentMethod === "bkash" && currentSubtotal > 200 ? 200 : 0),
    [currentSubtotal, formData.paymentMethod]
  );
  const total = useMemo(
    () => currentSubtotal + deliveryCharge - discountAmount,
    [currentSubtotal, deliveryCharge, discountAmount]
  );

  // Redirect if both carts are empty and no pending order
  useEffect(() => {
    // Combined logic: redirect if no items exist in either cart
    const hasNoItems = !preorderItem && items.length === 0;
    const shouldRedirect = hasNoItems && !orderPlaced && !sessionStorage.getItem("pendingOrderData");

    if (shouldRedirect) {
      router.push("/");
    }
  }, [preorderItem, items.length, orderPlaced, router]);

  // Update delivery charge
  useEffect(() => {
    const fee =
      formData.delivery_area === "inside_dhaka"
        ? insideFee
        : formData.delivery_area === "sub_dhaka"
          ? subDhakaFee
          : formData.delivery_area === "outside_dhaka"
            ? outsideFee
            : 0;
    setDeliveryCharge(fee);
  }, [formData.delivery_area, insideFee, outsideFee, subDhakaFee]);

  // Track checkout start
  useEffect(() => {
    if (items.length) trackBeginCheckout(items, subtotal);
  }, [items, subtotal]);

  // Scroll to top on error
  useEffect(() => {
    if (Object.values(formErrors).some((e) => e !== "")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [formErrors]);

  // Validation
  const validateForm = (): boolean => {
    const errors = { ...formErrors };
    let valid = true;

    if (!formData.name || formData.name.trim().length < 3) {
      errors.name = "সর্বনিম্ন ৩ অক্ষরের নাম দিন";
      valid = false;
    }
    if (!formData.phone) {
      errors.phone = "আপনার ফোন নাম্বার দিন";
      valid = false;
    }
    else if (!/^01\d{9}$/.test(formData.phone)) {
      errors.phone = "সঠিক ফোন নাম্বার দিন (01xxxxxxxxx)";
      valid = false;
    }
    if (!formData.address) {
      errors.address = "আপনার ঠিকানা দিন";
      valid = false;
    } else if (formData.address.trim().length < 5) {
      errors.address = "ডেলিভারি ঠিকানা কমপক্ষে ৫ অক্ষরের হতে হবে";
      valid = false;
    }
    if (!formData.delivery_area) {
      errors.delivery_area = "ডেলিভারি এলাকা নির্বাচন করুন";
      valid = false;
    }
    if (formData.note && formData.note.length < 5) {
      errors.note = "নোট কমপক্ষে ৫ অক্ষরের হতে হবে";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  // Handlers
  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  > = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((p) => ({ ...p, [name]: "" }));
    }
  };

  const handlePaymentMethodChange = (method: "bkash" | "cashOnDelivery" | "nagad" | "card") => {
    setFormData((p) => ({ ...p, paymentMethod: method }));
  };

  // Preorder-specific handlers
  const handlePreorderRemoveItem = (id: string, variantId?: string) => {
    if (isPreorderCheckout) {
      clearPreorderCart();
      toast.success("প্রি-অর্ডার আইটেম মুছে ফেলা হয়েছে");
    }
  };

  const handlePreorderUpdateQuantity = (id: string, variantId: string | undefined, quantity: number) => {
    if (isPreorderCheckout && preorderItem) {
      // Use the preorder cart's updateQuantity action
      updatePreorderQuantity(quantity);
      toast.success(`প্রি-অর্ডার কোয়ান্টিটি ${quantity}-এ আপডেট হয়েছে`);
    }
  };

  // Determine which handlers to use based on checkout type
  const currentRemoveItem = isPreorderCheckout ? handlePreorderRemoveItem : removeItem;
  const currentUpdateItemQuantity = isPreorderCheckout ? handlePreorderUpdateQuantity : updateItemQuantity;

  const prepareOrderData = () => {
    // Handle preorder vs regular checkout differently
    if (isPreorderCheckout) {
      // Preorder checkout - use preorderItem
      if (!preorderItem) {
        throw new Error("No preorder item found");
      }

      const productItemsForApi = [{
        productId: preorderItem._id,
        quantity: preorderItem.quantity,
      }];

      const productItemsForAnalytics = [{
        id: preorderItem._id,
        name: preorderItem.name,
        price: preorderItem.price,
        quantity: preorderItem.quantity,
        variant: (preorderItem.variantValues ?? []).join(" / ") || "N/A",
        image: preorderItem.image || "",
      }];

      const dueAmount =
        defaultCourier === "office-delivery"
          ? (currentSubtotal - discountAmount).toString()
          : total.toString();

      const basePayload = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        delivery_area: formData.delivery_area,
        customer_note: formData.note || undefined,
        products: productItemsForApi,
        due: dueAmount,
        delivery_charge: deliveryCharge,
        additional_discount_type: "fixed" as const,
        additional_discount_amount: discountAmount.toString(),
      };

      // Debug logging for preorder (only in development)
      if (process.env.NODE_ENV === "development") {
        console.log("🛒 Checkout PrepareOrderData (PREORDER):", {
          preorderItem: preorderItem.name,
          productItemsForApi,
          currentSubtotal,
          dueAmount,
        });
      }

      return {
        productItemsForApi,
        productItemsForAnalytics,
        dueAmount,
        basePayload,
      };
    } else {
      // Regular checkout - use regular cart items
      const productItemsForApi = items.map((item: TCartItem) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      const productItemsForAnalytics = items.map((item: TCartItem) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: (item.variantValues ?? []).join(" / ") || "N/A",
        image: item.image || "",
      }));

      const dueAmount =
        defaultCourier === "office-delivery"
          ? (currentSubtotal - discountAmount).toString()
          : total.toString();

      const basePayload = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        delivery_area: formData.delivery_area,
        customer_note: formData.note || undefined,
        products: productItemsForApi,
        due: dueAmount,
        delivery_charge: deliveryCharge,
        additional_discount_type: "fixed" as const,
        additional_discount_amount: discountAmount.toString(),
      };

      // Debug logging for regular (only in development)
      if (process.env.NODE_ENV === "development") {
        console.log("🛒 Checkout PrepareOrderData (REGULAR):", {
          itemsCount: items.length,
          productItemsForApi,
          currentSubtotal,
          dueAmount,
        });
      }

      return {
        productItemsForApi,
        productItemsForAnalytics,
        dueAmount,
        basePayload,
      };
    }
  };

  const handleCashOnDelivery = async () => {
    const { basePayload, productItemsForAnalytics } = prepareOrderData();

    try {
      const response = (await createOnlineOrder({
        ...basePayload,
        payment_method: "cashOnDelivery",
      }).unwrap()) as OnlineOrderResponse;

      const { _id: backendOrderId, orderId: businessOrderId } = response.data || {};

      if (!backendOrderId || !businessOrderId) {
        throw new Error("Order creation failed: Missing order IDs");
      }

      // Use the correct items for tracking based on checkout type
      const trackingItems = isPreorderCheckout
        ? (preorderItem ? [preorderItem] : [])
        : items;

      trackPurchase(
        backendOrderId,
        trackingItems,
        total,
        deliveryCharge,
        formData.name,
        formData.phone,
        formData.delivery_area,
        formData.address,
        formData.paymentMethod,
        formData.note
      );

      setOrderPlaced(true);
      clearCart();
      if (isPreorderCheckout) {
        clearPreorderCart();
      }
      sessionStorage.removeItem("pendingOrderData");

      const successUrl = new URL("/orderstatus", window.location.origin);
      successUrl.searchParams.set("status", "success");
      successUrl.searchParams.set("orderId", businessOrderId);
      successUrl.searchParams.set("_id", backendOrderId);
      successUrl.searchParams.set("customerName", encodeURIComponent(formData.name));
      successUrl.searchParams.set("customerPhone", encodeURIComponent(formData.phone));
      successUrl.searchParams.set("customerAddress", encodeURIComponent(formData.address));
      successUrl.searchParams.set("total", total.toString());
      successUrl.searchParams.set("deliveryCharge", deliveryCharge.toString());
      successUrl.searchParams.set("itemCount", trackingItems.length.toString());
      successUrl.searchParams.set("paymentMethod", "cashOnDelivery");
      successUrl.searchParams.set("additionalDiscount", discountAmount.toString());

      trackingItems.forEach((item: any, index: number) => {
        successUrl.searchParams.set(`itemName${index}`, encodeURIComponent(item.name));
        successUrl.searchParams.set(`itemPrice${index}`, item.price.toString());
        successUrl.searchParams.set(`itemQty${index}`, item.quantity.toString());
      });

      router.push(successUrl.toString());
    } catch (err: any) {
      const errorMessage = err?.data?.error[0]?.message || err?.message || "অর্ডার তৈরি করতে সমস্যা হয়েছে";
      console.error("COD Order failed:", err);
      toast.error(errorMessage);

      const errorUrl = new URL("/orderstatus", window.location.origin);
      errorUrl.searchParams.set("status", "fail");
      errorUrl.searchParams.set("error", encodeURIComponent(String((err as any)?.data?.error[0]?.message || err)));
      router.push(errorUrl.toString());
    }
  };

  const handleBkashPayment = async () => {
    const { basePayload, productItemsForApi } = prepareOrderData();

    const transactionId = `trax-${uuidv4().replace(/-/g, "").substring(0, 12)}`;

    try {
      const orderResponse = (await createOnlineOrder({
        ...basePayload,
        payment_method: "bkash",
        transaction_id: transactionId,
      }).unwrap()) as OnlineOrderResponse;

      const { _id: backendOrderId, orderId: businessOrderId } = orderResponse.data || {};

      if (!backendOrderId || !businessOrderId) {
        throw new Error("Order creation failed: Invalid response");
      }

      const paymentItems = isPreorderCheckout ? [{
        productId: preorderItem._id,
        quantity: preorderItem.quantity,
        price: preorderItem.price,
        name: preorderItem.name,
      }] : items.map((item: TCartItem) => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      }));

      const paymentPayload: PaymentRequestPayload = {
        ...basePayload,
        total_amount: total,
        items: paymentItems,
        total: total,
        delivery_charge: deliveryCharge,
        paymentMethod: formData.paymentMethod,
        transactionId,
        businessOrderId,
        backendOrderId,
      };

      const paymentResult = await createPaymentRequest(paymentPayload).unwrap();

      if (paymentResult.redirectUrl) {
        const pendingOrderData = {
          backendOrderId,
          businessOrderId,
          transactionId,
          analyticsData: {
            items: isPreorderCheckout ? [{
              id: preorderItem._id,
              name: preorderItem.name,
              price: preorderItem.price,
              quantity: preorderItem.quantity,
            }] : productItemsForApi.map((item: TCartItem) => ({
              id: item._id,
              name: items.find((i: TCartItem) => i._id === item._id)?.name || "",
              price: items.find((i: TCartItem) => i._id === item._id)?.price || 0,
              quantity: item.quantity,
            })),
            total,
            deliveryCharge,
            customer: {
              name: formData.name,
              phone: formData.phone,
              area: formData.delivery_area,
              address: formData.address,
            },
            paymentMethod: "bkash",
            discountAmount,
          },
        };

        sessionStorage.setItem("pendingOrderData", JSON.stringify(pendingOrderData));
        window.location.href = paymentResult.redirectUrl;
      } else {
        throw new Error("Payment initiation failed: No redirect URL");
      }
    } catch (err: any) {
      const errorMessage = err?.data?.error[0]?.message || err?.message || "পেমেন্ট শুরু করতে সমস্যা হয়েছে";
      console.error("bKash payment error:", err);
      toast.error(errorMessage);
    }
  };
  const handleNagadPayment = async () => {
    const { basePayload, productItemsForApi } = prepareOrderData();

    const transactionId = `trax-${uuidv4().replace(/-/g, "").substring(0, 12)}`;

    try {
      const orderResponse = (await createOnlineOrder({
        ...basePayload,
        payment_method: "nagad",
        transaction_id: transactionId,
      }).unwrap()) as OnlineOrderResponse;

      const { _id: backendOrderId, orderId: businessOrderId } = orderResponse.data || {};

      if (!backendOrderId || !businessOrderId) {
        throw new Error("Order creation failed: Invalid response");
      }

      const paymentItems = isPreorderCheckout ? [{
        productId: preorderItem._id,
        quantity: preorderItem.quantity,
        price: preorderItem.price,
        name: preorderItem.name,
      }] : items.map((item: TCartItem) => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      }));

      const paymentPayload: PaymentRequestPayload = {
        ...basePayload,
        total_amount: total,
        items: paymentItems,
        total: total,
        delivery_charge: deliveryCharge,
        paymentMethod: formData.paymentMethod,
        transactionId,
        businessOrderId,
        backendOrderId,
      };

      const paymentResult = await createPaymentRequest(paymentPayload).unwrap();

      if (paymentResult.redirectUrl) {
        const pendingOrderData = {
          backendOrderId,
          businessOrderId,
          transactionId,
          analyticsData: {
            items: isPreorderCheckout ? [{
              id: preorderItem._id,
              name: preorderItem.name,
              price: preorderItem.price,
              quantity: preorderItem.quantity,
            }] : productItemsForApi.map((item: TCartItem) => ({
              id: item._id,
              name: items.find((i: TCartItem) => i._id === item._id)?.name || "",
              price: items.find((i: TCartItem) => i._id === item._id)?.price || 0,
              quantity: item.quantity,
            })),
            total,
            deliveryCharge,
            customer: {
              name: formData.name,
              phone: formData.phone,
              area: formData.delivery_area,
              address: formData.address,
            },
            paymentMethod: "nagad",
            discountAmount,
          },
        };

        sessionStorage.setItem("pendingOrderData", JSON.stringify(pendingOrderData));
        window.location.href = paymentResult.redirectUrl;
      } else {
        throw new Error("Payment initiation failed: No redirect URL");
      }
    } catch (err: any) {
      const errorMessage = err?.data?.error[0]?.message || err?.message || "পেমেন্ট শুরু করতে সমস্যা হয়েছে";
      console.error("nagad payment error:", err);
      toast.error(errorMessage);
    }
  };
  const handleCardPayment = async () => {
    const { basePayload, productItemsForApi } = prepareOrderData();

    const transactionId = `trax-${uuidv4().replace(/-/g, "").substring(0, 12)}`;

    try {
      const orderResponse = (await createOnlineOrder({
        ...basePayload,
        payment_method: "card",
        transaction_id: transactionId,
      }).unwrap()) as OnlineOrderResponse;

      const { _id: backendOrderId, orderId: businessOrderId } = orderResponse.data || {};

      if (!backendOrderId || !businessOrderId) {
        throw new Error("Order creation failed: Invalid response");
      }

      const paymentItems = isPreorderCheckout ? [{
        productId: preorderItem._id,
        quantity: preorderItem.quantity,
        price: preorderItem.price,
        name: preorderItem.name,
      }] : items.map((item: TCartItem) => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      }));

      const paymentPayload: PaymentRequestPayload = {
        ...basePayload,
        total_amount: total,
        items: paymentItems,
        total: total,
        delivery_charge: deliveryCharge,
        paymentMethod: formData.paymentMethod,
        transactionId,
        businessOrderId,
        backendOrderId,
      };

      const paymentResult = await createPaymentRequest(paymentPayload).unwrap();

      if (paymentResult.redirectUrl) {
        const pendingOrderData = {
          backendOrderId,
          businessOrderId,
          transactionId,
          analyticsData: {
            items: isPreorderCheckout ? [{
              id: preorderItem._id,
              name: preorderItem.name,
              price: preorderItem.price,
              quantity: preorderItem.quantity,
            }] : productItemsForApi.map((item: TCartItem) => ({
              id: item._id,
              name: items.find((i: TCartItem) => i._id === item._id)?.name || "",
              price: items.find((i: TCartItem) => i._id === item._id)?.price || 0,
              quantity: item.quantity,
            })),
            total,
            deliveryCharge,
            customer: {
              name: formData.name,
              phone: formData.phone,
              area: formData.delivery_area,
              address: formData.address,
            },
            paymentMethod: "card",
            discountAmount,
          },
        };

        sessionStorage.setItem("pendingOrderData", JSON.stringify(pendingOrderData));
        window.location.href = paymentResult.redirectUrl;
      } else {
        throw new Error("Payment initiation failed: No redirect URL");
      }
    } catch (err: any) {
      const errorMessage = err?.data?.error || err?.message || "পেমেন্ট শুরু করতে সমস্যা হয়েছে";
      console.error("card payment error:", err);
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateForm()) return;

    const { productItemsForAnalytics } = prepareOrderData();
    sessionStorage.setItem("lastOrderProducts", JSON.stringify(productItemsForAnalytics));
    sessionStorage.setItem("lastOrderAmount", total.toString());
    sessionStorage.setItem("lastDeliveryCharge", deliveryCharge.toString());
    sessionStorage.setItem("paymentMethod", formData.paymentMethod);
    sessionStorage.setItem("additionalDiscount", discountAmount.toString());

    if (formData.paymentMethod === "cashOnDelivery") {
      await handleCashOnDelivery();
    } else if (formData.paymentMethod === "bkash") {
      await handleBkashPayment();
    } else if (formData.paymentMethod === "nagad") {
      await handleNagadPayment();
    } else if (formData.paymentMethod === "card") {
      await handleCardPayment();
    }
  };

  const overlayActive = (createOnlineOrder as any).isLoading || (createPaymentRequest as any).isLoading;

  return (

    <div className="min-h-screen bg-rose-50 dark:bg-gray-800 relative">
      {/* Overlay */}
      {overlayActive && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="animate-spin h-14 w-14 border-4 border-white border-t-transparent rounded-full" />
        </div>
      )}

      {/* top padding to mimic screenshot */}

      <div className="md:mt-10">
        <PromotionBikashText />
      </div>
      <div className="container max-w-[1600px] mx-auto px-3 lg:px-6 pb-24 -mt-4 lg:pb-16 bg-rose-50 dark:bg-gray-800">
        <div className="md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mt-6 lg:mt-12">
          {/* LEFT: Shopping Items */}
          <section className="lg:col-span-6 flex flex-col order-2 lg:order-1">
            <div className="rounded-xl overflow-hidden shadow-sm border border-rose-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex-1">
              <div className="bg-primary px-4 py-3">
                <h2 className="text-[15px] font-semibold text-white">Shopping Items</h2>
              </div>
              <div className="p-4">
                <CartSummary
                  items={mappedDisplayItems}
                  subtotal={currentSubtotal}
                  deliveryCharge={deliveryCharge}
                  // total={total}
                  additional_discount_amount={discountAmount}
                  currency={currency}
                  removeItem={currentRemoveItem}
                  updateItemQuantity={currentUpdateItemQuantity}
                  isLoading={overlayActive}
                  handleSubmit={() => handleSubmit()}
                />
              </div>
            </div>
          </section>

          {/* RIGHT: Delivery Information + Totals + CTA */}
          <section className="lg:col-span-6 space-y-4 flex flex-col order-1 lg:order-2 md:mt-0 mt-8">
            <div className="rounded-xl overflow-hidden shadow-sm border bg-white dark:bg-gray-900 border-rose-100 dark:border-gray-800 flex-1">
              <div className="p-4 lg:p-5">
                <DeliveryInfoForm
                  formData={formData}
                  formErrors={formErrors}
                  insideFee={insideFee}
                  subDhakaFee={subDhakaFee}
                  outsideFee={outsideFee}
                  isLoading={overlayActive}
                  handleChange={handleChange}
                  handlePaymentMethodChange={handlePaymentMethodChange}
                  handleSubmit={handleSubmit}
                  onBack={() => router.back()}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-900 flex-1">
                  <div className="px-4 py-4 space-y-2">
                    <div className="hidden md:block">
                      <div className="inline-flex gap-2 items-center mb-3">
                        <p className="text-gray-500 ml-2 dark:text-white">
                          CART <span className="text-gray-700 dark:text-white font-medium">TOTALS</span>
                        </p>
                        <p className="w-8 sm:w-12 h-0.5 bg-gray-700"></p>
                      </div>
                      <div className="w-full">
                        <div className="flex flex-col gap-1 sm:gap-2 sm:mt-2 text-sm">
                          <div className="flex justify-between ml-2 text-black dark:text-white">
                            <p>সাব-টোটাল</p> <span>{formatCurrency(currentSubtotal, currency)}</span>
                          </div>
                          <hr />
                          <div className="flex justify-between ml-2 text-black dark:text-white">
                            <p>ডেলিভারি চার্জ</p> <span>{formatCurrency(deliveryCharge, currency)}</span>
                          </div>
                          <hr />
                          {discountAmount > 0 && (
                            <div className="flex justify-between ml-2 text-black dark:text-white">
                              <p>বিকাশ ডিসকাউন্ট</p> <span>[&minus;] {formatCurrency(discountAmount, currency)}</span>
                            </div>
                          )}
                          {discountAmount > 0 && <hr />}
                          <div className="flex justify-between ml-2 text-black dark:text-white">
                            <p><strong>টোটাল বিল</strong></p>
                            <p className="font-bold"><span>{formatCurrency(total, currency)}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4 hidden md:block">
                    <Button
                      title="order"
                      type="submit"
                      disabled={overlayActive}
                      variant="custom"
                    >
                      {overlayActive ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                          প্রসেস হচ্ছে...
                        </div>
                      ) : (
                        <div className="">
                          অর্ডারটি নিশ্চিত করুন
                        </div>
                      )}
                    </Button>
                  </div>

                </div>
              </form>
            </div>
          </section>
        </div>
      </div>

      {/* Mobile/Tablet bottom bar */}
      <form onSubmit={handleSubmit}>
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-gray-900 shadow-2xl border-t px-4 py-4 z-[60]">
          <div className="pb-3">
            <h2 className="text-lg font-semibold text-black dark:text-white">Cart Total</h2>
            <div className="w-full">
              <div className="flex flex-col gap-1 sm:gap-2 sm:mt-2 text-sm">
                <div className="flex justify-between text-black dark:text-white">
                  <p>সাব-টোটাল</p>
                  <p>{formatCurrency(currentSubtotal, currency)}</p>
                </div>
                <hr />
                <div className="flex justify-between text-black dark:text-white">
                  <p>ডেলিভারি চার্জ</p>
                  <p>{formatCurrency(deliveryCharge, currency)}</p>
                </div>
                <hr />
                {discountAmount > 0 && (
                  <div className="flex justify-between text-black dark:text-white">
                    <p>বিকাশ ডিসকাউন্ট</p>
                    <p>[&minus;] {formatCurrency(discountAmount, currency)}</p>
                  </div>
                )}
                {discountAmount > 0 && <hr />}
                <div className="flex justify-between text-black dark:text-white">
                  <p><strong>টোটাল বিল</strong></p>
                  <p className="font-bold">{formatCurrency(total, currency)}</p>
                </div>
              </div>
            </div>
          </div>
          <Button
            title="order"
            type="submit"
            disabled={overlayActive}
            variant="custom"
          >
            {overlayActive ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                প্রসেস হচ্ছে...
              </div>
            ) : (
              <>
                <span className="mr-2">🛒</span> অর্ডারটি নিশ্চিত করুন
              </>
            )}
          </Button>
        </div>
      </form>

      <BkashCashbackModal pageType="checkout" />
    </div>
  );
}