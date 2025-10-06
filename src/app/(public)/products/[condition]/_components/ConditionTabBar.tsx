"use client";
import React, { useRef } from "react";

interface ConditionTabBarProps {
  options: { value: string; label: string }[];
  selected: string;
  onTabChange: (tab: string) => void;
}

const ConditionTabBar: React.FC<ConditionTabBarProps> = ({ options, selected, onTabChange }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -100 : 100;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 my-10 justify-center relative">
      {/* Left Arrow */}
      <div
        onClick={() => handleScroll("left")}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 cursor-pointer z-10 p-2 bg-white rounded-full shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4 h-4 text-gray-600 dark:text-gray-300" viewBox="0 0 16 16">
          <path d="M10.646 4.646a.5.5 0 0 1 0 .708L6.707 9H13a.5.5 0 0 1 0 1H6.707l3.939 3.646a.5.5 0 1 1-.708.708L5.146 9.354a.5.5 0 0 1 0-.708l8.5-8.5a.5.5 0 0 1 .708 0z"/>
        </svg>
      </div>

      <div className="flex flex-nowrap gap-2 overflow-x-auto md:flex-wrap md:overflow-x-visible" ref={scrollContainerRef}>
        {options.filter(opt => opt.value).map(opt => (
          <button
            key={opt.value}
            onClick={() => onTabChange(opt.value)}
            className={
              `px-1 py-1 md:px-4 md:py-2 rounded-full text-sm font-medium capitalize transition ` +
              (encodeURI(selected) === opt.value
                ? "bg-primary text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200")
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      <div
        onClick={() => handleScroll("right")}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer z-10 p-2 bg-white rounded-full shadow-lg md:hidden "
      >
       <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="jsx-e720eac5d1883e06 w-4 h-4 text-gray-600 dark:text-gray-300"><path strokeLinecap="round" stroke-linejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" className="jsx-e720eac5d1883e06"></path></svg>
      </div>



    </div>
  );
};

export default ConditionTabBar;
