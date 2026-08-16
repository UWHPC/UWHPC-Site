import {
  CONTACT_EMAIL,
  FOCUS_AREAS,
  PROJECTS,
  SEDRA_URL,
  SITE_ABOUT,
  SITE_FULL_NAME,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
  TEAM,
} from "@/lib/site";

/**
 * Serves /llms.txt — a plain-text summary of the site aimed at LLM crawlers.
 *
 * Generated from the same constants as the JSON-LD and the rendered pages, so
 * it cannot drift out of sync with them. Adding a team member or project in
 * site.ts updates this file automatically; only the hand-written prose in
 * site.ts (SITE_ABOUT, focus descriptions) needs editing by hand.
 *
 * Note that llms.txt is a proposed convention rather than a ratified standard.
 * It costs little and is ignored harmlessly by anything that does not read it.
 */

export const dynamic = "force-static";

function body(): string {
  const wrapped = SITE_ABOUT.match(/.{1,72}(\s|$)/g) ?? [SITE_ABOUT];

  return [
    `# ${SITE_NAME}`,
    "",
    ...wrapped.map((line) => `> ${line.trim()}`),
    "",
    `${SITE_NAME} is the ${SITE_FULL_NAME} student design team at the`,
    `University of Waterloo. Canonical site: ${SITE_URL}`,
    "",
    "## Focus areas",
    "",
    ...FOCUS_AREAS.map((a) => `- **${a.title}** — ${a.desc}`),
    "",
    "## Projects",
    "",
    ...PROJECTS.map((p) =>
      [
        `- **${p.title}** (${p.status})`,
        `  ${p.description}`,
        `  Tags: ${p.tags.join(", ")}`,
        ...(p.href ? [`  Source: ${p.href}`] : []),
      ].join("\n")
    ),
    "",
    "## Team",
    "",
    ...TEAM.map((m) => `- ${m.name} — ${m.role}`),
    "",
    "## Pages",
    "",
    `- Projects: ${SITE_URL}/projects`,
    `- Team: ${SITE_URL}/team`,
    `- Join the team: ${SITE_URL}/join`,
    `- Contact: ${SITE_URL}/contact`,
    "",
    "## Elsewhere",
    "",
    `- UW Sedra Student Design Centre directory entry: ${SEDRA_URL}`,
    `- GitHub: ${SOCIAL_LINKS.github}`,
    `- LinkedIn: ${SOCIAL_LINKS.linkedin}`,
    `- Instagram: ${SOCIAL_LINKS.instagram}`,
    `- X: ${SOCIAL_LINKS.x}`,
    `- Email: ${CONTACT_EMAIL}`,
    "",
  ].join("\n");
}

export function GET() {
  return new Response(body(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
