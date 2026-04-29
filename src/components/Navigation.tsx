import { useState, useEffect } from 'react';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Programs', href: '#programs' },
  { label: 'Placements', href: '#placements' },
  { label: 'Facilities', href: '#facilities' },
  { label: 'Admission', href: '#admission' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
    );

    navItems.forEach((item) => {
      const el = document.querySelector(item.href);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          isScrolled ? 'py-3 shadow-sm' : 'py-5'
        }`}
        style={{
          background: isScrolled
            ? 'rgba(255, 255, 255, 0.98)'
            : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          borderBottom: isScrolled ? '1px solid #E5E3DC' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <a
              href="#"
              className="flex items-center gap-3 shrink-0"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <div
                className="flex items-center justify-center w-9 h-9 shrink-0"
                style={{
                  background: isScrolled ? '#0D1B3E' : 'rgba(255,255,255,0.15)',
                  border: isScrolled ? 'none' : '1px solid rgba(255,255,255,0.4)',
                }}
              >
                <span
                  className="text-xs font-bold tracking-wider"
                  style={{ color: isScrolled ? '#C9A84C' : '#FFFFFF' }}
                >
                  KLE
                </span>
              </div>
              <div className="hidden sm:block">
                <p
                  className="text-xs font-semibold tracking-wider leading-none"
                  style={{ color: isScrolled ? '#0D1B3E' : '#FFFFFF' }}
                >
                  KLE Hotel Management
                </p>
                <p
                  className="text-[10px] tracking-widest leading-none mt-0.5"
                  style={{ color: isScrolled ? '#C9A84C' : 'rgba(255,255,255,0.6)' }}
                >
                  Belagavi · Since 1997
                </p>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.slice(1);
                return (
                  <button
                    key={item.label}
                    onClick={() => scrollTo(item.href)}
                    className="relative px-4 py-2 text-[11px] font-semibold tracking-widest uppercase transition-all duration-300"
                    style={{
                      color: isScrolled
                        ? isActive ? '#C9A84C' : '#0D1B3E'
                        : isActive ? '#C9A84C' : 'rgba(255,255,255,0.85)',
                    }}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-gold-DEFAULT"
                        style={{ background: '#C9A84C' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <a
                href="tel:+919731595657"
                className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide transition-colors"
                style={{ color: isScrolled ? '#4B5563' : 'rgba(255,255,255,0.7)' }}
              >
                <Phone className="w-3.5 h-3.5" />
                +91 97315 95657
              </a>
              <button
                onClick={() => scrollTo('#admission')}
                className="px-5 py-2.5 text-[11px] font-semibold tracking-wider uppercase transition-all duration-300"
                style={{
                  background: '#C9A84C',
                  color: '#FFFFFF',
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = '#A8872E'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#C9A84C'; }}
              >
                Apply Now
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 transition-colors"
              style={{ color: isScrolled ? '#0D1B3E' : '#FFFFFF' }}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[99] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="absolute top-0 right-0 bottom-0 w-72 flex flex-col"
              style={{ background: '#0D1B3E' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}
              >
                <div>
                  <p className="text-xs font-bold tracking-wider text-white">KLE Hotel Management</p>
                  <p className="text-[10px] tracking-widest mt-0.5" style={{ color: '#C9A84C' }}>
                    Belagavi · Since 1997
                  </p>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav Items */}
              <div className="flex-1 py-6 px-4">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.label}
                    onClick={() => scrollTo(item.href)}
                    className="w-full text-left px-4 py-3.5 text-sm font-medium tracking-widest uppercase flex items-center justify-between group"
                    style={{ color: 'rgba(255,255,255,0.75)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <span className="group-hover:text-gold" style={{ transition: 'color 0.2s' }}>
                      {item.label}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(201,168,76,0.4)' }}>0{i + 1}</span>
                  </motion.button>
                ))}
              </div>

              {/* CTA */}
              <div className="px-4 pb-8">
                <button
                  onClick={() => scrollTo('#admission')}
                  className="w-full py-4 text-sm font-semibold tracking-widest uppercase text-center"
                  style={{ background: '#C9A84C', color: '#FFFFFF' }}
                >
                  Apply for Admission
                </button>
                <a
                  href="tel:+919731595657"
                  className="flex items-center justify-center gap-2 mt-3 text-xs tracking-wide"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  <Phone className="w-3.5 h-3.5" />
                  +91 97315 95657
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
