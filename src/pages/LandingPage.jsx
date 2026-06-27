import React from "react";
import { FloatingPaws } from "@/components/tnr/Decorative";
import { Navbar, Footer } from "@/components/tnr/Layout";
import { Hero } from "@/components/tnr/Hero";
import { Features } from "@/components/tnr/Features";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <FloatingPaws />
      <Navbar />
      <main>
        <div className="section-mint">
          <Hero />
        </div>
        <div className="section-cream">
          <Features />
        </div>
      </main>
      <Footer />
    </div>
  );
}
