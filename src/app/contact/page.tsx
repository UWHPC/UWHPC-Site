import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with UWHPC, the UW High Performance Computing student design team at the University of Waterloo, by email, Discord, GitHub, or LinkedIn.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <Contact as="h1" />
      </main>
      <Footer />
    </>
  );
}
