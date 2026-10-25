'use client';

import { useEffect } from 'react';
import Navbar from '@/components/writeon/Navbar';
import IntroOverlay from '@/components/writeon/IntroOverlay';
import Hero from '@/components/writeon/Hero';
import { ToolsSection } from '@/components/writeon/ToolsSection';
import {
  ProblemSection,
  HowItWorksSection,
  LimitationsSection,
  ResearchSection,
  Footer,
  ScrollChrome,
} from '@/components/writeon/StaticSections';
import { useParallax, useReveal } from '@/hooks/writeon/scrollFx';

export default function Home() {
  // activate layered parallax + scroll-reveal effects
  useParallax();
  useReveal();

  // re-run reveal observer after the intro overlay dismisses, so any
  // .reveal elements already in view animate in cleanly.
  useEffect(() => {
    const t = setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>('.reveal:not(.in)')
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            el.classList.add('in');
          }
        });
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="writeon-shell" id="top">
      <IntroOverlay />
      <ScrollChrome />
      <Navbar />

      <main className="writeon-main">
        <Hero />
        <ProblemSection />
        <ToolsSection />
        <HowItWorksSection />
        <LimitationsSection />
        <ResearchSection />
      </main>

      <Footer />
    </div>
  );
}
