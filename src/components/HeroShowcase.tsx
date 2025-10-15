// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import * as React from "react";

// /** tiny classnames helper so we don't need `clsx` */
// const cx = (...classes: Array<string | false | null | undefined>) =>
//   classes.filter(Boolean).join(" ");

// /** ---- Content you can edit in this file ---- */
// const EYEBROW = "Grab It Now Fast";
// const TITLE = (
//   <>
//     New Summer Sale <br /> Discount Up To 50%
//   </>
// );
// const SUBTITLE =
//   "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since when an unknown priand scrambled it to a type specimen book.";
// const CTA = { label: "Shop Now", href: "/products" };
// const BG_IMAGE = '/assets/ffffff.png';
// const BG_ALT = "Girl with shopping bag on playful shapes background";

// /** section height preset - Reduced heights */
// const heightMap = {
//   sm: "min-h-[280px] xs:min-h-[300px] sm:min-h-[340px] md:min-h-[380px] lg:min-h-[420px]",
//   md: "min-h-[320px] xs:min-h-[360px] sm:min-h-[400px] md:min-h-[440px] lg:min-h-[480px]",
//   lg: "min-h-[360px] xs:min-h-[400px] sm:min-h-[440px] md:min-h-[500px] lg:min-h-[560px]",
// } as const;
// const HEIGHT: keyof typeof heightMap = "md"; // Changed to medium height

// /** ---- Component ---- */
// export default function HeroShowcase() {
//   const [imageError, setImageError] = React.useState(false);

//   return (
//     <section className={cx("relative overflow-hidden bg-[#F7F8F9]", heightMap[HEIGHT])}>
//       {/* Right-side background / model image - Reduced width */}
//       <div
//         aria-hidden
//         className="
//           pointer-events-none absolute inset-0
//           flex items-center justify-end
//         "
//       >
//         <div
//           className="
//             relative
//             h-full w-full
//             max-w-[70%] sm:max-w-[65%] md:max-w-[60%] lg:max-w-[55%] xl:max-w-[50%]  // Reduced width
//           "
//         >
//           <Image
//             src={BG_IMAGE}
//             alt={BG_ALT}
//             fill
//             priority
//             sizes="(max-width: 640px) 70vw, (max-width: 768px) 65vw, (max-width: 1024px) 60vw, 55vw"
//             className="object-contain object-right"
//             onError={() => setImageError(true)}
//           />
//         </div>
//       </div>

//       {/* soft white spotlight - smaller and repositioned */}
//       <span
//         aria-hidden
//         className="
//           absolute 
//           left-[-12%] xs:left-[-10%] sm:left-[-6%] md:left-[-4%]
//           top-[20%] xs:top-[22%] sm:top-[25%] md:top-[28%]
//           h-[120px] xs:h-[140px] sm:h-[160px] md:h-[180px] lg:h-[200px]  // Reduced size
//           w-[120px] xs:w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]  // Reduced size
//           rounded-full bg-white/50 blur-xl sm:blur-2xl  // Reduced opacity and blur
//         "
//       />

//       {/* content container */}
//       <div className="mx-auto w-full max-w-7xl h-full">
//         <div className="h-full flex items-center">
//           <div className="
//             px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10  // Reduced padding
//             w-full md:w-1/2 lg:w-2/5
//             py-6 xs:py-8 sm:py-10 md:py-12  // Reduced padding
//           ">
//             {/* Eyebrow */}
//             <p className="
//               text-xs xs:text-sm sm:text-base  // Smaller text
//               font-semibold text-[#FF6B6B]
//               mb-2 xs:mb-3 sm:mb-4  // Reduced margin
//               tracking-wide
//             ">
//               {EYEBROW}
//             </p>

//             {/* Title */}
//             <h1 className="
//               text-[22px] xs:text-[26px] sm:text-[30px] md:text-[34px] lg:text-[38px] xl:text-[42px]  // Smaller font sizes
//               leading-tight xs:leading-tight sm:leading-tight
//               font-black tracking-tight
//               text-[#1A2B3C]
//               mb-3 xs:mb-4 sm:mb-5  // Reduced margin
//             ">
//               {TITLE}
//             </h1>

//             {/* Subtitle */}
//             <p className="
//               text-[12px] xs:text-[13px] sm:text-[14px] md:text-[15px]  // Smaller text
//               text-gray-600
//               leading-relaxed
//               max-w-[95%] xs:max-w-[90%] sm:max-w-[85%]  // Slightly wider
//               mb-4 xs:mb-5 sm:mb-6  // Reduced margin
//             ">
//               {SUBTITLE}
//             </p>

//             {/* CTA Button */}
//             <div className="mt-6 xs:mt-7 sm:mt-8">  // Reduced margin
//               <Link
//                 href={CTA.href}
//                 className="
//                   inline-flex items-center gap-2  // Reduced gap
//                   rounded-full
//                   bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E]
//                   text-white
//                   px-5 xs:px-6 sm:px-7  // Reduced padding
//                   py-2 xs:py-2.5 sm:py-3  // Reduced padding
//                   text-sm xs:text-base sm:text-lg  // Smaller text
//                   font-bold
//                   shadow-md hover:shadow-lg  // Reduced shadow
//                   transition-all duration-300
//                   transform hover:scale-105
//                   hover:from-[#FF5757] hover:to-[#FF7B7B]
//                 "
//               >
//                 {CTA.label}
//                 <span 
//                   aria-hidden 
//                   className="
//                     text-base xs:text-lg sm:text-xl  // Smaller arrow
//                     transition-transform duration-300
//                     group-hover:translate-x-1
//                   "
//                 >
//                   ➜
//                 </span>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }



"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { IoMdArrowDroprightCircle } from "react-icons/io";

/* tiny classnames helper */
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

/* ---- Editable content ---- */
const EYEBROW = "Grab It Now Fast";
const TITLE = (
  <>
    New Summer Sale <br /> Discount Up To 50%
  </>
);
const SUBTITLE =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since when an unknown priand scrambled it to a type specimen book.";
const CTA = { label: "Shop Now", href: "/products" };
const BG_IMAGE = "/assets/ffffff.png";
const BG_ALT = "Girl with shopping bag on playful shapes background";

/* section height */
const heightMap = {
  sm: "min-h-[280px] xs:min-h-[300px] sm:min-h-[340px] md:min-h-[380px] lg:min-h-[420px]",
  md: "min-h-[320px] xs:min-h-[360px] sm:min-h-[400px] md:min-h-[440px] lg:min-h-[480px]",
  lg: "min-h-[360px] xs:min-h-[400px] sm:min-h-[440px] md:min-h-[500px] lg:min-h-[560px]",
} as const;
const HEIGHT: keyof typeof heightMap = "md";

/* ---- Component ---- */
export default function HeroShowcase() {
  const [imageError, setImageError] = React.useState(false);

  return (
    <section className={cx("relative overflow-visible sm:overflow-hidden bg-[#F6F4F2]", heightMap[HEIGHT], "max-[639px]:min-h-[220px]"    )}>
      {/* BG/model image
          Mobile: bottom-anchored small box (side-by-side feel)
          >=sm: আগের মতোই বড় হয়ে যায় */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 flex justify-end items-end pb-2 sm:pb-0"
      >
        <div
          className="
            relative overflow-visible
           h-[200px] w-[64%]                 /* MOBILE height & width */
            xs:h-[185px] xs:w-[56%]
            sm:h-full sm:w-full               /* >= sm: fill parent again */
            sm:max-w-[65%] md:max-w-[60%] lg:max-w-[55%] xl:max-w-[50%]
          "
        >
          {!imageError ? (
           <Image
  src={BG_IMAGE}
  alt={BG_ALT}
  fill
  priority
  sizes="(max-width: 640px) 62vw, (max-width: 768px) 65vw, (max-width: 1024px) 60vw, 55vw"
  className="object-cover sm:object-contain object-[right_bottom]"
/>

          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-50 to-purple-50" />
          )}
        </div>
      </div>

      {/* Spotlight: mobile এ হাইড, >=xs দেখাবে */}
      <span
        aria-hidden
        className="
          hidden xs:block
          absolute 
          left-[-10%] sm:left-[-6%] md:left-[-4%]
          top-[22%] sm:top-[25%] md:top-[28%]
          h-[140px] sm:h-[160px] md:h-[180px] lg:h-[200px]
          w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]
          rounded-full bg-white/50 blur-xl sm:blur-2xl
        "
      />

      {/* content */}
      <div className="mx-auto w-full max-w-7xl h-full">
        <div className="h-full flex items-center">
          <div
            className="
              relative z-10
              px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10
              w-full md:w-1/2 lg:w-2/5
              py-6 xs:py-8 sm:py-10 md:py-12
            "
          >
            <p className="text-xs xs:text-sm sm:text-base font-semibold text-[#FF6B6B] mb-2 xs:mb-3 sm:mb-4 tracking-wide">
              {EYEBROW}
            </p>

            <h1 className="text-[12px] xs:text-[26px] sm:text-[30px] md:text-[34px] lg:text-[38px] xl:text-[42px] leading-tight font-black tracking-tight text-[#1A2B3C] mb-3 xs:mb-4 sm:mb-5">
              {TITLE}
            </h1>

            <p className="  hidden md:block text-[12px] xs:text-[13px] sm:text-[14px] md:text-[15px] text-gray-600 leading-relaxed max-w-[95%] xs:max-w-[90%] sm:max-w-[85%] mb-4 xs:mb-5 sm:mb-6">
              {SUBTITLE}
            </p>

            <div className="mt-6 xs:mt-7 sm:mt-8">
              <Link
                href={CTA.href}
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  bg-[#742CFE]
                  text-white
                  px-2 xs:px-6 sm:px-7
                  py-2 xs:py-2.5 sm:py-3
                  text-sm xs:text-base sm:text-lg
                  font-bold shadow-md hover:shadow-lg
                  transition-all duration-300 transform hover:scale-105
                  hover:from-[#FF5757] hover:to-[#FF7B7B]
                "
              >
                {CTA.label}
                <IoMdArrowDroprightCircle  aria-hidden className="text-base xs:text-lg sm:text-xl transition-transform duration-300"/>
                 
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
