export interface CategorySeed {
  name: string;
  slug: string;
  icon: string;
  description: string;
  children?: CategorySeed[];
}

export const categories: CategorySeed[] = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: "smartphone",
    description: "Electronic devices and gadgets",

    children: [
      {
        name: "Mobile Phones",
        slug: "mobile-phones",
        icon: "smartphone",
        description: "All kinds of smartphones",
      },

      {
        name: "Laptops",
        slug: "laptops",
        icon: "laptop",
        description: "Laptop computers",
      },

      {
        name: "Tablets",
        slug: "tablets",
        icon: "tablet",
        description: "Tablets",
      },

      {
        name: "Smart Watches",
        slug: "smart-watches",
        icon: "watch",
        description: "Smart Watches",
      },
    ],
  },

  {
    name: "Vehicles",
    slug: "vehicles",
    icon: "car",
    description: "Cars and Bikes",

    children: [
      {
        name: "Cars",
        slug: "cars",
        icon: "car",
        description: "Cars",
      },

      {
        name: "Bikes",
        slug: "bikes",
        icon: "bike",
        description: "Motor Bikes",
      },

      {
        name: "Scooters",
        slug: "scooters",
        icon: "bike",
        description: "Scooters",
      },
    ],
  },

  {
    name: "Services",
    slug: "services",
    icon: "briefcase",
    description: "Professional Services",

    children: [
      {
        name: "Web Development",
        slug: "web-development",
        icon: "code",
        description: "Website Development",
      },

      {
        name: "Graphic Design",
        slug: "graphic-design",
        icon: "palette",
        description: "Graphic Design",
      },

      {
        name: "Digital Marketing",
        slug: "digital-marketing",
        icon: "megaphone",
        description: "Digital Marketing",
      },

      {
        name: "Astrology",
        slug: "astrology",
        icon: "sparkles",
        description: "Astrology Services",
      },

      {
        name: "Priest / Purohit",
        slug: "priest",
        icon: "church",
        description: "Pourahitya Service",
      },

      {
        name: "Vastu Consultation",
        slug: "vastu",
        icon: "home",
        description: "Vastu Consultation",
      },
    ],
  },
];