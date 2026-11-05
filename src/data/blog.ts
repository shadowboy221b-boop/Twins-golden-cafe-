import { CAFE } from "@/data/site";

/**
 * The cafe's own writing.
 *
 * Everything here is answerable from the counter: what is on the board, what
 * a thing costs, how it is cooked, where it is delivered. Nothing is written
 * to fill a page — a post that could have been written by somebody who has
 * never been to Arani is a post that should not exist, and Google treats a
 * pile of those exactly as it deserves.
 *
 * A post is data rather than a file of its own: the page that renders it is
 * the same for all of them, so adding one is adding an entry here.
 */

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "quote"; text: string };

export type Post = {
  slug: string;
  title: string;
  /** what the search result says, 70–160 characters */
  description: string;
  /** the line under the heading */
  standfirst: string;
  /** ISO date, the day it was published */
  date: string;
  /** how long it takes to read, in minutes */
  minutes: number;
  body: Block[];
};

const p = (text: string): Block => ({ kind: "p", text });
const h2 = (text: string): Block => ({ kind: "h2", text });
const list = (items: string[]): Block => ({ kind: "list", items });
const quote = (text: string): Block => ({ kind: "quote", text });

export const posts: Post[] = [
  {
    slug: "what-to-order-first-time",
    title: "What to order at Twin's Golden Cafe the first time",
    description:
      "A board with 259 dishes is hard to read standing up. Here is what to order on a first visit to Twin's Golden Cafe, Arani, and what it costs.",
    standfirst:
      "Thirty-four counters is a lot to take in at a counter. This is the short way round it.",
    date: "2026-11-05",
    minutes: 4,
    body: [
      p(
        "The board at the Old Bus Stand runs to 34 counters and 259 dishes, which is wonderful on a quiet afternoon and useless when there are four people behind you. Here is the short way through it, by what you came in for.",
      ),

      h2("If you came in hungry"),
      p(
        "The fried chicken counter is the one to start at. A Crispy Drumstick is ₹89 for one piece and ₹159 for two, and it is fried after you order rather than kept warm — which is the whole reason it is worth the wait. Four pieces is ₹309, six is ₹489, eight is ₹619, and past four pieces you are feeding more than yourself.",
      ),
      p(
        "If you want it sauced, the Korean counter does the same chicken fried twice and tossed by hand: ₹159 for the original gochujang, ₹169 for the hotter Dragon, ₹179 for teriyaki, ₹189 for malai or smoked barbecue. Teriyaki is the one children finish.",
      ),

      h2("If you came in with somebody"),
      p(
        "The combos are the cheapest way to eat properly. A Snack Combo is ₹169 — a crispy chicken, a small popcorn chicken and a dip. The Wrap Combo and the Burger Combo sit near it. The two family combos are built for a table rather than a person, and the larger one is ₹899.",
      ),
      p(
        "Ordering for a group is also the point at which delivery becomes free: anything over ₹500 goes out without a delivery charge, and so does anything at all inside three kilometres of the cafe.",
      ),

      h2("If you are vegetarian"),
      p(
        "Most of the board is. 172 of the 259 dishes are vegetarian, and they are not an afterthought — the pizzas, the paneer momos, the pastas, the sandwiches, the kunafa, the falooda, the shakes and every juice. On the menu page each one carries a green dot, and there is a switch at the top that hides everything else.",
      ),
      list([
        "Veg pizzas from ₹129",
        "Paneer Tikka Momo, steamed or fried",
        "Kunafa from ₹240, eleven flavours",
        "Fresh juice from ₹30",
      ]),

      h2("If you came in for something sweet"),
      p(
        "The kunafa is the house signature: shredded pastry baked crisp over a molten centre, eleven finishes, ₹240 to ₹380. The waffle counter is newer — nineteen of them, ₹89 for butter and honey up to ₹149, and four of those are ice-wiches, which is a scoop of ice cream pressed between two waffles rather than sitting on one.",
      ),
      p(
        "If you want something smaller, the dessert counter starts at ₹30 for a bun with palkhova and ends at ₹149 for a hot sizzling brownie.",
      ),

      h2("A word on timing"),
      p(
        `The kitchen is open ${CAFE.hoursShort}, every day. Everything fried is cooked to order, so the counter will tell you a few minutes rather than hand it over — that is the trade, and it is the right one.`,
      ),
    ],
  },

  {
    slug: "free-delivery-in-arani",
    title: "How food delivery works at Twin's Golden Cafe, Arani",
    description:
      "Where Twin's Golden Cafe delivers in and around Arani, when delivery is free, and what the cafe needs from you so the rider finds the door.",
    standfirst:
      "Twenty kilometres, two ways to pay nothing for it, and the one thing that decides whether your food arrives warm.",
    date: "2026-11-05",
    minutes: 3,
    body: [
      p(
        `The cafe runs its own deliveries across ${CAFE.deliveryTown} town and out to about ${CAFE.deliveryRadiusKm} kilometres around it — ${CAFE.deliveryPlaces.join(", ")} and the villages along those roads. Swiggy carries orders as well, where the kitchen is still listed under its older name, ${CAFE.swiggyName}.`,
      ),

      h2("When it costs nothing"),
      p(
        `Two ways, and either one is enough on its own. Inside ${CAFE.freeDeliveryKm} kilometres of the cafe, delivery is free whatever you order — one pizza, one dip, it does not matter. Beyond that, an order over ₹${CAFE.freeDeliveryOver} goes out free.`,
      ),
      p(
        "The cart works it out while you are still ordering rather than at the end. If you are short of the five hundred it says by how much, and if you are close enough to the cafe it simply says so.",
      ),

      h2("The thing that actually matters"),
      p(
        "An address in Arani is usually a landmark and a street name. That is enough for somebody who already knows the town and no help at all to a rider who does not, which is how a delivery turns into three phone calls and cold food.",
      ),
      p(
        "So the site asks your phone where you are and sends a map pin with the order. The rider taps it and the map opens on the gate. Your phone will ask you to allow it; the cafe sees a pin and nothing else, only for that order, and it is not kept afterwards.",
      ),
      quote(
        "If your phone will not share it — some have the setting off — give a landmark instead and the counter will call if the rider cannot find you.",
      ),

      h2("Ordering"),
      p(
        "Add what you want on the menu page, choose delivery, share the pin, and the order goes to the cafe's WhatsApp with everything on it: the dishes, the total, your number and the map link. Pay by UPI on the site or in cash when it arrives.",
      ),
      p(
        `Packing is ₹10 a dish, which covers the box and the bag. If an order is going outside the ${CAFE.deliveryRadiusKm} kilometres, the site says so before you pay rather than after, and the counter will tell you on WhatsApp whether they can reach you.`,
      ),
    ],
  },

  {
    slug: "korean-fried-chicken-double-fried",
    title: "Why Korean fried chicken is fried twice",
    description:
      "Double frying, and why the glaze goes on last: how the Korean counter at Twin's Golden Cafe, Arani keeps the crust crisp under the sauce.",
    standfirst: "Sauce on fried chicken usually ruins it. This is the method that does not.",
    date: "2026-11-05",
    minutes: 3,
    body: [
      p(
        "Pour something wet over something crisp and you get something soft. Every cook knows it, which is why sauced fried chicken is usually a disappointment by the time it reaches the table. Korean fried chicken is the exception, and the reason is dull and mechanical rather than secret.",
      ),

      h2("The first fry cooks it. The second dries it."),
      p(
        "The chicken goes into the oil once at a lower heat, long enough to cook through. It comes out, rests, and goes back into hotter oil for a short second fry. The second pass is not about cooking — the chicken is already cooked — it is about driving the last of the moisture out of the coating.",
      ),
      p(
        "What you end up with is a crust that is dry all the way through rather than one with a little steam still trapped under it. That is the crust that survives a sauce.",
      ),

      h2("The glaze goes on after, not before"),
      p(
        "The second thing is timing. The chicken is tossed in its glaze in a bowl, by hand, in the half minute after it leaves the oil — not marinated in it, not held in it under a lamp. Sesame over the top and it goes out.",
      ),
      p(
        "This is why it cannot be made ahead. A tray of glazed chicken sitting for twenty minutes is a tray of soft chicken, whatever was done to it before.",
      ),

      h2("The five at the counter"),
      list([
        "Korean Crispy Fried Chicken, ₹159 — gochujang, garlic, a little sweetness. Hot.",
        "Dragon Crispy Fried Chicken, ₹169 — the same, taken further. The hottest.",
        "Teriyaki Crispy Fried Chicken, ₹179 — soy and honey cooked down until it glosses. No chilli.",
        "Malai Crispy Fried Chicken, ₹189 — cream and mild spice. The gentlest.",
        "Smokey BBQ Chicken, ₹189 — smoked barbecue, closer to a grill than to a sauce.",
      ]),
      p(
        "The same glazes turn up on the loaded fries and in a wrap, if you would rather have them that way.",
      ),
    ],
  },
];

/** Newest first, which is the order a reader expects. */
export const postsByDate = [...posts].sort((a, b) => b.date.localeCompare(a.date));

export const findPost = (slug: string) => posts.find((x) => x.slug === slug);
