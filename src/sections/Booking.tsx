import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Clock, User, Mail, Phone, Check, ChevronRight, ChevronLeft, MapPin, Shield, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FadeInSection from '@/components/FadeInSection';
import MagneticButton from '@/components/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

const services = [
  { id: 'cosmetic', name: 'Cosmetic Dentistry', duration: '60 min', icon: Sparkles },
  { id: 'implants', name: 'Dental Implants', duration: '90 min', icon: Check },
  { id: 'whitening', name: 'Teeth Whitening', duration: '45 min', icon: Sparkles },
  { id: 'checkup', name: 'Regular Checkup', duration: '30 min', icon: Check },
  { id: 'emergency', name: 'Emergency Care', duration: 'Varies', icon: Clock },
];

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];

export default function Booking() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    const section = sectionRef.current;
    const form = formRef.current;

    if (!section || !form) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        form,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
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

  // Animate step transitions
  useEffect(() => {
    const formContent = formRef.current?.querySelector('.form-content');
    if (formContent) {
      gsap.fromTo(
        formContent,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [step]);

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
      setShowSuccess(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.service !== '';
      case 2:
        return formData.date !== '' && formData.time !== '';
      case 3:
        return formData.name !== '' && formData.email !== '' && formData.phone !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 form-content">
            <h3 className="text-xl font-semibold text-medical-blue mb-2">Select a Service</h3>
            <p className="text-text-muted text-sm mb-4">Choose the treatment that best fits your needs</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={() => setFormData({ ...formData, service: service.id })}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-300 group hover:-translate-y-0.5 ${
                      formData.service === service.id
                        ? 'border-medical-cyan bg-medical-cyan/5 shadow-medical'
                        : 'border-gray-200 hover:border-medical-cyan/50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        formData.service === service.id ? 'bg-medical-cyan text-white' : 'bg-gray-100 text-text-muted group-hover:bg-medical-cyan/10 group-hover:text-medical-cyan'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-text-primary group-hover:text-medical-cyan transition-colors">{service.name}</div>
                        <div className="text-sm text-text-muted flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {service.duration}
                        </div>
                      </div>
                    </div>
                    {formData.service === service.id && (
                      <div className="mt-3 flex items-center gap-2 text-medical-cyan text-sm">
                        <Check className="w-4 h-4" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 form-content">
            <h3 className="text-xl font-semibold text-medical-blue mb-2">Select Date & Time</h3>
            <p className="text-text-muted text-sm mb-4">Pick your preferred appointment slot</p>
            
            {/* Date Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-muted mb-2">Preferred Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-medical-cyan focus:outline-none transition-colors hover:border-gray-300"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Preferred Time</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setFormData({ ...formData, time })}
                    className={`p-2.5 rounded-lg text-sm border-2 transition-all duration-300 ${
                      formData.time === time
                        ? 'border-medical-cyan bg-medical-cyan text-white shadow-medical'
                        : 'border-gray-200 hover:border-medical-cyan/50 text-text-primary hover:bg-gray-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 form-content">
            <h3 className="text-xl font-semibold text-medical-blue mb-2">Your Information</h3>
            <p className="text-text-muted text-sm mb-4">Tell us a bit about yourself</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-medical-cyan focus:outline-none transition-colors hover:border-gray-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-medical-cyan focus:outline-none transition-colors hover:border-gray-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-medical-cyan focus:outline-none transition-colors hover:border-gray-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Additional Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any specific concerns or requirements..."
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-medical-cyan focus:outline-none transition-colors hover:border-gray-300 resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 form-content">
            <h3 className="text-xl font-semibold text-medical-blue mb-2">Confirm Your Appointment</h3>
            <p className="text-text-muted text-sm mb-4">Review your appointment details</p>
            
            <div className="bg-medical-cyan/5 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-medical-cyan/20">
                <span className="text-text-muted flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Service
                </span>
                <span className="font-medium text-text-primary">
                  {services.find(s => s.id === formData.service)?.name}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-medical-cyan/20">
                <span className="text-text-muted flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </span>
                <span className="font-medium text-text-primary">{formData.date}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-medical-cyan/20">
                <span className="text-text-muted flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                </span>
                <span className="font-medium text-text-primary">{formData.time}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-medical-cyan/20">
                <span className="text-text-muted flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Patient
                </span>
                <span className="font-medium text-text-primary">{formData.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-text-muted flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact
                </span>
                <span className="font-medium text-text-primary text-sm">{formData.email}</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-700">Your information is secure</p>
                <p className="text-sm text-green-600">We use HIPAA-compliant encryption to protect your data.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      ref={sectionRef}
      id="booking"
      className="relative w-full py-24 md:py-32 bg-gradient-to-b from-medical-grey to-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 medical-grid opacity-30" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-medical-cyan/5 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-medical-teal/5 blur-3xl" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <FadeInSection>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-medical-cyan/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-medical-cyan" />
              </div>
              <span className="text-medical-cyan font-semibold uppercase tracking-wider text-sm">Book Now</span>
            </div>
          </FadeInSection>
          
          <FadeInSection delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold text-medical-blue mb-4">
              Book Your
              <span className="text-gradient"> Appointment</span>
            </h2>
          </FadeInSection>
          
          <FadeInSection delay={0.2}>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Schedule your visit in just a few simple steps. Our team will confirm your appointment within 24 hours.
            </p>
          </FadeInSection>
        </div>
        
        {/* Form Container */}
        <div 
          ref={formRef}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="bg-gradient-to-r from-medical-cyan/10 to-medical-teal/10 px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-medical-cyan">Step {step} of 4</span>
              <span className="text-sm text-text-muted">
                {step === 1 && 'Select Service'}
                {step === 2 && 'Choose Date & Time'}
                {step === 3 && 'Your Details'}
                {step === 4 && 'Confirm'}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-medical-cyan to-medical-teal transition-all duration-500 ease-out"
                style={{ 
                  width: `${(step / 4) * 100}%`,
                  boxShadow: '0 0 10px rgba(11, 140, 179, 0.5)',
                }}
              />
            </div>
          </div>
          
          {/* Form Content */}
          <div className="p-6 md:p-8">
            {renderStep()}
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  step === 1
                    ? 'opacity-0 pointer-events-none'
                    : 'text-text-muted hover:text-medical-cyan hover:bg-medical-cyan/10'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              
              <MagneticButton
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-medium transition-all duration-300 ${
                  isStepValid() && !isSubmitting
                    ? 'btn-medical'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                strength={0.2}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {step === 4 ? 'Confirm Booking' : 'Continue'}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </MagneticButton>
            </div>
          </div>
        </div>
        
        {/* Contact Info */}
        <FadeInSection delay={0.3}>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-medical transition-shadow cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-medical-cyan/10 flex items-center justify-center group-hover:bg-medical-cyan group-hover:text-white transition-colors">
                <Phone className="w-5 h-5 text-medical-cyan group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Call Us</p>
                <p className="font-semibold text-medical-blue">1-800-MEDICAL</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-medical transition-shadow cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-medical-cyan/10 flex items-center justify-center group-hover:bg-medical-cyan group-hover:text-white transition-colors">
                <MapPin className="w-5 h-5 text-medical-cyan group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Visit Us</p>
                <p className="font-semibold text-medical-blue">123 Healthcare Ave</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-medical transition-shadow cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-medical-cyan/10 flex items-center justify-center group-hover:bg-medical-cyan group-hover:text-white transition-colors">
                <Clock className="w-5 h-5 text-medical-cyan group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Hours</p>
                <p className="font-semibold text-medical-blue">Mon-Sat: 8AM-6PM</p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
      
      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-scale-in">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <span className="text-2xl font-bold text-medical-blue">Appointment Confirmed!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-text-muted">
              Thank you, <span className="font-semibold text-medical-blue">{formData.name}</span>! Your appointment has been scheduled for <span className="font-semibold text-medical-blue">{formData.date}</span> at <span className="font-semibold text-medical-blue">{formData.time}</span>.
            </p>
            <p className="text-sm text-text-muted">
              A confirmation email has been sent to <span className="text-medical-cyan">{formData.email}</span>. We'll see you soon!
            </p>
            <div className="pt-4">
              <MagneticButton 
                onClick={() => {
                  setShowSuccess(false);
                  setStep(1);
                  setFormData({
                    service: '',
                    date: '',
                    time: '',
                    name: '',
                    email: '',
                    phone: '',
                    notes: '',
                  });
                }}
                className="btn-medical w-full"
              >
                Book Another Appointment
              </MagneticButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
