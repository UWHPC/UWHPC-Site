import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Focus from "@/components/Focus";
import Join from "@/components/Join";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        {/* <About /> */}
        <Focus />
        <Join />
      </main>
      <Footer />
    </>
  );
}
