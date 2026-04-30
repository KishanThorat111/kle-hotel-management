import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';

import { useLenis } from './hooks/useLenis';
import { ContentProvider } from './contexts/ContentContext';
import { track } from './lib/track';

import CustomCursor from './components/CustomCursor';
import EnquiryPopup from './components/EnquiryPopup';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';
import ScrollProgress from './components/ScrollProgress';

import Hero from './sections/Hero';
import About from './sections/About';
import Programs from './sections/Programs';
import Placements from './sections/Placements';
import Facilities from './sections/Facilities';
import Curriculum from './sections/Curriculum';
import StudentLife from './sections/StudentLife';
import Testimonials from './sections/Testimonials';
import Admission from './sections/Admission';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  useLenis();

  useEffect(() => {
    // Track unique page view on first render
    track('page_view');
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();
    }, mainRef);
    return () => ctx.revert();
  }, []);

  return (
    <ContentProvider>
    <div ref={mainRef} className="relative min-h-screen overflow-x-hidden" style={{ background: '#FFFFFF' }}>
      <CustomCursor />
      <LoadingScreen />
      <EnquiryPopup />
      <ScrollProgress />
      <Navigation />

      <main className="relative">
        <Hero />
        <About />
        <Programs />
        <Placements />
        <Facilities />
        <Curriculum />
        <StudentLife />
        <Testimonials />
        <Admission />
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-8" style={{ background: '#081123', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 flex items-center justify-center"
                  style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}
                >
                  <span className="text-sm font-bold" style={{ color: '#C9A84C' }}>KLE</span>
                </div>
                <div>
                  <p className="text-sm font-light tracking-wide" style={{ color: '#FFFFFF', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                    KLE Graduate School of Hotel Management
                  </p>
                  <p className="text-[10px] tracking-widest" style={{ color: 'rgba(201,168,76,0.6)' }}>
                    Learn · Prosper · Excel
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-md" style={{ color: 'rgba(255,255,255,0.45)' }}>
                A premier hotel management institution under the KLE Society, providing world-class hospitality education since 1997 at JNMC Campus, Belagavi.
              </p>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs tracking-widest uppercase mb-4" style={{ color: 'rgba(201,168,76,0.7)' }}>Contact</p>
              <div className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <p>JNMC Campus, Nehru Nagar</p>
                <p>Belagavi - 590 010, Karnataka, India</p>
                <a href="tel:08312444348" className="block hover:text-white transition-colors">0831-2444348</a>
                <a href="tel:+919731595657" className="block hover:text-white transition-colors">+91 97315 95657</a>
                <a href="mailto:info@klehotelmanagement.edu.in" className="block hover:text-white transition-colors">
                  info@klehotelmanagement.edu.in
                </a>
                <a href="https://www.klehotelmanagement.edu.in" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">
                  www.klehotelmanagement.edu.in
                </a>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 text-xs"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }}
          >
            <p>© {new Date().getFullYear()} KLE Graduate School of Hotel Management & Catering Technology. All rights reserved.</p>
            <p>Part of the KLE Society · Since 1916</p>
          </div>
        </div>
      </footer>
    </div>
    </ContentProvider>
  );
}

export default App;
