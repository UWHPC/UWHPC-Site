import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Focus from "@/components/Focus";
import SponsorStrip from "@/components/SponsorStrip";
import Join from "@/components/Join";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Focus />
        <SponsorStrip />
        <Join />
      </main>
      <Footer />
    </>
  );
}
