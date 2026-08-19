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
      className="group rounded-3xl border border-blue-100 bg-gradient-to-br from-[#1565d8] to-[#0f52ba] p-6 text-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
        {icon}
      </div>

      <h3 className="text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-blue-100">
        {description}
      </p>

      <div className="mt-6 flex items-center gap-2 font-semibold">
        Open

        <ArrowRight
          size={18}
          className="transition group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}