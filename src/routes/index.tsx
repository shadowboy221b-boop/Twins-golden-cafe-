import { createFileRoute } from "@tanstack/react-router";
import { Cursor } from "@/components/Cursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/Hero";
import { BrandMarquee } from "@/components/BrandMarquee";
import { BestCombos } from "@/components/home/BestCombos";
import { GoldenSpecials } from "@/components/home/GoldenSpecials";
import { FriedChickenSpecial } from "@/components/home/FriedChickenSpecial";
import { KunafaSpecial } from "@/components/home/KunafaSpecial";
import { CategoriesPreview } from "@/components/home/HomeSections";
import { VegSpecial } from "@/components/home/VegSpecial";
import { JuiceBar } from "@/components/home/JuiceBar";
import { Reviews } from "@/components/home/Reviews";
import { FindUs } from "@/components/home/FindUs";
import { ld, restaurantSchema } from "@/data/seo";

const title = "Twin's Golden Cafe — Cafe & Restaurant in Arani";
const description =
  "Pizza, burgers, fried chicken, momos, kunafa, shakes and juices, cooked to order at Twin's Golden Cafe, Old Bus Stand, Arani. Open daily 9 AM to 10:30 PM.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://twinsgoldencafe.com/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://twinsgoldencafe.com/" }],
    // tells Google this is a place in Arani — address, hours, phone, menu
    scripts: [ld(restaurantSchema)],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Cursor />
      <SiteHeader overDark />

      <main className="relative">
        <Hero />
        <BrandMarquee tone="orange" />
        <BestCombos />
        <VegSpecial />
        <FriedChickenSpecial />
        <GoldenSpecials />
        <KunafaSpecial />
        <JuiceBar />
        <CategoriesPreview />
        <Reviews />
        <FindUs />

        {/* no closing band here: the footer's sign-off is the one call to
            action every page ends on */}
      </main>

      <SiteFooter />
    </>
  );
}
