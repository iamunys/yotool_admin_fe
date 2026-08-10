"use client";

import Image from "next/image";
import { useState } from "react";

export function UserAvatar({
  name,
  email,
  avatarUrl,
}: {
  name: string | null;
  email: string;
  avatarUrl?: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const letter = (name?.trim() || email).charAt(0).toUpperCase();

  if (avatarUrl?.trim() && !imageFailed) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={36}
        height={36}
        unoptimized
        onError={() => setImageFailed(true)}
        className="h-9 w-9 shrink-0 rounded-full bg-surface-variant object-cover"
      />
    );
  }

  return (
    <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-black text-brand-dark">
      {letter}
    </span>
  );
}
