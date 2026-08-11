"use client";

import Image from "next/image";
import { useState } from "react";

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = 36,
}: {
  name: string | null;
  email: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const letter = (name?.trim() || email).charAt(0).toUpperCase();

  if (avatarUrl?.trim() && !imageFailed) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        unoptimized
        onError={() => setImageFailed(true)}
        className="shrink-0 rounded-full bg-surface-variant object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full bg-brand/15 font-black text-brand-dark"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {letter}
    </span>
  );
}
