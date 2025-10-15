






"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useBusiness } from "@/hooks/useBusiness";
import type { Category } from "@/types/business";
import { IoArrowUpCircle } from "react-icons/io5";
import { GiAmpleDress, GiDress, GiLargeDress, GiTravelDress } from "react-icons/gi";
import { FaHatCowboy, FaShoePrints, FaShoppingBag, FaTshirt } from "react-icons/fa";
import { PiDressFill } from "react-icons/pi";
import { IoMdArrowDroprightCircle } from "react-icons/io";

type OptionalProps = {
  heading?: string;
  subtext?: string;
  scrollStep?: number;
};

export default function CategorySlider({
  heading = "Category",
  subtext = "Lorem ipsum dolor sit amet, consectetue elit roni dis Aenean commodo ligula eget dolor, aenean ena masa suma soc Loramet.",
  scrollStep = 300,
}: OptionalProps) {
  const router = useRouter();
  const { businessData, isLoading, error } = useBusiness();
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activeCard, setActiveCard] = useState<number>(-1); // শুরুতে কোন card highlight হবে না

  // businessData থেকে categories বের করুন
  const rawCategories: Category[] =
    (businessData?.categories as Category[]) ??
    (businessData?.[0]?.categories as Category[]) ??
    
    [];


// NEW: mobile breakpoint detect
    const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  // Tailwind sm breakpoint ~= 640px
  const mq = window.matchMedia("(max-width: 639.98px)");
  const update = () => setIsMobile(mq.matches);
  update();
  mq.addEventListener("change", update);
  return () => mq.removeEventListener("change", update);
}, []);  


// 1️⃣ আইকন লিস্ট
const ICONS = [GiLargeDress , GiAmpleDress, PiDressFill, GiDress ];

// 2️⃣ প্রত্যেক আইকনের জন্য নির্দিষ্ট রঙ (Tailwind বা hex যেকোনোভাবে)
const ICON_COLORS = [
  "#EF4444", // red for dress
  "#10B981", // green for tshirt
  "#3B82F6", // blue for shoes
  "#F59E0B", // yellow/orange for hat
  "#F59E0B", // purple for bag
];

// 3️⃣ hash utility (আগের মতো)
function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getIconForCategory(cat: { _id?: string; name?: string }) {
  const key = cat?._id || cat?.name || "";
  const idx = hashStr(key) % ICONS.length;
  return { Icon: ICONS[idx], color: ICON_COLORS[idx] };
}






  // nested হলে flatten + id-unique
  const categories = useMemo(() => {
    const out: Category[] = [];
    const walk = (nodes: Category[]) => {
      nodes?.forEach((n) => {
        out.push({ ...n, children: [] });
        if (n.children?.length) walk(n.children);
      });
    };
    walk(rawCategories || []);
    const uniq = new Map(out.map((c) => [c._id, c]));
    return Array.from(uniq.values());
  }, [rawCategories]);

  // 4) 🔁 REPLACE: active card detect effect (এখানেই তোমার দেওয়া ব্লকটা বসবে)
useEffect(() => {
  if (isMobile) { setActiveCard(-1); return; }
  const rail = railRef.current;
  if (!rail) return;

  const onScroll = () => {
    const cards = Array.from(rail.querySelectorAll<HTMLDivElement>("[data-card]"));
    const railRect = rail.getBoundingClientRect();
    const railCenter = railRect.left + railRect.width / 2;

    let closest = -1, min = Infinity;
    cards.forEach((el, idx) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs((r.left + r.width / 2) - railCenter);
      if (d < min) { min = d; closest = idx; }
    });

    if (min < railRect.width * 0.3) setActiveCard(closest);
    else setActiveCard(-1);
  };

  onScroll();
  rail.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  return () => {
    rail.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}, [categories.length, isMobile]);




 // Mouse and touch event handlers for scrolling - এই useEffect টি add করুন
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const isDown = { current: false };
    let startX = 0;
    let scrollLeft = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      rail.scrollLeft += e.deltaY * 0.8;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDown.current = true;
      startX = e.pageX - rail.offsetLeft;
      scrollLeft = rail.scrollLeft;
      rail.style.cursor = "grabbing";
      rail.style.userSelect = "none";
    };

    const handleMouseUp = () => {
      isDown.current = false;
      rail.style.cursor = "grab";
      rail.style.userSelect = "auto";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown.current) return;
      e.preventDefault();
      const x = e.pageX - rail.offsetLeft;
      const walk = (x - startX) * 0.8;
      rail.scrollLeft = scrollLeft - walk;
    };

    // Touch handlers
    const handleTouchStart = (e: TouchEvent) => {
      isDown.current = true;
      startX = e.touches[0].pageX - rail.offsetLeft;
      scrollLeft = rail.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDown.current) return;
      const x = e.touches[0].pageX - rail.offsetLeft;
      const walk = (x - startX) * 0.8;
      rail.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      isDown.current = false;
    };

    rail.addEventListener("wheel", handleWheel, { passive: false });
    rail.addEventListener("mousedown", handleMouseDown);
    rail.addEventListener("mouseup", handleMouseUp);
    rail.addEventListener("mousemove", handleMouseMove);
    rail.addEventListener("mouseleave", handleMouseUp);
    rail.addEventListener("touchstart", handleTouchStart);
    rail.addEventListener("touchmove", handleTouchMove);
    rail.addEventListener("touchend", handleTouchEnd);

    return () => {
      rail.removeEventListener("wheel", handleWheel);
      rail.removeEventListener("mousedown", handleMouseDown);
      rail.removeEventListener("mouseup", handleMouseUp);
      rail.removeEventListener("mousemove", handleMouseMove);
      rail.removeEventListener("mouseleave", handleMouseUp);
      rail.removeEventListener("touchstart", handleTouchStart);
      rail.removeEventListener("touchmove", handleTouchMove);
      rail.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const scrollBy = (dir: "prev" | "next") => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: dir === "prev" ? -scrollStep : scrollStep,
      behavior: "smooth",
    });
  };

  const goToCategory = (c?: Category) => {
    if (c?._id) router.push(`/products?category=${encodeURIComponent(c._id)}`);
    else router.push("/products");
  };

return (
  <section className="relative overflow-visible overscroll-y-none mx-auto w-full max-w-[320px] md:max-w-[1000px] lg:max-w-[1500px]  mt-0 lg:mt-16">
    {/* Main section - mobile এ background remove করে শুধু card দেখাবে */}
    <div className="rounded-3xl lg:bg-[#192843] text-white px-4 sm:px-8 lg:px-12 py-6 lg:py-12 overflow-visible h-[340px] sm:h-[450px] lg:h-[350px] relative">
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 lg:gap-12 items-start h-full">
          {/* Left intro - Exact image design */}
        <div className="hidden lg:block relative">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            {heading}
          </h2>
          <p className="text-white/80 leading-relaxed text-sm sm:text-base md:text-lg mb-6 sm:mb-8 font-light">
            {subtext}
          </p>
          <button
            onClick={() => goToCategory()}
            className="inline-flex items-center gap-2 sm:gap-3 rounded-full bg-gradient-to-r from-[#6d28d9] to-[#4f46e5] px-6 sm:px-8 py-3 sm:py-4 font-semibold text-base sm:text-lg shadow-xl shadow-purple-900/30 transition-all hover:scale-105 active:scale-95 hover:shadow-2xl"
          >
            Shop Now 
            <span className="text-lg sm:text-xl transition-transform duration-300 group-hover:translate-x-1">➜</span>
          </button>
          <div className="hidden lg:block absolute right-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-500/50 via-blue-500/50 to-cyan-500/50" />
        </div>

        {/* Right rail - Main container */}
        <div className="relative h-full overflow-visible min-h-0 lg:mt-0">
          {/* Arrows - Hidden on mobile, shown on md and up */}
          <div className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={() => scrollBy("prev")}
              className=""
              aria-label="Previous"
            >
              {/* <IoArrowUpCircle className="h-7 w-7 rotate-90 text-white/70 hover:text-white" /> */}
            </button>
          </div>
          <div className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={() => scrollBy("next")}
              className=""
              aria-label="Next"
            >
              
            </button>
          </div>

     

          <div className="absolute inset-0 overflow-visible lg:-top-20">
         <div
          ref={railRef}
             className="flex items-center lg:items-center gap-3 sm:gap-4
            overflow-x-auto overflow-y-visible snap-x snap-mandatory
           pl-2 pr-2 pt-2 sm:pt-16 lg:py-8
             [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
             cursor-grab select-none"
            >
            {/* Loading / empty states */}
            {isLoading && (
              <div className="text-white/60 py-16 px-6 text-center flex items-center justify-center h-full">Loading categories…</div>
            )}
            {error && !isLoading && (
              <div className="text-red-400 py-16 px-6 text-center flex items-center justify-center h-full">Failed to load categories.</div>
            )}
            {!isLoading && !error && categories.length === 0 && (
              <div className="text-white/60 py-16 px-6 text-center flex items-center justify-center h-full">No categories found.</div>
            )}

            {categories.map((cat, idx) => {
              const isFeatured = activeCard === idx;
              return (
                <div
                  key={cat._id}
                  data-card
                  className={[
                    "snap-start shrink-0 transition-all duration-500 relative flex items-center",
  isFeatured ? "self-center" : "self-center",
   isFeatured 
     ? "w-[280px] sm:w-[260px] md:w-[320px] lg:w-[350px] z-30 -translate-y-[0px] sm:-translate-y-[25px] md:-translate-y-[30px] [will-change:transform]" 
     : "w-[290px] sm:w-[220px] md:w-[280px] lg:w-[330px] z-20 translate-y-0"
 ].join(" ")}
                >
                  <div
                    className={[
                      "rounded-3xl p-4 sm:p-6 flex flex-col justify-between  transition-all duration-500 relative overflow-hidden group w-full",
                      isFeatured
                        ? "bg-gradient-to-br from-purple-600/30 via-purple-500/20 to-blue-600/30 border-purple-400/40 shadow-2xl shadow-purple-900/30 backdrop-blur-sm h-[290px] sm:h-[280px] md:h-[410px]" 
                        : "bg-[#192843]  hover:bg-white/15 backdrop-blur-sm h-[250px] sm:h-[220px] md:h-[300px] top-0 md:-top-4 lg:-top-8",
                    ].join(" ")}
                  >
                    {/* Background glow for featured card */}
                    {isFeatured && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-b from-[#3b13ec] to-[#6a0c81] rounded-3xl" />
                        <div className="absolute -inset-1 bg-gradient-to-br from-purple-400/25 to-blue-400/25 rounded-3xl blur-sm opacity-60 group-hover:opacity-80 transition-opacity" />
                      </>
                    )}
                    
                    {/* Icon Section */}
                    <div
   className={[ 
     "w-24 h-24 sm:w-12 sm:h-12 unded-2xl grid place-items-center text-xl sm:text-2xl duration-500 relative z-10", 
     isFeatured 
       // featured: একটু ওপরে তোলা + বেশি bottom gap 
       ? "mb-4  md:mb-16 sm:mb-6 lg:mb-14 lg:-translate-y-1.5" 
       // normal: কিছুটা gap এবং সামান্য lift 
       : "mb-3 md:mb-16 sm:mb-4 lg:mb-16 lg:-translate-y-1", 
   ].join(" ")} 
 >
 {(() => {
   const { Icon, color } = getIconForCategory(cat);
   return <Icon className="w-28 h-28" style={{ color }} />;
 })()}
</div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col justify-start relative z-10">
                      <h3
                        className={[
                          "text-xl sm:text-2xl font-bold transition-all duration-500",
                          isFeatured ? "text-white mb-3 sm:mb-4" : "text-white/80 mb-2 sm:mb-3",
                        ].join(" ")}
                      >
                        {cat.name}
                      </h3>
                      
                      {/* Description - শুধুমাত্র featured card এ show হবে */}
                      {isFeatured && (
                        <p className="text-white/70 text-xs sm:text-[15px] font-semibold leading-relaxed mb-4 sm:mb-6  tracking-wide">
                          Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem an ubook.Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem an ubook.
                        </p>
                      )}


                       {!isFeatured && (
                        <p className=" md:hidden sm:block  text-white/70 text-xs sm:text-[15px] font-semibold leading-relaxed mb-4 sm:mb-6  tracking-wide">
                          Lorem ipsum is simply dummy text of the printing and typesetting industry.
                        </p>
                      )}
                      
                {!isFeatured && (


   <button
     onClick={() => goToCategory(cat)}
     className="inline-flex items-center gap-2 font-semibold transition-all duration-500 group w-fit mb-6 text-sm sm:text-base
                text-white/70 hover:text-white  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg  hover:bg-white/10 -ml-6 "
   >
     Shop Now 
     <IoMdArrowDroprightCircle className="text-sm sm:text-base transition-transform duration-300 group-hover:translate-x-0.5" />
   </button>
 )}
 {/* layout balance রাখতে (button এর জায়গা) ছোট spacer */}
 {isFeatured && <div className="mt-auto h-10 sm:h-11" aria-hidden="true" />}



                      
                    </div>

                    {/* Additional decorative elements for featured card */}
                    {isFeatured && (
                      <>
                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-tr-3xl" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-bl-3xl" />
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="shrink-0 w-4" />
          </div>
          </div>




        </div>
      </div>
    </div>

    {/* Gradient Decorations - শুধু LG以上 এ show হবে */}
    <span className="pointer-events-none absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 blur-2xl hidden lg:block" />
    <span className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-400/30 blur-2xl hidden lg:block" />
  </section>
);}