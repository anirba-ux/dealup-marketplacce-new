import {
  Laptop,
  Car,
  Wrench,
  Home,
  Shirt,
  Sofa,
  Briefcase,
  PawPrint,
  BookOpen,
  Trophy,
  ChevronDown,
} from "lucide-react";

export function getCategoryIcon(slug: string) {
  switch (slug) {
    case "electronics":
      return <Laptop size={18} />;

    case "vehicles":
      return <Car size={18} />;

    case "services":
      return <Wrench size={18} />;

    case "property":
      return <Home size={18} />;

    case "fashion":
      return <Shirt size={18} />;

    case "furniture":
      return <Sofa size={18} />;

    case "jobs":
      return <Briefcase size={18} />;

    case "pets":
      return <PawPrint size={18} />;

    case "books":
      return <BookOpen size={18} />;

    case "sports":
      return <Trophy size={18} />;

    default:
      return <ChevronDown size={18} />;
  }
}

export function getCategoryColor(slug: string) {
  switch (slug) {
    case "electronics":
      return "from-blue-50 to-blue-100 border-blue-200";

    case "vehicles":
      return "from-red-50 to-red-100 border-red-200";

    case "services":
      return "from-violet-50 to-violet-100 border-violet-200";

    case "property":
      return "from-green-50 to-green-100 border-green-200";

    case "fashion":
      return "from-pink-50 to-pink-100 border-pink-200";

    case "furniture":
      return "from-orange-50 to-orange-100 border-orange-200";

    case "jobs":
      return "from-cyan-50 to-cyan-100 border-cyan-200";

    case "pets":
      return "from-amber-50 to-amber-100 border-amber-200";

    case "books":
      return "from-sky-50 to-sky-100 border-sky-200";

    case "sports":
      return "from-lime-50 to-lime-100 border-lime-200";

    default:
      return "from-slate-50 to-slate-100 border-slate-200";
  }
}