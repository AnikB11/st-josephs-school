import { cn } from "@/lib/utils";

/**
 * Pure-CSS marquee strip. Renders children twice so the loop is seamless.
 */
export function Marquee({
  children,
  className,
  itemClassName,
}: {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="flex w-max marquee-track">
        {[...children, ...children].map((c, i) => (
          <div key={i} className={cn("shrink-0", itemClassName)}>
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
