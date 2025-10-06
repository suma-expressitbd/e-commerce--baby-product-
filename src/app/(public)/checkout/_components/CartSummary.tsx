"use client";

import React from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import { CartItem } from "@/components/ui/molecules/cartItem";
import type { TCartItem } from "@/lib/features/cart/cartSlice";
import { Button } from "@/components/ui/atoms/button";

export interface CartSummaryProps {
    items: TCartItem[];
    subtotal: number;
    deliveryCharge: number;
    currency: string;
    removeItem: (id: string, variantId?: string) => void;
    updateItemQuantity: (
        id: string,
        variantId: string | undefined,
        qty: number,
    ) => void;
    isLoading: boolean;
    handleSubmit: () => void;
    additional_discount_amount?: number;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
    items,
    subtotal,
    deliveryCharge,
    currency,
    removeItem,
    updateItemQuantity,
    isLoading,
    handleSubmit,
    additional_discount_amount = 0,
}) => {
    const total = subtotal + deliveryCharge - additional_discount_amount;

    return (
        <div className="w-full lg:w-6/5 lg:px-0 mb-40 lg:mb-0">
            {/* Enhanced Header with gradient background */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-2 mb-6 border border-indigo-100 dark:border-indigo-800 md:block hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🛍️</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            আপনার কার্ট
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                            {items.length} আইটেম
                        </span>
                    </div>
                </div>
            </div>

            {/* Items Container with enhanced styling */}
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div
                        key={`${item._id}-${item.variantId ?? "default"}`}

                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <CartItem
                                item={item}
                                onRemove={() => removeItem(item._id, item.variantId)}
                                onQuantityChange={(q) =>
                                    updateItemQuantity(item._id, item.variantId, q)
                                }
                                showQuantityControls
                            />
                        </div>
                    </div>
                ))}
            </div>


            <style jsx>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .group:hover .gradient-border {
                    background: linear-gradient(45deg, #4f46e5, #7c3aed, #ec4899);
                }
            `}</style>
        </div>
    );
};