// src/components/Hero.tsx
import React from "react";

export default function Hero() {
  return (
    <section className="text-center py-16 px-6 bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
        One sky. One moon. Many hearts.
      </h1>
      <p className="text-lg md:text-2xl max-w-2xl mx-auto opacity-80 leading-relaxed">
        Somewhere you can’t see them, strangers are looking up at the same moon.  
        Each pulse you share becomes part of a constellation of feelings—proof  
        that we’re never truly alone in the night.
      </p>
    </section>
  );
}
