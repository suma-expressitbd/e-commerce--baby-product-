'use client';
import React from 'react';
import { motion } from 'framer-motion';
import SkeletonComponent from './SkeletonComponent';

const ProductTabsSkeleton: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="mt-6"
        >
            <div className="flex gap-4 mb-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonComponent key={index} type="text" width="w-24" height="h-8" />
                ))}
            </div>
            <SkeletonComponent type="text" width="w-full" height="h-32" />
        </motion.div>
    );
};

export default ProductTabsSkeleton;