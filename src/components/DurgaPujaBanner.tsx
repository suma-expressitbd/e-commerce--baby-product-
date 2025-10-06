// 'use client';

// import Image from 'next/image';
// import React, { useState } from 'react';
// import DurgaPujaBannerSkeleton from './ui/skeleton/DurgaPujaBannerSkeleton';

// interface DurgaPujaBannerProps {
//     className?: string;
//     alt?: string;
// }

// const DurgaPujaBanner: React.FC<DurgaPujaBannerProps> = ({
//     className,
//     alt = "Durga Puja Banner"
// }) => {
//     const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

//     return (
//         <div className={`w-full relative pt-0 md:pt-16 lg:pt-8 ${className || ''}`}>  {/* Removed pt-* paddings to avoid shifting/cropping */}
//             {status === 'loading' && (
//                 <div className="absolute inset-0">
//                     <DurgaPujaBannerSkeleton />
//                 </div>
//             )}
//             {status === 'error' && (
//                 <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
//                     <div className="text-center text-gray-500">
//                         <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
//                         </svg>
//                         <p className="mt-2">Image failed to load</p>
//                     </div>
//                 </div>
//             )}
//             <div className={`${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}>
//                 <Image
//                     src={`https://cloudecalquick.xyz/v2/api/files/upload/images/durgapuja-192373.webp`}
//                     alt={alt}
//                     width={1920}
//                     height={1080}
//                     className="w-full h-auto"
//                     style={{ objectFit: "contain" }}
//                     sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
//                     priority={true}
//                     onLoad={() => setStatus('loaded')}
//                     onError={() => setStatus('error')}
//                 />
//             </div>
//         </div>
//     );
// };

// export default DurgaPujaBanner;





// 'use client';

// import Image from 'next/image';
// import React, { useEffect, useMemo, useState } from 'react';
// import DurgaPujaBannerSkeleton from './ui/skeleton/DurgaPujaBannerSkeleton';

// interface DurgaPujaBannerProps {
//   className?: string;
//   alt?: string;
//   images?: { src: string; alt?: string }[];
//   autoplay?: boolean;
//   intervalMs?: number;
// }

// type LoadState = 'loading' | 'loaded' | 'error';

// const DEFAULT_IMAGES = [
//   { src: "/assets/new-banner1.png", alt: 'Durga Puja 1' },
//   { src: "/assets/new-banner1.png", alt: 'Durga Puja 2' },
//   { src: "/assets/new-banner1.png", alt: 'Durga Puja 3' },
// ];

// const DurgaPujaBanner: React.FC<DurgaPujaBannerProps> = ({
//   className,
//   alt = 'Durga Puja Banner',
//   images = DEFAULT_IMAGES,
//   autoplay = true,
//   intervalMs = 4000,
// }) => {
//   const [status, setStatus] = useState<LoadState>('loading');
//   const [index, setIndex] = useState(0);

//   const slide = images[index] || images[0];

//   // ✅ autoplay
//   useEffect(() => {
//     if (!autoplay || images.length < 2) return;
//     const t = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs);
//     return () => clearInterval(t);
//   }, [autoplay, intervalMs, images.length]);

//   // ✅ index বদলালে status আবার loading
//   useEffect(() => {
//     setStatus('loading');
//   }, [index]);

//   // (optional) প্রিলোড
//   useEffect(() => {
//     const next = images[(index + 1) % images.length];
//     if (!next) return;
//     const i = new window.Image();
//     i.src = next.src;
//   }, [index, images]);

//   const dotAria = useMemo(() => `Slide ${index + 1} of ${images.length}`, [index, images.length]);

//   return (
//     <div className={`w-full relative pt-0 md:pt-16 lg:pt-8 ${className || ''}`}>
//       {status === 'loading' && (
//         <div className="absolute inset-0 pointer-events-none">
//           <DurgaPujaBannerSkeleton />
//         </div>
//       )}
//       {status === 'error' && (
//         <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
//           <div className="text-center text-gray-500">
//             <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
//             </svg>
//             <p className="mt-2">Image failed to load</p>
//           </div>
//         </div>
//       )}

//       {/* ✅ onLoadingComplete ব্যবহার, key আলাদা */}
//       <div className={`${status === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
//         <Image
//           key={`${slide.src}-${index}`}
//           src={slide.src}
//           alt={slide.alt || alt}
//           width={1920}
//           height={1080}
//           className="w-full h-auto"
//           style={{ objectFit: 'contain' }}
//           sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
//           priority={index === 0}
//           // ⬇️ এইটা সবচেয়ে reliable
//           onLoadingComplete={() => setStatus('loaded')}
//           onError={() => setStatus('error')}
//           // যদি external domain কনফিগ না থাকে, uncomment করুন:
//           // unoptimized
//         />
//       </div>

//       {images.length > 1 && (
//         <>
//           <button
//             aria-label="Previous slide"
//             onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
//             className="absolute left-2 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-9 h-9 rounded-full bg-white/85 hover:bg-white shadow dark:bg-black/50"
//           >
//             ‹
//           </button>
//           <button
//             aria-label="Next slide"
//             onClick={() => setIndex((i) => (i + 1) % images.length)}
//             className="absolute right-2 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-9 h-9 rounded-full bg-white/85 hover:bg-white shadow dark:bg-black/50"
//           >
//             ›
//           </button>

//           <div aria-label={dotAria} className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-2">
//             {images.map((_, i) => (
//               <button
//                 key={i}
//                 aria-label={`Go to slide ${i + 1}`}
//                 onClick={() => setIndex(i)}
//                 className={`h-2.5 rounded-full transition-all ${
//                   i === index ? 'w-6 bg-violet-600' : 'w-2.5 bg-white/80 dark:bg-white/40'
//                 }`}
//               />
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default DurgaPujaBanner;





'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import DurgaPujaBannerSkeleton from './ui/skeleton/DurgaPujaBannerSkeleton';

interface DurgaPujaBannerProps {
  className?: string;
  alt?: string;
  images?: { src: string; alt?: string }[];
  autoplay?: boolean;
  intervalMs?: number;
}

type LoadState = 'loading' | 'loaded' | 'error';

const DEFAULT_IMAGES = [
  { src: "/assets/Capture11.png", alt: 'Durga Puja 1' },
  { src: "/assets/durgapuja.png", alt: 'Durga Puja 2' },
  { src: "/assets/new-banner1.png", alt: 'Durga Puja 3' },
];

const DurgaPujaBanner: React.FC<DurgaPujaBannerProps> = ({
  className,
  alt = 'Durga Puja Banner',
  images = DEFAULT_IMAGES,
  autoplay = true,
  intervalMs = 40000,
}) => {
  const [status, setStatus] = useState<LoadState>('loading');
  const [index, setIndex] = useState(0);

  const slide = images[index] || images[0];

  // ✅ autoplay
  useEffect(() => {
    if (!autoplay || images.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(t);
  }, [autoplay, intervalMs, images.length]);

  // ✅ index বদলালে status আবার loading
  useEffect(() => {
    setStatus('loading');
  }, [index]);

  // (optional) প্রিলোড
  useEffect(() => {
    const next = images[(index + 1) % images.length];
    if (!next) return;
    const i = new window.Image();
    i.src = next.src;
  }, [index, images]);

  const dotAria = useMemo(() => `Slide ${index + 1} of ${images.length}`, [index, images.length]);

  return (
    <div className={`w-full relative pt-0 md:pt-16 lg:pt-8  ${className || ''}`}>
      {status === 'loading' && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <DurgaPujaBannerSkeleton />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-20">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <p className="mt-2">Image failed to load</p>
          </div>
        </div>
      )}

      {/* ✅ Full-screen image container */}
      <div className={`relative w-full h-full ${status === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
        <Image
          key={`${slide.src}-${index}`}
          src={slide.src}
          alt={slide.alt || alt}
          width={1920}
                    height={1080}
                    className="w-full h-auto"
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
          priority={index === 0}
          onLoadingComplete={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          // unoptimized={true} // যদি external domain কনফিগ না থাকে
        />
        
        {/* Optional: Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 grid place-items-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
          >
            <span className="text-xl md:text-2xl font-bold">‹</span>
          </button>
          <button
            aria-label="Next slide"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 grid place-items-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
          >
            <span className="text-xl md:text-2xl font-bold">›</span>
          </button>

          {/* Dots indicator */}
          <div aria-label={dotAria} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === index 
                    ? 'w-8 bg-white shadow-lg' 
                    : 'w-3 bg-white/70 hover:bg-white/90'
                } h-3`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DurgaPujaBanner;