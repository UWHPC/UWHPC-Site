import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Join from "@/components/Join";

export const metadata = {
  title: "Join - UWHPC",
  description:
    "Join UWHPC. Whether you're experienced in HPC or just curious, there's a place for you on the team.",
};

export default function JoinPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <Join />
      </main>
      <Footer />
    </>
  );
}
