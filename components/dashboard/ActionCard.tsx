import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export default function ActionCard({
  title,
  description,
  href,
  icon,
}: ActionCardProps) {
  return (
    <Link
      href={href}
      className="
        group
        relative
        flex
        min-h-[104px]
        items-center
        gap-3.5
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#1565d8]/30
        hover:shadow-lg
        active:scale-[0.98]
        sm:min-h-[118px]
        sm:gap-4
        sm:p-5
        dark:border-slate-700
        dark:bg-slate-800
        dark:hover:border-blue-500/40
      "
    >
      {/* Decorative Glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-20
          w-20
          rounded-full
          bg-blue-500/5
          blur-2xl
          transition
          duration-300
          group-hover:bg-blue-500/10
        "
      />

      {/* Icon */}

      <div
        className="
          relative
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-blue-50
          text-[#1565d8]
          transition-all
          duration-300
          group-hover:scale-105
          group-hover:bg-[#1565d8]
          group-hover:text-white
          sm:h-13
          sm:w-13
          sm:rounded-2xl
          dark:bg-blue-950/50
          dark:text-blue-400
          dark:group-hover:bg-[#1565d8]
          dark:group-hover:text-white
        "
      >
        {icon}
      </div>

      {/* Content */}

      <div className="relative min-w-0 flex-1">
        <h3
          className="
            truncate
            text-sm
            font-bold
            text-slate-900
            transition-colors
            duration-200
            group-hover:text-[#1565d8]
            sm:text-base
            dark:text-white
            dark:group-hover:text-blue-400
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-1
            line-clamp-2
            text-[11px]
            leading-4
            text-slate-500
            sm:text-xs
            sm:leading-5
            dark:text-slate-400
          "
        >
          {description}
        </p>

        <div
          className="
            mt-1.5
            flex
            items-center
            gap-1
            text-[10px]
            font-bold
            text-[#1565d8]
            sm:mt-2
            sm:text-[11px]
            dark:text-blue-400
          "
        >
          Open
          <ArrowRight
            size={13}
            className="
              transition-transform
              duration-200
              group-hover:translate-x-1
            "
          />
        </div>
      </div>
    </Link>
  );
}