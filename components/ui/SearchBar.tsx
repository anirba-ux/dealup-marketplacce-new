"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import SearchSuggestionCard from "../search/SearchSuggestionCard";
import SearchHistory from "./SearchHistory";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function SearchBar() {
  const t = useTranslations("common");

  const router = useRouter();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    async function fetchProducts() {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(debouncedQuery)}`,
        );

        const data = await response.json();

        setResults(data);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search Error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setResults([]);
        setSelectedIndex(-1);
        setShowHistory(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem("dealup-search-history");

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();

      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();

      // User selected a product from the dropdown
      if (selectedIndex >= 0) {
        const product = results[selectedIndex];

        setQuery("");
        setResults([]);

        router.push(`/products/${product.slug}`);
        return;
      }

      // User wants to search all matching products
      if (query.trim()) {
        const keyword = query.trim();

        saveSearchHistory(keyword);

        setResults([]);
        setShowHistory(false);

        router.push(`/search?q=${encodeURIComponent(keyword)}`);
      }
    }

    if (e.key === "Escape") {
      setResults([]);
      setSelectedIndex(-1);
    }
  };

  function saveSearchHistory(value: string) {
    if (!value.trim()) return;

    const updatedHistory = [
      value,
      ...history.filter((item) => item !== value),
    ].slice(0, 5);

    setHistory(updatedHistory);

    localStorage.setItem(
      "dealup-search-history",
      JSON.stringify(updatedHistory),
    );
  }

  function handleSearch() {
    if (!query.trim()) return;

    const keyword = query.trim();

    saveSearchHistory(keyword);

    setResults([]);
    setShowHistory(false);

    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="flex w-full max-w-2xl overflow-hidden rounded-lg border border-gray-300 bg-white dark:bg-slate-900">
        <div className="flex items-center pl-4 text-gray-400">
          <Search size={20} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClick={() => {
            if (!query.trim() && history.length > 0) {
              setShowHistory((prev) => !prev);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("searchPlaceholder")}
          className="flex-1 px-4 py-3 text-base outline-none"
        />

        <button
          onClick={handleSearch}
          className="bg-[#1565d8] px-8 py-3 font-medium text-white transition-all duration-200 hover:bg-[#0f52ba] active:scale-95"
        >
          {t("search")}
        </button>
      </div>

      {showHistory && history.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <SearchHistory
            history={history}
            onSelect={(value) => {
              setQuery(value);
              setShowHistory(false);

              router.push(`/search?q=${encodeURIComponent(value)}`);
            }}
            onClear={() => {
              localStorage.removeItem("dealup-search-history");
              setHistory([]);
              setShowHistory(false);
            }}
          />
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border bg-white shadow-xl dark:bg-slate-900">
          {results.map((product, index) => (
            <SearchSuggestionCard
              key={product._id}
              product={product}
              selected={selectedIndex === index}
              onClick={() => {
                setQuery("");
                setResults([]);
                router.push(`/products/${product.slug}`);
              }}
            />
          ))}

          <div className="border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setResults([]);

                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
              className="
      flex
      w-full
      items-center
      justify-between

      px-5
      py-4

      font-semibold

      text-[#1565d8]

      transition-all
      duration-300

      hover:bg-blue-50

      dark:hover:bg-slate-800
    "
            >
              <span>
                🔍 Search for "<strong>{query}</strong>"
              </span>

              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
