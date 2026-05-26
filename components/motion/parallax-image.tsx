"use client";

import Image, { type ImageProps } from "next/image";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = Omit<ImageProps, "src"> & {
  src: string;
  intensity?: number;
  wrapperClassName?: string;
};

/**
 * Wraps next/image in a fixed-aspect container with a subtle parallax on Y.
 * Cheap because framer-motion only animates a transform.
 */
export function ParallaxImage({
  src,
  alt,
  intensity = 60,
  wrapperClassName,
  className,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [intensity, -intensity]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-3xl bg-[hsl(var(--sand))]",
        wrapperClassName,
      )}
    >
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className={cn("object-cover", className)}
          {...rest}
        />
      </motion.div>
    </div>
  );
}
