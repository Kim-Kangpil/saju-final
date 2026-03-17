"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <div key={pathname} className="hy-page-transition">
        {children}
      </div>
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .hy-page-transition {
            animation: none !important;
            transition: none !important;
          }
        }

        .hy-page-transition {
          animation: hyFadeSlideIn 180ms ease-out both;
          will-change: opacity, transform;
        }

        @keyframes hyFadeSlideIn {
          from {
            opacity: 0;
            transform: translate3d(0, 6px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </>
  );
}

