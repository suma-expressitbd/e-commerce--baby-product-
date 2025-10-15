// // src/components/FeaturesBar.tsx
// "use client";

// import * as React from "react";
// import Image from "next/image";
// import { FiTruck, FiRotateCcw, FiPhoneCall, FiDollarSign } from "react-icons/fi";

// /** tiny classnames helper (no clsx) */
// const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

// type FeatureItem = {
//   /** Large title text */
//   title: string;
//   /** Small helper text */
//   subtitle: string;
//   /** Optional React icon (e.g. <FiTruck />). If you prefer an image, use imgSrc */
//   icon?: React.ReactNode;
//   /** Optional image path (from /public). If provided, it's used instead of `icon` */
//   imgSrc?: string;
//   /** Tailwind gradient e.g. "from-fuchsia-500 to-pink-500" */
//   gradient?: string;
// };

// type FeaturesBarProps = {
//   items?: FeatureItem[];
//   className?: string;
//   containerClassName?: string;
//   /** Toggle section background */
//   mutedBackground?: boolean;
// };

// const DEFAULT_ITEMS: FeatureItem[] = [
//   {
//     title: "Free Shipping",
//     subtitle: "On Order $25+ · 7 Days/Week",
//     icon: <FiTruck className="h-8 w-8" />,
//     gradient: "from-[#6E55FF] to-[#A76BFF]", // purple
//   },
//   {
//     title: "Money Back Guarantee",
//     subtitle: "Send Within 30 Days",
//     icon: <FiDollarSign className="h-8 w-8" />,
//     gradient: "from-[#FF9EB3] to-[#FF6B8B]", // pink
//   },
//   {
//     title: "Free Returns",
//     subtitle: "Free 90 Days Returns Policy",
//     icon: <FiRotateCcw className="h-8 w-8" />,
//     gradient: "from-[#FF7BE5] to-[#A855F7]", // fuchsia
//   },
//   {
//     title: "24/7 Customer Service",
//     subtitle: "Call Us 24/7 At 000-123-455",
//     icon: <FiPhoneCall className="h-8 w-8" />,
//     gradient: "from-[#22D3EE] to-[#34D399]", // cyan→emerald
//   },
// ];

// /** A single feature card */
// function FeatureCard({ item }: { item: FeatureItem }) {
//   const grad = item.gradient ?? "from-indigo-500 to-purple-500";

//   return (
//     <div className="group flex flex-col items-center text-center px-6 py-10">
//       <div className="relative mb-5">
//         {/* gradient glow ring */}
//         <div
//           className={cx(
//             "absolute inset-0 blur-xl opacity-30 rounded-full",
//             "bg-gradient-to-br",
//             grad
//           )}
//           aria-hidden
//         />
//         {/* icon container */}
//         <div className="relative grid place-items-center h-16 w-16 rounded-full bg-white shadow ring-1 ring-black/5">
//           {item.imgSrc ? (
//             <Image
//               src={item.imgSrc}
//               alt=""
//               width={28}
//               height={28}
//               className="opacity-90"
//               aria-hidden
//             />
//           ) : (
//             // Icon color (solid) + slight drop shadow
//             <div className={cx("text-2xl drop-shadow-sm text-[#6E55FF]")}>
//               {item.icon}
//             </div>
//           )}
//         </div>
//       </div>

//       <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
//         {item.title}
//       </h3>
//       <p className="mt-2 text-slate-500 text-base">
//         {item.subtitle}
//       </p>
//     </div>
//   );
// }

// /** Reusable bar */
// export default function FeaturesBar({
//   items = DEFAULT_ITEMS,
//   className,
//   containerClassName,
//   mutedBackground = true,
// }: FeaturesBarProps) {
//   return (
//     <section
//       className={cx(
//         "w-full",
//         mutedBackground && "bg-[#FCFAF9]",
//         className
//       )}
//     >
//       <div
//         className={cx(
//           "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
//           containerClassName
//         )}
//       >
//         <div
//           className={cx(
//             "grid",
//             "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
//             "divide-y sm:divide-y-0 sm:divide-x divide-slate-100"
//           )}
//         >
//           {items.map((it, idx) => (
//             <FeatureCard key={idx} item={it} />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }




// src/components/FeaturesBar.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { FiTruck, FiRotateCcw, FiPhoneCall, FiDollarSign } from "react-icons/fi";

/** tiny classnames helper (no clsx) */
const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

type FeatureItem = {
  /** Large title text */
  title: string;
  /** Small helper text */
  subtitle: string;
  /** Optional React icon (e.g. <FiTruck />). If you prefer an image, use imgSrc */
  icon?: React.ReactNode;
  /** Optional image path (from /public). If provided, it's used instead of `icon` */
  imgSrc?: string;
  /** Tailwind gradient e.g. "from-fuchsia-500 to-pink-500" */
  gradient?: string;
};

type FeaturesBarProps = {
  items?: FeatureItem[];
  className?: string;
  containerClassName?: string;
  /** Toggle section background */
  mutedBackground?: boolean;
};

const DEFAULT_ITEMS: FeatureItem[] = [
  {
    title: "Free Shipping",
    subtitle: "On Order $25+ · 7 Days/Week",
    icon: <FiTruck className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />,
    gradient: "from-[#6E55FF] to-[#A76BFF]", // purple
  },
  {
    title: "Money Back Guarantee",
    subtitle: "Send Within 30 Days",
    icon: <FiDollarSign className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />,
    gradient: "from-[#FF9EB3] to-[#FF6B8B]", // pink
  },
  {
    title: "Free Returns",
    subtitle: "Free 90 Days Returns Policy",
    icon: <FiRotateCcw className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />,
    gradient: "from-[#FF7BE5] to-[#A855F7]", // fuchsia
  },
  {
    title: "24/7 Customer Service",
    subtitle: "Call Us 24/7 At 000-123-455",
    icon: <FiPhoneCall className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />,
    gradient: "from-[#22D3EE] to-[#34D399]", // cyan→emerald
  },
];

/** A single feature card */
function FeatureCard({ item }: { item: FeatureItem }) {
  const grad = item.gradient ?? "from-indigo-500 to-purple-500";

  return (
    <div className="group flex flex-col items-center text-center px-4 sm:px-5 md:px-6 py-6 sm:py-8 md:py-10">
      <div className="relative mb-4 sm:mb-4 md:mb-5">
        {/* gradient glow ring */}
        <div
          className={cx(
            "absolute inset-0 blur-lg sm:blur-xl opacity-20 sm:opacity-30 rounded-full",
            "bg-gradient-to-br",
            grad
          )}
          aria-hidden
        />
        {/* icon container */}
        <div className="relative grid place-items-center h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-white shadow sm:shadow-md ring-1 ring-black/5">
          {item.imgSrc ? (
            <Image
              src={item.imgSrc}
              alt=""
              width={24}
              height={24}
              className="opacity-90 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
              aria-hidden
            />
          ) : (
            // Icon color (solid) + slight drop shadow
            <div className={cx("drop-shadow-sm text-[#6E55FF]")}>
              {item.icon}
            </div>
          )}
        </div>
      </div>

      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 tracking-tight leading-tight">
        {item.title}
      </h3>
      <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-slate-500 leading-relaxed px-2">
        {item.subtitle}
      </p>
    </div>
  );
}

/** Reusable bar */
export default function FeaturesBar({
  items = DEFAULT_ITEMS,
  className,
  containerClassName,
  mutedBackground = true,
}: FeaturesBarProps) {
  return (
    <section
      className={cx(
        "w-full",
        mutedBackground && "bg-[#FCFAF9]",
        className
      )}
    >
      <div
        className={cx(
          "mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8",
          containerClassName
        )}
      >
        <div
          className={cx(
            "grid",
            "grid-cols-1 xs:grid-cols-2 lg:grid-cols-4",
            "divide-y xs:divide-y-0 xs:divide-x divide-slate-100",
            "border-t border-slate-100 xs:border-t-0"
          )}
        >
          {items.map((it, idx) => (
            <FeatureCard key={idx} item={it} />
          ))}
        </div>
      </div>
    </section>
  );
}