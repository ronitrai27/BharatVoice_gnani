import { Navbar } from "@/modules/web/components/Navbar";
import { Hero } from "@/modules/web/components/Hero";

export default function WebLandingPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden relative">
      <Navbar />
      <Hero />
    </main>
  );
}
