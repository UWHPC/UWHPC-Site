import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

type Route = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

/**
 * `priority` is relative within this site only — it ranks our own pages
 * against each other for crawl budget, and says nothing to Google about how
 * we compare to anyone else.
 */
const routes: Route[] = [
  { path: "/", priority: 1.0, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.9, changeFrequency: "monthly" },
  { path: "/join", priority: 0.8, changeFrequency: "monthly" },
  { path: "/team", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  // /blog is intentionally omitted while it is noindexed. Listing a
  // noindexed URL in a sitemap sends crawlers a contradictory signal.
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
