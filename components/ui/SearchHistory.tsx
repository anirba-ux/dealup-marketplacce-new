"use client";

interface SearchHistoryProps {
  history: string[];
  onSelect: (value: string) => void;
  onClear: () => void;
}

export default function SearchHistory({
  history,
  onSelect,
  onClear,
}: SearchHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="p-5 text-center text-sm text-slate-500">
        No recent searches
      </div>
    );
  }

  return (
    <div
      className="
    overflow-hidden

    rounded-3xl

    border
    border-slate-200

    bg-white

    shadow-2xl

    backdrop-blur

    dark:border-slate-700
    dark:bg-slate-900
  "
    >
      {/* Header */}
      {/* Header */}
      <div
        className="
    flex
    items-center
    justify-between

    border-b
    border-slate-200

    bg-slate-50

    px-5
    py-4

    dark:border-slate-700
    dark:bg-slate-800
  "
      >
        <div>
          <h3
            className="
      flex
      items-center
      gap-2

      text-sm
      font-bold

      text-slate-700
      dark:text-slate-200
    "
          >
            <span>🕘</span>
            Recent Searches
          </h3>

          <p
            className="
      mt-1

      text-xs

      text-slate-500
      dark:text-slate-400
    "
          >
            Your latest searches
          </p>
        </div>
        <button
          onClick={onClear}
          className="
      rounded-lg

      px-3
      py-1

      text-xs
      font-semibold

      text-red-500

      transition-all

      hover:bg-red-50
      hover:text-red-600
    "
        >
          🗑 Clear
        </button>
      </div>

      {/* History List */}
      <div className="py-2">
        {history.map((item) => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            className="
  group

  flex
  w-full
  items-center
  gap-3

  px-5
  py-4

  text-left

  transition-all
  duration-300

  hover:bg-blue-50
  dark:hover:bg-slate-800
"
          >
            <span
              className="
    flex
    h-10
    w-10
    items-center
    justify-center

    rounded-full

    bg-slate-100

    text-lg

    transition-colors

    group-hover:bg-blue-100
  "
            >
              🕘
            </span>

            <div className="flex-1">
              <p
                className="
      text-sm
      font-semibold

      text-slate-800
      dark:text-slate-100
    "
              >
                {item}
              </p>

              <p className="text-xs text-slate-400">Tap to search again</p>
            </div>

            <span
              className="
    flex
    h-8
    w-8
    items-center
    justify-center

    rounded-full

    bg-blue-100

    text-[#1565d8]

    transition-transform
    duration-300

    group-hover:translate-x-1
  "
            >
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
