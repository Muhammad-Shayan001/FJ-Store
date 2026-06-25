"use client";

import Image from "next/image";
import { useTheme } from "@/lib/theme-context";
import { useEffect, useState } from "react";

interface BrandLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function BrandLogo({ className = "", height = 48 }: BrandLogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Logo icon is roughly square, name image is wider
  const logoSize = height;
  const nameHeight = height * 0.75;
  const nameWidth = nameHeight * 2.4;

  const nameSrc = mounted && theme === "dark" ? "/OS-Name.png" : "/logo-light.png";

  return (
    <div className={`relative flex items-center gap-1.5 ${className}`}>
      {/* FJ Logo Icon — same for both themes */}
      <Image
        src="/logo-of-OS.png"
        alt="FJ Store Logo"
        width={logoSize}
        height={logoSize}
        style={{ width: "auto", height: "auto" }}
        className="object-contain"
        priority
      />
      {/* Dynamic theme name */}
      <div className={`transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <Image
          src={nameSrc}
          alt="Store For Justice"
          width={nameWidth}
          height={nameHeight}
          style={{ width: "auto", height: "auto" }}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}

