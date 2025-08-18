"use client";

import Image, { type ImageProps } from "next/image";
import { useState, useMemo } from "react";
import { getImagePath } from "@/lib/utils";

type SafeImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string | null | undefined;
  alt: string;
  fallback?: string;
};

export function SafeImage({
  src,
  alt,
  fallback = "/placeholder.jpg",
  ...rest
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  function deriveFallback(input: string | null | undefined): string {
    const s = (input || "").toLowerCase();
    if (s.includes("/images/products") || s.startsWith("product_")) {
      return "/supplement-bottles.png";
    }
    if (s.includes("/images/badges") || s.startsWith("badge_")) {
      return "/images/New-and-Improved-Badge.png";
    }
    if (s.includes("/images/avatars") || s.startsWith("avatar_")) {
      return "/placeholder-user.jpg";
    }
    if (s.includes("/images/ingredients") || s.startsWith("ingredient_")) {
      return "/placeholder.jpg";
    }
    return "/placeholder.jpg";
  }

  const computedFallback = fallback || deriveFallback(src);

  const resolvedSrc = useMemo(() => {
    if (hasError) return computedFallback;
    return getImagePath(src || "", computedFallback);
  }, [hasError, src, computedFallback]);

  if (!resolvedSrc) {
    return null;
  }

  return (
    <Image
      {...rest}
      src={resolvedSrc}
      alt={alt}
      onError={() => setHasError(true)}
    />
  );
}

export default SafeImage;
