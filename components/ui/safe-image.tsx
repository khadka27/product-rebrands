"use client";

import Image, { type ImageProps } from "next/image";
import { useState, useMemo } from "react";
import { getImagePath } from "@/lib/utils";

type SafeImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string | null | undefined;
  alt: string;
  fallback?: string;
};

export function SafeImage({ src, alt, fallback = "/images/placeholder.png", ...rest }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  const resolvedSrc = useMemo(() => {
    if (hasError) return fallback;
    return getImagePath(src || "", fallback);
  }, [hasError, src, fallback]);

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


