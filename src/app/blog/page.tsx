import Nav from "@/components/Nav";
import Blog from "@/components/Blog";

export const metadata = {
  title: "Blog - UWHPC",
  description: "Notes, deep-dives, and post-mortems from the UWHPC team.",
};

export default function BlogPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <Blog />
      </main>
    </>
  );
}
