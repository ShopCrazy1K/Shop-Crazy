export interface Category {
  name: string;
  slug: string;
  emoji: string;
  description: string;
}

export const categories: Category[] = [
  {
    name: "Shop 4 Us",
    slug: "shop-4-us",
    emoji: "🧸",
    description: "Toys, collectibles & kids items",
  },
  {
    name: "Game Zone",
    slug: "game-zone",
    emoji: "🎮",
    description: "Video games, consoles & accessories",
  },
  {
    name: "Fresh Out World",
    slug: "fresh-out-world",
    emoji: "👕",
    description: "Streetwear, fashion & accessories",
  },
  {
    name: "Digital Products",
    slug: "digital-products",
    emoji: "💾",
    description: "Downloads, art, music & digital goods",
  },
  {
    name: "Electronics",
    slug: "electronics",
    emoji: "📱",
    description: "Gadgets & tech",
  },
  {
    name: "Art & Custom",
    slug: "art-custom",
    emoji: "🎨",
    description: "Handmade & custom designs",
  },
  {
    name: "Vintage",
    slug: "vintage",
    emoji: "📼",
    description: "Retro & throwback items",
  },
  {
    name: "Collectibles",
    slug: "collectibles",
    emoji: "🏆",
    description: "Rare finds & exclusives",
  },
  {
    name: "Accessories",
    slug: "accessories",
    emoji: "🧢",
    description: "Hats, bags & extras",
  },
  {
    name: "Health",
    slug: "health",
    emoji: "💊",
    description: "Health supplements, vitamins & wellness products",
  },
  {
    name: "Skin Care",
    slug: "skin-care",
    emoji: "✨",
    description: "Skincare products, beauty & personal care",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((cat) => cat.slug === slug);
}

export function getCategoryByName(name: string): Category | undefined {
  return categories.find((cat) => cat.name === name);
}

