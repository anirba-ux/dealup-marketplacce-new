"use client";

import { useEffect, useState } from "react";
import { ChevronDown, FolderOpen } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Props {
  register: any;
  errors: any;
  setValue?: any;
  watch?: any;
}

export default function CategorySection({
  register,
  errors,
  setValue,
  watch,
}: Props) {
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingSub, setLoadingSub] = useState(false);
  const currentCategory = watch?.("category");

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const result = await res.json();

        if (result.success) {
          setMainCategories(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMain(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    if (!currentCategory) return;

    setSelectedCategory(currentCategory);

    async function loadSubCategories() {
      try {
        setLoadingSub(true);

        const res = await fetch(`/api/categories?parentId=${currentCategory}`);

        const result = await res.json();

        if (result.success) {
          setSubCategories(result.data);
        }
      } finally {
        setLoadingSub(false);
      }
    }

    loadSubCategories();
  }, [currentCategory]);

  async function handleCategoryChange(
  e: React.ChangeEvent<HTMLSelectElement>
) {
 const parentId = e.target.value;

setSelectedCategory(parentId);

if (setValue) {
  setValue("category", parentId);
}

  setSubCategories([]);

  if (!parentId) return;

  try {
    setLoadingSub(true);

    const res = await fetch(`/api/categories?parentId=${parentId}`);

    const result = await res.json();

    if (result.success) {
      setSubCategories(result.data);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingSub(false);
  }
}

const categoryRegister = register("category");

const selectedSubCategory = watch?.("subcategory");



  console.log("CURRENT CATEGORY:", currentCategory);
  console.log("WATCH CATEGORY:", watch?.("category"));
  console.log("SELECTED CATEGORY:", selectedCategory);
  console.log("MAIN CATEGORIES:", mainCategories);
  console.log("SUB CATEGORIES:", subCategories);
  return (
    <section className="space-y-10">
      {/* Header */}

      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 shadow-sm">
          <FolderOpen size={30} className="text-[#1565d8]" />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Product Category
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Choose the category that best matches your product.
          </p>
        </div>
      </div>

      {/* Category */}

      <div className="space-y-3">
        <label className="text-sm font-semibold tracking-wide text-slate-700">
          Category *
        </label>

        <div className="relative">
          <select
  {...categoryRegister}
  value={currentCategory || ""}
  onChange={(e) => {
    categoryRegister.onChange(e);
    handleCategoryChange(e);
  }}
  className="
    h-16
    w-full
    appearance-none
    rounded-2xl
    border
    border-slate-300
    bg-white dark:bg-slate-900
    px-5
    pr-12
    text-[15px]
    font-medium
    text-slate-800
    shadow-sm
    outline-none
    transition-all
    duration-200
    hover:border-slate-400
    hover:shadow-md
    focus:border-[#1565d8]
    focus:ring-4
    focus:ring-blue-100
  "
>
            <option value="">
              {loadingMain ? "Loading categories..." : "📂 Choose Category"}
            </option>

            {mainCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <ChevronDown
            size={22}
            className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
          />
        </div>

        {errors.category && (
          <p className="text-sm font-medium text-red-500">
            {errors.category.message}
          </p>
        )}
      </div>

      {/* Sub Category */}

      <div className="space-y-3">
        <label className="text-sm font-semibold tracking-wide text-slate-700">
          Sub Category
        </label>

        <div className="relative">
          <select
  {...register("subcategory")}
  value={selectedSubCategory || ""}
  disabled={!selectedCategory}
            className="
              h-16
              w-full
              appearance-none
              rounded-2xl
              border
              border-slate-300
              bg-white dark:bg-slate-900
              px-5
              pr-12
              text-[15px]
              font-medium
              text-slate-800
              shadow-sm
              outline-none
              transition-all
              duration-200
              hover:border-slate-400
              hover:shadow-md
              focus:border-[#1565d8]
              focus:ring-4
              focus:ring-blue-100
              disabled:bg-slate-100
              disabled:text-slate-400
            "
          >
            <option value="">
              {!selectedCategory
                ? "📁 Choose Category First"
                : loadingSub
                  ? "Loading..."
                  : "📁 Choose Sub Category"}
            </option>

            {subCategories.map((subcategory) => (
              <option key={subcategory._id} value={subcategory.slug}>
                {subcategory.name}
              </option>
            ))}
          </select>

          <ChevronDown
            size={22}
            className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
          />
        </div>

        {errors.subcategory && (
          <p className="text-sm font-medium text-red-500">
            {errors.subcategory.message}
          </p>
        )}
      </div>

      {/* Brand */}

      <div className="space-y-3">
        <label className="text-sm font-semibold tracking-wide text-slate-700">
          Brand
        </label>

        <input
          type="text"
          placeholder="Example: Apple, Samsung, Sony"
          {...register("brand")}
          className="
            h-16
            w-full
            rounded-2xl
            border
            border-slate-300
            bg-white dark:bg-slate-900
            px-5
            text-[15px]
            text-slate-800
            shadow-sm
            outline-none
            transition-all
            duration-200
            hover:border-slate-400
            hover:shadow-md
            focus:border-[#1565d8]
            focus:ring-4
            focus:ring-blue-100
          "
        />
      </div>

      {/* Model */}

      <div className="space-y-3">
        <label className="text-sm font-semibold tracking-wide text-slate-700">
          Model
        </label>

        <input
          type="text"
          placeholder="Example: iPhone 15 Pro Max"
          {...register("model")}
          className="
            h-16
            w-full
            rounded-2xl
            border
            border-slate-300
            bg-white dark:bg-slate-900
            px-5
            text-[15px]
            text-slate-800
            shadow-sm
            outline-none
            transition-all
            duration-200
            hover:border-slate-400
            hover:shadow-md
            focus:border-[#1565d8]
            focus:ring-4
            focus:ring-blue-100
          "
        />
      </div>
    </section>
  );
}


