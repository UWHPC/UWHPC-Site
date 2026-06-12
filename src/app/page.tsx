import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Focus from "@/components/Focus";
import Projects from "@/components/Projects";
import Team from "@/components/Team";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Join from "@/components/Join";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        {/* <About /> */}
        <Projects />
        <Focus />
        <Team />
        <Blog />
        <Contact />
        <Join />
      </main>
      <Footer />
    </>
  );
}
