"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
    formData: {
        name: string;
        phone: string;
        address: string;
        delivery_area: string;
        note: string;
        paymentMethod: string;
    };
    formErrors: typeof propsDummy["formErrors"];
    insideFee: number;
    subDhakaFee: number;
    outsideFee: number;
    isLoading: boolean;
    handleChange: React.ChangeEventHandler<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >;
    handlePaymentMethodChange: (method: "bkash" | "cashOnDelivery" | "nagad" | "card") => void;
    handleSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
}

const propsDummy = {
    formErrors: {
        name: "",
        phone: "",
        address: "",
        delivery_area: "",
        note: "",
    },
};

const DeliveryInfoForm: React.FC<Props> = ({
    formData,
    formErrors,
    insideFee,
    subDhakaFee,
    outsideFee,
    isLoading,
    handleChange,
    handlePaymentMethodChange,
    handleSubmit,
    onBack,
}) => {
    const [showNote, setShowNote] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);

    return (
        <form onSubmit={handleSubmit} className="w-full bg-white dark:bg-gray-900">
            <div className="inline-flex gap-2 items-center mb-3">
                <p className="text-gray-500 dark:text-white">
                    DELIVERY <span className="text-gray-700 dark:text-white font-medium">INFORMATION</span>
                </p>
                <p className="w-8 sm:w-12 h-0.5 bg-gray-700"></p>
            </div>

            <p className="text-xs text-gray-500 dark:text-white -mt-2 lg:mt-4">
                অর্ডার কনফার্ম করতে আপনার নাম, ঠিকানা, মোবাইল নাম্বার লিখে অর্ডার কনফার্ম করুন।
            </p>

            <div className="md:space-y-6 space-y-2">
                <div>
                    <label
                        htmlFor="name"
                        className="block mt-1 lg:mt-4 md:mb-2 text-sm font-semibold text-black dark:text-white"
                    >
                        আপনার নাম*
                    </label>
                    <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter Full Name"
                        className={`w-full mb-1 px-4 py-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-white ${formErrors.name
                            ? "border-red-300 bg-red-50 focus:border-black"
                            : "border-red-100 focus:border-primary hover:border-gray-300"
                            }`}
                    />
                    {formErrors.name && (
                        <p className=" mt-2 text-red-600 dark:text-primary text-sm flex items-center">
                            {formErrors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="phone"
                        className="block md:mb-2 text-sm font-semibold text-black dark:text-white mt-[-8px] sm:mt-0"
                    >
                        ফোন নাম্বার*
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        pattern="[0-9]*"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter Contact Number"
                        className={`w-full px-4 py-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-white ${formErrors.phone
                            ? "border-red-300 bg-red-50 focus:border-black"
                            : "border-red-100 focus:border-primary hover:border-gray-300"
                            }`}
                    />
                    {formErrors.phone && (
                        <p className="mt-2 text-red-600 dark:text-primary text-sm flex items-center">
                            {formErrors.phone}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="address"
                        className="block md:mb-2 text-sm font-semibold text-black dark:text-white mt-[-6px] sm:mt-0"
                    >
                        ডেলিভারি ঠিকানা*
                    </label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter Delivery Address"
                        rows={2}
                        className={`w-full px-4 py-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-primary resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white ${formErrors.address
                            ? "border-red-300 bg-red-50 focus:border-black"
                            : "border-red-100 focus:border-primary hover:border-gray-300"
                            }`}
                    />
                    {formErrors.address && (
                        <p className="mt-2 text-red-600 dark:text-primary text-sm flex items-center">
                            {formErrors.address}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="delivery_area"
                        className="block md:mb-2 text-sm font-semibold text-black dark:text-white mt-[-8px] sm:mt-0"
                    >
                        ডেলিভারি এলাকা*
                    </label>
                    <select
                        id="delivery_area"
                        name="delivery_area"
                        value={formData.delivery_area}
                        onChange={handleChange}
                        className={`w-full py-2 lg:px-4 lg:py-4 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-primary bg-white text-sm text-gray-800 dark:text-white dark:bg-gray-700 ${formErrors.delivery_area
                            ? "border-red-300 focus:border-black"
                            : "border-red-100 focus:border-primary hover:border-gray-300"
                            }`}
                    >
                        <option value="" disabled hidden>
                            Select Delivery Area
                        </option>
                        <option value="inside_dhaka"> ঢাকার ভিতরে - ৳{insideFee}</option>
                        <option value="sub_dhaka"> সাব-ঢাকা - ৳{subDhakaFee}</option>
                        <option value="outside_dhaka"> ঢাকার বাইরে - ৳{outsideFee}</option>
                    </select>
                    {formErrors.delivery_area && (
                        <p className="mt-2 text-red-600 dark:text-primary text-sm flex items-center">
                            {formErrors.delivery_area}
                        </p>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label
                            htmlFor="note"
                            className="block text-sm font-bold text-black dark:text-white"
                        >
                            গ্রাহক নোট (optional)
                        </label>

                        {/* Show/Hide Button - Visible only on mobile */}
                        <button
                            type="button"
                            onClick={() => setShowNote(!showNote)}
                            className="md:hidden px-3 py-1 text-xs text-black dark:text-white bg-gray-100 dark:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-500"
                        >
                            {showNote ? 'আড়াল করুন' : 'নোট যোগ করুন'}
                        </button>
                    </div>

                    {/* Note field - hidden on mobile by default, shown when button clicked */}
                    <div className={`${isMobile ? (showNote ? 'block' : 'hidden') : 'block'}`}>
                        <textarea
                            id="note"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            placeholder="Enter Your Note"
                            rows={1}
                            className={`w-full px-4 py-2 rounded-xl border transition-all duration-200 focus:outline-none resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white ${formErrors.note
                                ? "border-red-300 bg-red-50 focus:border-black"
                                : "border-red-100 focus:border-black hover:border-gray-300"
                                }`}
                        />
                        {formErrors.note && (
                            <p className="mt-2 text-red-600 text-sm flex items-center">
                                ⚠️ {formErrors.note}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex  flex-col">
                    <p className="mb-2 text-sm text-black dark:text-white font-semibold">
                        Payment Method
                    </p>
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                        {/* Cash on Delivery Option */}
                        <label
                            className={`flex items-center gap-4 px-3 rounded-lg border cursor-pointer ${formData.paymentMethod === "cashOnDelivery"
                                ? "border-red-300 bg-white shadow-sm"
                                : "border-red-100 bg-gray-50"
                                }`}
                            onClick={() => handlePaymentMethodChange("cashOnDelivery")}
                        >
                            <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center aspect-square ${formData.paymentMethod === "cashOnDelivery"
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                    }`}
                            >
                                {formData.paymentMethod === "cashOnDelivery" && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                )}
                            </div>
                            <span className="font-medium text-gray-700 dark:text-white flex items-center justify-center">
                                <Image
                                    src="/assets/cod.png"
                                    alt="cod"
                                    width={60}
                                    height={60}
                                    className="w-20 h-10 object-contain"
                                />
                            </span>
                        </label>

                        {/* bKash Option */}
                        <label
                            className={`flex items-center gap-4 px-3 rounded-lg border cursor-pointer ${formData.paymentMethod === "bkash"
                                ? "border-red-300 bg-white shadow-sm"
                                : "border-red-100 bg-gray-50"
                                }`}
                            onClick={() => handlePaymentMethodChange("bkash")}
                        >
                            <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center aspect-square ${formData.paymentMethod === "bkash"
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                    }`}
                            >
                                {formData.paymentMethod === "bkash" && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                )}
                            </div>
                            <span className="font-medium text-gray-700 dark:text-white flex items-center justify-center">
                                <Image
                                    src="/assets/bkash.png"
                                    alt="bKash"
                                    width={60}
                                    height={60}
                                    className="w-20 h-10 object-contain"
                                />
                            </span>
                        </label>

                        {/* nagad Option */}
                        <label
                            className={`flex items-center gap-4 px-3 rounded-lg border cursor-pointer ${formData.paymentMethod === "nagad"
                                ? "border-red-300 bg-white shadow-sm"
                                : "border-red-100 bg-gray-50"
                                }`}
                            onClick={() => handlePaymentMethodChange("nagad")}
                        >
                            <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center aspect-square ${formData.paymentMethod === "nagad"
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                    }`}
                            >
                                {formData.paymentMethod === "nagad" && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                )}
                            </div>
                            <span className="font-medium text-gray-700 dark:text-white flex items-center justify-center">
                                <Image
                                    src="/assets/nagad.png"
                                    alt="Nagad"
                                    width={60}
                                    height={60}
                                    className="w-20 h-10  object-contain"
                                />
                            </span>
                        </label>

                        {/* card Option */}
                        <label
                            className={`flex items-center gap-4 px-3 rounded-lg border cursor-pointer ${formData.paymentMethod === "card"
                                ? "border-red-300 bg-white shadow-sm"
                                : "border-red-100 bg-gray-50"
                                }`}
                            onClick={() => handlePaymentMethodChange("card")}
                        >
                            <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center aspect-square ${formData.paymentMethod === "card"
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                    }`}
                            >
                                {formData.paymentMethod === "card" && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                )}
                            </div>
                            <span className="font-medium text-gray-700 dark:text-white flex items-center justify-center">
                                <Image
                                    src="/assets/card.jpg"
                                    alt="card"
                                    width={80}
                                    height={80}
                                    className="w-20 h-10  object-contain"
                                />
                            </span>
                        </label>
                    </div>

                </div>
                <div className="mt-6 bg-white dark:bg-gray-700 p-4 rounded-xl border border-blue-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            defaultChecked
                            className="w-3 h-3 rounded-md border-2 border-gray-200 text-primary focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 mt-1"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-white">
                            I agree to our{" "}
                            <a href="/terms-of-service" className="text-primary hover:underline">Terms & Conditions</a>,{" "}
                            <a href="privacy-policy" className="text-primary hover:underline">Privacy Policy</a>, and{" "}
                            <a href="/refund-policy" className="text-primary hover:underline">Return & Refund Policy</a>
                        </span>
                    </label>
                </div>
            </div>

        </form>
    );
};

export default DeliveryInfoForm;