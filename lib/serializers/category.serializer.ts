import { Category } from "@/lib/models/category";

export type SerializedCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  children: SerializedCategory[];
};

type CategoryTree = Category & {
  children: Category[];
};

export function serializeCategoryTree(
  categories: CategoryTree[]
): SerializedCategory[] {
  return categories.map((parent) => ({
    id: parent._id!.toString(),
    name: parent.name,
    slug: parent.slug,
    icon: parent.icon,

    children: parent.children.map((child) => ({
      id: child._id!.toString(),
      name: child.name,
      slug: child.slug,
      icon: child.icon,

      children: [],
    })),
  }));
}