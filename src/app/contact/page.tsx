import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Email UWHPC about sponsorship or collaboration, join our Discord, or find the team on GitHub and LinkedIn.",
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
