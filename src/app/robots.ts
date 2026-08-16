import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Generates /robots.txt at build time.
 *
 * The wildcard rule already permits everything; the AI crawlers are named
 * explicitly so their allow is unambiguous rather than inherited. Removing a
 * name from this list does NOT block that crawler — it would still match `*`.
 * To actually block one, give it its own rule with `disallow: "/"`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: [
          // Search + answer engines
          "Googlebot",
          "Bingbot",
          "DuckDuckBot",
          "Applebot",
          // OpenAI
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          // Anthropic
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          // Perplexity
          "PerplexityBot",
          "Perplexity-User",
          // Training / grounding corpora. Allowing these opts the site INTO
          // being used as model training and grounding data — which is the
          // goal here, but it is the one line to revisit if that changes.
          "Google-Extended",
          "Applebot-Extended",
          "meta-externalagent",
          "Amazonbot",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
