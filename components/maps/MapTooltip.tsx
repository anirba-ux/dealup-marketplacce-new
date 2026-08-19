"use client";

interface MapTooltipProps {
  text: string;
  visible: boolean;
}

export default function MapTooltip({
  text,
  visible,
}: MapTooltipProps) {
  return (
    <div
      className={`
        absolute
        right-14

        rounded-lg

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
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2 pointer-events-none"
        }
      `}
    >
      {text}
    </div>
  );
}