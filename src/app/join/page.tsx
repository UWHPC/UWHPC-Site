import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Join from "@/components/Join";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Join the Team",
  description:
    "Join UWHPC, the UW High Performance Computing student design team at the University of Waterloo. Open to students interested in performance engineering.",
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
