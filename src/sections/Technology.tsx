import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, Zap, Shield, Microscope, Check, Play } from 'lucide-react';
import FadeInSection from '@/components/FadeInSection';
import StaggerContainer from '@/components/StaggerContainer';
import AnimatedCounter from '@/components/AnimatedCounter';
import MagneticButton from '@/components/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

const techFeatures = [
  {
    icon: Cpu,
    title: 'Digital Impressions',
    description: 'No more messy molds. Our 3D intraoral scanners create precise digital models in seconds with unmatched accuracy.',
    stat: '99.8%',
    statLabel: 'Accuracy',
  },
  {
    icon: Zap,
    title: 'Laser Dentistry',
    description: 'Pain-free procedures with advanced laser technology for faster healing and minimal discomfort.',
    stat: '0%',
    statLabel: 'Anesthesia Needed',
  },
  {
    icon: Microscope,
    title: 'AI Diagnostics',
    description: 'Machine learning algorithms detect issues invisible to the human eye for early intervention.',
    stat: '50x',
    statLabel: 'Faster Detection',
  },
  {
    icon: Shield,
    title: 'Sterilization Tech',
    description: 'Hospital-grade autoclave systems ensure 100% instrument sterility for your safety.',
    stat: '100%',
    statLabel: 'Sterile',
  },
];

const stats = [
  { value: 50000, suffix: '+', label: 'Procedures' },
  { value: 99.9, suffix: '%', label: 'Success Rate', decimals: 1 },
  { value: 0, suffix: '%', label: 'Infection Rate' },
];

export default function Technology() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const statsEl = statsRef.current;

    if (!section || !image || !statsEl) return;

    const ctx = gsap.context(() => {
      // Image reveal with scale and rotation
      gsap.fromTo(
        image,
        { opacity: 0, scale: 0.85, x: 100 },
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Parallax on image
      gsap.to(image.querySelector('img'), {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Stats cards pop in
      const statCards = statsEl.querySelectorAll('.stat-card');
      gsap.fromTo(
        statCards,
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: statsEl,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={sectionRef}
      id="technology"
      className="relative w-full py-24 md:py-32 bg-gradient-to-b from-medical-grey to-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 medical-grid opacity-50" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/3 -left-32 w-64 h-64 rounded-full bg-medical-cyan/5 blur-3xl" />
      <div className="absolute bottom-1/3 -right-32 w-64 h-64 rounded-full bg-medical-teal/5 blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Content */}
          <div>
            <FadeInSection>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-medical-cyan/10 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-medical-cyan" />
                </div>
                <span className="text-medical-cyan font-semibold uppercase tracking-wider text-sm">Cutting-Edge Technology</span>
              </div>
            </FadeInSection>
            
            <FadeInSection delay={0.1}>
              <h2 className="text-4xl md:text-5xl font-bold text-medical-blue mb-6">
                State-of-the-Art
                <span className="text-gradient block">Technology</span>
              </h2>
            </FadeInSection>
            
            <FadeInSection delay={0.2}>
              <p className="text-text-muted text-lg mb-8 leading-relaxed">
                Our facility is equipped with the latest advancements in dental and medical technology, ensuring precise diagnoses and comfortable treatments for every patient.
              </p>
            </FadeInSection>
            
            {/* Features List */}
            <StaggerContainer className="space-y-4 mb-8" staggerDelay={0.1}>
              {techFeatures.map((feature, i) => (
                <div 
                  key={i}
                  className="group flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-medical-lg transition-all duration-500 cursor-pointer hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-medical-cyan/10 to-medical-teal/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-medical-cyan group-hover:text-medical-teal transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-text-primary group-hover:text-medical-cyan transition-colors">{feature.title}</h4>
                      <span className="text-xs font-bold text-medical-teal bg-medical-teal/10 px-2 py-1 rounded-full">
                        {feature.stat} {feature.statLabel}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </StaggerContainer>
            
            {/* Trust Indicators */}
            <FadeInSection delay={0.4}>
              <div className="flex flex-wrap gap-3">
                {['ISO 9001 Certified', 'FDA Approved', 'CE Marked'].map((cert, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 bg-medical-cyan/10 rounded-full hover:bg-medical-cyan hover:text-white transition-all duration-300 cursor-pointer group">
                    <Check className="w-4 h-4 text-medical-cyan group-hover:text-white transition-colors" />
                    <span className="text-sm text-medical-cyan font-medium group-hover:text-white transition-colors">{cert}</span>
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>
          
          {/* Image & Stats */}
          <FadeInSection direction="right" className="relative">
            <div ref={imageRef} className="relative">
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                <img 
                  src="/images/tech-rig.jpg"
                  alt="Advanced Dental Technology"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-medical-blue/50 via-transparent to-transparent" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <MagneticButton 
                    className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl hover:bg-white transition-colors group/btn"
                    strength={0.4}
                  >
                    <Play className="w-8 h-8 text-medical-cyan ml-1 group-hover/btn:scale-110 transition-transform" />
                  </MagneticButton>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 glass-card px-4 py-3 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium text-medical-blue">System Online</span>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div 
                ref={statsRef}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-4"
              >
                {stats.map((stat, i) => (
                  <div 
                    key={i}
                    className="stat-card glass-card px-6 py-4 rounded-2xl text-center min-w-[110px] hover:shadow-medical-lg transition-shadow cursor-pointer group"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-medical-cyan group-hover:scale-110 transition-transform">
                      <AnimatedCounter 
                        end={stat.value}
                        suffix={stat.suffix}
                        decimals={stat.decimals || 0}
                        duration={2000}
                      />
                    </div>
                    <div className="text-xs text-text-muted mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              {/* Decorative Ring */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-4 border-medical-cyan/20 animate-pulse-glow" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full border-2 border-dashed border-medical-teal/30 animate-spin" style={{ animationDuration: '20s' }} />
            </div>
          </FadeInSection>
        </div>
      </div>
    </div>
  );
}
