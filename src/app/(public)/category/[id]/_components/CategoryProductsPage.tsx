'use client'

import { useMemo } from 'react'
import { Product } from '@/types/product'
import { useParams } from 'next/navigation'
import ProductCard from '@/components/ui/organisms/product-card'
import { Button } from '@/components/ui/atoms/button'
import Link from 'next/link'
import { FiArrowRight, FiPackage, FiGrid } from 'react-icons/fi'
import Image from 'next/image'


interface Props {
    initialProducts: Product[]
}

export default function CategoryProductsPage({ initialProducts }: Props) {
    const params = useParams()
    const category = decodeURIComponent(params.id as string)


    const filtered = useMemo(() => {
        const match = (p: Product, name: string) =>
            p.sub_category?.some(
                c =>
                    c.name.toLowerCase() === name.toLowerCase() ||
                    ('path' in c && typeof c.path === 'string' && c.path.toLowerCase().includes(name.toLowerCase()))
            )
        return initialProducts.filter(p => match(p, category))
    }, [initialProducts, category])

    return (
        <div className="min-h-screen bg-[#FFEBF0] dark:bg-gray-800 md:mt-10 ">
            <div className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary -top-2">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-red-800 to-primary" />
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 100 }).map((_, i) => {
                        const size = Math.random() * 14 + 12
                        const left = Math.random() * 100
                        const duration = Math.random() * 20 + 20
                        const delay = Math.random() * 10
                        return (
                            <span
                                key={i}
                                className="snowflake"
                                style={{
                                    left: `${left}%`,
                                    fontSize: `${size}px`,
                                    animationDuration: `${duration}s`,
                                    animationDelay: `${delay}s`,
                                }}
                            >
                                *
                            </span>
                        )
                    })}
                </div>


                <div className="relative md:py-6 py-2 mx-auto max-w-7xl text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-1 md:mb-4 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
                        <FiGrid className="w-4 h-4" />
                        Category Collection
                    </div>
                    <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-white mb-1 md:mb-4 animate-fade-in capitalize">
                        {category}
                    </h1>
                    <p className="text-sm md:text-xl text-white/90 md:mb-4 mb-1 max-w-2xl mx-auto">
                        Discover our curated collection of premium products
                    </p>
                    <div className="flex items-center justify-center gap-4 text-white/80">
                        <div className="flex items-center gap-2">
                            <FiPackage className="w-5 h-5" />
                            <span className="md:text-lg text-sm font-semibold">
                                {filtered.length} Product{filtered.length !== 1 && 's'}
                            </span>
                        </div>
                        <div className="w-2 h-2 bg-white/50 rounded-full" />
                        <span className="text-sm">Premium Quality</span>
                    </div>
                </div>
            </div>

            {/* Main Content  */}
            <div className="max-w-7xl mx-auto md:py-4 md:px-2 py-1">
                {filtered.length === 0 ? (
                    /* No Products  */
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6">
                            <FiPackage className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                            No Products Found
                        </h3>
                        <p className="text-gray-600 mb-1">
                            We couldn&apos;t find any products in this category.
                        </p>
                        <p className="text-sm text-gray-500">
                            Searched through {initialProducts.length} products.
                        </p>
                    </div>
                ) : (
                    <>


                        {/* Products Grid  */}


                        <div className="py-2 text-3xl text-center "><div className="inline-flex gap-2 items-center mb-3"><p className="text-gray-500"> <span className="text-gray-700 font-medium"></span></p><p className="w-8 sm:w-12 h-0.5 bg-gray-700"></p></div></div>
                        <div className="grid   max-[345px]:grid-cols-1    grid-cols-2  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-2 sm:gap-2 md:gap-4 w-full max-w-[1600px] mx-auto px-2 sm:px-4">

                            {filtered.map((product, idx) => (
                                <div
                                    key={product._id}
                                    className="animate-fade-in-up"
                                    style={{
                                        animationDelay: `${idx * 0.1}s`,
                                        animationFillMode: 'both',
                                    }}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </>
                )}




            </div>
        </div>
    )
}
