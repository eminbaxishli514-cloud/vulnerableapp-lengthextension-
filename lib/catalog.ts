export const CATALOG = {
  phone: { title: "Smartphone", price: 499, emoji: "📱", blurb: "Latest model, 128GB storage" },
  water: { title: "Bottled Water", price: 5, emoji: "💧", blurb: "24-pack, purified spring water" },
  laptop: { title: "Laptop", price: 899, emoji: "💻", blurb: '15" display, 16GB RAM' },
  headphones: { title: "Wireless Headphones", price: 149, emoji: "🎧", blurb: "Noise cancelling, 30h battery" },
  bread: { title: "Fresh Bread", price: 4, emoji: "🍞", blurb: "Daily baked whole grain loaf" },
  milk: { title: "Organic Milk", price: 3, emoji: "🥛", blurb: "Farm-fresh, 1L bottle" },
  coffee: { title: "Coffee Beans", price: 18, emoji: "☕", blurb: "Arabica medium roast 1kg" },
  apple: { title: "Red Apples", price: 5, emoji: "🍎", blurb: "Sweet and crispy, 1kg" },
  rice: { title: "Basmati Rice", price: 22, emoji: "🍚", blurb: "Long grain family pack 5kg" },
  notebook: { title: "Notebook Set", price: 12, emoji: "📓", blurb: "Hardcover ruled pages" }
} as const;

export type ProductId = keyof typeof CATALOG;

export const PRODUCT_LIST = Object.entries(CATALOG).map(([id, item]) => ({
  id: id as ProductId,
  ...item
}));
