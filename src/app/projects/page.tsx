import Nav from "@/components/Nav";
import Projects from "@/components/Projects";
import Focus from "@/components/Focus";

export const metadata = {
  title: "Projects - UWHPC",
  description:
    "What UWHPC is building and the focus areas we work across, from hardware to algorithms.",
};

export default function ProjectsPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <Projects />
        <Focus />
      </main>
    </>
  );
}
