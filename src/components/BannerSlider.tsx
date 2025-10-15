











// 'use client';

// import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
// import Image from 'next/image';
// import { IoMdArrowDropleftCircle, IoMdArrowDroprightCircle } from 'react-icons/io';
// import { BiSolidLeftArrow, BiSolidRightArrow } from 'react-icons/bi';

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
//   const desktopScrollRef = useRef<HTMLDivElement | null>(null);
//   const mobileScrollRef = useRef<HTMLDivElement | null>(null);

//   // inertia wheel
//   const wheelVel = useRef(0);
//   const rafId = useRef<number | null>(null);

//   // drag-to-scroll helpers
//   const isDragging = useRef(false);
//   const startX = useRef(0);
//   const startScrollLeft = useRef(0);

//   // State for quote image rotation
//   const [quoteImageIndex, setQuoteImageIndex] = useState(0);

//   // Quote images and reviews for each slide
//   const quoteImages = useMemo(() => [
//     // Slide 1 images and reviews
//     {
//       images: [
//         '/assets/banner.png',
//         '/assets/baby.jpg', 
//         '/assets/baby2.jpg'
//       ],
//       reviews: [
//         {
//           title: 'I Just Our Company !',
//           text: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system.',
//           author: 'Web Designer'
//         },
//         {
//           title: 'Amazing Quality !',
//           text: 'The product quality is exceptional and the service was outstanding. I would definitely recommend this to everyone looking for premium products.',
//           author: 'Fashion Blogger'
//         },
//         {
//           title: 'Best Collection !',
//           text: 'This collection has completely transformed my wardrobe. The styles are trendy and comfortable for everyday wear.',
//           author: 'Style Influencer'
//         }
//       ]
//     },
//     // Slide 2 images and reviews
//     {
//       images: [
//         '/assets/banner.png',
//         '/assets/baby.jpg', 
//         '/assets/baby2.jpg'
//       ],
//       reviews: [
//         {
//           title: 'I Just Our Dream !',
//           text: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system.',
//           author: 'Web Designer'
//         },
//         {
//           title: 'Fantastic Service !',
//           text: 'The customer service team was incredibly helpful and the delivery was faster than expected. Great shopping experience overall.',
//           author: 'Happy Customer'
//         },
//         {
//           title: 'Love The Style !',
//           text: 'The attention to detail in these designs is remarkable. Every piece feels unique and special in its own way.',
//           author: 'Fashion Enthusiast'
//         }
//       ]
//     }
//   ], []);


//  // Current slide's quote images and reviews
//   const currentSlideData = quoteImages[index] || quoteImages[0];
//   const currentQuoteImages = currentSlideData.images;
//   const currentReviews = currentSlideData.reviews;

//   // Auto rotate quote images and reviews every 3 seconds
//   useEffect(() => {
//     if (currentQuoteImages.length <= 1) return;
    
//     const interval = setInterval(() => {
//       setQuoteImageIndex((prev) => (prev + 1) % currentQuoteImages.length);
//     }, 3000);
    
//     return () => clearInterval(interval);
//   }, [currentQuoteImages.length, index]);

//   // Reset quote image index when slide changes
//   useEffect(() => {
//     setQuoteImageIndex(0);
//   }, [index]);

//   // slides
//   const slides: Slide[] = useMemo(() => [
//     {
//       id: 1,
//       title: "Trendy Collection's",
//       subtitle: 'Freshen up',
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
//   ], []);

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

//   // auto-play avatars every 3 seconds
//   useEffect(() => {
//     if (avatarList.length <= AVATAR_VISIBLE) return;
//     const t = setInterval(() => {
//       setAvatarIndex((i) => (i + 1) % avatarList.length);
//     }, 3000);
//     return () => clearInterval(t);
//   }, [avatarList.length]);

//   // Auto scroll desktop avatar container every 3 seconds
//   useEffect(() => {
//     const el = desktopScrollRef.current;
//     if (!el || avatarList.length <= 6) return;

//     const interval = setInterval(() => {
//       if (el) {
//         const scrollAmount = 80; // Avatar width (64px) + gap (16px)
//         const maxScroll = el.scrollWidth - el.clientWidth;
        
//         if (el.scrollLeft >= maxScroll - 10) {
//           // Reset to start when reaching the end
//           el.scrollLeft = 0;
//         } else {
//           // Scroll to next avatar
//           el.scrollLeft += scrollAmount;
//         }
//       }
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [avatarList.length, index]); // Added index dependency

//   // Auto scroll mobile avatar container every 3 seconds
//   useEffect(() => {
//     const el = mobileScrollRef.current;
//     if (!el || avatarList.length <= 6) return;

//     const interval = setInterval(() => {
//       if (el) {
//         const scrollAmount = 52; // Avatar width (40px) + gap (12px)
//         const maxScroll = el.scrollWidth - el.clientWidth;
        
//         if (el.scrollLeft >= maxScroll - 10) {
//           // Reset to start when reaching the end
//           el.scrollLeft = 0;
//         } else {
//           // Scroll to next avatar
//           el.scrollLeft += scrollAmount;
//         }
//       }
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [avatarList.length, index]); // Added index dependency

//   // autoplay slides
//   useEffect(() => {
//     if (!autoplay || slides.length < 2) return;
    
//     const t = setInterval(
//       () => setIndex((i) => (i + 1) % slides.length),
//       intervalMs
//     );
    
//     return () => clearInterval(t);
//   }, [autoplay, intervalMs, slides.length, index]);

//   // rAF animator for desktop
//   const animateWheel = () => {
//     const el = desktopScrollRef.current;
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

//   // wheel -> horizontal inertia for desktop
//   const handleDesktopWheel = (e: React.WheelEvent<HTMLDivElement>) => {
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

//   // drag-to-scroll for desktop
//   const onDesktopPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
//     const el = e.currentTarget;
//     isDragging.current = true;
//     startX.current = e.clientX;
//     startScrollLeft.current = el.scrollLeft;
//     el.setPointerCapture?.(e.pointerId);
//   };

//   const onDesktopPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
//     if (!isDragging.current) return;
//     e.preventDefault();
//     const el = e.currentTarget;
//     const dx = e.clientX - startX.current;
//     el.scrollLeft = startScrollLeft.current - dx;
//   };

//   const endDesktopDrag = (e: React.PointerEvent<HTMLDivElement>) => {
//     isDragging.current = false;
//     e.currentTarget.releasePointerCapture?.(e.pointerId);
//   };

//   // drag-to-scroll for mobile
//   const onMobilePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
//     const el = e.currentTarget;
//     isDragging.current = true;
//     startX.current = e.clientX;
//     startScrollLeft.current = el.scrollLeft;
//     el.setPointerCapture?.(e.pointerId);
//   };

//   const onMobilePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
//     if (!isDragging.current) return;
//     e.preventDefault();
//     const el = e.currentTarget;
//     const dx = e.clientX - startX.current;
//     el.scrollLeft = startScrollLeft.current - dx;
//   };

//   const endMobileDrag = (e: React.PointerEvent<HTMLDivElement>) => {
//     isDragging.current = false;
//     e.currentTarget.releasePointerCapture?.(e.pointerId);
//   };

//   return (
//     <section className={`relative overflow-hidden bg-white ${className || ''}`}>
//       <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
//         {/* Mobile-optimized wrapper */}
//         <div className="relative min-h-[500px] lg:min-h-[800px] grid grid-cols-1 lg:grid-cols-2 items-center gap-6 lg:gap-16 py-32 lg:py-20">

//           {/* ========= Left Text ========= */}
//           <div
//             className={`relative order-2 lg:order-1 ${
//               slide.textPosition === 'left' ? '' : 'lg:col-start-2'
//             }`}
//           >
//             {/* Mobile backdrop circle */}
//             <div className="absolute -z-10 -top-10 -left-10 w-48 h-48 lg:w-96 lg:h-96 bg-pink-100 rounded-full blur-xl lg:blur-3xl opacity-70" />

//             {/* small label - MOBILE: Hidden */}
//             <p className="hidden lg:block text-lg font-semibold text-gray-800 mb-4 tracking-wider">
//               {slide.title}
//             </p>

//             {/* Headline - Mobile Optimized */}
//             <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
//               {slide.subtitle ? (
//                 <h1 className="text-[20px] sm:text-[40px] lg:text-[72px] xl:text-[80px]  font-sans font-black text-[#0d1b3e] leading-[1.1] lg:leading-[1.05]">
//                   {slide.subtitle}
//                 </h1>
//               ) : null}

//               {slide.description ? (
//                 <h2 className="text-[20px] sm:text-[36px] lg:text-[64px] xl:text-[76px] font-black text-[#0d1b3e]/95 leading-[1.1] lg:leading-[1.05]">
//                   {slide.description}
//                 </h2>
//               ) : null}
//             </div>

//             {/* body - MOBILE: Shorter text */}
//             <p className="text-gray-500 leading-relaxed text-xs sm:text-base lg:text-lg max-w-xl lg:max-w-2xl mb-4 lg:mb-8 line-clamp-3 lg:line-clamp-none">
//               {slide.content}
//             </p>

//             {/* CTA - Mobile Optimized */}
//             <button className="inline-flex items-center gap-2 lg:gap-3 px-3 lg:px-6 py-1 lg:py-2 rounded-full bg-[#7f56d9] text-white font-normal text-base lg:text-lg shadow-lg lg:shadow-2xl hover:shadow-xl lg:hover:shadow-3xl transition-all duration-300 hover:-translate-y-0.5 lg:hover:-translate-y-1 hover:scale-105">
//               {slide.cta}
//               {/* <span className="inline-block text-xl lg:text-2xl">➤</span> */}

//               <IoMdArrowDroprightCircle className="inline-block text-xl lg:text-2xl" />
//             </button>

//             {/* Horizontal line - MOBILE: Hidden */}
//             {/* <div className="hidden lg:block my-10 w-20 h-1 bg-white rounded-full" /> */}

//             {/* review block */}
//             <div className=" flex items-start gap-6 mt-6 md:mt-6">
//               <div className=" w-10 md:w-20  h-10 md:h-20 rounded-full bg-[#f1f5ff] ring-4 ring-white shadow-2xl grid place-items-center overflow-hidden flex-shrink-0">
//                 <Image
//                   src={currentQuoteImages[quoteImageIndex]}
//                   alt="Customer quote"
//                   width={80}
//                   height={80}
//                   className="w-full h-full object-cover"
//                   priority
//                 />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h4 className="font-bold text-gray-800  text-xl md:text-2xl mb-3">
//                    {currentReviews[quoteImageIndex]?.title}
//                 </h4>
//                 <p className="text-gray-500 text-base leading-relaxed max-w-2xl mb-4">
//                   {currentReviews[quoteImageIndex]?.text}
//                 </p>
//                 <div className="text-gray-700 font-semibold text-lg">
//                    {currentReviews[quoteImageIndex]?.author}
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
//             {/* Colored circles - Mobile Optimized */}
//             <div className="absolute -z-10 top-4 right-4 lg:top-10 lg:right-16 w-32 h-32 lg:w-96 lg:h-96 bg-blue-200 rounded-full blur-xl lg:blur-3xl" />
//             <div className="absolute -z-10 bottom-4 right-2 lg:bottom-10 lg:right-8 w-40 h-40 lg:w-96 lg:h-96 bg-pink-300 rounded-full blur-xl lg:blur-3xl opacity-90" />
//             <div className="absolute -z-10 bottom-24 right-12 lg:bottom-48 lg:right-32 w-24 h-24 lg:w-80 lg:h-80 bg-orange-200 rounded-full blur-xl lg:blur-3xl opacity-80" />

//             {/* small stickers - MOBILE: Hidden */}
//             {slide.starImg && (
//               <Image
//                 src={slide.starImg}
//                 alt="star"
//                 width={80}
//                 height={80}
//                 className="hidden lg:block absolute top-40 right-[45%] rotate-3"
//               />
//             )}
//             {slide.butterflyImg && (
//               <Image
//                 src={slide.butterflyImg}
//                 alt="butterfly"
//                 width={76}
//                 height={76}
//                 className="hidden lg:block absolute -top-8 left-16"
//               />
//             )}

//             {/* main model image - Mobile Optimized */}
//             <div className="relative w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[650px]">
//               <Image
//                 src={slide.mainImg}
//                 alt="model"
//                 width={650}
//                 height={800}
//                 priority
//                 className="w-full h-auto object-contain"
//               />
//             </div>

//             {/* like bubble - MOBILE: Hidden */}
//             {slide.likeImg && (
//               <div className="hidden lg:flex absolute bottom-48 left-12 bg-white/90 backdrop-blur-md border-2 border-white/80 rounded-full w-20 h-20 grid place-items-center shadow-2xl">
//                 <Image 
//                   src={slide.likeImg} 
//                   alt="like" 
//                   width={32}
//                   height={32}
//                   className="w-8 h-8"
//                 />
//               </div>
//             )}

//             {/* bottom-right small framed card - MOBILE: Hidden */}
//             {slide.smallCardImg && (
//               <div className="hidden lg:block absolute bottom-8 right-12 bg-white p-4 rounded-3xl shadow-3xl">
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

//             {/* bottom-left avatars row */}
//             {avatarList.length > 0 && (
//               <>
//                 {/* Desktop Avatar Slider */}
//                 <div className="hidden lg:block absolute -bottom-6 left-8">
//                   <div className="relative bg-white rounded-full shadow-xl w-[400px] h-[80px] flex items-center">
//                     <div
//                       ref={desktopScrollRef}
//                       onWheel={handleDesktopWheel}
//                       onPointerDown={onDesktopPointerDown}
//                       onPointerMove={onDesktopPointerMove}
//                       onPointerUp={endDesktopDrag}
//                       onPointerCancel={endDesktopDrag}
//                       className="
//                         mx-12
//                         overflow-x-auto overflow-y-hidden
//                         no-scrollbar
//                         flex items-center gap-4
//                         snap-x snap-proximity
//                         overscroll-x-contain
//                         cursor-grab active:cursor-grabbing
//                         touch-pan-x select-none
//                       "
//                       style={{ scrollbarWidth: 'none' }}
//                     >
//                       {avatarList.map((src, i) => (
//                         <div
//                           key={`${src}-${i}`}
//                           className="snap-center flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg"
//                         >
//                           <Image
//                             src={src}
//                             alt={`avatar-${i}`}
//                             width={64}
//                             height={64}
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Mobile Avatar Slider */}
//                 <div className="lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2">
//                   <div className="relative bg-white/95 backdrop-blur-md rounded-full shadow-lg w-[220px] h-[60px] flex items-center px-4 mr-16">
//                     <div
//                       ref={mobileScrollRef}
//                       onPointerDown={onMobilePointerDown}
//                       onPointerMove={onMobilePointerMove}
//                       onPointerUp={endMobileDrag}
//                       onPointerCancel={endMobileDrag}
//                       className="
//                         w-full
//                         overflow-x-auto overflow-y-hidden
//                         no-scrollbar
//                         flex items-center gap-3
//                         snap-x snap-mandatory
//                         overscroll-x-contain
//                         cursor-grab active:cursor-grabbing
//                         touch-pan-x select-none
//                       "
//                       style={{ scrollbarWidth: 'none' }}
//                     >
//                       {avatarList.slice(0, 6).map((src, i) => (
//                         <div
//                           key={`${src}-${i}-mobile`}
//                           className="snap-center flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md"
//                         >
//                           <Image
//                             src={src}
//                             alt={`avatar-${i}`}
//                             width={40}
//                             height={40}
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>


//       {/* ===== Navigation - Bottom Right Corner ===== */}
// {slides.length > 1 && (
//   <>
//     {/* Navigation Container - Bottom Right */}
//     <div className="absolute bottom-8  right-4 md:right-8 z-10 flex items-center gap-4">
      
//       {/* Previous button */}
//       <button
//         onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
//         className="w-9 h-9 rounded-full bg-white/90 hover:bg-white backdrop-blur border border-gray-200 grid place-items-center transition-all duration-300 hover:scale-110 shadow-lg"
//         aria-label="Previous slide"
//       >
//         {/* <span className="text-2xl font-light text-gray-700">‹</span> */}
//      <BiSolidLeftArrow   className=" w-4 h-4 text-2xl font-light text-gray-700" />
//       </button>

//       {/* Next button */}
//       <button
//         onClick={() => setIndex((i) => (i + 1) % slides.length)}
//         className="w-9 h-9 rounded-full bg-white/90 hover:bg-white backdrop-blur border border-gray-200 grid place-items-center transition-all duration-300 hover:scale-110 shadow-lg"
//         aria-label="Next slide"
//       >
//         <BiSolidRightArrow  className=" w-4 h-4 text-2xl font-light text-gray-700" />
//       </button>

//       {/* Dots indicator */}
      
//     </div>
//   </>
// )}
//     </section>
//   );
// };

// export default BannerSlider;







'use client';

import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { IoMdArrowDroprightCircle } from 'react-icons/io';
import { BiSolidLeftArrow, BiSolidRightArrow } from 'react-icons/bi';

interface BannerSliderProps {
  className?: string;
  autoplay?: boolean;
  intervalMs?: number;
}

type Review = {
  title: string;
  text: string;
  author: string;
  image: string;
};

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
  reviews: Review[];
};

const AVATAR_VISIBLE = 4;

const BannerSlider: React.FC<BannerSliderProps> = ({
  className,
  autoplay = true,
  intervalMs = 50000,
}) => {
  const [index, setIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);

  const desktopScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);

  // inertia wheel
  const wheelVel = useRef(0);
  const rafId = useRef<number | null>(null);

  // drag-to-scroll helpers
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  // slides with integrated reviews
  const slides: Slide[] = useMemo(() => [
    {
      id: 1,
      title: "Trendy Collection's",
      subtitle: 'Freshen up',
      description: 'Your Look Style',
      content: 'Lorem ipsum dolor sit amet, consectetue adipiscin elit roni dis Aenean comodo ligula eget dolor, aenean ena masa suma soc Lorem ipsum dolor sit amet.',
      cta: 'Shop Now',
      textPosition: 'left',
      mainImg: '/assets/s2.webp',
      avatars: ['/assets/baby.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg'],
      reviews: [
        {
          title: 'I Just Our Company !',
          text: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system.',
          author: 'Web Designer',
          image: '/assets/banner.png'
        },
        {
          title: 'Amazing Quality !',
          text: 'The product quality is exceptional and the service was outstanding. I would definitely recommend this to everyone looking for premium products.',
          author: 'Fashion Blogger',
          image: '/assets/baby.jpg'
        },
        {
          title: 'Best Collection !',
          text: 'This collection has completely transformed my wardrobe. The styles are trendy and comfortable for everyday wear.',
          author: 'Style Influencer',
          image: '/assets/baby2.jpg'
        }
      ]
    },
    {
      id: 2,
      title: "Trendy Collection's",
      subtitle: 'Freshen Up',
      description: 'Your Look Style',
      content: 'Lorem ipsum dolor sit amet, consectetue adipiscin elit roni dis Aenean comodo ligula eget dolor, aenean ena masa suma soc Lorem ipsum dolor sit amet.',
      cta: 'Shop Now',
      textPosition: 'left',
      mainImg: '/assets/s3.webp',
      avatars: ['/assets/baby.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg', '/assets/baby2.jpg'],
      reviews: [
        {
          title: 'I Just Our Dream !',
          text: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system.',
          author: 'Web Designer',
          image: '/assets/banner.png'
        },
        {
          title: 'Fantastic Service !',
          text: 'The customer service team was incredibly helpful and the delivery was faster than expected. Great shopping experience overall.',
          author: 'Happy Customer',
          image: '/assets/baby.jpg'
        },
        {
          title: 'Love The Style !',
          text: 'The attention to detail in these designs is remarkable. Every piece feels unique and special in its own way.',
          author: 'Fashion Enthusiast',
          image: '/assets/baby2.jpg'
        }
      ]
    },
  ], []);

  const slide = slides[index];
  const currentReview = slide.reviews[reviewIndex];

  // Auto rotate reviews every 3 seconds
  useEffect(() => {
    if (slide.reviews.length <= 1) return;
    
    const interval = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % slide.reviews.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [slide.reviews.length, index]); // Reset when slide changes

  // Reset review index when slide changes
  useEffect(() => {
    setReviewIndex(0);
  }, [index]);

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

  // auto-play avatars every 3 seconds
  useEffect(() => {
    if (avatarList.length <= AVATAR_VISIBLE) return;
    const t = setInterval(() => {
      setAvatarIndex((i) => (i + 1) % avatarList.length);
    }, 3000);
    return () => clearInterval(t);
  }, [avatarList.length]);

  // Auto scroll desktop avatar container every 3 seconds
  useEffect(() => {
    const el = desktopScrollRef.current;
    if (!el || avatarList.length <= 6) return;

    const interval = setInterval(() => {
      if (el) {
        const scrollAmount = 80;
        const maxScroll = el.scrollWidth - el.clientWidth;
        
        if (el.scrollLeft >= maxScroll - 10) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += scrollAmount;
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [avatarList.length, index]);

  // Auto scroll mobile avatar container every 3 seconds
  useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el || avatarList.length <= 6) return;

    const interval = setInterval(() => {
      if (el) {
        const scrollAmount = 52;
        const maxScroll = el.scrollWidth - el.clientWidth;
        
        if (el.scrollLeft >= maxScroll - 10) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += scrollAmount;
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [avatarList.length, index]);

  // autoplay slides
  useEffect(() => {
    if (!autoplay || slides.length < 2) return;
    
    const t = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      intervalMs
    );
    
    return () => clearInterval(t);
  }, [autoplay, intervalMs, slides.length, index]);

  // rAF animator for desktop
  const animateWheel = () => {
    const el = desktopScrollRef.current;
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

  // wheel -> horizontal inertia for desktop
  const handleDesktopWheel = (e: React.WheelEvent<HTMLDivElement>) => {
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

  // drag-to-scroll for desktop
  const onDesktopPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    isDragging.current = true;
    startX.current = e.clientX;
    startScrollLeft.current = el.scrollLeft;
    el.setPointerCapture?.(e.pointerId);
  };

  const onDesktopPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const el = e.currentTarget;
    const dx = e.clientX - startX.current;
    el.scrollLeft = startScrollLeft.current - dx;
  };

  const endDesktopDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  // drag-to-scroll for mobile
  const onMobilePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    isDragging.current = true;
    startX.current = e.clientX;
    startScrollLeft.current = el.scrollLeft;
    el.setPointerCapture?.(e.pointerId);
  };

  const onMobilePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const el = e.currentTarget;
    const dx = e.clientX - startX.current;
    el.scrollLeft = startScrollLeft.current - dx;
  };

  const endMobileDrag = (e: React.PointerEvent<HTMLDivElement>) => {
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
                <h1 className="text-[20px] sm:text-[40px] lg:text-[72px] xl:text-[80px] font-sans font-black text-[#0d1b3e] leading-[1.1] lg:leading-[1.05]">
                  {slide.subtitle}
                </h1>
              ) : null}

              {slide.description ? (
                <h2 className="text-[20px] sm:text-[36px] lg:text-[64px] xl:text-[76px] font-black text-[#0d1b3e]/95 leading-[1.1] lg:leading-[1.05]">
                  {slide.description}
                </h2>
              ) : null}
            </div>

            {/* body - MOBILE: Shorter text */}
            <p className="text-gray-500 leading-relaxed text-xs sm:text-base lg:text-lg max-w-xl lg:max-w-2xl mb-4 lg:mb-8 line-clamp-3 lg:line-clamp-none">
              {slide.content}
            </p>

            {/* CTA - Mobile Optimized */}
            <button className="inline-flex items-center gap-2 lg:gap-3 px-3 lg:px-6 py-1 lg:py-2 rounded-full bg-[#7f56d9] text-white font-normal text-base lg:text-lg shadow-lg lg:shadow-2xl hover:shadow-xl lg:hover:shadow-3xl transition-all duration-300 hover:-translate-y-0.5 lg:hover:-translate-y-1 hover:scale-105">
              {slide.cta}
              <IoMdArrowDroprightCircle className="inline-block text-xl lg:text-2xl" />
            </button>

            {/* Review block */}
            <div className="flex items-start gap-6 mt-6 md:mt-6">
              <div className="w-10 md:w-20 h-10 md:h-20 rounded-full bg-[#f1f5ff] ring-4 ring-white shadow-2xl grid place-items-center overflow-hidden flex-shrink-0">
                <Image
                  src={currentReview.image}
                  alt="Customer quote"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-xl md:text-2xl mb-3">
                  {currentReview.title}
                </h4>
                <p className="text-gray-500 text-base leading-relaxed max-w-2xl mb-4">
                  {currentReview.text}
                </p>
                <div className="text-gray-700 font-semibold text-lg">
                  {currentReview.author}
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

            {/* bottom-left avatars row */}
            {avatarList.length > 0 && (
              <>
                {/* Desktop Avatar Slider */}
                <div className="hidden lg:block absolute -bottom-6 left-8">
                  <div className="relative bg-white rounded-full shadow-xl w-[400px] h-[80px] flex items-center">
                    <div
                      ref={desktopScrollRef}
                      onWheel={handleDesktopWheel}
                      onPointerDown={onDesktopPointerDown}
                      onPointerMove={onDesktopPointerDown}
                      onPointerUp={endDesktopDrag}
                      onPointerCancel={endDesktopDrag}
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

                {/* Mobile Avatar Slider */}
                <div className="lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2">
                  <div className="relative bg-white/95 backdrop-blur-md rounded-full shadow-lg w-[220px] h-[60px] flex items-center px-4 mr-16">
                    <div
                      ref={mobileScrollRef}
                      onPointerDown={onMobilePointerDown}
                      onPointerMove={onMobilePointerMove}
                      onPointerUp={endMobileDrag}
                      onPointerCancel={endMobileDrag}
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

      {/* ===== Navigation - Bottom Right Corner ===== */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 right-4 md:right-8 z-10 flex items-center gap-4">
          <button
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white backdrop-blur border border-gray-200 grid place-items-center transition-all duration-300 hover:scale-110 shadow-lg"
            aria-label="Previous slide"
          >
            <BiSolidLeftArrow className="w-4 h-4 text-2xl font-light text-gray-700" />
          </button>

          <button
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white backdrop-blur border border-gray-200 grid place-items-center transition-all duration-300 hover:scale-110 shadow-lg"
            aria-label="Next slide"
          >
            <BiSolidRightArrow className="w-4 h-4 text-2xl font-light text-gray-700" />
          </button>
        </div>
      )}
    </section>
  );
};

export default BannerSlider;