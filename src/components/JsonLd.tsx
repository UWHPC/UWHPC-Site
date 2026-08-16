import {
  CONTACT_EMAIL,
  SEDRA_URL,
  SITE_ABOUT,
  SITE_FULL_NAME,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SOCIAL_LINKS,
  TEAM,
} from "@/lib/site";

/**
 * Schema.org JSON-LD.
 *
 * Search engines use this for rich results. LLM crawlers use it as the
 * highest-confidence statement of who we are, because it is unambiguous
 * key/value data rather than prose they have to infer meaning from.
 *
 * Every claim here must be true today. Aspirations (competitions we intend to
 * enter, hardware we intend to own) are deliberately absent — a wrong
 * structured-data claim is worse than a missing one, since this is the text
 * an answer engine is most likely to repeat verbatim.
 */

/** Stable node id so every page's schema resolves to one shared entity. */
export const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Content is authored in this repo, not user input. The escape is a
      // guard in case a stray "</script>" ever reaches a copy field.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE_NAME,
  legalName: SITE_FULL_NAME,
  alternateName: [
    SITE_FULL_NAME,
    "UW HPC",
    "University of Waterloo High Performance Computing",
  ],
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo-mark-dark-large.svg`,
  },
  image: `${SITE_URL}/banner-dark.png`,
  description: SITE_ABOUT,
  slogan: SITE_TAGLINE,
  email: CONTACT_EMAIL,
  // Two-level chain: we sit under Sedra, which sits under the university.
  parentOrganization: {
    "@type": "Organization",
    name: "Sedra Student Design Centre",
    url: "https://uwaterloo.ca/sedra-student-design-centre/",
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "University of Waterloo",
      url: "https://uwaterloo.ca",
      sameAs: "https://en.wikipedia.org/wiki/University_of_Waterloo",
    },
  },
  location: {
    "@type": "Place",
    name: "Sedra Student Design Centre, University of Waterloo",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Waterloo",
      addressRegion: "ON",
      addressCountry: "CA",
    },
  },
  knowsAbout: [
    "Scientific computing",
    "Machine learning infrastructure",
    "Compilers",
    "Distributed systems",
    "Performance engineering",
    "High performance computing",
    "Parallel computing",
    "GPU computing",
    "CUDA",
    "MPI",
    "OpenMP",
    "C++",
  ],
  sameAs: [
    SEDRA_URL,
    SOCIAL_LINKS.github,
    SOCIAL_LINKS.linkedin,
    SOCIAL_LINKS.instagram,
    SOCIAL_LINKS.x,
  ],
  member: TEAM.map((m) => ({
    "@type": "Person",
    name: m.name,
    jobTitle: m.role,
    image: `${SITE_URL}${m.image}`,
  })),
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_TAGLINE,
  inLanguage: "en-CA",
  publisher: { "@id": ORG_ID },
};
