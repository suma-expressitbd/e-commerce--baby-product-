"use client";
import React, { useEffect, useState, useRef } from "react";

interface FlashDealTimeCounterProps {
    endDate: string;
    variant?: "default" | "productDetails";
}

export const FlashDealTimeCounter = React.memo(({ endDate, variant = "default" }: FlashDealTimeCounterProps) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        completed: false
    });

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const end = new Date(endDate);
            const diff = end.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, completed: true });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, completed: false });

            timerRef.current = setTimeout(updateTimer, 1000);
        };

        updateTimer();

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [endDate]);

    if (timeLeft.completed) {
        return (
            <div className="relative overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 px-3 py-2 rounded-xl text-center shadow-lg">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                    <span className="relative text-sm font-semibold text-white">Deal Expired</span>
                </div>
            </div>
        );
    }

    // Product Details variant - Advanced Neon Design
    if (variant === "productDetails") {
        return (
            <div className="relative group">
                {/* Glowing Background Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

                <div className="relative bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 rounded-xl p-4 shadow-2xl border border-purple-500/30">
                    {/* Animated particles background */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-400 rounded-full animate-bounce opacity-60"></div>
                        <div className="absolute top-3 right-2 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-40"></div>
                        <div className="absolute bottom-2 left-6 w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-50" style={{ animationDelay: '0.5s' }}></div>
                    </div>

                    <div className="relative">
                        <div className="text-center mb-3">
                            <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 text-sm font-bold animate-pulse">
                                ⚡ FLASH SALE ENDS IN ⚡
                            </div>
                        </div>

                        <div className="flex justify-center items-center space-x-2">
                            {[
                                { value: timeLeft.days, label: 'DAYS', color: 'from-red-500 to-orange-500' },
                                { value: timeLeft.hours, label: 'HRS', color: 'from-yellow-500 to-red-500' },
                                { value: timeLeft.minutes, label: 'MIN', color: 'from-green-500 to-yellow-500' },
                                { value: timeLeft.seconds, label: 'SEC', color: 'from-blue-500 to-purple-500' }
                            ].map((item, index) => (
                                <div key={item.label} className="flex items-center">
                                    <div className="relative group/item">
                                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.color} rounded-lg blur opacity-60 group-hover/item:opacity-100 transition animate-pulse`}></div>
                                        <div className="relative bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
                                            <div className={`text-lg font-bold text-transparent bg-clip-text bg-gradient-to-b ${item.color} text-center`}>
                                                {item.value.toString().padStart(2, "0")}
                                            </div>
                                            <div className="text-[8px] text-gray-300 dark:text-white text-center font-medium tracking-wider">
                                                {item.label}
                                            </div>
                                        </div>
                                    </div>
                                    {index < 3 && (
                                        <div className="text-purple-400 mx-1 animate-pulse text-lg font-bold">:</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 relative">
                            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 animate-pulse rounded-full"
                                    style={{ width: `${100 - (timeLeft.days * 2)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }







    // Default variant - Glassmorphism Design with Mobile Row Layout
    return (
        <div className="relative group">
           

            {/* Main Timer Container */}
            <div className="">
                
               

                <div className="relative">
                    
                   {/* Minimal pill-style timer (like the screenshot) */}
<div className="inline-flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 px-3 sm:px-4 py-1 sm:py-1.5 shadow-inner">
  {[
    { value: timeLeft.days,    label: "D", color: "text-[#0F265C]" },
    { value: timeLeft.hours,   label: "H", color: "text-[#0F265C]" },
    { value: timeLeft.minutes, label: "M", color: "text-[#0F265C]" },
    { value: timeLeft.seconds, label: "S", color: "text-violet-600" },
  ].map((seg, i, arr) => (
    <div key={seg.label} className="flex items-baseline">
      <span className={`tabular-nums font-semibold text-[13px] sm:text-sm ${seg.color}`}>
        {seg.value.toString().padStart(2, "0")}
      </span>
      <span className={`ml-1 font-semibold text-[11px] sm:text-xs ${seg.color}`}>
        {seg.label}
      </span>

      {i < arr.length - 1 && (
        <span className="mx-2 sm:mx-3 font-bold text-[#0F265C]/70">:</span>
      )}
    </div>
  ))}
</div>


                    {/* Animated Border */}
                  
                </div>
            </div>
        </div>
    );
});