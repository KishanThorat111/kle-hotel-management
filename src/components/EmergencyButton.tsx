import { useState, useEffect } from 'react';
import { Phone, X, AlertCircle, Clock, MapPin, ChevronRight } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { gsap } from 'gsap';

const emergencies = [
  { name: 'Severe Toothache', urgency: 'high' },
  { name: 'Broken Tooth', urgency: 'high' },
  { name: 'Lost Filling', urgency: 'medium' },
  { name: 'Gum Bleeding', urgency: 'medium' },
  { name: 'Jaw Pain', urgency: 'medium' },
];

export default function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show button after scrolling
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Animate modal content
      gsap.fromTo(
        '.modal-content',
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Emergency Button - Desktop */}
      <div 
        className={`fixed bottom-8 right-8 z-[90] hidden md:block transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <MagneticButton
          onClick={() => setIsOpen(true)}
          className="btn-emergency flex items-center gap-3"
          strength={0.4}
        >
          <Phone className="w-5 h-5" />
          <span>Emergency</span>
        </MagneticButton>
      </div>

      {/* Emergency Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="modal-content relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-medical-red to-red-500 p-6 text-white relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Dental Emergency?</h3>
                    <p className="text-white/80 text-sm">We're here to help 24/7</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Emergency Call */}
                <a 
                  href="tel:1-800-MEDICAL"
                  className="flex items-center gap-4 p-4 bg-medical-red/5 rounded-2xl hover:bg-medical-red/10 transition-all duration-300 group hover:-translate-y-0.5"
                >
                  <div className="w-14 h-14 rounded-full bg-medical-red flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-muted">Call Emergency Line</p>
                    <p className="text-2xl font-bold text-medical-red">1-800-MEDICAL</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-medical-red group-hover:translate-x-1 transition-transform" />
                </a>
                
                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-start gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Clock className="w-5 h-5 text-medical-cyan" />
                    <div>
                      <p className="font-medium text-text-primary text-sm">24/7 Care</p>
                      <p className="text-xs text-text-muted">Always available</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <MapPin className="w-5 h-5 text-medical-cyan" />
                    <div>
                      <p className="font-medium text-text-primary text-sm">Walk-ins</p>
                      <p className="text-xs text-text-muted">Welcome anytime</p>
                    </div>
                  </div>
                </div>
                
                {/* Common Emergencies */}
                <div>
                  <p className="text-sm font-medium text-text-muted mb-3">Common Emergencies We Treat:</p>
                  <div className="flex flex-wrap gap-2">
                    {emergencies.map((item) => (
                      <span 
                        key={item.name} 
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 cursor-pointer ${
                          item.urgency === 'high' 
                            ? 'bg-medical-red/10 text-medical-red hover:bg-medical-red/20' 
                            : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                        }`}
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-3 text-text-muted hover:text-text-primary transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
