// src/components/NewProducts.tsx
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, Autoplay } from 'swiper/modules';
import { Swiper as SwiperType } from 'swiper';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import ProductCard from './ui/organisms/product-card';
import { Product } from '@/types/product';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import 'swiper/css/autoplay';
import Link from 'next/link';
import ProductCard1 from './ui/organisms/product-card1';
import { BiSolidLeftArrow, BiSolidRightArrow } from 'react-icons/bi';
import { PiDressFill } from 'react-icons/pi';

interface NewProductsSlideProps {
    initialProducts: Product[];
    className?: string;
    autoplay?: boolean | { delay: number };
}

const isDev = process.env.NODE_ENV === 'development';

const ChevronLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

export default function NewProductsSlide({
    initialProducts,
    className = '',
    autoplay = { delay: 3000 },
}: NewProductsSlideProps) {
    const componentId = useMemo(
        () => `new-products-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        []
    );
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
    const [showNavButtons, setShowNavButtons] = useState({ prev: false, next: false });
    const [isHovered, setIsHovered] = useState(false);
    const [isAutoplay, setIsAutoplay] = useState(!!autoplay);

    const newProducts = useMemo(() => {
        const filtered = initialProducts.filter((product) =>
            product.variantsId?.some((variant) => variant.condition?.toLowerCase() === 'new')
        );
        if (isDev) console.log('Filtered new products:', filtered);
        return filtered;
    }, [initialProducts]);

    // ✅ ফিক্স: debounce কে useMemo এ রাখো, useCallback নয়
    const checkNavButtons = useMemo(() => {
        const updateButtons = () => {
            if (swiperInstance) {
                setShowNavButtons({
                    prev: !swiperInstance.isBeginning,
                    next: !swiperInstance.isEnd,
                });
            }
        };
        return debounce(updateButtons, 200);
    }, [swiperInstance]);

    const handlePrevClick = useCallback(() => {
        swiperInstance?.slidePrev();
    }, [swiperInstance]);

    const handleNextClick = useCallback(() => {
        swiperInstance?.slideNext();
    }, [swiperInstance]);

    // ✅ ফিক্স: cleanup যোগ করা হয়েছে
    useEffect(() => {
        return () => {
            checkNavButtons.cancel();
        };
    }, [checkNavButtons]);

    // ✅ ফিক্স: autoplay এবং nav update
    useEffect(() => {
        if (swiperInstance && autoplay && !isAutoplay) {
            swiperInstance.autoplay.start();
            setIsAutoplay(true);
        }
        checkNavButtons();
    }, [swiperInstance, autoplay, isAutoplay, checkNavButtons]);

    useEffect(() => {
        if (swiperInstance) {
            swiperInstance.update();
            checkNavButtons();
        }
    }, [newProducts, swiperInstance, checkNavButtons]);

    useEffect(() => {
        const handleResize = () => {
            if (swiperInstance) {
                swiperInstance.update();
                checkNavButtons();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [swiperInstance, checkNavButtons]);

    return (
        <motion.section
            className={`relative overflow-hidden ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-green-50/30 via-transparent to-green-50/20 dark:from-green-900/10 dark:via-transparent dark:to-green-900/5 pointer-events-none" />
            <div className="container mx-auto">{/* ⬅️ UPDATED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">{/* ⬅️ UPDATED */}
        <div className="col-span-12 relative md:px-4 py-6 sm:py-8 md:py-10 lg:py-12">{/* ⬅️ UPDATED */}

                <motion.div
                    className="relative mb-8 md:mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="">

                        
                       <motion.div
  className="relative   mt-0 md:mt-8 mb-8 md:mb-12"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
>
  {/* পুরো হেডারকে center align */}
  <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center">
    <motion.h2
      className="flex items-center gap-2 text-[28px] sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B2A4B]"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <span>New Products</span>
      <PiDressFill className="w-6 h-6 sm:w-7 sm:h-7 text-gradient-to-tr from-[#9B77DC] via-[#D090CD] to-[#DF8BB0]  " />
    </motion.h2>

    <motion.p
      className="mt-2 text-xs sm:text-sm md:text-base text-slate-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      Our Colors Matching Your Different Moods.
    </motion.p>

    {/* optional underline */}
    <div className="mt-3 h-[2px] w-24 sm:w-32 rounded-full bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
  </div>
</motion.div>
                       

                       
                    </div>


                </motion.div>
                <div className="relative group">
  {newProducts.length > 0 ? (
    <>
      <Swiper
        modules={[Navigation, FreeMode, Autoplay]}
        spaceBetween={16}
        slidesPerView={1}
        freeMode={{ enabled: true, sticky: false, momentumRatio: 0.25 }}
        autoplay={
          autoplay
            ? {
                delay: typeof autoplay === "object" ? autoplay.delay : 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        navigation={{
          nextEl: `#${componentId}-next`,
          prevEl: `#${componentId}-prev`,
        }}
        onSwiper={(swiper: SwiperType) => {
          if (isDev) console.log("Swiper initialized");
          setSwiperInstance(swiper);
          setTimeout(() => checkNavButtons(), 100);
        }}
        onSlideChange={checkNavButtons}
        breakpoints={{
          0: { slidesPerView: 1.2, spaceBetween: 8, centeredSlides: false },
          320: { slidesPerView: 1.5, spaceBetween: 10, centeredSlides: false },
          480: { slidesPerView: 2, spaceBetween: 12, centeredSlides: false },
          640: { slidesPerView: 2.5, spaceBetween: 14, centeredSlides: false },
          768: { slidesPerView: 3, spaceBetween: 16, centeredSlides: false },
          1024: { slidesPerView: 4, spaceBetween: 18, centeredSlides: false },
          1280: { slidesPerView: 5, spaceBetween: 20, centeredSlides: false },
          1536: { slidesPerView: 5, spaceBetween: 24, centeredSlides: false },
        }}
        className={`${componentId}-swiper pb-24 sm:pb-28 md:pb-32`} // ⬅️ UPDATED (নিচে জায়গা রাখতে)
      >
        <AnimatePresence mode="popLayout">
          {newProducts.map((product, index) => (
            <SwiperSlide key={`${componentId}-product-${product._id}-${index}`}>
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8, y: 30, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -30, rotateY: 15 }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  rotateY: 2,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(index * 0.05, 0.8),
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="w-full h-full"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-pink-400/20 to-pink-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  <ProductCard product={product} isAboveFold={index < 6} />
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </AnimatePresence>
      </Swiper>


      {/* ⬇️ NAV BUTTONS: bottom-center container */}
      <div  className="absolute inset-x-0 bottom-0 translate-y-6 sm:translate-y-8 md:translate-y-10
             flex items-center justify-center gap-3 z-30"
> {/* ⬅️ UPDATED */}
        <AnimatePresence>
          {showNavButtons.prev && (
            <motion.div
            key="prev"  
              id={`${componentId}-prev`} // Swiper nav target অপরিবর্তিত
              onClick={handlePrevClick}
              initial={{ opacity: 0, y: 10, scale: 0.9 }} // ⬅️ UPDATED
              animate={{ opacity: 1, y: 0, scale: 1 }}     // ⬅️ UPDATED
              exit={{ opacity: 0, y: 10, scale: 0.9 }}     // ⬅️ UPDATED
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="group/nav cursor-pointer select-none"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/95 dark:bg-gray-800/95 border border-gray-200/60 dark:border-gray-700/60 shadow-md hover:shadow-lg transition">
              <BiSolidLeftArrow className="w-4 h-4 text-gray-700 dark:text-gray-200" />
              </div>
            </motion.div>
          )}

          {showNavButtons.next && (
            <motion.div
            key="next"  
              id={`${componentId}-next`} // Swiper nav target অপরিবর্তিত
              onClick={handleNextClick}
              initial={{ opacity: 0, y: 10, scale: 0.9 }} // ⬅️ UPDATED
              animate={{ opacity: 1, y: 0, scale: 1 }}     // ⬅️ UPDATED
              exit={{ opacity: 0, y: 10, scale: 0.9 }}     // ⬅️ UPDATED
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="group/nav cursor-pointer select-none"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/95 text-white shadow-md hover:shadow-lg transition"> {/* ⬅️ UPDATED (ডান বাটন সলিড) */}
                  <BiSolidRightArrow className="w-4 h-4 text-gray-700 dark:text-gray-200" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* ⬆️ NAV BUTTONS END */}
    </>
                    ) : (
                        <motion.div
                            className="text-center py-16 md:py-24"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex flex-col items-center gap-6 md:gap-8 max-w-lg mx-auto px-4">
                                <motion.div
                                    className="relative"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-green-500 rounded-full blur-xl opacity-20" />
                                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center border border-gray-200/50 dark:border-gray-600/50">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-10 w-10 md:h-12 md:w-12 text-gray-400 dark:text-gray-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                            />
                                        </svg>
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                        No New Products Yet
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                        We're working on bringing you the latest products.
                                        <br className="hidden sm:block" />
                                        Check back soon for exciting new arrivals!
                                    </p>
                                    <motion.button
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-green-600 hover:from-pink-600 hover:to-green-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span>Explore All Products</span>
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
             </div>{/* col-span-12 */}
      </div>{/* grid */}
    
        </motion.section>
    );
}