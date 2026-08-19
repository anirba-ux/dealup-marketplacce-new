interface SellerBadgesProps {
  badges: string[];
}

const badgeColors: Record<string, string> = {
  "Verified Seller":
    "bg-green-100 text-green-700 border border-green-200",

  "Fast Responder":
    "bg-blue-100 text-blue-700 border border-blue-200",

  "Trusted Seller":
    "bg-yellow-100 text-yellow-700 border border-yellow-200",

  "Top Seller":
    "bg-purple-100 text-purple-700 border border-purple-200",
};

export default function SellerBadges({
  badges,
}: SellerBadgesProps) {
  if (!badges.length) return null;

  return (
    <div className="mt-5 border-t pt-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Seller Badges
      </h3>

      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              badgeColors[badge] ??
              "bg-gray-100 text-gray-700 border border-gray-200"
            }`}
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}