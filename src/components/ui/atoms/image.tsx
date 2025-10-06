/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface ImageProps {
  src: string
  alt: string
  className?: string
  srcSet?: Array<{
    src: string
    width: number
    breakpoint: number
  }>
  sizes?: string
  width?: number | string
  height?: number | string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  loading?: 'eager' | 'lazy'
  decoding?: 'sync' | 'async' | 'auto'
  onClick?: () => void
  role?: string
  tabIndex?: number
  onError?: React.ReactEventHandler<HTMLImageElement>
  fallbackSrc?: string
  onLoad?: React.ReactEventHandler<HTMLImageElement>
  rootMargin?: string
  threshold?: number
  enableIntersectionObserver?: boolean
  fill?: boolean
  placeholder?: 'blur' | undefined
  blurDataURL?: string
  priority?: boolean
  isBlur?: boolean // Added isBlur prop
}

const Image: React.FC<ImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  srcSet,
  sizes,
  rounded = 'none',
  objectFit: propObjectFit = 'cover', // Default to cover for main image
  loading = 'lazy',
  decoding = 'async',
  onClick,
  role,
  tabIndex,
  onError,
  fallbackSrc,
  onLoad,
  rootMargin = '100px',
  threshold = 0.1,
  enableIntersectionObserver = false,
  fill = false,
  placeholder,
  blurDataURL,
  priority = false,
  isBlur = false,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isVisible, setIsVisible] = useState(false)
  const [autoDimensions, setAutoDimensions] = useState<{
    width?: string | number
    height?: string | number
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  }>({ width, height, objectFit: propObjectFit })
  const hasFallback = Boolean(fallbackSrc)
  const containerRef = useRef<HTMLDivElement>(null)

  // Map Next.js props to our implementation
  const fetchPriorityValue = priority ? 'high' : undefined

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false)
    onLoad?.(e)
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false)
    if (hasFallback && currentSrc !== fallbackSrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc)
    } else if (currentSrc !== src) {
      setCurrentSrc(src)
    }
    onError?.(e)
  }

  // Detect image aspect ratio and set dimensions
  useEffect(() => {
    if (width || height || propObjectFit) {
      // If width, height, or objectFit is provided, use them
      setAutoDimensions({ width, height, objectFit: propObjectFit })
      return
    }

    const img = new window.Image()
    img.src = src

    img.onload = () => {
      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight
      const aspectRatio = naturalWidth / naturalHeight

      // Check if the aspect ratio is approximately 9:16 (0.5625)
      const isPortrait916 = Math.abs(aspectRatio - 9 / 16) < 0.05 // Allow small deviation
      const calculatedObjectFit = isPortrait916 ? 'cover' : 'contain'

      // Set width to '100%' for w-full, height auto-calculated based on aspect ratio
      const calculatedHeight = `calc(100% * ${naturalHeight / naturalWidth})`

      setAutoDimensions({
        width: '100%',
        height: calculatedHeight,
        objectFit: calculatedObjectFit,
      })
    }

    img.onerror = () => {
      // Fallback to defaults if image fails to load
      setAutoDimensions({ width: '100%', height: 'auto', objectFit: 'contain' })
    }
  }, [src, width, height, propObjectFit])

  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded]

  const objectFitClass = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  }[autoDimensions.objectFit || 'cover']

  const generatedSrcSet = srcSet
    ?.map((item) => `${item.src} ${item.width}w`)
    .join(', ')

  const generateDefaultSizes = () => {
    if (!srcSet) return '100vw'
    const breakpoints = srcSet
      .map((item) => item.breakpoint)
      .sort((a, b) => a - b)
    const maxBreakpoint = breakpoints[breakpoints.length - 1]
    return `(max-width: ${maxBreakpoint}px) 100vw, ${maxBreakpoint}px`
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick?.()
    }
  }

  useEffect(() => {
    if (!enableIntersectionObserver || loading === 'eager') {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { rootMargin, threshold }
    )

    const currentRef = containerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [enableIntersectionObserver, loading, rootMargin, threshold])

  return (
    <div
      ref={containerRef}
      className={twMerge(
        'relative h-full w-full overflow-hidden', // Added overflow-hidden to contain blurred image
        className,
        onClick && 'cursor-pointer',
        fill ? 'h-full' : ''
      )}

      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={role}
      tabIndex={tabIndex}
    >
      {isBlur && (
        <img
          src={blurDataURL || currentSrc} // Use blurDataURL if provided, else use currentSrc
          alt={`${alt} blurred background`}
          srcSet={hasFallback ? undefined : (currentSrc === src ? undefined : generatedSrcSet)}
          sizes={hasFallback ? undefined : (currentSrc === src ? undefined : sizes || generateDefaultSizes())}
          className={twMerge(
            'absolute inset-0 h-svh w-full blur-lg object-cover z-0', // Absolute positioning, full size, blurred, behind
            roundedClass,
          )}
          style={{
            width: '100%',
            height: '100%',
          }}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriorityValue}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      {isVisible && (
        <img
          src={currentSrc}
          alt={alt}
          srcSet={hasFallback ? undefined : (currentSrc === src ? undefined : generatedSrcSet)}
          sizes={hasFallback ? undefined : (currentSrc === src ? undefined : sizes || generateDefaultSizes())}
          className={twMerge(
            'relative h-auto transition-opacity duration-200', // Relative to ensure it’s above blurred image
            roundedClass,
            objectFitClass,
            isLoading ? 'opacity-0' : 'opacity-100',
            onClick && 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
          style={{
            width: '100%',
            height: '100%',
            ...(autoDimensions.width && !autoDimensions.height ? { height: 'auto' } : {}),
            ...(autoDimensions.height && !autoDimensions.width ? { width: 'auto' } : {}),
          }}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriorityValue}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  )
}

export default Image