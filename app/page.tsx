import React from "react";
import Hero from "./LandingPageComponents/Hero";
import Features from "./LandingPageComponents/Features";
import Footer from "./LandingPageComponents/Footer";
import { LandingNavbar } from "./components/LandingNavBar";

export default function Home() {
  return (
    <main className="flex flex-col bg-[#FAF6F3] min-h-screen">
      <LandingNavbar/>
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
