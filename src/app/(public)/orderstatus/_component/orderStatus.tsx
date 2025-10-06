"use client";
import { Button } from "@/components/ui/atoms/button";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { clearCart } from "@/lib/features/cart/cartSlice";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FiArrowRight,
    FiCheckCircle,
    FiClock,
    FiCreditCard,
    FiPackage,
    FiShoppingBag,
    FiTruck,
    FiUser,
    FiXCircle,
} from "react-icons/fi";

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
}

export function OrderStatus() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status") || "fail";
    const orderId = searchParams.get("orderId");
    const tranId = searchParams.get("tranId");
    const error = searchParams.get("error");
    const hasOrderData = !!searchParams.get("customerName");
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [total, setTotal] = useState(0);
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [additionalDiscount, setAdditionalDiscount] = useState(0); // 👈 New state

    const paymentMethod = searchParams.get("cardIssuer");
    const isCashOnDelivery = paymentMethod === "cashOnDelivery";
    const isSuccess = status === "success";
    const isFailure = status === "fail";
    const dispatch = useAppDispatch();

    useEffect(() => {
        setIsVisible(true);

        // Reconstruct order items
        const itemCount = parseInt(searchParams.get("itemCount") || "0", 10);
        const items: OrderItem[] = [];
        let totalAmount = 0;

        for (let i = 0; i < itemCount; i++) {
            const name = decodeURIComponent(
                searchParams.get(`itemName${i}`) || `Product ${i + 1}`
            );
            const price = parseFloat(searchParams.get(`itemPrice${i}`) || "0");
            const quantity = parseInt(searchParams.get(`itemQty${i}`) || "1", 10);
            const itemTotal = price * quantity;
            items.push({ name, price, quantity });
            totalAmount += itemTotal;
        }

        setOrderItems(items);
        const delivery = parseFloat(searchParams.get("deliveryCharge") || "0");
        const discount = parseFloat(searchParams.get("additionalDiscount") || "0");
        const finalTotal = totalAmount + delivery - discount;

        setSubtotal(totalAmount);
        setDeliveryCharge(delivery);
        setAdditionalDiscount(discount);
        setTotal(finalTotal);

        // Animate progress bar
        if (isSuccess) {
            dispatch(clearCart());
            sessionStorage.removeItem("pendingOrderData");
            const timer = setInterval(() => {
                setCurrentStep((prev) => (prev < 3 ? prev + 1 : prev));
            }, 2000);
            return () => clearInterval(timer);
        }
    }, [searchParams, isSuccess]);

    const orderSteps = [
        { icon: FiCheckCircle, label: "Order Confirmed", active: true },
        { icon: FiPackage, label: "Preparing", active: currentStep >= 1 },
        { icon: FiTruck, label: "Shipping", active: currentStep >= 2 },
        { icon: FiClock, label: "Delivered", active: currentStep >= 3 },
    ];

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 2);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
                <div
                    className={`w-full md:max-w-6xl mx-auto transition-all duration-1000 ease-out transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        }`}
                >
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden mb-8">
                        {/* Status Header */}
                        <div
                            className={`relative px-6 sm:px-8 lg:px-12 py-8 sm:py-12 text-center ${isSuccess
                                ? "bg-green-50 dark:bg-emerald-900/20"
                                : "bg-red-50 dark:bg-rose-900/20"
                                }`}
                        >
                            <div
                                className={`inline-flex p-4 sm:p-6 rounded-full mb-6 sm:mb-8 ${isSuccess
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                    }`}
                            >
                                {isSuccess ? (
                                    <FiCheckCircle className="w-8 h-8 sm:w-12 sm:h-12" />
                                ) : (
                                    <FiXCircle className="w-8 h-8 sm:w-12 sm:h-12" />
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-slate-800 dark:text-white">
                                {isSuccess ? "Order Successful!" : "Order Failed"}
                            </h1>
                            <div className="text-slate-600 dark:text-white text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                                {isSuccess ? (
                                    <>
                                        <p className="font-medium text-xl dark:text-white">
                                            Thank you for your order!
                                        </p>
                                        {orderId && (
                                            <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-4 mt-4">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    Order ID
                                                </p>
                                                <p className="font-mono text-lg font-semibold text-slate-800 dark:text-white">
                                                    {orderId}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium dark:text-white">
                                            Sorry, your payment could not be processed.
                                        </p>
                                        {error && (
                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mt-3">
                                                <p className="text-red-600 dark:text-red-400 text-sm">
                                                    {decodeURIComponent(error)}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar (Success Only) */}
                        {isSuccess && (
                            <div className="px-6 sm:px-8 lg:px-12 py-8 border-t border-slate-200 dark:border-slate-700">
                                <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white text-center">
                                    Order Progress
                                </h2>
                                <div className="flex justify-between items-center relative">
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2"></div>
                                    <div
                                        className="absolute top-1/2 left-0 h-0.5 bg-green-500 -translate-y-1/2 transition-all duration-1000 ease-out"
                                        style={{ width: `${(currentStep / 3) * 100}%` }}
                                    ></div>
                                    {orderSteps.map((step, index) => {
                                        const Icon = step.icon;
                                        return (
                                            <div
                                                key={index}
                                                className="flex flex-col items-center relative z-10"
                                            >
                                                <div
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${step.active
                                                        ? "bg-green-500 text-white"
                                                        : "bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700"
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </div>
                                                <span
                                                    className={`mt-2 text-xs font-medium ${step.active
                                                        ? "text-slate-800 dark:text-white"
                                                        : "text-slate-400"
                                                        }`}
                                                >
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-8 text-center">
                                    <p className="text-slate-600 dark:text-white">
                                        Estimated delivery:{" "}
                                        <span className="font-semibold text-slate-800 dark:text-white">
                                            {deliveryDate.toLocaleDateString("en-US", {
                                                weekday: "long",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Order Details */}
                        {hasOrderData && (
                            <div className="px-6 sm:px-8 lg:px-12 py-8 border-t border-slate-200 dark:border-slate-700">
                                <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white">
                                    Order Details
                                </h2>
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Customer Info */}
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                                            <h3 className="flex items-center text-lg font-semibold mb-4 text-slate-800 dark:text-white">
                                                <FiUser className="mr-2" /> Customer Information
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex">
                                                    <span className="w-32 text-slate-500 dark:text-slate-400">
                                                        Name:
                                                    </span>
                                                    <span className="font-medium dark:text-white">
                                                        {decodeURIComponent(
                                                            searchParams.get("customerName") || "N/A"
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex">
                                                    <span className="w-32 text-slate-500 dark:text-slate-400">
                                                        Phone:
                                                    </span>
                                                    <span className="font-medium dark:text-white">
                                                        {decodeURIComponent(
                                                            searchParams.get("customerPhone") || "N/A"
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex">
                                                    <span className="w-32 text-slate-500 dark:text-slate-400">
                                                        Address:
                                                    </span>
                                                    <span className="font-medium dark:text-white">
                                                        {decodeURIComponent(
                                                            searchParams.get("customerAddress") || "N/A"
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                                            <h3 className="flex items-center text-lg font-semibold mb-4 text-slate-800 dark:text-white">
                                                <FiCreditCard className="mr-2" /> Payment Information
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex">
                                                    <span className="w-32 text-slate-500 dark:text-slate-400">
                                                        Amount:
                                                    </span>
                                                    <span className="font-medium dark:text-white">
                                                        ৳{total.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex">
                                                    <span className="w-32 text-slate-500 dark:text-slate-400">
                                                        Delivery:
                                                    </span>
                                                    <span className="font-medium dark:text-white">
                                                        ৳{deliveryCharge.toFixed(2)}
                                                    </span>
                                                </div>
                                                {
                                                    searchParams.get("cardIssuer")
                                                    && <div className="flex">
                                                        <span className="w-32 text-slate-500 dark:text-slate-400">
                                                            Method:
                                                        </span>
                                                        <span className="font-medium dark:text-white">
                                                            {/* {isCashOnDelivery ? "Cash on Delivery" : "bKash"} */}
                                                            {decodeURIComponent(
                                                                searchParams.get("cardIssuer") as string
                                                            )}
                                                        </span>
                                                    </div>}
                                                {!isCashOnDelivery && (
                                                    <div className="flex">
                                                        <span className="w-32 text-slate-500 dark:text-slate-400">
                                                            Transaction ID:
                                                        </span>
                                                        <span className="font-medium dark:text-white">
                                                            {tranId || "N/A"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                                        <h3 className="flex items-center text-lg font-semibold mb-4 text-slate-800 dark:text-white">
                                            <FiShoppingBag className="mr-2" /> Order Summary
                                        </h3>
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                                    <th className="py-3 text-left text-slate-500 dark:text-slate-400">
                                                        Product
                                                    </th>
                                                    <th className="py-3 text-center text-slate-500 dark:text-slate-400">
                                                        Qty
                                                    </th>
                                                    <th className="py-3 text-right text-slate-500 dark:text-slate-400">
                                                        Price
                                                    </th>
                                                    <th className="py-3 text-right text-slate-500 dark:text-slate-400">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderItems.map((item, i) => (
                                                    <tr
                                                        key={i}
                                                        className="border-b border-slate-100 dark:border-slate-700/50"
                                                    >
                                                        <td className="py-3 font-medium dark:text-white">{item.name}</td>
                                                        <td className="py-3 text-center dark:text-white">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="py-3 text-right dark:text-white">
                                                            ৳{item.price.toFixed(2)}
                                                        </td>
                                                        <td className="py-3 text-right dark:text-white">
                                                            ৳{(item.price * item.quantity).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="pt-4 text-right font-semibold dark:text-white"
                                                    >
                                                        Subtotal:
                                                    </td>
                                                    <td className="pt-4 text-right font-semibold dark:text-white">
                                                        ৳{subtotal.toFixed(2)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="pt-1 text-right text-slate-500 dark:text-slate-400"
                                                    >
                                                        Delivery:
                                                    </td>
                                                    <td className="pt-1 text-right text-slate-500 dark:text-white">
                                                        ৳{deliveryCharge.toFixed(2)}
                                                    </td>
                                                </tr>
                                                {additionalDiscount > 0 && (
                                                    <tr>
                                                        <td
                                                            colSpan={3}
                                                            className="pt-1 text-right text-green-600 dark:text-green-400 font-medium"
                                                        >
                                                            Discount:
                                                        </td>
                                                        <td className="pt-1 text-right text-green-600 dark:text-green-400 font-medium">
                                                            [&minus;] ৳{additionalDiscount.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="pt-1 text-right font-semibold text-lg dark:text-white"
                                                    >
                                                        Total:
                                                    </td>
                                                    <td className="pt-1 text-right font-semibold text-lg dark:text-white">
                                                        ৳{total.toFixed(2)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Buttons */}
                        <div className="px-6 sm:px-8 lg:px-12 py-8 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <Button title="continue" variant="custom">
                                    <Link
                                        href="/products"
                                        className="flex items-center justify-center gap-2 w-full"
                                    >
                                        Continue Shopping
                                        <FiArrowRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                                {isFailure && (
                                    <Button title="try-again" variant="outline" className="px-2">
                                        <Link
                                            href="/checkout"
                                            className="flex items-center justify-center gap-2 w-full text-nowrap"
                                        >
                                            Try Again
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
