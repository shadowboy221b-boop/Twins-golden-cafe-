import { createFileRoute } from "@tanstack/react-router";
import { Cursor } from "@/components/Cursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/Hero";
import { BrandMarquee } from "@/components/BrandMarquee";
import { FeatureBanner } from "@/components/FeatureBanner";
import burgerSplash from "@/assets/burger-splash.webp";
import { BestCombos } from "@/components/home/BestCombos";
import { GoldenSpecials } from "@/components/home/GoldenSpecials";
import { KunafaSpecial } from "@/components/home/KunafaSpecial";
import { CategoriesPreview, WhyChooseUs } from "@/components/home/HomeSections";

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
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
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

        <FeatureBanner
          src={burgerSplash}
          width={1254}
          height={1254}
          eyebrow="Built for big bites"
          title="STACKED,"
          accent="SAUCED, SERVED."
          lede="Fried chicken fillet, cheese, crisp lettuce and the signature sauce — assembled the moment you order."
          cta={{ to: "/menu", label: "See the burgers" }}
        />

        <GoldenSpecials />
        <KunafaSpecial />
        <CategoriesPreview />
        <WhyChooseUs />
      </main>

      <SiteFooter />
    </>
  );
}
