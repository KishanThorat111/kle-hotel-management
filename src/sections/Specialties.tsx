import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ArrowRight, Stethoscope } from 'lucide-react';
import FadeInSection from '@/components/FadeInSection';
import MagneticButton from '@/components/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

const specialties = [
  {
    id: 1,
    title: 'Cosmetic Dentistry',
    description: 'Transform your smile with our advanced cosmetic procedures including veneers, bonding, and complete smile makeovers tailored to your unique features.',
    image: '/images/card-cosmetic.jpg',
    color: 'from-rose-400 to-pink-500',
    services: ['Porcelain Veneers', 'Dental Bonding', 'Smile Design', 'Gum Contouring'],
    price: 'From $299',
  },
  {
    id: 2,
    title: 'Dental Implants',
    description: 'Permanent tooth replacement solutions using titanium implants that look, feel, and function exactly like your natural teeth.',
    image: '/images/card-implants.jpg',
    color: 'from-medical-cyan to-medical-teal',
    services: ['Single Implants', 'All-on-4', 'Bone Grafting', 'Implant Crowns'],
    price: 'From $1,499',
  },
  {
    id: 3,
    title: 'Teeth Whitening',
    description: 'Professional whitening treatments that deliver dramatic results in a single visit. Safe, effective, and long-lasting.',
    image: '/images/card-whitening.jpg',
    color: 'from-amber-300 to-yellow-400',
    services: ['In-Office Laser', 'Take-Home Kits', 'Touch-Up Treatments', 'Sensitivity Care'],
    price: 'From $199',
  },
];

export default function Specialties() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current;

    if (!section || !cards) return;

    const cardElements = cards.querySelectorAll('.specialty-card');

    const ctx = gsap.context(() => {
      // Cards entrance animation with 3D effect
      cardElements.forEach((card, i) => {
        const direction = i === 0 ? -1 : i === 2 ? 1 : 0;
        
        gsap.fromTo(
          card,
          { 
            opacity: 0, 
            y: 100,
            rotateY: direction * 45,
            z: -200,
          },
          {
            opacity: 1,
            y: 0,
            rotateY: direction * 8,
            z: 0,
            duration: 1,
            delay: i * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Continuous floating animation
      cardElements.forEach((card, i) => {
        gsap.to(card, {
          y: `random(-8, 8)`,
          duration: `random(3, 5)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.5,
        });
      });

      // Parallax on scroll
      gsap.to(cards, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // 3D tilt effect on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: number) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    gsap.to(card, {
      rotateX: -rotateX,
      rotateY: rotateY,
      duration: 0.3,
      ease: 'power2.out',
    });

    setHoveredCard(cardId);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    });

    setHoveredCard(null);
  };

  return (
    <div 
      ref={sectionRef}
      id="services"
      className="relative w-full py-24 md:py-32 bg-gradient-to-b from-white to-medical-grey overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 medical-grid opacity-30" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-medical-cyan/5 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-medical-teal/5 blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <FadeInSection>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-medical-cyan/10 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-medical-cyan" />
              </div>
              <span className="text-medical-cyan font-semibold uppercase tracking-wider text-sm">Our Services</span>
            </div>
          </FadeInSection>
          
          <FadeInSection delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold text-medical-blue mb-4">
              Centers of
              <span className="text-gradient"> Excellence</span>
            </h2>
          </FadeInSection>
          
          <FadeInSection delay={0.2}>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Discover our comprehensive range of dental and medical services, delivered with precision and care by our expert team.
            </p>
          </FadeInSection>
        </div>
        
        {/* 3D Cards Container */}
        <div 
          ref={cardsRef}
          className="relative flex flex-col md:flex-row items-center justify-center gap-8 perspective-1000"
          style={{ perspective: '1200px' }}
        >
          {specialties.map((specialty) => (
            <div
              key={specialty.id}
              className="specialty-card relative w-full md:w-[360px] preserve-3d cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
                zIndex: hoveredCard === specialty.id ? 20 : 10,
              }}
              onMouseMove={(e) => handleMouseMove(e, specialty.id)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500 group">
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img 
                    src={specialty.image}
                    alt={specialty.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${specialty.color} opacity-30 group-hover:opacity-40 transition-opacity duration-500`} />
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 left-4 glass-card px-3 py-1.5 rounded-full">
                    <span className="text-sm font-semibold text-medical-blue">{specialty.price}</span>
                  </div>
                  
                  {/* Sparkle Icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <Sparkles className="w-5 h-5 text-medical-cyan" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-medical-blue mb-3 group-hover:text-medical-cyan transition-colors duration-300">
                    {specialty.title}
                  </h3>
                  
                  <p className="text-text-muted text-sm mb-5 leading-relaxed">
                    {specialty.description}
                  </p>
                  
                  {/* Services Tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {specialty.services.map((service, j) => (
                      <span 
                        key={j}
                        className="px-3 py-1.5 bg-medical-cyan/10 text-medical-cyan text-xs rounded-full font-medium hover:bg-medical-cyan hover:text-white transition-all duration-300 cursor-pointer"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                  
                  {/* CTA */}
                  <MagneticButton 
                    className="flex items-center gap-2 text-medical-cyan font-semibold text-sm group/btn w-full justify-center py-3 rounded-xl hover:bg-medical-cyan/10 transition-colors"
                    strength={0.2}
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </MagneticButton>
                </div>
                
                {/* Hover Glow Effect */}
                <div 
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${specialty.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}
                />
                
                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* View All Services */}
        <FadeInSection delay={0.4} className="text-center mt-14">
          <MagneticButton 
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-medical-cyan text-medical-cyan rounded-full font-semibold hover:bg-medical-cyan hover:text-white transition-all duration-300 group"
            strength={0.3}
          >
            View All Services
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </MagneticButton>
        </FadeInSection>
      </div>
    </div>
  );
}
