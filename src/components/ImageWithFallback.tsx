"use client";

import Image, { ImageProps } from "next/image";
import React, { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";

export interface ImageWithFallbackProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src: string | null | undefined;
  alt: string;
  fallback?: React.ReactNode;
}

export default function ImageWithFallback({
  src,
  alt,
  fallback,
  className,
  unoptimized = true,
  ...imageProps
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 border border-gray-200 rounded-md p-2 ${className || 'w-full h-full'}`}>
        <ImageOff className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      unoptimized={unoptimized}
      {...imageProps}
    />
  );
}
