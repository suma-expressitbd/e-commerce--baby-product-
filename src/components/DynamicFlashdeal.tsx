/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Navigation,
  Autoplay,
  FreeMode,
  Pagination,
  EffectCoverflow,
} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import { Product } from '@/types/product';
import ProductCard from '@/components/ui/organisms/product-card';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { FlashDealTimeCounter } from './ui/atoms/FlashDealTimeCounter';
import ProductCard1 from './ui/organisms/product-card1';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
const getCategoryName = (p: Product) =>
  p.sub_category?.[0]?.name ?? 'Uncategorised';

const toNumber = (v: string | number | undefined | null) =>
  v === undefined || v === null ? 0 : Number(v);

interface FlashDealsProps {
  initialProducts: Product[];
}

function FlashDeals({ initialProducts }: FlashDealsProps) {
  const router = useRouter();

  /* ───────── State ───────── */
  const [swiper, setSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [sortBy, setSortBy] = useState<'discount' | 'time' | 'price'>('discount');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showExpired, setShowExpired] = useState(false);
  const [dealStats, setDealStats] = useState({
    total: 0,
    active: 0,
    expiring: 0,
  });
  const [isMobile, setIsMobile] = useState(false);

  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const [showNav, setShowNav] = useState({ prev: false, next: false });

  /* ───────── Memoized Functions ───────── */
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const updateVisibleCount = useCallback(() => {
    const w = window.innerWidth;
    if (w >= 1680) {
      setVisibleCount(8);
    } else if (w >= 1280) {
      setVisibleCount(8);
    } else if (w >= 1024) {
      setVisibleCount(8);
    } else if (w >= 640) {
      setVisibleCount(6);
    } else {
      setVisibleCount(4);
    }
  }, []);

  /* ───────── Responsive Handling ───────── */
  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  /* ───────── Derived Data ───────── */
  const { deals, categories } = useMemo(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    let filteredDeals = initialProducts.filter((p) => {
      const v = p.variantsId?.[0];
      const end = v?.discount_end_date;
      const start = v?.discount_start_date;
      const discountPercent = toNumber(v?.discount_percent);

      if (!end || discountPercent <= 0) return false;

      const endTime = new Date(end).getTime();
      const startTime = start ? new Date(start).getTime() : 0;

      const isActive = now >= startTime && now <= endTime;
      const isExpired = now > endTime;

      return showExpired ? isActive || isExpired : isActive;
    });

    if (filterCategory !== 'all') {
      filteredDeals = filteredDeals.filter(
        (p) => getCategoryName(p).toLowerCase() === filterCategory.toLowerCase(),
      );
    }

    filteredDeals.sort((a, b) => {
      const va = a.variantsId?.[0];
      const vb = b.variantsId?.[0];

      switch (sortBy) {
        case 'discount': {
          const da = toNumber(va?.discount_percent);
          const db = toNumber(vb?.discount_percent);
          return db - da;
        }
        case 'time': {
          const ea = new Date(va?.discount_end_date ?? 0).getTime();
          const eb = new Date(vb?.discount_end_date ?? 0).getTime();
          return ea - eb;
        }
        case 'price': {
          const pa = toNumber(va?.offer_price) || toNumber(va?.selling_price) || 0;
          const pb = toNumber(vb?.offer_price) || toNumber(vb?.selling_price) || 0;
          return pa - pb;
        }
        default:
          return 0;
      }
    });

    const uniqueCategories = [...new Set(initialProducts.map(getCategoryName))];

    return { deals: filteredDeals, categories: uniqueCategories };
  }, [initialProducts, filterCategory, sortBy, showExpired]);

  /* ───────── Memoized Functions ───────── */
  const updateNav = useCallback(() => {
    if (!swiper) return;
    setShowNav({ prev: !swiper.isBeginning, next: !swiper.isEnd });
  }, [swiper, deals]);

  const handleMouseEnter = useCallback(() => {
    setIsAutoplayPaused(true);
    swiper?.autoplay?.stop();
  }, [swiper]);

  const handleMouseLeave = useCallback(() => {
    setIsAutoplayPaused(false);
    swiper?.autoplay?.start();
  }, [swiper]);

  const handleShowMore = useCallback(() => setShowAll((v) => !v), []);

  /* ───────── Deal stats ───────── */
  useEffect(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    const stats = initialProducts.reduce(
      (acc, p) => {
        const v = p.variantsId?.[0];
        const discountPercent = toNumber(v?.discount_percent);

        if (!v?.discount_end_date || discountPercent <= 0) return acc;

        const end = new Date(v.discount_end_date).getTime();
        const start = v.discount_start_date
          ? new Date(v.discount_start_date).getTime()
          : 0;

        acc.total += 1;
        if (now >= start && now <= end) {
          acc.active += 1;
          if (end - now <= oneHour) acc.expiring += 1;
        }
        return acc;
      },
      { total: 0, active: 0, expiring: 0 },
    );

    setDealStats(stats);
  }, [initialProducts]);

  /* ───────── Swiper nav visibility ───────── */
  useEffect(updateNav, [updateNav]);

  /* ───────── Hover pause ───────── */

  /* ───────── Discount progress ───────── */
  const getDiscountProgress = (p: Product) => {
    const v = p.variantsId?.[0];
    if (!v?.discount_start_date || !v?.discount_end_date) return 0;

    const now = Date.now();
    const start = new Date(v.discount_start_date).getTime();
    const end = new Date(v.discount_end_date).getTime();
    const total = end - start;
    return Math.max(0, Math.min(100, ((now - start) / total) * 100));
  };

  /* ───────── Visible count ───────── */
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [updateVisibleCount]);

  /* ───────── Random four products ───────── */
  const randomFourProducts = useMemo(() => {
    if (!initialProducts?.length) return [];
    const copy = [...initialProducts];
    copy.sort(() => 0.5 - Math.random());
    return copy.slice(0, 4);
  }, [initialProducts]);

  /* ───────── Show all / visible deals ───────── */
  const [showAll, setShowAll] = useState(false);
  const visibleDeals = showAll ? deals : deals.slice(0, visibleCount);

  /* ───────── JSX ───────── */
  return (
    <div className="py-4 space-y-6 ">
    <section className="group/section py-4 min-h-[720px] md:min-h-[780px] mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 container mx-auto">
          <div className="col-span-12 relative md:px-4">
          {/* <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-12">
              Flash Deals
            </h2>   */}

        <div className="flex flex-col gap-2">
       <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary"> 
        Flash Deals 
       </h2> 
 
      <div>
  <Swiper
    modules={[Navigation, Autoplay, FreeMode, Pagination, EffectCoverflow]}
    spaceBetween={50}
    slidesPerView={'auto'}      // ← পরিবর্তন
    centeredSlides={true}
    navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
    autoplay={!isAutoplayPaused ? { delay: 4000 } : false}
    onSwiper={setSwiper}
    onSlideChange={updateNav}
    className="py-8 overflow-visible h-[720px] md:h-[780px]"

     breakpoints={{
    1024: {
      slidesPerView: 'auto',
      centeredSlides: false,
    },
  }}
  >
    {deals.map((deal) => (
     <SwiperSlide
      key={deal._id}
    
    className="!w-[320px] md:!w-[800px] lg:!w-[800px] !h-full"
    >
  
     <div className="h-full flex">
       <ProductCard1 product={deal} isAboveFold={false} />
     </div>
    </SwiperSlide>
    ))}
  </Swiper>
</div>
</div>

          </div>
        </div>
      </section>


    </div>
  );
}

export default memo(FlashDeals);