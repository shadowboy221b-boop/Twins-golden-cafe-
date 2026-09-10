/**
 * The Twin's Golden Cafe board, transcribed from the printed menu.
 *
 * This file is the single source of truth for what anything costs — every
 * price shown anywhere on the site is read from here, so a correction lands
 * everywhere at once. Nothing is priced here that is not on the printed menu.
 */

export type MenuItem = {
  name: string;
  price: number;
  /** second price where a dish is sold two ways (momos: steam / fried) */
  altPrice?: number | undefined;
  note?: string | undefined;
  veg?: boolean | undefined;
  hot?: boolean | undefined;
};

export type MenuCategory = {
  id: string;
  title: string;
  tagline: string;
  items: MenuItem[];
  /** column headings, for sections where every item carries two prices */
  priceColumns?: [string, string];
  /** counter add-ons printed under the section */
  extras?: { label: string; price: number }[];
};

/* ------------------------------------------------------------------ pizza */

export const pizzas: MenuItem[] = [
  { name: "Delight Veg Pizza", price: 129, veg: true },
  { name: "Hot & Spicy Veg Pizza", price: 139, veg: true, hot: true },
  { name: "Golden Corn Pizza", price: 139, veg: true },
  { name: "Farm Fresh Panner Pizza", price: 149, veg: true },
  { name: "Tandoori Panner Pizza", price: 159, veg: true },
  { name: "Village Mushroom Pizza", price: 169, veg: true },
  { name: "Chicken Tikka Pizza", price: 169 },
  { name: "Cheesy Chicken Pizza", price: 179 },
  { name: "Peri Peri Chicken Pizza", price: 189, hot: true },
  { name: "Chicken Makhani Pizza", price: 189 },
  { name: "Spl BBQ Pizza", price: 199 },
  { name: "Chicken & Corn Pizza", price: 199 },
  { name: "Schezwan Chicken Pizza", price: 199, hot: true },
];

/* ---------------------------------------------------------------- burgers */

export const vegBurgers: MenuItem[] = [
  { name: "Veg Bliss Burger", price: 89, veg: true },
  { name: "Double Cheese Burger", price: 99, veg: true },
  { name: "Tandoori Panner Burger", price: 99, veg: true },
  { name: "Pinko Veg Burger", price: 109, veg: true },
  { name: "Double Tower Burger", price: 119, veg: true },
  { name: "Minto Veg Burger", price: 119, veg: true },
  { name: "Pizza Blast Burger", price: 129, veg: true },
  { name: "Cheese Shot Burger", price: 149, veg: true },
];

export const nonVegBurgers: MenuItem[] = [
  { name: "Classic Chicken Mayo Burger", price: 119 },
  { name: "Sweeto Chicken Burger", price: 129 },
  { name: "Mutton Down Burger", price: 129 },
  { name: "Mint Chicken Burger", price: 139 },
  { name: "Chicken Tandoori Burger", price: 149 },
  { name: "H-Spicy Chicken Burger", price: 149, hot: true },
  { name: "Fish Flow Burger", price: 179 },
  { name: "Pizza Yet Burger", price: 179 },
  { name: "Double Mix (N-V) Burger", price: 199 },
];

/** every burger on the board, for anything that wants the whole range */
export const burgers: MenuItem[] = [...vegBurgers, ...nonVegBurgers];

/* ----------------------------------------------------------- wrap & roll */

export const wraps: MenuItem[] = [
  { name: "Mix Veg Wrap", price: 99, veg: true },
  { name: "Peri Peri Corn Wrap", price: 119, veg: true, hot: true },
  { name: "Panner Royale Wrap", price: 139, veg: true },
  { name: "Chicken Tikka Wrap", price: 149 },
  { name: "BBQ Chicken Wrap", price: 159 },
];

/* ------------------------------------------------------------- sandwiches */

export const sandwiches: MenuItem[] = [
  { name: "Crispy Veg Sandwich", price: 79, veg: true },
  { name: "Spicy Corn Sandwich", price: 89, veg: true, hot: true },
  { name: "Chicken Grill Sandwich", price: 99 },
  { name: "Peri Peri Panner Sandwich", price: 119, veg: true, hot: true },
  { name: "Tandoori Mushroom Sandwich", price: 119, veg: true },
  { name: "Veg Pinky Sandwich", price: 119, veg: true },
  { name: "Mint Veg Sandwich", price: 119, veg: true },
  { name: "Mutton Patty Sandwich", price: 139 },
  { name: "Fish Fillet Grill Sandwich", price: 149 },
];

export const sweetSandwiches: MenuItem[] = [
  { name: "Chocolate Grill Sandwich", price: 129, veg: true },
  { name: "Nutella Sandwich", price: 149, veg: true },
  { name: "Lotus Biscoff Sandwich", price: 169, veg: true },
];

/* ------------------------------------------------------------ happy treats */

export const happyTreats: MenuItem[] = [
  { name: "French Fries", price: 79, veg: true },
  { name: "Peri Peri Fries", price: 99, veg: true, hot: true },
  { name: "Cheesey Fries", price: 109, veg: true },
  { name: "Cheese Corn Nuggets", price: 119, note: "6 pc", veg: true },
  { name: "Veg Roll", price: 119, note: "6 pc", veg: true },
  { name: "Veg Nuggets", price: 119, note: "6 pc", veg: true },
  { name: "Spicy Double Fries", price: 139, veg: true, hot: true },
  { name: "Chicken Nuggets", price: 129, note: "6 pc" },
  { name: "Popcorn Chicken", price: 139, note: "10 pc" },
  { name: "Fish Fillet", price: 129 },
  { name: "Crab Lollipop", price: 149, note: "2 pc" },
  { name: "Chicken Roll", price: 149, note: "6 pc" },
  { name: "Mutton Roll", price: 175, note: "6 pc" },
  { name: "Fish Finger", price: 179, note: "5 pc" },
];

/* ------------------------------------------------------------------ momos */

export const vegMomos: MenuItem[] = [
  { name: "Veg Momo", price: 89, altPrice: 99, veg: true },
  { name: "Panner Tikka Momo", price: 99, altPrice: 109, veg: true },
  { name: "Mushroom Momo", price: 99, altPrice: 109, veg: true },
  { name: "Panner Momo", price: 99, altPrice: 109, veg: true },
  { name: "Corn Momo", price: 99, altPrice: 109, veg: true },
  { name: "Corn & Cheese Momo", price: 119, altPrice: 129, veg: true },
];

export const nonVegMomos: MenuItem[] = [
  { name: "Chicken Tikka Momo", price: 99, altPrice: 109 },
  { name: "Chicken Peri-Peri Momo", price: 119, altPrice: 109, hot: true },
  { name: "Chicken Cheese Momo", price: 119, altPrice: 109 },
  { name: "Chicken BBQ Momo", price: 129, altPrice: 139 },
  { name: "Chicken Schezwan Momo", price: 129, altPrice: 139, hot: true },
  { name: "Chicken Pizza Momo", price: 139, altPrice: 149 },
];

/* ------------------------------------------------------------------ pasta */

export const pastas: MenuItem[] = [
  { name: "Red Sauce Pasta", price: 99, veg: true },
  { name: "White Sauce Pasta", price: 109, veg: true },
  { name: "Schezwan Pasta", price: 109, veg: true, hot: true },
  { name: "Corn Pasta", price: 119, veg: true },
  { name: "Paneer Pasta", price: 129, veg: true },
  { name: "Chicken Pasta", price: 139 },
  { name: "Cheese Loaded Pasta", price: 149, veg: true },
];

/* --------------------------------------------------------- bread omelette */

export const breadOmelettes: MenuItem[] = [
  { name: "Butter Bread Omelette", price: 79 },
  { name: "Cheese Bread Omelette", price: 89 },
  { name: "Paneer Bread Omelette", price: 99 },
  { name: "Chicken Bread Omelette", price: 129 },
];

/* ----------------------------------------------------------------- kunafa */

export const kunafas: MenuItem[] = [
  { name: "Cream Kunafa", price: 240, veg: true },
  { name: "Mozzerella Kunafa", price: 250, veg: true },
  { name: "Chocolate Kunafa", price: 280, veg: true },
  { name: "Blueberry Kunafa", price: 280, veg: true },
  { name: "Strawberry Kunafa", price: 280, veg: true },
  { name: "Kunafa with Ice-Cream", price: 290, veg: true },
  { name: "Kitkat Kunafa", price: 320, veg: true },
  { name: "Caramel Kunafa", price: 320, veg: true },
  { name: "Oreo Kunafa", price: 330, veg: true },
  { name: "Nutella Kunafa", price: 380, veg: true },
  { name: "Lotus Biscoff Kunafa", price: 380, veg: true },
];

/* ---------------------------------------------------------------- falooda */

export const faloodas: MenuItem[] = [
  { name: "Royal Falooda", price: 119, veg: true },
  { name: "Vannilla Cashew Falooda", price: 119, veg: true },
  { name: "Strawberry Falooda", price: 119, veg: true },
  { name: "Mix Icecream Falooda", price: 119, veg: true },
  { name: "Mango Falooda", price: 119, veg: true },
  { name: "Choco Cream Falooda", price: 119, veg: true },
  { name: "Kesar Pista Falooda", price: 119, veg: true },
  { name: "Blackcurrant Falooda", price: 119, veg: true },
  { name: "Butterscotch Falooda", price: 119, veg: true },
];

export const splFaloodas: MenuItem[] = [
  { name: "Malai Falooda", price: 149, veg: true },
  { name: "Rabdi Falooda", price: 149, veg: true },
  { name: "Dry Fruit Falooda", price: 149, veg: true },
];

/* ------------------------------------------------------------- milkshakes */

export const milkshakes: MenuItem[] = [
  { name: "Vanilla Milkshake", price: 119, veg: true },
  { name: "Strawberry Milkshake", price: 129, veg: true },
  { name: "Pistachio Milkshake", price: 139, veg: true },
  { name: "Chocolate Milkshake", price: 139, veg: true },
  { name: "Mango Mad Milkshake", price: 139, veg: true },
  { name: "Butterscotch Milkshake", price: 139, veg: true },
  { name: "Caramel Milkshake", price: 139, veg: true },
  { name: "Blueberry Delight Milkshake", price: 139, veg: true },
  { name: "Oreo Milkshake", price: 139, veg: true },
  { name: "Kit Kat Milkshake", price: 139, veg: true },
  { name: "Brownie Milkshake", price: 139, veg: true },
  { name: "Beligian Choco Milkshake", price: 139, veg: true },
  { name: "Black Curranto Milkshake", price: 139, veg: true },
  { name: "Oreo Blast Brownie Milkshake", price: 139, veg: true },
  { name: "Cold Coffee", price: 139, veg: true },
];

/* ------------------------------------------------------------- spl drinks */

export const splDrinks: MenuItem[] = [
  { name: "Rosemilk", price: 40, veg: true },
  { name: "Rosemilk with Icecream", price: 50, veg: true },
  { name: "Badam", price: 50, veg: true },
  { name: "Badam with Icecream", price: 60, veg: true },
  { name: "Pista Milk", price: 60, veg: true },
  { name: "Pista Smoothie with Ice-Cream", price: 70, veg: true },
  { name: "Chocolate Milk", price: 60, veg: true },
  { name: "Chocolate Smoothie with Ice-Cream", price: 70, veg: true },
  { name: "Strawberry Milk", price: 60, veg: true },
  { name: "Strawberry Smoothie with Ice-Cream", price: 70, veg: true },
  { name: "Black Curranto Milk", price: 60, veg: true },
  { name: "Black Curranto Smoothie with Ice-Cream", price: 70, veg: true },
  { name: "Litche Smoothie", price: 60, veg: true },
  { name: "Mango Smoothie", price: 60, veg: true },
  { name: "Pineapple Smoothie", price: 60, veg: true },
  { name: "Blueberry Smoothie", price: 60, veg: true },
];

/* ------------------------------------------------------------------ lassi */

export const lassis: MenuItem[] = [
  { name: "Sweet Lassi", price: 40, veg: true },
  { name: "Vanilla Lassi", price: 60, veg: true },
  { name: "Mango Lassi", price: 60, veg: true },
  { name: "Strawberry Lassi", price: 60, veg: true },
  { name: "Basundi Lassi", price: 80, veg: true },
  { name: "Blueberry Lassi", price: 80, veg: true },
  { name: "Khova Lassi", price: 90, veg: true },
];

/* ----------------------------------------------------------------- mojito */

export const mojitos: MenuItem[] = [
  { name: "Blue Lagoon Mojito", price: 80, veg: true },
  { name: "Lemon Mojito", price: 80, veg: true },
  { name: "Spicy Mojito", price: 90, veg: true, hot: true },
  { name: "Mango Mojito", price: 90, veg: true },
  { name: "Strawberry Cooler", price: 99, veg: true },
  { name: "Berry Blast Mojito", price: 99, veg: true },
];

/* ----------------------------------------------------------------- juices */

export const freshJuices: MenuItem[] = [
  { name: "Lemon Juice", price: 30, veg: true },
  { name: "Lemon Soda", price: 40, veg: true },
  { name: "Masala Lemon Soda", price: 50, veg: true },
  { name: "Sweet Lime Juice", price: 60, veg: true },
  { name: "Papaya Juice", price: 60, veg: true },
  { name: "Watermelon Juice", price: 60, veg: true },
  { name: "Pineapple Juice", price: 70, veg: true },
  { name: "Orange Juice", price: 70, veg: true },
  { name: "Apple Juice", price: 70, veg: true },
  { name: "Grape Juice", price: 70, veg: true },
  { name: "Mango Juice", price: 70, veg: true },
  { name: "Pomegranate Juice", price: 80, veg: true },
  { name: "Muskmelon Juice", price: 80, veg: true },
  { name: "Kiwi Juice", price: 80, veg: true },
  { name: "Fig (Anjeer) Juice", price: 80, veg: true },
  { name: "Dragon Fruit Juice", price: 90, veg: true },
  { name: "Avocado Juice", price: 100, veg: true },
];

export const specialBlends: MenuItem[] = [
  { name: "Mango Delight", price: 80, note: "Mango + orange", veg: true },
  { name: "Sunrise Boost", price: 80, note: "Pineapple + orange + carrot", veg: true },
  { name: "Tropical Mix", price: 90, note: "Pineapple + watermelon + mint", veg: true },
  { name: "Berry Blast", price: 100, note: "Strawberry + pomegranate + apple", veg: true },
  { name: "Green Power", price: 100, note: "Apple + kiwi + mint + lime", veg: true },
];

export const detoxJuices: MenuItem[] = [
  { name: "ABC Juice", price: 80, note: "Apple + beetroot + carrot", veg: true },
  { name: "Fat Cutter", price: 90, note: "Pineapple + ginger + mint + lime", veg: true },
  { name: "Detox Green", price: 90, note: "Cucumber + celery + green apple + lime", veg: true },
  { name: "Immunity Booster", price: 100, note: "Orange + carrot + turmeric", veg: true },
];

export const kulukkiSarbath: MenuItem[] = [
  { name: "Classic Kulukki Sarbath", price: 40, veg: true },
  { name: "Chilli Kulukki Sarbath", price: 50, veg: true, hot: true },
  { name: "Strawberry Kulukki Sarbath", price: 60, veg: true },
  { name: "Pineapple Kulukki Sarbath", price: 60, veg: true },
];

export const fruitSalads: MenuItem[] = [
  {
    name: "Classic Fruit Salad",
    price: 80,
    note: "Seasonal fruits + honey + lemon juice",
    veg: true,
  },
  {
    name: "Premium Fruits",
    price: 110,
    note: "Seasonal fruits + nuts + honey + chia seeds",
    veg: true,
  },
];

/* ----------------------------------------------------------------- combos */

export type Combo = {
  name: string;
  price: number;
  contents: string[];
  hero?: boolean;
};

export const combos: Combo[] = [
  {
    name: "Snack Combo",
    price: 169,
    contents: ["1 Crispy Chicken", "Small Chicken Popcorn", "1 Dip"],
  },
  {
    name: "Chicken Lover Combo",
    price: 229,
    contents: ["2 Crispy Chicken", "Small Chicken Popcorn / Medium Fries", "1 Dip"],
  },
  {
    name: "Burger Combo",
    price: 219,
    contents: ["Chicken Burger", "Small Chicken Popcorn", "1 Dip"],
  },
  {
    name: "Premium Burger Combo",
    price: 249,
    contents: ["Cheesy Chicken Burger", "Peri Peri Fries / Chicken Popcorn", "1 Dip"],
  },
  {
    name: "Wings Combo",
    price: 239,
    contents: ["6 Chicken Wings", "Small Chicken Popcorn", "1 Dip"],
  },
  {
    name: "Wrap Combo",
    price: 219,
    contents: ["Chicken Wrap", "Small Chicken Popcorn", "1 Dip"],
  },
  {
    name: "Family Combo 1",
    price: 599,
    contents: ["6 Crispy Chicken", "Large Chicken Popcorn", "3 Dips"],
  },
  {
    name: "Family Combo 2",
    price: 899,
    contents: ["8 Crispy Chicken", "Large Chicken Popcorn", "2 Burgers", "2 Dips"],
    hero: true,
  },
];

/* -------------------------------------------------------------- the board */

export const categories: MenuCategory[] = [
  {
    id: "pizza",
    title: "Pizza",
    tagline: "Stone-baked to order",
    items: pizzas,
  },
  {
    id: "burgers-veg",
    title: "Burgers — Veg",
    tagline: "Stacked golden",
    items: vegBurgers,
    extras: [{ label: "Cheese extra", price: 20 }],
  },
  {
    id: "burgers-nonveg",
    title: "Burgers — Non-Veg",
    tagline: "Chicken, mutton & fish",
    items: nonVegBurgers,
    extras: [{ label: "Cheese extra", price: 20 }],
  },
  {
    id: "wraps",
    title: "Wrap & Roll (12 inch)",
    tagline: "Twelve inches, rolled",
    items: wraps,
  },
  {
    id: "sandwiches",
    title: "Sandwiches",
    tagline: "Grilled and pressed",
    items: sandwiches,
    extras: [{ label: "Cheese extra", price: 20 }],
  },
  {
    id: "sweet-sandwiches",
    title: "Sweet Sandwiches",
    tagline: "The dessert side of the grill",
    items: sweetSandwiches,
  },
  {
    id: "happy-treats",
    title: "Happy Treats",
    tagline: "Fries, nuggets & rolls",
    items: happyTreats,
  },
  {
    id: "momos-veg",
    title: "Momos — Veg",
    tagline: "Steamed or fried",
    items: vegMomos,
    priceColumns: ["Steam", "Fried"],
  },
  {
    id: "momos-nonveg",
    title: "Momos — Non-Veg",
    tagline: "Steamed or fried",
    items: nonVegMomos,
    priceColumns: ["Steam", "Fried"],
  },
  {
    id: "pasta",
    title: "Pasta",
    tagline: "Red, white & schezwan",
    items: pastas,
  },
  {
    id: "bread-omelette",
    title: "Bread Omelette",
    tagline: "Hot off the pan",
    items: breadOmelettes,
  },
  {
    id: "combos",
    title: "Combos & Family Feast",
    tagline: "Extra dip ₹25",
    items: combos.map((c) => ({
      name: c.name,
      price: c.price,
      note: c.contents.join(" · "),
    })),
  },
  {
    id: "kunafa",
    title: "Kunafa",
    tagline: "Crisp outside, creamy inside",
    items: kunafas,
  },
  {
    id: "falooda",
    title: "Falooda",
    tagline: "Layered and chilled",
    items: faloodas,
  },
  {
    id: "spl-falooda",
    title: "Spl Falooda",
    tagline: "The premium three",
    items: splFaloodas,
  },
  {
    id: "milkshakes",
    title: "Milkshakes",
    tagline: "Thick, cold, loaded",
    items: milkshakes,
  },
  {
    id: "spl-drinks",
    title: "Spl Drinks",
    tagline: "Milks & smoothies",
    items: splDrinks,
    extras: [
      { label: "Add on sabja seed", price: 15 },
      { label: "Parcel extra", price: 10 },
    ],
  },
  {
    id: "lassi",
    title: "Lassi",
    tagline: "Churned and chilled",
    items: lassis,
  },
  {
    id: "mojito",
    title: "Mojito",
    tagline: "Iced and fizzy",
    items: mojitos,
  },
  {
    id: "fresh-juices",
    title: "Classic Fresh Juices",
    tagline: "Pressed to order",
    items: freshJuices,
  },
  {
    id: "special-blends",
    title: "Special Blends",
    tagline: "Built from two or more",
    items: specialBlends,
  },
  {
    id: "detox-juices",
    title: "Detox & Health Juices",
    tagline: "Cold-pressed goodness",
    items: detoxJuices,
  },
  {
    id: "kulukki",
    title: "Kulukki Sarbath",
    tagline: "Shaken, not stirred",
    items: kulukkiSarbath,
  },
  {
    id: "fruit-salad",
    title: "Fruit Salad",
    tagline: "Seasonal and fresh",
    items: fruitSalads,
  },
];
