"use client";

import Image from "next/image";
import { useState } from "react";

export function BrandMark({ size = 44, className = "" }: { size?: number; className?: string }) {
  const [logoMissing, setLogoMissing] = useState(false);

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-brand ${className}`}
      style={{ height: size, width: size }}
    >
      {!logoMissing ? (
        <Image
          src="/brand/yotool-logo-transparent.png"
          alt="Yotool logo"
          width={size}
          height={size}
          className="h-full w-full object-contain brightness-0 invert"
          onError={() => setLogoMissing(true)}
        />
      ) : (
        <span aria-hidden="true" className="text-lg font-black text-white">Y</span>
      )}
    </span>
  );
}
