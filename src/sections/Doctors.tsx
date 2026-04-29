import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Award, GraduationCap, Star, Calendar } from 'lucide-react';
import FadeInSection from '@/components/FadeInSection';
import MagneticButton from '@/components/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

const doctors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialty: 'Orthodontist',
    image: '/images/doc-johnson.png',
    credentials: ['DDS, Harvard University', 'Board Certified Orthodontist', '15+ Years Experience'],
    rating: 4.9,
    reviews: 328,
    bio: 'Specializing in Invisalign and traditional braces, Dr. Johnson has transformed over 5,000 smiles with her gentle approach and precision technique.',
    availability: 'Next: Tomorrow 2PM',
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'Oral Surgeon',
    image: '/images/doc-chen.png',
    credentials: ['DMD, Stanford University', 'Fellow, AAOMS', '10+ Years Experience'],
    rating: 5.0,
    reviews: 256,
    bio: 'Expert in dental implants and complex extractions, Dr. Chen combines surgical excellence with compassionate patient care.',
    availability: 'Next: Today 4PM',
  },
  {
    id: 3,
    name: 'Dr. Emily White',
    specialty: 'Endodontist',
    image: '/images/doc-white.png',
    credentials: ['DDS, Columbia University', 'Root Canal Specialist', '8+ Years Experience'],
    rating: 4.8,
    reviews: 189,
    bio: 'Known for her painless root canal treatments, Dr. White uses the latest techniques to save natural teeth and relieve pain.',
    availability: 'Next: Friday 10AM',
  },
];

export default function Doctors() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      // Initial reveal animation
      gsap.fromTo(
        carouselRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const navigate = (direction: 'prev' | 'next') => {
    if (isAnimating) return;
    setIsAnimating(true);

    const newIndex = direction === 'prev' 
      ? (activeIndex === 0 ? doctors.length - 1 : activeIndex - 1)
      : (activeIndex === doctors.length - 1 ? 0 : activeIndex + 1);

    setActiveIndex(newIndex);
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const absIndex = Math.abs(diff);
    
    if (absIndex > 1) {
      return {
        transform: `translateX(${diff * 120}%) scale(0.6) rotateY(${diff * 30}deg)`,
        opacity: 0,
        zIndex: 0,
        filter: 'blur(15px)',
        pointerEvents: 'none' as const,
      };
    }
    
    return {
      transform: `translateX(${diff * 105}%) scale(${absIndex === 0 ? 1 : 0.85}) rotateY(${diff * -10}deg)`,
      opacity: absIndex === 0 ? 1 : 0.5,
      zIndex: absIndex === 0 ? 20 : 10,
      filter: absIndex === 0 ? 'blur(0px)' : 'blur(5px)',
      pointerEvents: absIndex === 0 ? 'auto' as const : 'none' as const,
    };
  };

  return (
    <div 
      ref={sectionRef}
      id="doctors"
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
                <Award className="w-5 h-5 text-medical-cyan" />
              </div>
              <span className="text-medical-cyan font-semibold uppercase tracking-wider text-sm">Our Team</span>
            </div>
          </FadeInSection>
          
          <FadeInSection delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold text-medical-blue mb-4">
              Meet Our
              <span className="text-gradient"> Specialists</span>
            </h2>
          </FadeInSection>
          
          <FadeInSection delay={0.2}>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Our team of board-certified specialists brings decades of combined experience and a passion for patient care.
            </p>
          </FadeInSection>
        </div>
        
        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <MagneticButton
            onClick={() => navigate('prev')}
            className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-white shadow-medical-lg flex items-center justify-center hover:bg-medical-cyan hover:text-white transition-all duration-300"
            strength={0.4}
          >
            <ChevronLeft className="w-6 h-6" />
          </MagneticButton>
          
          <MagneticButton
            onClick={() => navigate('next')}
            className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-white shadow-medical-lg flex items-center justify-center hover:bg-medical-cyan hover:text-white transition-all duration-300"
            strength={0.4}
          >
            <ChevronRight className="w-6 h-6" />
          </MagneticButton>
          
          {/* Cards Container */}
          <div 
            ref={carouselRef}
            className="relative h-[580px] md:h-[600px] flex items-center justify-center"
            style={{ perspective: '1500px' }}
          >
            {doctors.map((doctor, index) => (
              <div
                key={doctor.id}
                className="absolute w-full max-w-sm md:max-w-md transition-all duration-500 ease-out"
                style={{
                  ...getCardStyle(index),
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500">
                  {/* Image Section */}
                  <div className="relative h-64 md:h-72 bg-gradient-to-br from-medical-cyan/10 to-medical-teal/10 flex items-center justify-center overflow-hidden">
                    <img 
                      src={doctor.image}
                      alt={doctor.name}
                      className="h-full w-auto object-contain transition-transform duration-500 hover:scale-105"
                    />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 glass-card px-3 py-2 rounded-xl flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-medical-blue">{doctor.rating}</span>
                      <span className="text-text-muted text-xs">({doctor.reviews})</span>
                    </div>
                    
                    {/* Availability Badge */}
                    <div className="absolute bottom-4 left-4 glass-card px-3 py-2 rounded-xl flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-medical-cyan" />
                      <span className="text-xs font-medium text-medical-blue">{doctor.availability}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-5 h-5 text-medical-cyan" />
                      <span className="text-medical-cyan font-medium text-sm">{doctor.specialty}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-medical-blue mb-3">
                      {doctor.name}
                    </h3>
                    
                    <p className="text-text-muted text-sm mb-5 leading-relaxed">
                      {doctor.bio}
                    </p>
                    
                    {/* Credentials */}
                    <div className="space-y-2 mb-6">
                      {doctor.credentials.map((cred, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-text-muted">
                          <div className="w-1.5 h-1.5 rounded-full bg-medical-teal" />
                          {cred}
                        </div>
                      ))}
                    </div>
                    
                    {/* CTA */}
                    <MagneticButton 
                      className="w-full btn-medical py-3.5 flex items-center justify-center gap-2"
                      strength={0.2}
                    >
                      <Calendar className="w-5 h-5" />
                      Book Consultation
                    </MagneticButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {doctors.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-3 rounded-full transition-all duration-500 ${
                  index === activeIndex 
                    ? 'bg-medical-cyan w-10' 
                    : 'bg-medical-cyan/30 w-3 hover:bg-medical-cyan/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
