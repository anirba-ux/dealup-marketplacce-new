
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ViewAllLinkProps {
  href: string;
  label?: string;
  className?: string;
  ariaLabel?: string;
}

export default function ViewAllLink({
  href,
  label = "View All",
  className = "",
  ariaLabel,
}: ViewAllLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel || label}
      className={`
        group inline-flex w-fit shrink-0
        items-center justify-center gap-2
        rounded-full border border-[#2563eb]
        bg-transparent px-4 py-2
        text-sm font-semibold text-blue-400
        transition-all duration-200 ease-in-out
        hover:border-[#1565d8]
        hover:bg-[#1565d8] hover:text-white
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-[#1565d8]
        focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-slate-950
        ${className}
      `}
    >
      <span>{label}</span>

      <ArrowRight
        size={16}
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  );
}
