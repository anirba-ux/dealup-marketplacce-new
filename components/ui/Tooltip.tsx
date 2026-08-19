"use client";

import { ReactNode, useState } from "react";

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export default function Tooltip({
  text,
  children,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}

      <div
        className={`
          absolute
          bottom-full
          left-1/2
          mb-3

          -translate-x-1/2

          whitespace-nowrap

          rounded-xl

          bg-slate-900

          px-3
          py-2

          text-xs
          font-medium

          text-white

          shadow-xl

          transition-all
          duration-200

          ${
            visible
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0"
          }
        `}
      >
        {text}

        <div
          className="
            absolute
            left-1/2
            top-full

            -translate-x-1/2

            border-x-[6px]
            border-t-[6px]
            border-x-transparent
            border-t-slate-900
          "
        />
      </div>
    </div>
  );
}