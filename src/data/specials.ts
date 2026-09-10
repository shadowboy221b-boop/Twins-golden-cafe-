import drumstick from "@/assets/drumstick.webp";
import burgerSplash from "@/assets/burger-splash.webp";
import pizza from "@/assets/pizza.webp";
import friesExplosion from "@/assets/fries-explosion.webp";
import freshJuice from "@/assets/fresh-juice.webp";
import brownieShake from "@/assets/brownie-shake.webp";
import kunafa from "@/assets/kunafa.webp";
import falooda from "@/assets/falooda.webp";

export type SpecialGroup = {
  id: string;
  title: string;
  tagline: string;
  items: string[];
  /** sub-lists, for groups that split into ranges (juices) */
  lists?: { label: string; items: string[] }[];
  src: string;
  w: number;
  h: number;
};

/**
 * The Golden Specials board — signature and premium items.
 *
 * Deliberately name-only: this is a showcase, not a price list. Anything here
 * that also carries a price lives in `menu.ts`, which stays the single source
 * of truth for what a dish costs.
 */
export const specialGroups: SpecialGroup[] = [
  {
    id: "signature-chicken",
    title: "Fried Chicken & Signature Wraps",
    tagline: "Glazed, spiced, rolled",
    src: drumstick,
    w: 1024,
    h: 1024,
    items: [
      "Korean Crispy Fried Chicken",
      "Dragon Crispy Fried Chicken",
      "Teriyaki Crispy Fried Chicken",
      "Malai Crispy Fried Chicken",
      "Smokey BBQ Chicken",
      "Punjabi Makhni Chicken Wrap",
      "Tandoori Chicken Wrap",
      "Korean Fried Chicken Wrap",
      "Mexican Fried Chicken Wrap",
    ],
  },
  {
    id: "signature-burgers",
    title: "Signature Burgers",
    tagline: "Stacked to order",
    src: burgerSplash,
    w: 1254,
    h: 1254,
    items: [
      "Signature Burger",
      "Nashville Burger",
      "Mexican Chipotle Burger",
      "Punjabi Chicken Makhni Burger",
      "Teriyaki Chicken Burger",
    ],
  },
  {
    id: "signature-pizzas",
    title: "Signature Pizzas",
    tagline: "Stone deck, baked to order",
    src: pizza,
    w: 1200,
    h: 1200,
    items: [
      "SPL BBQ Pizza",
      "Chicken & Corn Pizza",
      "Schezwan Chicken Pizza",
      "Chicken Makhani Pizza",
      "Peri Peri Chicken Pizza",
    ],
  },
  {
    id: "signature-fries",
    title: "Loaded Fries",
    tagline: "Tossed hot so it sticks",
    src: friesExplosion,
    w: 736,
    h: 1030,
    items: [
      "Gochujang Loaded Fries",
      "Teriyaki Loaded Fries",
      "Nashville Loaded Fries",
      "Sweet & Chilli Loaded Fries",
      "Cheesy Chicken Loaded Fries",
    ],
  },
  {
    id: "signature-juices",
    title: "Fresh Juices & Special Blends",
    tagline: "Pressed to order",
    src: freshJuice,
    w: 736,
    h: 1104,
    items: [],
    lists: [
      {
        label: "Fresh Juices",
        items: [
          "Pomegranate",
          "Pineapple",
          "Orange",
          "Apple",
          "Grape",
          "Mango",
          "Muskmelon",
          "Kiwi",
          "Fig",
          "Dragon Fruit",
          "Avocado",
        ],
      },
      {
        label: "Special Blends",
        items: ["Mango Delight", "Sunrise Boost", "Tropical Mix", "Berry Blast", "Green Power"],
      },
      {
        label: "Detox & Health",
        items: ["ABC", "Fat Cutter", "Detox Green", "Immunity Booster"],
      },
    ],
  },
  {
    id: "signature-shakes",
    title: "Signature Milkshakes",
    tagline: "Thick, cold, loaded",
    src: brownieShake,
    w: 736,
    h: 1472,
    items: [
      "Vanilla",
      "Strawberry",
      "Pistachio",
      "Chocolate",
      "Mango Mad",
      "Butterscotch",
      "Caramel",
      "Blueberry Delight",
      "Oreo",
      "KitKat",
      "Brownie",
      "Belgian Choco",
      "Black Curranto",
      "Oreo Blast Brownie",
      "Cold Coffee",
    ],
  },
  {
    id: "signature-kunafa",
    title: "Premium Kunafa",
    tagline: "Crisp outside, creamy inside",
    src: kunafa,
    w: 1200,
    h: 1008,
    items: [
      "Nutella Kunafa",
      "Lotus Biscoff Kunafa",
      "Oreo Kunafa",
      "KitKat Kunafa",
      "Caramel Kunafa",
      "Blueberry Kunafa",
      "Strawberry Kunafa",
      "Kunafa with Ice Cream",
    ],
  },
  {
    id: "signature-falooda",
    title: "Premium Falooda",
    tagline: "Layered and chilled",
    src: falooda,
    w: 736,
    h: 1308,
    items: ["Malai Falooda", "Rabdi Falooda", "Dry Fruit Falooda"],
  },
];

/** The eight the kitchen leads with. */
export const heroProducts = [
  "Korean Crispy Fried Chicken",
  "Signature Burger",
  "SPL BBQ Pizza",
  "Korean Fried Chicken Wrap",
  "Gochujang Loaded Fries",
  "Berry Blast",
  "Oreo Blast Brownie Milkshake",
  "Lotus Biscoff Kunafa",
];
