import pizza from "@/assets/food/pizza.jpg";
import burger from "@/assets/food/burger.jpg";
import sandwich from "@/assets/food/sandwich.jpg";
import rolls from "@/assets/food/rolls.jpg";
import chinese from "@/assets/food/chinese.jpg";
import southIndian from "@/assets/food/south-indian.jpg";
import northIndian from "@/assets/food/north-indian.jpg";
import coffee from "@/assets/food/coffee.jpg";
import coldDrinks from "@/assets/food/cold-drinks.jpg";
import desserts from "@/assets/food/desserts.jpg";
import fallback from "@/assets/food/default.jpg";
import { menuItems } from "@/data/menu";

/**
 * Category photography used whenever a menu item has no uploaded image of its
 * own. Items that carry an `imageUrl` from the database always win.
 */
const byCategory: Record<string, string> = {
  pizza,
  burger,
  sandwich,
  rolls,
  chinese,
  "south-indian": southIndian,
  "north-indian": northIndian,
  coffee,
  "cold-drinks": coldDrinks,
  desserts,
};

export const categoryImage = (slug: string): string => byCategory[slug] ?? fallback;

export function foodImage(item: {
  name?: string;
  categorySlug?: string;
  imageUrl?: string | null;
}): string {
  if (item.imageUrl) return item.imageUrl;
  const slug = item.categorySlug ?? "";
  if (byCategory[slug]) return byCategory[slug];
  return item.name ? foodImageForName(item.name) : fallback;
}


export const fallbackFoodImage = fallback;

/**
 * Keyword → category photography. Order lines and database rows only carry a
 * dish name, so we infer the right picture from the words in that name.
 */
const KEYWORDS: Array<[RegExp, string]> = [
  [/pizza|margherita|pepperoni|calzone/i, "pizza"],
  [/burger|whopper|patty|slider/i, "burger"],
  [/sandwich|sub|toastie|grilled cheese|panini|club/i, "sandwich"],
  [/roll|wrap|kathi|shawarma|frankie|burrito/i, "rolls"],
  [/noodle|manchur|hakka|schezwan|chowmein|chow mein|momo|spring roll|fried rice|soup|chilli/i, "chinese"],
  [/dosa|idli|vada|uttapam|sambar|upma|pongal|rasam|filter coffee/i, "south-indian"],
  [/paneer|roti|naan|biryani|thali|dal|chole|rajma|curry|masala|tikka|butter chicken|paratha/i, "north-indian"],
  [/coffee|latte|cappuccino|espresso|mocha|chai|tea/i, "coffee"],
  [/juice|soda|cooler|shake|smoothie|lemonade|mojito|lassi|cold drink|iced/i, "cold-drinks"],
  [/cake|brownie|waffle|pastry|ice cream|gulab|jamun|halwa|kheer|pudding|dessert|donut|muffin/i, "desserts"],
];

/** Best-effort photography for a dish, using its category first then its name. */
export function foodImageForName(name: string, categorySlug?: string | null): string {
  if (categorySlug && byCategory[categorySlug]) return byCategory[categorySlug];
  const match = KEYWORDS.find(([re]) => re.test(name));
  if (match) return byCategory[match[1]] ?? fallback;
  const known = menuItems.find((m) => m.name.toLowerCase() === name.trim().toLowerCase());
  return known ? foodImage(known) : fallback;
}

/** Resolve imagery for an order line that carries an id and (usually) a name. */
export function foodImageById(itemId: string, name?: string): string {
  const item = menuItems.find((m) => m.id === itemId);
  if (item) return foodImage(item);
  return name ? foodImageForName(name) : fallback;
}

