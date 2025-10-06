// "use client";

// import { useBusiness } from "@/hooks/useBusiness";
// import Image from "next/image";
// import { useEffect, useState } from "react";

// export default function Logo() {
//   const { businessData } = useBusiness();
//   const [imgError, setImgError] = useState(false);

//   // Static fallback logo URL
//   const fallbackLogoUrl ="/assets/logo5.png";
//   const logoUrl = businessData?.logo?.secure_url || businessData?.logo?.optimizeUrl || fallbackLogoUrl;
//   // Preload the fallback logo using useEffect
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const img = document.createElement('img');
//       img.src = logoUrl;
//     }
//   }, []);

//   if (!businessData) {
//     // Show fallback immediately while loading
//     return (
//       <Image
//         src={logoUrl}
//         alt="Loading logo"
//         width={160}
//         height={40}
//         priority={true}
//         className="h-12 md:h-16 w-auto"
//       />
//     );
//   }

//   const { businessName, logo } = businessData;

//   // const logoUrl = logo?.optimizeUrl || logo?.secure_url || fallbackLogoUrl;
//   ;

//   if (imgError || !logoUrl) {
//     return <h1 className="text-2xl font-bold">{businessName}</h1>;
//   }

//   return (
//     <Image
//       src={logoUrl}
//       alt={businessName + " logo"}
//       width={160}
//       height={40}
//       priority={true}
//       loading="eager"
//       className="h-12 md:h-16 w-auto"
//       onError={() => setImgError(true)}
//     />
//   );
// }



"use client";

import { useBusiness } from "@/hooks/useBusiness";
import useTheme from "@/hooks/useTheme";
import Image from "next/image";
import { useState, useEffect } from "react";

// Define type for businessData (adjust based on your actual useBusiness hook)
// hooks/useBusiness.ts
interface Image {
  url: string; // Adjust based on actual structure
}
interface Business {
  businessName: string | null;
  logo: Image | null | undefined;
}

export default function Logo() {
  const { businessData, isLoading } = useBusiness(); // Assuming useBusiness provides isLoading
  const { mode } = useTheme(); // Use custom theme hook
  const [imgError, setImgError] = useState(false);

  // Dynamic fallback logo URL based on theme
  // const fallbackLogoUrl = mode === "dark" ? "/assets/logo.svg" : "/assets/logo.svg";

    // Fallback logos for light and dark mode
  const lightFallback = "/assets/logo5.png";
  const darkFallback ="/assets/3.svg"

 // Determine which fallback to use based on mode
  const fallbackLogoUrl = mode === "dark" ? darkFallback : lightFallback;


  // Debug theme mode and business data
  useEffect(() => {
    console.log("Theme mode:", mode);
    console.log("Business data:", businessData, "isLoading:", isLoading);
  }, [mode, businessData, isLoading]);

  // Show fallback logo during loading or if no business data
  if (isLoading || !businessData) {
    console.log("Rendering fallback logo during loading:", fallbackLogoUrl);
    return (
      <Image
        src={fallbackLogoUrl}
        alt="Loading logo"
        width={160}
        height={40}
        priority
        className="h-12 md:h-16 w-auto "
        onError={() => {
          console.error("Loading logo failed:", fallbackLogoUrl);
          setImgError(true);
        }}
      />
    );
  }

  const { businessName, logo } = businessData;

  // Use business logo only if valid and no error, otherwise use fallback
  const logoUrl = !imgError && logo && typeof logo === "string" ? logo : fallbackLogoUrl;

  // Debug logo selection
  console.log("Selected logo URL:", logoUrl, "imgError:", imgError, "business logo:", logo);

  // Fallback to business name if logo URL is invalid or image fails
  if (!logoUrl || imgError) {
    console.log("Falling back to business name:", businessName);
    return (
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {businessName || "Business Name"}
      </h1>
    );
  }

  return (
    <Image
      src={fallbackLogoUrl}
      alt={`${businessName || "Business"} logo`}
      width={160}
      height={40}
      priority
      loading="eager"
      className="h-12 md:h-16 w-auto "
      onError={() => {
        console.error("Logo failed to load:", logoUrl);
        setImgError(true);
      }}
    />
  );
}