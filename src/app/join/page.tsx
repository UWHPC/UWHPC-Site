import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Join from "@/components/Join";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Join the Team",
  description:
    "Interested in high-performance computing at the University of Waterloo? Join the UWHPC Discord to meet the team and find a project.",
  path: "/join",
});

export default function JoinPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <Join as="h1" />
      </main>
      <Footer />
    </>
  );
}
