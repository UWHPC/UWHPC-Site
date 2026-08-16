import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Blog from "@/components/Blog";
import { pageMetadata } from "@/lib/site";

/**
 * Hidden while the blog is still a "coming soon" stub: no nav link, absent
 * from the sitemap, and noindexed here. A thin page that ranks is worse than
 * no page at all. To unhide: drop the `robots` block below, restore the nav
 * entry in Nav.tsx, and re-add the route to sitemap.ts.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Blog",
    description:
      "Notes, deep-dives, and post-mortems from the UWHPC team on performance engineering, parallel computing, and systems work.",
    path: "/blog",
  }),
  robots: { index: false, follow: true },
};

export default function BlogPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <Blog as="h1" />
      </main>
      <Footer />
    </>
  );
}
