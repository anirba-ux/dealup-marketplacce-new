"use client";

import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { formatPrice } from "@/lib/utils/formatPrice";

import {
  getCategoryColor,
  getCategoryIcon,
} from "@/lib/utils/searchFilterHelpers";

import { SerializedCategory } from "@/lib/serializers/category.serializer";

interface SearchFilterContentProps {
  categories: SerializedCategory[];

  selectedRadius: number;

  selectedCategory: string;

  selectedConditions: string[];

  price: number;

  openCategory: string | null;

  updateRadius: (value: number) => void;

  updateCategory: (slug: string) => void;

  updateCondition: (value: string) => void;

  updatePrice: (value: number) => void;

  toggleCategory: (slug: string) => void;

  setPrice: (value: number) => void;
}

export default function SearchFilterContent({
  categories,

  selectedRadius,

  selectedCategory,

  selectedConditions,

  price,

  openCategory,

  updateRadius,

  updateCategory,

  updateCondition,

  updatePrice,

  toggleCategory,

  setPrice,
}: SearchFilterContentProps) {
 

  return (
    <>
      {/* Radius */}

       <div className="mb-8">
        <h3 className="mb-4 text-lg font-bold text-[#1565d8]">Radius</h3>

        <div className="flex flex-wrap gap-2">
          {[5, 10, 25, 50].map((item) => (
            <button
              key={item}
              onClick={() => updateRadius(item)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                selectedRadius === item
                  ? "bg-[#1565d8] text-white shadow-md"
                  : "border border-slate-300 bg-white hover:border-[#1565d8] hover:bg-blue-50 hover:text-[#1565d8]"
              }`}
            >
              📍 {item} KM
            </button>
          ))}
        </div>
      </div>
      {/* Category */}

      
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-bold text-[#1565d8]">Category</h3>
      
              <div className="space-y-2">
                {categories.map((parent) => (
                  <div
                    key={parent.id}
                    className={`
          mb-3
          overflow-hidden
          rounded-2xl
          border
          bg-gradient-to-r
          ${getCategoryColor(parent.slug)}
      
          shadow-sm
      
          transition-all
          duration-300
      
          hover:shadow-lg
          hover:scale-[1.02]
      
          dark:border-slate-700
          dark:from-slate-800
          dark:to-slate-900
        `}
                  >
                    {/* Parent Category */}
      
                    <button
                      onClick={() => toggleCategory(parent.slug)}
                      className="
      flex
      w-full
      items-center
      justify-between
      
      px-5
      py-4
      
      font-semibold
      
      transition-all
      duration-300
      
      hover:bg-white/30
      
      dark:hover:bg-slate-800/60
      "
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-[#1565d8]">
                          {getCategoryIcon(parent.slug)}
                        </span>
      
                        <span className="font-medium">{parent.name}</span>
                      </span>
      
                      {openCategory === parent.slug ? (
                        <ChevronUp size={18} className="text-[#1565d8]" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-500" />
                      )}
                    </button>
      
                    {/* Children */}
      
                    {openCategory === parent.slug && parent.children.length > 0 && (
                      <div className="border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                        {parent.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => updateCategory(child.slug)}
                            className={`block w-full px-8 py-2 text-left transition ${
                              selectedCategory === child.slug
                                ? "bg-[#1565d8] text-white"
                                : "hover:bg-blue-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            • {child.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
      {/* Condition */}

       <div className="mb-8">
              <h3 className="mb-4 text-lg font-bold text-[#1565d8]">Condition</h3>
      
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes("new")}
                    onChange={() => updateCondition("new")}
                  />
                  New
                </label>
      
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes("used")}
                    onChange={() => updateCondition("used")}
                  />
                  Used
                </label>
      
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes("refurbished")}
                    onChange={() => updateCondition("refurbished")}
                  />
                  Refurbished
                </label>
              </div>
            </div>
      {/* Price */}
        
           <div>
        <h3 className="mb-4 text-lg font-bold text-[#1565d8]">Price</h3>

        <input
          type="range"
          min={0}
          max={1000000}
          step={5000}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          onMouseUp={() => updatePrice(price)}
          onTouchEnd={() => updatePrice(price)}
          className="w-full"
        />

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">₹0</span>

          <span className="rounded-lg bg-[#1565d8] px-3 py-1 text-sm font-semibold text-white">
            {formatPrice(price)}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {[25000, 50000, 100000, 200000, 500000].map((value) => (
            <button
              key={value}
              onClick={() => updatePrice(value)}
              className={`
        rounded-full
        px-4
        py-2
        text-sm
        font-medium
        transition-all
        duration-300

        ${
          price === value
            ? "bg-[#1565d8] text-white"
            : "border border-slate-300 bg-white hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        }
      `}
            >
              {formatPrice(value)}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={() => updatePrice(1000000)}
            className="
      flex
      items-center
      justify-center

      w-full

      rounded-xl

      border
      border-red-200

      bg-red-50

      px-4
      py-3

      font-medium

      text-red-600

      transition-all
      duration-300

      hover:bg-red-100

      dark:border-red-900
      dark:bg-red-950/30
      dark:text-red-400
    "
          >
            ✕ Clear Price Filter
          </button>
        </div>
      </div>
      
    </>
  );
}