import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Cursor } from "@/components/Cursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero, Section } from "@/components/page";
import { CAFE } from "@/data/site";
import { findPost, postsByDate, type Post } from "@/data/blog";
import { breadcrumbSchema, ld, pageSchema, restaurantSchema, SITE_URL } from "@/data/seo";

const PATH = "/blog";

/** The post as a search engine reads it. */
const articleSchema = (post: Post) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": `${SITE_URL}${PATH}/${post.slug}#post`,
  headline: post.title,
  description: post.description,
  datePublished: post.date,
  dateModified: post.date,
  inLanguage: "en-IN",
  url: `${SITE_URL}${PATH}/${post.slug}`,
  mainEntityOfPage: { "@id": `${SITE_URL}${PATH}/${post.slug}#webpage` },
  author: { "@type": "Organization", name: CAFE.name, "@id": `${SITE_URL}/#restaurant` },
  publisher: { "@id": `${SITE_URL}/#restaurant` },
  isPartOf: { "@id": `${SITE_URL}${PATH}#blog` },
});

export const Route = createFileRoute("/blog/$slug")({
  // a slug nobody wrote is a 404, not an empty page
  loader: ({ params }) => {
    const post = findPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ params }) => {
    const post = findPost(params.slug);
    if (!post) return {};
    const url = `${SITE_URL}${PATH}/${post.slug}`;
    return {
      meta: [
        // the cafe's name is in some of the titles already; saying it twice
        // only pushes the end of the line out of the search result
        {
          title: post.title.includes(CAFE.name) ? post.title : `${post.title} — ${CAFE.name}`,
        },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: post.date },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ld(
          pageSchema({
            path: `${PATH}/${post.slug}`,
            name: post.title,
            description: post.description,
          }),
        ),
        ld(articleSchema(post)),
        ld(restaurantSchema),
        ld(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "From the kitchen", path: PATH },
            { name: post.title, path: `${PATH}/${post.slug}` },
          ]),
        ),
      ],
    };
  },
  component: PostPage,
});

const readable = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

function PostPage() {
  const post = Route.useLoaderData();
  const others = postsByDate.filter((x) => x.slug !== post.slug).slice(0, 2);

  // the heading is split so the accent line carries the end of the title
  const words = post.title.split(" ");
  const head = words.slice(0, Math.ceil(words.length / 2)).join(" ");
  const tail = words.slice(Math.ceil(words.length / 2)).join(" ");

  return (
    <>
      <Cursor />
      <SiteHeader overDark />

      <main>
        <PageHero
          eyebrow={`${readable(post.date)} · ${post.minutes} min read`}
          title={head.toUpperCase()}
          accent={tail.toUpperCase()}
          lede={post.standfirst}
          trail={[
            { name: "Home", path: "/" },
            { name: "From the kitchen", path: PATH },
          ]}
        />

        <Section>
          <article className="mx-auto max-w-2xl">
            {post.body.map((block, i) => {
              if (block.kind === "h2") {
                return (
                  <h2
                    key={i}
                    className="mt-10 font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-ink md:text-2xl"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.kind === "list") {
                return (
                  <ul key={i} className="mt-5 space-y-2">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-3 text-ink/75">
                        <span
                          aria-hidden
                          className="mt-2.5 size-1.5 shrink-0 rounded-full bg-orange"
                        />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (block.kind === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="serif-accent mt-7 border-l-2 border-orange pl-5 text-lg italic leading-relaxed text-ink/70"
                  >
                    {block.text}
                  </blockquote>
                );
              }
              return (
                <p key={i} className="mt-5 leading-relaxed text-ink/75">
                  {block.text}
                </p>
              );
            })}

            <div className="mt-12 flex flex-wrap gap-3 border-t border-ink/10 pt-8">
              <Link
                to="/menu"
                data-cursor="cta"
                className="inline-flex items-center rounded-full bg-orange px-7 py-3.5 text-[0.64rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
              >
                See the menu
              </Link>
              <Link
                to="/contact"
                data-cursor="cta"
                className="inline-flex items-center rounded-full border border-ink/20 px-7 py-3.5 text-[0.64rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-colors duration-300 hover:border-orange hover:text-orange-ink"
              >
                Find the cafe
              </Link>
            </div>
          </article>
        </Section>

        {others.length > 0 && (
          <Section tone="warm">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.24em] text-ink/45">
              More from the kitchen
            </p>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: other.slug }}
                    className="group block rounded-2xl border border-ink/10 bg-paper p-5 transition-colors duration-300 hover:border-orange"
                  >
                    <h3 className="font-display text-base font-extrabold uppercase leading-tight tracking-[-0.01em] text-ink">
                      {other.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/60">{other.standfirst}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
