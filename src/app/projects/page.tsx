import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Projects from "@/components/Projects";
import Focus from "@/components/Focus";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description:
    "What UWHPC builds: high-performance software for computationally intensive workloads, spanning scientific computing, compilers, and distributed systems.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <Projects as="h1" />
        <Focus />
      </main>
      <Footer />
    </>
  );
}
