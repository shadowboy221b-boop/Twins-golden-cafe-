/**
 * What guests have written on Google, quoted as they wrote it.
 *
 * These are real reviews of the cafe, copied from its Google listing, kept
 * short and always with the name and the month they were left. Nothing here is
 * written by us — if a quote cannot be found on the listing, it does not belong
 * in this file.
 *
 * Deliberately *not* marked up as schema.org ratings: Google does not allow a
 * business to publish star markup about itself, and the stars show on Maps and
 * in search anyway. This section is for the person reading the page.
 */

export type Review = {
  name: string;
  /** whole stars, as left on Google */
  stars: number;
  /** when it was left, in the listing's own words */
  when: string;
  quote: string;
  /** the dish it is about, printed as a tag */
  about: string;
};

/** The listing itself: rating and count as Google shows them. */
export const GOOGLE = {
  rating: 4.4,
  count: 42,
  /** the cafe's place on Google Maps, by its place id */
  url: "https://maps.google.com/?cid=10855196564753764769",
};

export const REVIEWS: Review[] = [
  {
    name: "Revathi Venkatesan",
    stars: 5,
    when: "4 months ago",
    quote:
      "You can really feel the quality and freshness in all their items. The ambience was neat, the service was quick, and the staff were friendly too. Definitely one of the best places for burgers, sandwiches, and milkshakes.",
    about: "Burgers & shakes",
  },
  {
    name: "Prem Kumar",
    stars: 5,
    when: "3 weeks ago",
    quote: "Must try Momos — ossome taste of momos and superb chutney side dish recipe.",
    about: "Momos",
  },
  {
    name: "Sangeethaa",
    stars: 5,
    when: "a month ago",
    quote:
      "The Chicken Tikka Pizza was absolutely delicious. The chicken tikka was flavourful and perfectly seasoned, and the pizza had a great balance of cheese, toppings, and spices.",
    about: "Pizza",
  },
  {
    name: "Deepesh",
    stars: 5,
    when: "2 weeks ago",
    quote:
      "The pomegranate juice was fresh, refreshing, and perfectly balanced in taste. Worth visiting if you're looking for a refreshing drink and a nice cafe experience.",
    about: "Fresh juice",
  },
  {
    name: "Pooja A",
    stars: 5,
    when: "5 months ago",
    quote:
      "Tasty, budget-friendly fried chicken with great combos — perfect for quick cravings, quality is literally too good.",
    about: "Fried chicken",
  },
  {
    name: "Faiz",
    stars: 5,
    when: "6 days ago",
    quote: "Burger and fries is so excellent.",
    about: "Burgers",
  },
];
