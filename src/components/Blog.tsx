"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import { Container, SectionHeader } from "@/components/ui";

const posts: {
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  href?: string;
}[] = [
  {
    title: "Coming soon",
    excerpt:
      "We’re putting together write-ups on our Monte Carlo engine, GPU profiling experiments, and lessons from running on student hardware.",
    date: "TBD",
    tag: "Announcement",
  },
];

function PostRow({
  post,
  index,
}: {
  post: (typeof posts)[number];
  index: number;
}) {
  const divRef = useFadeIn<HTMLDivElement>(index * 100);
  const anchorRef = useFadeIn<HTMLAnchorElement>(index * 100);

  const content = (
    <>
      <span className="font-mono text-xs text-ink-faint md:col-span-3">
        [{post.tag}]
      </span>

      <div className="md:col-span-7">
        <h3 className="mb-2 text-xl font-semibold tracking-tight">
          {post.title}
        </h3>
        <p className="max-w-prose text-sm/6 font-light text-ink-muted">
          {post.excerpt}
        </p>
      </div>

      <span className="font-mono text-xs text-ink-muted md:col-span-2 md:justify-self-end">
        {post.date}
      </span>
    </>
  );

  const className =
    "opacity-0 translate-y-3 transition-all duration-500 ease-out group grid gap-3 border-t border-line py-7 md:grid-cols-12 md:items-baseline md:gap-4 hover:bg-bg-raised";

  if (post.href) {
    return (
      <a ref={anchorRef} href={post.href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <div ref={divRef} className={className}>
      {content}
    </div>
  );
}

export default function Blog({ as = "h2" }: { as?: "h1" | "h2" }) {
  return (
    <section id="blog" className="border-t border-line">
      <Container className="py-24">
        <SectionHeader
          index="04"
          as={as}
          kicker="Latest"
          title="Blog"
          blurb="Notes, deep-dives, and post-mortems from the team."
        />

        <div className="border-b border-line">
          {posts.map((p, i) => (
            <PostRow key={p.title} post={p} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
