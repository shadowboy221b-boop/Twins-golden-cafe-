import { createFileRoute, Link } from "@tanstack/react-router";
import { Cursor } from "@/components/Cursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero, RevealCard, Section } from "@/components/page";
import { postsByDate } from "@/data/blog";
import { breadcrumbSchema, ld, pageSchema, SITE_URL } from "@/data/seo";

const title = "From the Kitchen — Twin's Golden Cafe, Arani";
const description =
  "What to order, how delivery works in Arani, and how the kitchen cooks what it cooks — written at the counter of Twin's Golden Cafe.";

const PATH = "/blog";

/** The list, so a search engine sees the posts without following every link. */
const listSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${SITE_URL}${PATH}#blog`,
  name: title,
  url: `${SITE_URL}${PATH}`,
  inLanguage: "en-IN",
  publisher: { "@id": `${SITE_URL}/#restaurant` },
  blogPost: postsByDate.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `${SITE_URL}${PATH}/${post.slug}`,
  })),
};

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}${PATH}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}${PATH}` }],
    scripts: [
      ld(pageSchema({ path: PATH, name: title, description })),
      ld(listSchema),
      ld(
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "From the kitchen", path: PATH },
        ]),
      ),
    ],
  }),
  component: BlogIndex,
});

const readable = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

function BlogIndex() {
  return (
    <>
      <Cursor />
      <SiteHeader overDark />

      <main>
        <PageHero
          eyebrow="Written at the counter"
          title="FROM THE"
          accent="KITCHEN"
          lede="What to order, how the delivery works, and why a thing is cooked the way it is. Short pieces, written by the people who cook it."
          trail={[
            { name: "Home", path: "/" },
            { name: "From the kitchen", path: PATH },
          ]}
        />

        <Section>
          <ul className="grid gap-5 md:grid-cols-2">
            {postsByDate.map((post, i) => (
              <RevealCard
                as="li"
                key={post.slug}
                index={i}
                className="group h-full rounded-2xl border border-ink/10 bg-paper-warm transition-colors duration-300 hover:border-orange"
              >
                <Link to="/blog/$slug" params={{ slug: post.slug }} className="block h-full p-6">
                  <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.22em] text-ink/45">
                    {readable(post.date)} · {post.minutes} min read
                  </p>
                  <h2 className="mt-3 font-display text-xl font-extrabold uppercase leading-tight tracking-[-0.02em] text-ink md:text-2xl">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">{post.standfirst}</p>
                  <span className="mt-5 inline-flex items-center gap-3 text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-orange-ink">
                    Read it
                    <span
                      aria-hidden
                      className="h-px w-5 bg-orange-ink transition-all duration-500 group-hover:w-10"
                    />
                  </span>
                </Link>
              </RevealCard>
            ))}
          </ul>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
