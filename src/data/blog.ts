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
  /**
   * What the tab and the search result say, when the headline above is too
   * long for them. Google prints about sixty characters and the cafe's name
   * is added after this, so it is kept short.
   */
  seoTitle?: string;
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
    seoTitle: "What to order on a first visit",
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
    seoTitle: "Food delivery in Arani",
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
  {
    slug: "order-food-online-in-arani",
    title: "Ordering food online in Arani, and what reaches the kitchen",
    seoTitle: "Ordering food online in Arani",
    description:
      "How online food ordering works in Arani: ordering direct from Twin's Golden Cafe, what it costs, and what happens to your order once you send it.",
    standfirst:
      "An order placed here reaches a phone behind the counter. Nothing stands between the two.",
    date: "2026-11-06",
    minutes: 4,
    body: [
      p(
        "Most food ordered online in India goes through an app that sits between the kitchen and the person eating. That works, and there are days it is the only thing open. But it is worth knowing what the other route looks like, because this cafe runs one.",
      ),

      h2("What happens when you order here"),
      p(
        "You pick what you want on the menu page, say whether you are collecting it or want it delivered, and share your location. The order goes to the cafe's own WhatsApp with everything written out: the dishes, the sizes, the total, your number and a map pin. Somebody behind the counter reads it and starts cooking.",
      ),
      p(
        "There is no queue of restaurants, no rider assigned from three streets away, and no app deciding when the kitchen sees it. It is the same phone the cafe answers calls on.",
      ),

      h2("The prices are the board's prices"),
      p(
        "What you see on the menu page is what is written on the board at the Old Bus Stand — the same numbers, kept in one place so they cannot drift apart. A Crispy Drumstick is ₹89 here because it is ₹89 there.",
      ),
      p(
        `Packing is ₹10 a dish and it is shown as its own line rather than folded into anything. Delivery is free inside ${CAFE.freeDeliveryKm} kilometres and free on any order over ₹${CAFE.freeDeliveryOver}; outside that the counter tells you the charge on WhatsApp before anything is cooked.`,
      ),

      h2("Paying"),
      p(
        "UPI or cash. Choosing UPI gives you a QR code and a button that opens Google Pay, PhonePe, Paytm or whatever else you use, with the amount already filled in. Send a screenshot in the chat and the counter checks it against the account before the order is confirmed.",
      ),
      p("Cash is simpler: pay when you collect it, or at the door."),

      h2("Swiggy, if you would rather"),
      p(
        `The kitchen is on Swiggy too, listed under its older name, ${CAFE.swiggyName} — the same food out of the same fryer. Some evenings that is the easier route and nobody at the counter minds.`,
      ),
      quote(
        "The difference is only this: an order placed on this site arrives as a message somebody reads, and anything you want changed you can simply type.",
      ),

      h2("Where it reaches"),
      p(
        `${CAFE.deliveryTown} town and about ${CAFE.deliveryRadiusKm} kilometres around it — ${CAFE.deliveryPlaces.join(", ")} and the villages along those roads. Open every day, ${CAFE.hoursShort}.`,
      ),
    ],
  },

  {
    slug: "vegetarian-food-in-arani",
    title: "Vegetarian food in Arani: 172 dishes at one counter",
    seoTitle: "Vegetarian food in Arani",
    description:
      "Where to eat vegetarian in Arani: 172 of the 259 dishes at Twin's Golden Cafe are veg, from ₹30 juices to ₹380 kunafa. What to order and what it costs.",
    standfirst:
      "Two thirds of the board, and not one of it an afterthought bolted on to a chicken menu.",
    date: "2026-11-06",
    minutes: 4,
    body: [
      p(
        "A cafe that sells fried chicken usually treats the vegetarian side as a short list near the back. This one does not, and the number says so: 172 of the 259 dishes are vegetarian. On the menu page each carries a green dot, and a switch at the top hides everything else.",
      ),

      h2("Pizza, 13 of them"),
      p(
        "From ₹129, stone-baked to order. Six are vegetarian outright — corn, paneer two ways, mushroom — and extra cheese is ₹20 if you want it heavier.",
      ),

      h2("Momos, steamed or fried"),
      p(
        "Six vegetarian fillings, each available steamed or fried, from ₹89 to ₹129: paneer, paneer tikka, mushroom, corn, corn and cheese, and plain veg. Steamed is the lighter plate; fried is the one that disappears faster.",
      ),

      h2("Pasta, sandwiches and the fryer"),
      p(
        "Red sauce, white sauce, schezwan, corn, paneer and a cheese-loaded pasta. The grill does crispy veg, spicy corn, peri peri paneer, tandoori mushroom and mint veg sandwiches. From the fryer: french fries, peri peri fries, cheesy fries, cheese corn nuggets, veg nuggets and veg rolls.",
      ),

      h2("The sweet end"),
      list([
        "Kunafa — 11 flavours, ₹240 to ₹380, all vegetarian",
        "Waffles — 19 of them, ₹89 to ₹149",
        "Falooda — royal, malai, rabdi, dry fruit and more",
        "Desserts — basundi, rabdi, brownies, bun with palkhova from ₹30",
      ]),

      h2("And to drink"),
      p(
        "Seventeen fresh juices from ₹30, five special blends and four detox juices from ₹80, milkshakes, lassi, mojitos and the kulukki sarbath. Everything pressed when you order it.",
      ),
      p(
        `The cafe is not pure vegetarian and does not pretend to be — the fryer does chicken all evening. What is true is that most of the board does not touch it, and that is unusual for a place in ${CAFE.deliveryTown} that is known for its fried chicken.`,
      ),
    ],
  },

  {
    slug: "kunafa-in-arani",
    title: "Kunafa in Arani: eleven ways, pulled fresh at the counter",
    seoTitle: "Kunafa in Arani",
    description:
      "Where to eat kunafa in Arani. Eleven flavours at Twin's Golden Cafe, ₹240 to ₹380, baked crisp with a molten centre and finished to order.",
    standfirst:
      "A Middle Eastern pastry that turned up at the Old Bus Stand and stayed. Here is what it is.",
    date: "2026-11-06",
    minutes: 3,
    body: [
      p(
        "Kunafa is shredded pastry — fine strands, something like vermicelli — packed over a soft cheese or cream centre, baked until the top is dark and crisp, then soaked in syrup while it is still hot. The contrast is the whole point: a crackling lid over something molten.",
      ),
      p(
        "It is Levantine by origin and has reached most Indian cities in the last few years. It reached Arani by way of this counter.",
      ),

      h2("The eleven"),
      p(
        "The house version is the cream kunafa at ₹240, which is the one to start with if you have not had it before. From there it gets busier.",
      ),
      list([
        "Cream — ₹240, the plain one and the best introduction",
        "Mozzarella — ₹250, the cheese version, closer to the original",
        "Chocolate, blueberry, strawberry — ₹280",
        "Kunafa with ice cream — ₹290, hot pastry and cold scoop",
        "Kitkat, caramel, Oreo — the loaded end of the counter",
        "Nutella and Lotus Biscoff — ₹380, the top of the board",
      ]),

      h2("Why it is made to order"),
      p(
        "A kunafa that has been sitting is a kunafa with a soft top, and a soft top is the one thing it cannot survive. It is finished when you order it, which is why the counter asks you to wait a few minutes rather than handing it straight over.",
      ),

      h2("Eating it"),
      p(
        "Hot, with a spoon, and sooner rather than later. If you are taking it home, it travels about fifteen minutes before the top starts to give — inside Arani town that is usually fine, and the cafe packs it so the syrup stays where it should.",
      ),
      p(
        `Every one of them is vegetarian. The counter is open ${CAFE.hoursShort}, every day, at ${CAFE.shortAddress}.`,
      ),
    ],
  },
  {
    slug: "momos-in-arani",
    title: "Momos in Arani: twelve fillings, steamed or fried",
    seoTitle: "Momos in Arani",
    description:
      "Where to eat momos in Arani. Twelve fillings at Twin's Golden Cafe, each steamed or fried, from ₹89 — and what the difference actually is.",
    standfirst: "The same dumpling twice over, and the choice is not a small one.",
    date: "2026-11-06",
    minutes: 3,
    body: [
      p(
        "Momos arrived in Tamil Nadu from a long way north and settled in without much ceremony. The counter here does twelve fillings, six vegetarian and six not, and every one of them can be steamed or fried — which is twenty-four plates from one list.",
      ),

      h2("Steamed or fried"),
      p(
        "Steamed is the original and the lighter plate: the wrapper stays soft, the filling tastes of itself, and the chutney does the work. Fried takes the same dumpling into oil afterwards, so the base goes crisp and the wrapper blisters. Neither is the correct answer. Fried costs about ten rupees more.",
      ),

      h2("The vegetarian six"),
      list([
        "Veg Momo — ₹89 steamed, the plain one",
        "Paneer Momo and Paneer Tikka Momo — ₹99 steamed",
        "Mushroom Momo — ₹99 steamed",
        "Corn Momo — ₹99 steamed",
        "Corn & Cheese Momo — ₹119 steamed, the heaviest of them",
      ]),

      h2("The chicken six"),
      p(
        "Chicken tikka is where most people start, and it runs through peri-peri, cheese, barbecue and schezwan to the chicken pizza momo, which is as odd and as popular as it sounds. The chicken list runs from ₹99 to ₹149.",
      ),

      h2("A plate, or part of one"),
      p(
        "A plate of momos is a reasonable snack on its own and a good third dish for two people who have already ordered something fried. If you are ordering for a table, they travel better steamed than fried — the crisp base is the first thing to go soft on the ride.",
      ),
      p(
        `The counter is at ${CAFE.shortAddress}, open ${CAFE.hoursShort} every day, and delivery across ${CAFE.deliveryTown} is free inside ${CAFE.freeDeliveryKm} kilometres.`,
      ),
    ],
  },

  {
    slug: "party-food-order-arani",
    title: "Ordering food for a crowd in Arani",
    seoTitle: "Party food orders in Arani",
    description:
      "Ordering food for a party or an office in Arani: family combos from ₹599, how much to order per head, and how to get it there warm.",
    standfirst:
      "Eight people, one order, and the arithmetic nobody wants to do standing at a counter.",
    date: "2026-11-06",
    minutes: 4,
    body: [
      p(
        "Ordering for one is easy. Ordering for eight is where people either over-order by half or end up short, and the counter gets asked the same question most weeks: how much is enough?",
      ),

      h2("Start with the family combos"),
      p(
        "They exist for this. Family Combo 1 is ₹599 — six crispy chicken, a large chicken popcorn and three dips. Family Combo 2 is ₹899 — eight crispy chicken, a large popcorn, two burgers and two dips. The second one feeds a table of five or six who are actually hungry; the first suits three or four.",
      ),
      p(
        "For a bigger group, two of the ₹899 is a better order than anything assembled piece by piece, and it is less for the kitchen to get wrong.",
      ),

      h2("Roughly, per head"),
      list([
        "A snack between conversations — one combo between two",
        "An actual meal — a burger or a wrap each, plus fries to share",
        "A proper spread — two pieces of chicken a head, one shared popcorn per four",
        "Always one dip per two people. Nobody shares a dip three ways happily.",
      ]),

      h2("Feeding people who do not eat chicken"),
      p(
        "Most of this board is vegetarian, so it is not a problem: a couple of veg pizzas from ₹129, paneer momos, cheese corn nuggets and a jug's worth of fresh juice will sit beside the chicken without anybody feeling catered-to as an afterthought.",
      ),

      h2("Getting it there warm"),
      p(
        `Everything fried is cooked after you order, so a large order takes longer than a small one — tell the counter the time you want it and they will work back from that rather than start when the message lands. Delivery is free on anything over ₹${CAFE.freeDeliveryOver}, which a party order passes without trying, and free anywhere inside ${CAFE.freeDeliveryKm} kilometres.`,
      ),
      quote(
        "If it is going further than the town, order the momos steamed and the chicken plain. Sauce and crisp both travel badly; everything else is fine.",
      ),
      p(
        `Ordering is the same as any other order — put it in the cart, share the pin, and it reaches the cafe's WhatsApp where somebody can ring you back if the numbers look wrong. Or call ${CAFE.phone}.`,
      ),
    ],
  },

  {
    slug: "pizza-in-arani",
    title: "Pizza in Arani: thirteen on the board, six of them veg",
    seoTitle: "Pizza in Arani",
    description:
      "Where to eat pizza in Arani. Thirteen at Twin's Golden Cafe from ₹129 — six vegetarian, seven with chicken, all baked after you order.",
    standfirst: "Baked when you ask for it, which is the only part that matters.",
    date: "2026-11-06",
    minutes: 3,
    body: [
      p(
        "A pizza is dough, a sauce, cheese and heat, and the difference between a good one and a sad one is almost entirely the last of those. The ones here go into the oven after the order rather than before it, which is slower and is the point.",
      ),

      h2("The vegetarian side"),
      list([
        "Delight Veg — ₹129, the plain one",
        "Hot & Spicy Veg — ₹139",
        "Golden Corn — ₹139",
        "Farm Fresh Paneer — ₹149",
        "Tandoori Paneer — ₹159",
        "Village Mushroom — ₹169",
      ]),

      h2("The chicken side"),
      p(
        "Chicken tikka at ₹169 is the one most tables order. Cheesy chicken is ₹179, peri peri and makhani ₹189, and the top three — special barbecue, chicken and corn, schezwan chicken — are ₹199 each.",
      ),
      p("Extra cheese is ₹20 on any of them."),

      h2("Which to order"),
      p(
        "If you have not eaten here before, the tandoori paneer and the chicken tikka are the two that taste most like the kitchen rather than like a pizza chain — the tandoori masala is the same one the grill uses, and it comes through.",
      ),
      p(
        "If you are ordering for people who disagree about food, the corn pizza settles more arguments than anything else on the board.",
      ),

      h2("Taking it home"),
      p(
        `Pizza is one of the better travellers — fifteen or twenty minutes does it no harm. Delivery across ${CAFE.deliveryTown} is free inside ${CAFE.freeDeliveryKm} kilometres or on anything over ₹${CAFE.freeDeliveryOver}, and the box is ₹10.`,
      ),
      p(`${CAFE.shortAddress}, open ${CAFE.hoursShort} every day.`),
    ],
  },
];

/** Newest first, which is the order a reader expects. */
export const postsByDate = [...posts].sort((a, b) => b.date.localeCompare(a.date));

export const findPost = (slug: string) => posts.find((x) => x.slug === slug);
