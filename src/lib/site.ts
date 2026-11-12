/**
 * Single source of truth for site-wide facts.
 *
 * Metadata, JSON-LD, and the sitemap all describe the same entity, and search
 * engines cross-check them against each other. Keeping the values here means
 * they cannot drift apart.
 */

export const SITE_URL = "https://uwhpc.com";

/** What the team goes by, and what should appear in titles and nav. */
export const SITE_NAME = "UWHPC";

/** The full branded name. Note: "UW", not "University of Waterloo". */
export const SITE_FULL_NAME = "UW High Performance Computing";

/** Meta + OpenGraph description. Mirrors the Sedra directory positioning. */
export const SITE_TAGLINE =
  "A student design team at the University of Waterloo that designs and builds high-performance software for computationally intensive workloads.";

/**
 * The long-form description, used as the schema `description`.
 *
 * Written to stand alone: retrieval may surface this paragraph with no
 * surrounding context, so it names the org, its abbreviation, its parent, its
 * location, and its domains in a single self-contained chunk. Sentences two
 * and three track the official Sedra directory entry closely on purpose —
 * matching text across the canonical source and this site is an entity
 * signal, not duplicate content.
 */
export const SITE_ABOUT =
  "UWHPC (UW High Performance Computing) is a student design team based at the Sedra Student Design Centre at the University of Waterloo in Waterloo, Ontario, Canada. The team designs and builds high-performance software for computationally intensive workloads. Through hands-on engineering projects, members work across scientific computing, machine learning infrastructure, compilers, distributed systems, and performance engineering.";

export const CONTACT_EMAIL = "info@uwhpc.com";

/** Canonical UW directory entry. Our strongest third-party authority link. */
export const SEDRA_URL =
  "https://uwaterloo.ca/sedra-student-design-centre/catalogs/directory-teams/uw-high-performance-computing-uwhpc";

export const SOCIAL_LINKS = {
  github: "https://github.com/UWHPC",
  linkedin: "https://www.linkedin.com/company/uw-hpc/",
  instagram: "https://www.instagram.com/uw.hpc/",
  x: "https://x.com/uw_hpc",
  discord: "https://discord.gg/Q54uuaWvhA",
} as const;

export type Project = {
  title: string;
  /** Full name, when the title is an acronym or codename. */
  subtitle?: string;
  description: string;
  tags: string[];
  status: string;
  leads?: string[];
  href?: string;
  /** Current flagship work, shown large with its own visual. */
  featured?: boolean;
};

export const PROJECTS: Project[] = [
  {
    title: "BATS",
    subtitle: "Beamforming Across Tensor-core Systems",
    description:
      "Beamforming combines signals from an array of sensors so that one direction adds up and the rest cancel out. It sits at the core of radio astronomy, radar, and medical ultrasound. Forming many beams across frequency channels is a batched complex matrix multiply, which tensor cores accelerate. BATS is building a distributed tensor-core beamformer across GPUs and nodes, with a planner that chooses how to split the work from the workload, where the data lives, and the interconnect.",
    tags: ["CUDA", "Tensor cores", "Multi-GPU"],
    status: "In Progress",
    leads: ["Alyan Salamat", "Shpat Sahiti"],
    featured: true,
  },
  {
    title: "Maverick",
    subtitle: "Topology-aware GPU execution of graph neural networks",
    description:
      "Two graphs with the same number of edges can produce very different GPU workloads: a handful of high-degree nodes can leave most of the GPU waiting. Maverick analyzes the topology of a static graph once and uses it to choose specialized execution strategies for GNN inference, measured against TorchInductor under torch.compile, with the cost of that analysis counted against the speedup.",
    tags: ["PyTorch", "Triton", "GNNs"],
    status: "In Progress",
    leads: ["James Redekopp", "Vijay Goyal"],
    featured: true,
  },
  {
    title: "XPU",
    description:
      "A header-only C++23 library that lets the same allocation, layout, and math code compile for either CPU or NVIDIA CUDA. Backend-aware buffers, structure-of-arrays storage, OpenMP + SIMD parallel loops on the CPU, and launch helpers on the GPU. It's the performance foundation shared across UWHPC projects.",
    tags: ["C++23", "CUDA", "OpenMP"],
    status: "In Progress",
    href: "https://github.com/UWHPC/xpu",
    featured: true,
  },
  {
    title: "Variational Monte Carlo",
    description:
      "A Variational Monte Carlo engine in CUDA C++ for the homogeneous electron gas. A plane-wave Slater determinant with a Padé–Jastrow factor, sampled by Metropolis moves in a periodic cell, with Jastrow optimization and blocking analysis for honest error bars.",
    tags: ["CUDA C++", "Monte Carlo", "Many-body physics"],
    status: "In Progress",
    href: "https://github.com/UWHPC/Variational-Monte-Carlo",
    featured: true,
  },
];

export type SponsorTier = "Diamond" | "Gold" | "Silver" | "Bronze";

/** Highest first. Tiers with no sponsors are skipped when rendering. */
export const SPONSOR_TIERS: SponsorTier[] = ["Diamond", "Gold", "Silver", "Bronze"];

export type Sponsor = {
  name: string;
  tier: SponsorTier;
  /** White-on-transparent logo in /public/sponsors. */
  logo: string;
  logoWidth: number;
  logoHeight: number;
  href: string;
};

export const SPONSORS: Sponsor[] = [
  {
    name: "Jane Street",
    tier: "Gold",
    logo: "/sponsors/jane-street.png",
    logoWidth: 529,
    logoHeight: 146,
    href: "https://www.janestreet.com",
  },
];

/**
 * The five domains from the official Sedra directory entry, which is the
 * source of truth for how the team is described. Order matches the directory.
 */
export const FOCUS_AREAS = [
  {
    title: "Scientific Computing",
    desc: "Numerical methods and simulation for physics and the computational sciences, including Monte Carlo techniques and large-scale numerical workloads that have to run fast enough to be useful.",
  },
  {
    title: "Machine Learning Infrastructure",
    desc: "The systems layer beneath the models: data and training pipelines, GPU utilization, and the throughput and memory limits that decide how quickly experiments can actually run.",
  },
  {
    title: "Compilers",
    desc: "How source becomes fast machine code. Intermediate representations, optimization passes, code generation, and understanding compiler behaviour well enough to know when hand-tuning is worth it.",
  },
  {
    title: "Distributed Systems",
    desc: "Splitting work across many machines with MPI and related tooling, and handling the coordination, communication, and failure behaviour that comes with it.",
  },
  {
    title: "Performance Engineering",
    desc: "Profiling real workloads to find bottlenecks, then closing them with vectorization, cache-aware tuning, and low-level work in C, C++, and Rust.",
  },
] as const;

/**
 * Builds per-page metadata so the canonical URL, the <title>, and the
 * OpenGraph copy stay in step. Without this a page tends to end up
 * advertising three slightly different summaries of itself.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} — ${SITE_NAME}`,
      description,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      type: "website" as const,
      locale: "en_CA",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${title} — ${SITE_NAME}`,
      description,
    },
  };
}

/** Sections on /team, in page order. */
export const TEAM_GROUPS = ["Founders", "Project Directors", "Core Members"] as const;
export type TeamGroup = (typeof TEAM_GROUPS)[number];

export type TeamMember = {
  name: string;
  role: string;
  group: TeamGroup;
  /** Profile links; a card shows the label dimmed until one is set. */
  linkedin?: string;
  portfolio?: string;
  /** Photos are no longer shown on /team; kept for the unused home preview. */
  image?: string;
  imageClassName?: string;
};

export const TEAM: TeamMember[] = [
  {
    name: "James Redekopp",
    linkedin: "https://www.linkedin.com/in/tesselland/",
    portfolio: "https://www.redekopp.dev",
    group: "Founders",
    role: "Founder",
    image: "/team/james1.jpg",
    imageClassName: "object-cover object-[50%_28%]",
  },
  {
    name: "Karl Keshavarzi",
    linkedin: "https://www.linkedin.com/in/karl-keshavarzi/",
    portfolio: "https://karlkes.uwce.ca",
    group: "Founders",
    role: "Founder",
    image: "/team/karl.png",
    imageClassName: "object-cover object-[50%_28%]",
  },
  {
    name: "Rita Bhowmik",
    linkedin: "https://www.linkedin.com/in/ritabhowmik/",
    portfolio: "https://ritabhowmik.vercel.app",
    group: "Core Members",
    role: "Growth & Operations Director",
    image: "/team/rita-bhowmik.png",
    imageClassName: "object-cover object-center",
  },
  {
    name: "Shpat Sahiti",
    linkedin: "https://www.linkedin.com/in/shpatsahiti/",
    portfolio: "https://shsahiti.github.io/portfolio/",
    group: "Project Directors",
    role: "Founding Project Manager",
    image: "/team/shpat.png",
    imageClassName: "object-cover object-center",
  },
  {
    name: "Alyan Salamat",
    linkedin: "https://www.linkedin.com/in/alyansal/",
    portfolio: "https://alyansal.github.io/alyan-salamat/",
    group: "Project Directors",
    role: "Founding Project Manager",
    image: "/team/alyan.png",
    imageClassName: "object-cover object-[50%_22%]",
  },
  {
    name: "Julian Salvador",
    linkedin: "https://www.linkedin.com/in/julian-salvador727/",
    portfolio: "https://www.juliansalvador.com",
    group: "Core Members",
    role: "Software Developer",
    image: "/team/julian.png",
    imageClassName: "object-cover object-center",
  },
  {
    name: "Vijay Goyal",
    linkedin: "https://www.linkedin.com/in/vijay-goyal7/",
    portfolio: "https://www.vijaygoyal.dev",
    group: "Project Directors",
    role: "Founding Project Manager",
  },
  {
    name: "Adam Kamel",
    linkedin: "https://www.linkedin.com/in/adamkamel/",
    portfolio: "https://akamel.dev",
    group: "Project Directors",
    role: "Founding Project Manager",
  },
];
