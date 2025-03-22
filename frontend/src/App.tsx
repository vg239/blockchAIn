"use client";

import React from "react";
import "./globals.css";
import "./App.css";
import { AuroraBackground } from "./components/ui/aurora-background";
import { Navbar } from "./components/navbar";
import { HeroSection } from "./components/hero-section";
import { FeatureCards } from "./components/feature-cards";
import { CTASection } from "./components/cta-section";

function App() {
  return (
    <AuroraBackground>
      <div className="min-h-screen w-full bg-zinc-950/30">
        <Navbar />
        <main className="pt-20">
          <HeroSection />
          <FeatureCards />
          <CTASection />
        </main>
      </div>
    </AuroraBackground>
  );
}

export default App;
