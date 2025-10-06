

// 'use client';

// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import Image from 'next/image';

// interface BannerSliderProps {
//   className?: string;
//   autoplay?: boolean;
//   intervalMs?: number;
// }

// type Slide = {
//   id: number;
//   title: string;
//   subtitle?: string;
//   description?: string;
//   content: string;
//   cta: string;
//   textPosition?: 'left' | 'right';
//   mainImg: string;
//   smallCardImg?: string;
//   avatars?: string[];
//   butterflyImg?: string;
//   starImg?: string;
//   likeImg?: string;
// };

// const AVATAR_VISIBLE = 4;

// const BannerSlider: React.FC<BannerSliderProps> = ({
//   className,
//   autoplay = true,
//   intervalMs = 50000,
// }) => {
//   const [index, setIndex] = useState(0);
//   const scrollRef = useRef<HTMLDivElement | null>(null);

//   // inertia wheel
//   const wheelVel = useRef(0);
//   const rafId = useRef<number | null>(null);

//   // drag-to-scroll helpers
//   const isDragging = useRef(false);
//   const startX = useRef(0);
//   const startScrollLeft = useRef(0);

//   // slides
//   const slides: Slide[] = [
//     {
//       id: 1,
//       title: "Trendy Collection's",
//       subtitle: 'Freshen Up',
//       description: 'Your Look Style',
//       content:
//         'Lorem ipsum dolor sit amet, consectetue adipiscin elit roni dis Aenean comodo ligula eget dolor, aenean ena masa suma soc Lorem ipsum dolor sit amet.',
//       cta: 'Shop Now',
//       textPosition: 'left',
//       mainImg: '/assets/s2.webp',
//       avatars: ['/assets/baby.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg'],
//     },
//     {
//       id: 2,
//       title: "Trendy Collection's",
//       subtitle: 'Freshen Up',
//       description: 'Your Look Style',
//       content:
//         'Lorem ipsum dolor sit amet, consectetue adipiscin elit roni dis Aenean comodo ligula eget dolor, aenean ena masa suma soc Lorem ipsum dolor sit amet.',
//       cta: 'Shop Now',
//       textPosition: 'left',
//       mainImg: '/assets/s3.webp',
//       avatars: ['/assets/baby.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg'],
//     },
//   ];

//   const slide = slides[index];

//   // ===== Avatar mini-slider state =====
//   const [avatarIndex, setAvatarIndex] = useState(0);
//   const avatarList = slide.avatars ?? [];

//   // slide বদলালে avatarIndex reset করে দেই
//   useEffect(() => {
//     setAvatarIndex(0);
//   }, [index]);

//   const visibleAvatars = useMemo(
//     () =>
//       Array.from(
//         { length: Math.min(AVATAR_VISIBLE, avatarList.length) },
//         (_, k) => avatarList[(avatarIndex + k) % avatarList.length]
//       ),
//     [avatarIndex, avatarList]
//   );

//   // auto-play avatars (optional)
//   useEffect(() => {
//     if (avatarList.length <= AVATAR_VISIBLE) return;
//     const t = setInterval(() => {
//       setAvatarIndex((i) => (i + 1) % avatarList.length);
//     }, 2000);
//     return () => clearInterval(t);
//   }, [avatarList.length]);

//   // autoplay slides
//   useEffect(() => {
//     if (!autoplay || slides.length < 2) return;
//     const t = setInterval(
//       () => setIndex((i) => (i + 1) % slides.length),
//       intervalMs
//     );
//     return () => clearInterval(t);
//   }, [autoplay, intervalMs, slides.length]);

//   // rAF animator
//   const animateWheel = () => {
//     const el = scrollRef.current;
//     if (!el) return;

//     el.scrollLeft += wheelVel.current;
//     wheelVel.current *= 0.92;

//     if (Math.abs(wheelVel.current) < 0.15) {
//       wheelVel.current = 0;
//       if (rafId.current) {
//         cancelAnimationFrame(rafId.current);
//         rafId.current = null;
//       }
//       return;
//     }

//     rafId.current = requestAnimationFrame(animateWheel);
//   };

//   // wheel -> horizontal inertia
//   const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
//     const el = e.currentTarget;
//     if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
//       e.preventDefault();
//       wheelVel.current += e.deltaY * 0.12;
//     } else {
//       wheelVel.current += e.deltaX * 0.12;
//     }

//     if (!rafId.current) {
//       rafId.current = requestAnimationFrame(animateWheel);
//     }
//   };

//   // আনমাউন্টে rAF ক্লিনআপ
//   useEffect(() => {
//     return () => {
//       if (rafId.current) cancelAnimationFrame(rafId.current);
//     };
//   }, []);

//   // drag-to-scroll
//   const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
//     const el = e.currentTarget;
//     isDragging.current = true;
//     startX.current = e.clientX;
//     startScrollLeft.current = el.scrollLeft;
//     el.setPointerCapture?.(e.pointerId);
//   };

//   const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
//     if (!isDragging.current) return;
//     e.preventDefault();
//     const el = e.currentTarget;
//     const dx = e.clientX - startX.current;
//     el.scrollLeft = startScrollLeft.current - dx;
//   };

//   const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
//     isDragging.current = false;
//     e.currentTarget.releasePointerCapture?.(e.pointerId);
//   };

//  return (
//     <section className={`relative overflow-hidden bg-white ${className || ''}`}>
//       <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
//         {/* Desktop-optimized wrapper */}
//         <div className="relative min-h-[800px] grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16 py-12 lg:py-20">

//           {/* ========= Left Text ========= */}
//           <div
//             className={`relative order-2 lg:order-1 ${
//               slide.textPosition === 'left' ? '' : 'lg:col-start-2'
//             }`}
//           >
//             {/* Large backdrop circle */}
//             <div className="absolute -z-10 -top-20 -left-20 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-70" />

//             {/* small label - Larger */}
//             <p className="text-lg font-semibold text-gray-800 mb-4 tracking-wider">
//               {slide.title}
//             </p>

//             {/* Large headline */}
//             <div className="space-y-3 mb-6">
//               {slide.subtitle ? (
//                 <h1 className="text-[56px] lg:text-[72px] xl:text-[80px] font-black text-[#0d1b3e] leading-[1.05]">
//                   {slide.subtitle}
//                 </h1>
//               ) : null}

//               {slide.description ? (
//                 <h2 className="text-[48px] lg:text-[64px] xl:text-[76px] font-black text-[#0d1b3e]/95 leading-[1.05]">
//                   {slide.description}
//                 </h2>
//               ) : null}
//             </div>

//             {/* body - Larger */}
//             <p className="text-gray-500 leading-relaxed text-lg max-w-2xl mb-8">
//               {slide.content}
//             </p>

//             {/* CTA - Larger */}
//             <button className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-[#7f56d9] text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 hover:scale-105">
//               {slide.cta}
//               <span className="inline-block text-2xl">➤</span>
//             </button>

//             {/* Horizontal line */}
//             <div className="my-10 w-20 h-1 bg-gray-300 rounded-full" />

//             {/* review block - Larger */}
//             <div className="flex items-start gap-6">
//               <div className="w-20 h-20 rounded-full bg-[#f1f5ff] ring-4 ring-white shadow-2xl grid place-items-center text-[#7f56d9] text-3xl flex-shrink-0">
//                 “
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h4 className="font-bold text-gray-800 text-2xl mb-3">
//                   I Just Our Company !
//                 </h4>
//                 <p className="text-gray-500 text-base leading-relaxed max-w-2xl mb-4">
//                   But I must explain to you how all this mistaken idea of
//                   denouncing pleasure and praising pain was born and I will give
//                   you a complete account of the system, and expound the actual
//                   teachings of the great explorer of the truth, the master-builder of human happiness.
//                 </p>
//                 <div className="text-gray-700 font-semibold text-lg">
//                   Web Designer
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ========= Right Visual ========= */}
//           <div
//             className={`relative order-1 lg:order-2 flex justify-center lg:justify-end ${
//               slide.textPosition === 'left' ? '' : 'lg:col-start-1'
//             }`}
//           >
//             {/* Large colored circles behind */}
//             <div className="absolute -z-10 top-10 right-16 w-80 h-80 lg:w-96 lg:h-96 bg-blue-200 rounded-full blur-3xl" />
//             <div className="absolute -z-10 bottom-10 right-8 w-96 h-96 lg:w-[480px] lg:h-[480px] bg-pink-300 rounded-full blur-3xl opacity-90" />
//             <div className="absolute -z-10 bottom-48 right-32 w-64 h-64 lg:w-80 lg:h-80 bg-orange-200 rounded-full blur-3xl opacity-80" />

//             {/* small stickers - Larger */}
//             {slide.starImg && (
//               <Image
//                 src={slide.starImg}
//                 alt="star"
//                 width={80}
//                 height={80}
//                 className="absolute top-40 right-[45%] rotate-3"
//               />
//             )}
//             {slide.butterflyImg && (
//               <Image
//                 src={slide.butterflyImg}
//                 alt="butterfly"
//                 width={76}
//                 height={76}
//                 className="absolute -top-8 left-16"
//               />
//             )}

//             {/* main model image - Larger */}
//             <div className="relative w-full max-w-[650px]">
//               <Image
//                 src={slide.mainImg}
//                 alt="model"
//                 width={650}
//                 height={800}
//                 priority
//                 className="w-full h-auto object-contain"
//               />
//             </div>

//             {/* like bubble - Larger */}
//             {slide.likeImg && (
//               <div className="absolute bottom-48 left-12 bg-white/90 backdrop-blur-md border-2 border-white/80 rounded-full w-20 h-20 grid place-items-center shadow-2xl">
//                 <Image 
//                   src={slide.likeImg} 
//                   alt="like" 
//                   width={32}
//                   height={32}
//                   className="w-8 h-8"
//                 />
//               </div>
//             )}

//             {/* bottom-right small framed card - Larger */}
//             {slide.smallCardImg && (
//               <div className="absolute bottom-8 right-12 bg-white p-4 rounded-3xl shadow-3xl">
//                 <div className="relative w-48 h-60">
//                   <Image
//                     src={slide.smallCardImg}
//                     alt="small"
//                     fill
//                     className="rounded-2xl object-cover"
//                   />
//                 </div>
//                 {/* heart bubble */}
//                 <div className="absolute -right-3 -top-3 w-12 h-12 rounded-full bg-white shadow-2xl grid place-items-center text-red-500 text-xl">
//                   ♥
//                 </div>
//               </div>
//             )}

//             {/* bottom-left avatars row - Larger */}
//             {avatarList.length > 0 && (
//               <div className="absolute -bottom-6 left-8">
//                 <div className="relative bg-white rounded-full shadow-xl w-[400px] h-[80px] flex items-center">
//                   <div
//                     ref={scrollRef}
//                     onWheel={handleWheel}
//                     onPointerDown={onPointerDown}
//                     onPointerMove={onPointerMove}
//                     onPointerUp={endDrag}
//                     onPointerCancel={endDrag}
//                     className="
//                       mx-12
//                       overflow-x-auto overflow-y-hidden
//                       no-scrollbar
//                       flex items-center gap-4
//                       snap-x snap-proximity
//                       overscroll-x-contain
//                       cursor-grab active:cursor-grabbing
//                       touch-pan-x select-none
//                     "
//                     style={{ scrollbarWidth: 'none' }}
//                   >
//                     {avatarList.map((src, i) => (
//                       <div
//                         key={`${src}-${i}`}
//                         className="snap-center flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg"
//                       >
//                         <Image
//                           src={src}
//                           alt={`avatar-${i}`}
//                           width={64}
//                           height={64}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ===== Navigation - Desktop Optimized ===== */}
//       {slides.length > 1 && (
//         <>
//           {/* Previous button - Larger */}
//           <button
//             onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
//             className="absolute left-8 top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-white/80 hover:bg-white backdrop-blur border-2 border-white/70 grid place-items-center transition-all duration-300 hover:scale-110 shadow-2xl"
//             aria-label="Previous slide"
//           >
//             <span className="text-4xl font-light text-gray-700">‹</span>
//           </button>

//           {/* Next button - Larger */}
//           <button
//             onClick={() => setIndex((i) => (i + 1) % slides.length)}
//             className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-white/80 hover:bg-white backdrop-blur border-2 border-white/70 grid place-items-center transition-all duration-300 hover:scale-110 shadow-2xl"
//             aria-label="Next slide"
//           >
//             <span className="text-4xl font-light text-gray-700">›</span>
//           </button>

//           {/* dots - Larger */}
//           <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex gap-4">
//             {slides.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setIndex(i)}
//                 aria-label={`Go to slide ${i + 1}`}
//                 className={`rounded-full transition-all duration-300 ${
//                   i === index 
//                     ? 'w-12 h-3 bg-gray-900' 
//                     : 'w-3 h-3 bg-gray-400/50 hover:bg-gray-500'
//                 }`}
//               />
//             ))}
//           </div>
//         </>
//       )}
//     </section>
//   );
// };

// export default BannerSlider;
















'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

interface BannerSliderProps {
  className?: string;
  autoplay?: boolean;
  intervalMs?: number;
}

type Slide = {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  content: string;
  cta: string;
  textPosition?: 'left' | 'right';
  mainImg: string;
  smallCardImg?: string;
  avatars?: string[];
  butterflyImg?: string;
  starImg?: string;
  likeImg?: string;
};

const AVATAR_VISIBLE = 4;

const BannerSlider: React.FC<BannerSliderProps> = ({
  className,
  autoplay = true,
  intervalMs = 50000,
}) => {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // inertia wheel
  const wheelVel = useRef(0);
  const rafId = useRef<number | null>(null);

  // drag-to-scroll helpers
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  // slides
  const slides: Slide[] = [
    {
      id: 1,
      title: "Trendy Collection's",
      subtitle: 'Freshen Up',
      description: 'Your Look Style',
      content:
        'Lorem ipsum dolor sit amet, consectetue adipiscin elit roni dis Aenean comodo ligula eget dolor, aenean ena masa suma soc Lorem ipsum dolor sit amet.',
      cta: 'Shop Now',
      textPosition: 'left',
      mainImg: '/assets/s2.webp',
      avatars: ['/assets/baby.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg'],
    },
    {
      id: 2,
      title: "Trendy Collection's",
      subtitle: 'Freshen Up',
      description: 'Your Look Style',
      content:
        'Lorem ipsum dolor sit amet, consectetue adipiscin elit roni dis Aenean comodo ligula eget dolor, aenean ena masa suma soc Lorem ipsum dolor sit amet.',
      cta: 'Shop Now',
      textPosition: 'left',
      mainImg: '/assets/s3.webp',
      avatars: ['/assets/baby.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg'],
    },
  ];

  const slide = slides[index];

  // ===== Avatar mini-slider state =====
  const [avatarIndex, setAvatarIndex] = useState(0);
  const avatarList = slide.avatars ?? [];

  // slide বদলালে avatarIndex reset করে দেই
  useEffect(() => {
    setAvatarIndex(0);
  }, [index]);

  const visibleAvatars = useMemo(
    () =>
      Array.from(
        { length: Math.min(AVATAR_VISIBLE, avatarList.length) },
        (_, k) => avatarList[(avatarIndex + k) % avatarList.length]
      ),
    [avatarIndex, avatarList]
  );

  // auto-play avatars (optional)
  useEffect(() => {
    if (avatarList.length <= AVATAR_VISIBLE) return;
    const t = setInterval(() => {
      setAvatarIndex((i) => (i + 1) % avatarList.length);
    }, 2000);
    return () => clearInterval(t);
  }, [avatarList.length]);

  // autoplay slides
  useEffect(() => {
    if (!autoplay || slides.length < 2) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      intervalMs
    );
    return () => clearInterval(t);
  }, [autoplay, intervalMs, slides.length]);

  // rAF animator
  const animateWheel = () => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollLeft += wheelVel.current;
    wheelVel.current *= 0.92;

    if (Math.abs(wheelVel.current) < 0.15) {
      wheelVel.current = 0;
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      return;
    }

    rafId.current = requestAnimationFrame(animateWheel);
  };

  // wheel -> horizontal inertia
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
      e.preventDefault();
      wheelVel.current += e.deltaY * 0.12;
    } else {
      wheelVel.current += e.deltaX * 0.12;
    }

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(animateWheel);
    }
  };

  // আনমাউন্টে rAF ক্লিনআপ
  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // drag-to-scroll
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    isDragging.current = true;
    startX.current = e.clientX;
    startScrollLeft.current = el.scrollLeft;
    el.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const el = e.currentTarget;
    const dx = e.clientX - startX.current;
    el.scrollLeft = startScrollLeft.current - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

 return (
    <section className={`relative overflow-hidden bg-white ${className || ''}`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Mobile-optimized wrapper */}
        <div className="relative min-h-[500px] lg:min-h-[800px] grid grid-cols-1 lg:grid-cols-2 items-center gap-6 lg:gap-16 py-32 lg:py-20">

          {/* ========= Left Text ========= */}
          <div
            className={`relative order-2 lg:order-1 ${
              slide.textPosition === 'left' ? '' : 'lg:col-start-2'
            }`}
          >
            {/* Mobile backdrop circle */}
            <div className="absolute -z-10 -top-10 -left-10 w-48 h-48 lg:w-96 lg:h-96 bg-pink-100 rounded-full blur-xl lg:blur-3xl opacity-70" />

            {/* small label - MOBILE: Hidden */}
            <p className="hidden lg:block text-lg font-semibold text-gray-800 mb-4 tracking-wider">
              {slide.title}
            </p>

            {/* Headline - Mobile Optimized */}
            <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
              {slide.subtitle ? (
                <h1 className="text-[32px] sm:text-[40px] lg:text-[72px] xl:text-[80px] font-black text-[#0d1b3e] leading-[1.1] lg:leading-[1.05]">
                  {slide.subtitle}
                </h1>
              ) : null}

              {slide.description ? (
                <h2 className="text-[28px] sm:text-[36px] lg:text-[64px] xl:text-[76px] font-black text-[#0d1b3e]/95 leading-[1.1] lg:leading-[1.05]">
                  {slide.description}
                </h2>
              ) : null}
            </div>

            {/* body - MOBILE: Shorter text */}
            <p className="text-gray-500 leading-relaxed text-sm sm:text-base lg:text-lg max-w-xl lg:max-w-2xl mb-4 lg:mb-8 line-clamp-3 lg:line-clamp-none">
              {slide.content}
            </p>

            {/* CTA - Mobile Optimized */}
            <button className="inline-flex items-center gap-2 lg:gap-3 px-6 lg:px-10 py-3 lg:py-4 rounded-full bg-[#7f56d9] text-white font-semibold lg:font-bold text-base lg:text-lg shadow-lg lg:shadow-2xl hover:shadow-xl lg:hover:shadow-3xl transition-all duration-300 hover:-translate-y-0.5 lg:hover:-translate-y-1 hover:scale-105">
              {slide.cta}
              <span className="inline-block text-xl lg:text-2xl">➤</span>
            </button>

            {/* Horizontal line - MOBILE: Hidden */}
            <div className="hidden lg:block my-10 w-20 h-1 bg-gray-300 rounded-full" />

            {/* review block - MOBILE: Hidden */}
            <div className="hidden lg:flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-[#f1f5ff] ring-4 ring-white shadow-2xl grid place-items-center text-[#7f56d9] text-3xl flex-shrink-0">
                “
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-2xl mb-3">
                  I Just Our Company !
                </h4>
                <p className="text-gray-500 text-base leading-relaxed max-w-2xl mb-4">
                  But I must explain to you how all this mistaken idea of
                  denouncing pleasure and praising pain was born and I will give
                  you a complete account of the system, and expound the actual
                  teachings of the great explorer of the truth, the master-builder of human happiness.
                </p>
                <div className="text-gray-700 font-semibold text-lg">
                  Web Designer
                </div>
              </div>
            </div>
          </div>

          {/* ========= Right Visual ========= */}
          <div
            className={`relative order-1 lg:order-2 flex justify-center lg:justify-end ${
              slide.textPosition === 'left' ? '' : 'lg:col-start-1'
            }`}
          >
            {/* Colored circles - Mobile Optimized */}
            <div className="absolute -z-10 top-4 right-4 lg:top-10 lg:right-16 w-32 h-32 lg:w-96 lg:h-96 bg-blue-200 rounded-full blur-xl lg:blur-3xl" />
            <div className="absolute -z-10 bottom-4 right-2 lg:bottom-10 lg:right-8 w-40 h-40 lg:w-96 lg:h-96 bg-pink-300 rounded-full blur-xl lg:blur-3xl opacity-90" />
            <div className="absolute -z-10 bottom-24 right-12 lg:bottom-48 lg:right-32 w-24 h-24 lg:w-80 lg:h-80 bg-orange-200 rounded-full blur-xl lg:blur-3xl opacity-80" />

            {/* small stickers - MOBILE: Hidden */}
            {slide.starImg && (
              <Image
                src={slide.starImg}
                alt="star"
                width={80}
                height={80}
                className="hidden lg:block absolute top-40 right-[45%] rotate-3"
              />
            )}
            {slide.butterflyImg && (
              <Image
                src={slide.butterflyImg}
                alt="butterfly"
                width={76}
                height={76}
                className="hidden lg:block absolute -top-8 left-16"
              />
            )}

            {/* main model image - Mobile Optimized */}
            <div className="relative w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[650px]">
              <Image
                src={slide.mainImg}
                alt="model"
                width={650}
                height={800}
                priority
                className="w-full h-auto object-contain"
              />
            </div>

            {/* like bubble - MOBILE: Hidden */}
            {slide.likeImg && (
              <div className="hidden lg:flex absolute bottom-48 left-12 bg-white/90 backdrop-blur-md border-2 border-white/80 rounded-full w-20 h-20 grid place-items-center shadow-2xl">
                <Image 
                  src={slide.likeImg} 
                  alt="like" 
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </div>
            )}

            {/* bottom-right small framed card - MOBILE: Hidden */}
            {slide.smallCardImg && (
              <div className="hidden lg:block absolute bottom-8 right-12 bg-white p-4 rounded-3xl shadow-3xl">
                <div className="relative w-48 h-60">
                  <Image
                    src={slide.smallCardImg}
                    alt="small"
                    fill
                    className="rounded-2xl object-cover"
                  />
                </div>
                {/* heart bubble */}
                <div className="absolute -right-3 -top-3 w-12 h-12 rounded-full bg-white shadow-2xl grid place-items-center text-red-500 text-xl">
                  ♥
                </div>
              </div>
            )}

            {/* bottom-left avatars row - MOBILE: Hidden */}
            {avatarList.length > 0 && (
  <>
    {/* Desktop Avatar Slider - Unchanged */}
    <div className="hidden lg:block absolute -bottom-6 left-8">
      <div className="relative bg-white rounded-full shadow-xl w-[400px] h-[80px] flex items-center">
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="
            mx-12
            overflow-x-auto overflow-y-hidden
            no-scrollbar
            flex items-center gap-4
            snap-x snap-proximity
            overscroll-x-contain
            cursor-grab active:cursor-grabbing
            touch-pan-x select-none
          "
          style={{ scrollbarWidth: 'none' }}
        >
          {avatarList.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="snap-center flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg"
            >
              <Image
                src={src}
                alt={`avatar-${i}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Mobile Avatar Slider - Image এর মতো */}
    <div className="lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2">
      <div className="relative bg-white/95 backdrop-blur-md rounded-full shadow-lg w-[220px] h-[60px] flex items-center px-4 mr-16">
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="
            w-full
            overflow-x-auto overflow-y-hidden
            no-scrollbar
            flex items-center gap-3
            snap-x snap-mandatory
            overscroll-x-contain
            cursor-grab active:cursor-grabbing
            touch-pan-x select-none
          "
          style={{ scrollbarWidth: 'none' }}
        >
          {avatarList.slice(0, 6).map((src, i) => (
            <div
              key={`${src}-${i}-mobile`}
              className="snap-center flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md"
            >
              <Image
                src={src}
                alt={`avatar-${i}`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        
        
      </div>
    </div>
  </>
)}
          </div>
        </div>
      </div>

      {/* ===== Navigation - Mobile Optimized ===== */}
      {slides.length > 1 && (
        <>
          {/* Previous button - MOBILE: Hidden */}
          <button
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-white/80 hover:bg-white backdrop-blur border-2 border-white/70 grid place-items-center transition-all duration-300 hover:scale-110 shadow-2xl"
            aria-label="Previous slide"
          >
            <span className="text-4xl font-light text-gray-700">‹</span>
          </button>

          {/* Next button - MOBILE: Hidden */}
          <button
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-white/80 hover:bg-white backdrop-blur border-2 border-white/70 grid place-items-center transition-all duration-300 hover:scale-110 shadow-2xl"
            aria-label="Next slide"
          >
            <span className="text-4xl font-light text-gray-700">›</span>
          </button>

          {/* dots - MOBILE: Hidden */}
          <div className="hidden lg:flex absolute bottom-12 left-1/2 -translate-x-1/2 z-10 gap-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === index 
                    ? 'w-12 h-3 bg-gray-900' 
                    : 'w-3 h-3 bg-gray-400/50 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default BannerSlider;