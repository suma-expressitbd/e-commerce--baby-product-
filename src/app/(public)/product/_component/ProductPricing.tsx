"use client";
import { HiSparkles, HiLightningBolt } from "react-icons/hi";
import { CountdownTimer } from "./CountdownTimer";
import { LiveViews } from "./Liveviews";
import { FiThumbsUp } from "react-icons/fi";

interface ProductPricingProps {
    sellingPrice: number;
    offerPrice: number;
    stock: number;
    discountPercent: number;
    discountStartDate?: string;
    discountEndDate?: string;
}

export default function ProductPricing({
    sellingPrice,
    offerPrice,
    stock,
    discountPercent,
    discountStartDate,
    discountEndDate,
}: ProductPricingProps) {
    const now = new Date().getTime();
    const start = discountStartDate ? new Date(discountStartDate).getTime() : 0;
    const end = discountEndDate ? new Date(discountEndDate).getTime() : Infinity;

    const isOfferActive = offerPrice < sellingPrice && now >= start && now <= end;
    const displayPrice = isOfferActive ? offerPrice : sellingPrice;

    return (
        <div className="space-y-3 md:space-y-4 mt-2 sm:mb-2">
            <div className="flex flex-row items-center gap-1 md:gap-2 flex-wrap">
                <div className="bg-primary dark:bg-black py-1 rounded-full items-center md:gap-4 text-xs text-gray-600 hidden md:block font-semibold">
                    <LiveViews initialCount={10} />
                </div>

                {/* Badges */}
                {stock > 0 && stock <= 10 && (
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full flex items-center animate-pulse">
                        <HiLightningBolt />
                        Almost Gone!
                    </span>
                )}
                <span className="bg-primary dark:bg-primary text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full flex items-center">
                    <HiSparkles />
                    Premium Quality
                </span>
                <span className="flex items-center bg-white px-2 py-1.5 rounded-full text-primary dark:text-primary text-xs">
                    <FiThumbsUp className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    89% recommend
                </span>
            </div>

            {/* Pricing Section */}
            <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="flex items-center gap-2 md:gap-4">
                    <span className="text-2xl md:text-4xl font-bold text-primary dark:text-white">
                        ৳{displayPrice.toFixed(2)}
                    </span>
                    {isOfferActive && (
                        <span className="line-through text-gray-400 text-base md:text-xl">
                            ৳{sellingPrice.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>

            {isOfferActive && (
                <div className="mt-1 md:mt-2 flex items-center gap-1 md:gap-2">
                    <span className="bg-primary dark:bg-primary text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full">
                        {discountPercent}% OFF
                    </span>
                    <span className="text-xs md:text-sm text-black dark:text-gray-200">
                        Save ৳{(sellingPrice - offerPrice).toFixed(2)}
                    </span>
                </div>
            )}

            {isOfferActive && discountEndDate && (
                <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-200">
                    <div className="text-xs md:text-sm text-primary dark:text-primary font-semibold">
                        <CountdownTimer endDate={discountEndDate} />
                    </div>
                </div>
            )}
        </div>
    );
}