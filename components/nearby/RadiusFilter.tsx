"use client";

interface Props {
  radius: number;
  onChange: (radius: number) => void;
}

const options = [3, 5, 10, 20, 50];

export default function RadiusFilter({
  radius,
  onChange,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {options.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`px-4 py-2 rounded-full border transition whitespace-nowrap ${
            radius === item
              ? "bg-primary text-white border-primary"
              : "bg-white dark:bg-neutral-900 hover:bg-primary/10"
          }`}
        >
          {item} km
        </button>
      ))}
    </div>
  );
}