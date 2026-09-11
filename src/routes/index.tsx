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

const title = "Twin's Golden Cafe — Taste the Golden Side";
const description =
  "An immersive food-brand experience: fried chicken, big-bite burgers, loaded fries, the Golden Kunafa, shakes and mojitos — fried to order at Twin's Golden Cafe.";

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

        {/* no closing band here: the footer's sign-off is the one call to
            action every page ends on */}
      </main>

      <SiteFooter />
    </>
  );
}
