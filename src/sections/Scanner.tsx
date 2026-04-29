import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scan, Activity, Brain, Heart, Bone, Sparkles } from 'lucide-react';
import FadeInSection from '@/components/FadeInSection';
import StaggerContainer from '@/components/StaggerContainer';

gsap.registerPlugin(ScrollTrigger);

const scanFeatures = [
  { icon: Brain, label: 'Neural Imaging', desc: 'Advanced brain scan analysis with AI-powered diagnostics' },
  { icon: Heart, label: 'Cardiac Monitor', desc: 'Real-time heart monitoring and ECG analysis' },
  { icon: Bone, label: 'Bone Density', desc: 'Precise osteoporosis screening and bone health assessment' },
  { icon: Activity, label: 'Vital Signs', desc: 'Complete health metrics and biometric monitoring' },
];

export default function Scanner() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const scanner = scannerRef.current;
    const scanLine = scanLineRef.current;
    const rings = ringsRef.current;

    if (!section || !scanner || !scanLine || !rings) return;

    const ctx = gsap.context(() => {
      // Scanner entrance with dramatic scale and rotation
      gsap.fromTo(
        scanner,
        { opacity: 0, scale: 0.6, rotateY: -30 },
        {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Continuous scan line animation
      gsap.to(scanLine, {
        y: '200%',
        duration: 2.5,
        repeat: -1,
        ease: 'none',
      });

      // Rotating rings
      const ringElements = rings.querySelectorAll('.scanner-ring');
      ringElements.forEach((ring, i) => {
        gsap.to(ring, {
          rotation: i % 2 === 0 ? 360 : -360,
          duration: 15 + i * 5,
          repeat: -1,
          ease: 'none',
        });
      });

      // Parallax effect for scanner
      gsap.to(scanner, {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Glow pulse effect
      gsap.to('.scanner-glow', {
        opacity: 0.3,
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={sectionRef}
      id="diagnostics"
      className="relative w-full py-24 md:py-32 bg-gradient-to-b from-medical-grey to-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 medical-grid opacity-50" />
      
      {/* Decorative Blobs */}
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-medical-cyan/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-medical-teal/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Scanner Visual */}
          <FadeInSection direction="left" className="order-2 lg:order-1">
            <div 
              ref={scannerRef}
              className="relative flex items-center justify-center"
              style={{ perspective: '1000px' }}
            >
              {/* Scanner Ring Container */}
              <div className="relative w-80 h-80 md:w-[450px] md:h-[450px]">
                {/* Glow Effect */}
                <div className="scanner-glow absolute inset-0 rounded-full bg-medical-cyan/20 blur-3xl" />
                
                <div ref={ringsRef} className="absolute inset-0">
                  {/* Outer Ring */}
                  <div className="scanner-ring absolute inset-0 rounded-full border-4 border-medical-cyan/20" />
                  
                  {/* Middle Ring - Dashed */}
                  <div className="scanner-ring absolute inset-4 rounded-full border-2 border-dashed border-medical-teal/40" />
                  
                  {/* Inner Ring */}
                  <div className="scanner-ring absolute inset-8 rounded-full border border-medical-cyan/30" />
                </div>
                
                {/* Body Image Container */}
                <div className="absolute inset-12 rounded-full overflow-hidden bg-gradient-to-b from-medical-blue/20 to-medical-cyan/20 shadow-2xl">
                  <img 
                    src="/images/scanner-body.jpg" 
                    alt="Body Scan"
                    className="w-full h-full object-contain opacity-90"
                  />
                  
                  {/* Scan Line */}
                  <div 
                    ref={scanLineRef}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-medical-teal to-transparent"
                    style={{ 
                      boxShadow: '0 0 30px rgba(78, 205, 196, 0.8), 0 0 60px rgba(78, 205, 196, 0.4)',
                      top: '-100%'
                    }}
                  />
                  
                  {/* Scan Line Glow Trail */}
                  <div 
                    className="absolute left-0 right-0 h-20 bg-gradient-to-b from-medical-teal/30 to-transparent pointer-events-none"
                    style={{ top: '-100%' }}
                  />
                </div>
                
                {/* Center Pulse */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-4 h-4 rounded-full bg-medical-teal animate-ping" />
                  <div className="absolute w-3 h-3 rounded-full bg-medical-teal" />
                </div>
                
                {/* Floating Labels */}
                <div className="absolute -right-4 top-1/4 glass-card px-4 py-2 rounded-xl flex items-center gap-2 animate-float">
                  <Sparkles className="w-4 h-4 text-medical-cyan" />
                  <span className="text-medical-cyan font-semibold text-sm">AI Powered</span>
                </div>
                
                <div className="absolute -left-4 bottom-1/3 glass-card px-4 py-2 rounded-xl animate-float" style={{ animationDelay: '1s' }}>
                  <span className="text-medical-teal font-semibold text-sm">98% Accuracy</span>
                </div>
              </div>
            </div>
          </FadeInSection>
          
          {/* Content */}
          <div className="order-1 lg:order-2">
            <FadeInSection delay={0.1}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-medical-cyan/10 flex items-center justify-center">
                  <Scan className="w-5 h-5 text-medical-cyan" />
                </div>
                <span className="text-medical-cyan font-semibold uppercase tracking-wider text-sm">Advanced Diagnostics</span>
              </div>
            </FadeInSection>
            
            <FadeInSection delay={0.2}>
              <h2 className="text-4xl md:text-5xl font-bold text-medical-blue mb-6">
                Precision
                <span className="text-gradient block">Diagnostic Imaging</span>
              </h2>
            </FadeInSection>
            
            <FadeInSection delay={0.3}>
              <p className="text-text-muted text-lg mb-8 leading-relaxed">
                Our state-of-the-art diagnostic equipment provides precise, detailed imaging for accurate treatment planning. From 3D dental scans to full-body health assessments powered by artificial intelligence.
              </p>
            </FadeInSection>
            
            {/* Features Grid */}
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4" staggerDelay={0.1}>
              {scanFeatures.map((feature, i) => (
                <div 
                  key={i}
                  className="group glass-card p-5 rounded-2xl hover:shadow-medical-lg transition-all duration-500 cursor-pointer hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-medical-cyan/10 to-medical-teal/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-medical-cyan group-hover:text-medical-teal transition-colors" />
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2 group-hover:text-medical-cyan transition-colors">{feature.label}</h4>
                  <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
