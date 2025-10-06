"use client";

import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { RiMessengerLine } from "react-icons/ri";
import { motion } from "framer-motion";

export default function Footer() {
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0, 0, 0.58, 1] },
    },
  };

  return (
    <footer className="w-full bg-white dark:bg-black">
      {/* Thin pink top border */}
      <div className="h-0.5 bg-[#ffd6e0]" />

      <div className=" px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: Logo + Text */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start">
            <Link href="/">
              <Image
                src="/assets/logo.webp"
                alt="G'Lore Logo"
                width={240}
                height={60}
                className="w-60"

              />
            </Link>
            <p className="mt-6 text-sm leading-7 text-gray-800 dark:text-gray-200 text-center md:text-left">
              আমাদের কালেকশন আপনাকে দেবে ফ্যাশনের আধুনিকতা এবং এলিগেন্সের একটি নিখুঁত সমন্বয়।
            </p>
          </div>

          {/* Explore More */}
          <div className="md:col-span-3">
            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Explore More</h4>
            <ul className="mt-4 space-y-3 text-gray-800 dark:text-gray-200">
              <li>
                <Link href="/products/new" className="hover:text-pink-600 transition-colors">
                  New Arrivals
                </Link>
              </li>

              <li>
                <Link href="/about" className="hover:text-pink-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-pink-600 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-pink-600 transition-colors">
                  Support
                </Link>
              </li>

            </ul>
          </div>

          {/* Policies */}
          <div className="md:col-span-3">
            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Policies</h4>
            <ul className="mt-4 space-y-3 text-gray-800 dark:text-gray-200">

              <li>
                <Link href="/refund-policy" className="hover:text-pink-600 transition-colors">
                  Return and Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-pink-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link href="/terms-of-service" className="hover:text-pink-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/shipping-info" className="hover:text-pink-600 transition-colors">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Get in Touch</h4>
            <div className="mt-4 space-y-2 text-gray-800 dark:text-gray-200">
              <p>
                মোবাইল নং:{" "}
                <a href="tel:+8801855375963" className="hover:text-pink-600 transition-colors">
                  (+88) 01855-375963
                </a>
              </p>
              <p>
                ইমেইল:{" "}
                <a href="mailto:hello@glore.com" className="hover:text-pink-600 transition-colors">
                  hello@glore.com
                </a>
              </p>
            </div>
            <div className="mt-5 flex items-center gap-4 text-gray-800 dark:text-gray-200">
              <a
                href="https://www.facebook.com/G'Lore/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-pink-600 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebookF size={20} />
              </a>
              <a
                href="https://www.facebook.com/messages/t/414489611749530"
                target="_blank"
                rel="noreferrer"
                className="hover:text-pink-600 transition-colors"
                aria-label="Messenger"
              >
                <RiMessengerLine size={20} />
              </a>
              <a
                href="https://wa.me/+8801907349009"
                target="_blank"
                rel="noreferrer"
                className="hover:text-pink-600 transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row items-center gap-1 text-sm text-gray-800 dark:text-gray-200">
              <p>© 2025 Powered by</p>
              <a href="https://calquick.app" aria-label="Calquick">
                <Image
                  src="https://calquick.app/images/logo/logo.png"
                  alt="CalQuick logo"
                  width={70}
                  height={20}
                  className="w-[70px] dark:hidden"
                />
              </a>
              <a href="https://calquick.app" aria-label="Calquick">
                <Image
                  src="https://calquick.app/images/logo/logo-white.png"
                  alt="CalQuick logo"
                  width={70}
                  height={20}
                  className="w-[70px] hidden dark:block"
                />
              </a>
            </div>
            <div className="flex gap-2 text-sm text-gray-800 dark:text-gray-200">
              <span className="font-semibold">Trade License Number:</span>
              <span>TRAD/DNCC/050278/2022</span>
            </div>
          </div>

          <motion.div
            className="w-full mt-8 border-t border-gray-800 pt-6"
            variants={itemVariants}
          >
            <div className="container mx-auto">
              <a
                href="https://www.sslcommerz.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Image
                  src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-03.png"
                  alt="SSLCommerz Payment Methods"
                  width={1600}
                  height={100}
                  className="w-full"

                />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}