// src/components/magicui/marquee.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  speed?: number; // speed in seconds
}

export function Marquee({
  className,
  children,
  reverse,
  pauseOnHover = true,
  speed = 30,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "relative overflow-hidden select-none",
        pauseOnHover && "hover:[animation-play-state:paused]",
        className
      )}
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `${reverse ? "marquee-reverse" : "marquee"} ${speed}s linear infinite`,
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
