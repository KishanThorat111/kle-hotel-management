/**
 * KLE Site Content — canonical type definitions + hard-coded defaults.
 * Every section of the public website reads from this structure.
 * When the admin saves content to D1, it overrides these defaults at runtime
 * (loaded once per session via ContentContext).
 */

export const R2_CDN = 'https://pub-fd0ab08dad314949855afdfccd5131ec.r2.dev';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeroContent {
  heading: string;           // e.g. "Your Place in the World of Hospitality"
  subtitle: string;          // paragraph under the heading
  accreditation: string;     // badge below CTAs
  cta_primary: string;       // primary button text
  cta_secondary: string;     // secondary button text
  bg_image: string;          // CDN URL for hero background
  stats: Array<{ value: number; suffix: string; label: string }>;
  /** Small label above heading, e.g. "KLE Graduate School". Optional for backward-compat. */
  badge_label?: string;
  /** Location pill on the right of the badge */
  location_label?: string;
}

export interface AboutContent {
  heading: string;
  subheading: string;
  desc_1: string;
  desc_2: string;
  image: string;             // CDN URL for the about image
  stats: Array<{ value: string; label: string }>;
  pillars: Array<{ title: string; desc: string }>;
  /** "About KLE Hotel Management" small label above heading. */
  section_label?: string;
  /** Year shown in the floating badge over the image. */
  established_year?: string;
  /** Caption under the year, e.g. "Belagavi, Karnataka". */
  established_caption?: string;
  /** Tagline strip e.g. "Learn · Prosper · Excel". */
  tagline?: string;
  /** H2 line: `<heading_main> <em>{heading_em}</em> {heading_after}` */
  heading_main?: string;
  heading_em?: string;
  heading_after?: string;
}

export interface ProgramItem {
  title: string;
  subtitle: string;
  duration: string;
  desc: string;
  tags: string[];
  image: string;
}

/** Optional wrapping content for the Programs section header / footer. */
export interface ProgramsHeader {
  section_label?: string;
  heading_main?: string;     // "Degrees That Open"
  heading_em?: string;       // "Hotel Doors"
  subtitle?: string;         // small paragraph next to heading
  bottom_note?: string;      // "All programs include 6-month industrial training…"
}

export interface ContactContent {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;         // digits only, e.g. "916364504056"
  batch_year: string;
  admission_open: boolean;
}

// ─── New section types ────────────────────────────────────────────────────────

export interface PlacementsContent {
  section_label: string;
  heading_main: string;
  heading_em: string;
  description: string;
  stats: Array<{ value: string; label: string }>;
  career_paths: string[];
  partners: string[];
  partners_label: string;             // "Our Placement Partners"
  career_label: string;               // "Career Opportunities"
  badge_value: string;                // "50+"
  badge_caption: string;              // "Partner Hotels & Brands"
  image: string;                      // CDN URL
}

export interface FacilitiesContent {
  section_label: string;
  heading_main: string;
  heading_em: string;
  description: string;
  features: Array<{ title: string; desc: string }>;
  /** Captions on the three header images (kitchen, hostel, campus) */
  caption_1: string;
  caption_2: string;
  caption_3: string;
}

export interface CurriculumContent {
  section_label: string;
  heading_main: string;
  heading_em: string;
  description: string;
  subjects: Array<{ name: string; detail: string }>;
  highlights: string[];
  features_label: string;             // "Program Features"
  quote: string;
  quote_attribution: string;
  image: string;                      // CDN URL
}

export interface StudentLifeContent {
  section_label: string;
  heading_main: string;
  heading_em: string;
  description: string;
  experiences: Array<{ number: string; title: string; desc: string }>;
  /** Captions on the 5 mosaic images */
  caption_1: string;
  caption_2: string;
  caption_3: string;
  caption_4: string;
  caption_5: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  batch: string;
  quote: string;
  image: string;
}

export interface TestimonialsContent {
  section_label: string;
  heading_main: string;
  heading_em: string;
  items: TestimonialItem[];
}

export interface AdmissionContent {
  section_label: string;
  heading_main: string;
  heading_em: string;
  description: string;
  steps: Array<{ number: string; title: string; desc: string }>;
  eligibility: string[];
  eligibility_label: string;          // "Eligibility Criteria"
  contact_label: string;              // "Get In Touch"
  /** WhatsApp prefilled message text (without URL encoding) */
  whatsapp_message: string;
  cta_apply: string;                  // "Apply for Admission"
  cta_whatsapp: string;               // "WhatsApp Us"
  cta_call: string;                   // "Call Admissions"
  /** Phone shown / dialed in admission section. */
  call_number: string;                // "08312444348"
}

export interface FooterContent {
  brand_name: string;                 // "KLE Graduate School of Hotel Management"
  tagline: string;                    // "Learn · Prosper · Excel"
  description: string;                // brand paragraph
  contact_label: string;              // "Contact"
  address_lines: string[];
  phones: string[];
  email: string;
  website: string;
  copyright: string;                  // template, "©" gets year prepended
  copyright_subtext: string;          // "Part of the KLE Society · Since 1916"
}

export interface SiteContent {
  hero: HeroContent;
  about: AboutContent;
  programs: ProgramItem[];
  /** Optional header/footer text for the programs section. */
  programs_header?: ProgramsHeader;
  contact: ContactContent;
  placements: PlacementsContent;
  facilities: FacilitiesContent;
  curriculum: CurriculumContent;
  student_life: StudentLifeContent;
  testimonials: TestimonialsContent;
  admission: AdmissionContent;
  footer: FooterContent;
}

// ─── Defaults (match current hardcoded values exactly) ───────────────────────

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    heading: 'Your Place in the World of Hospitality',
    subtitle:
      'KLE Graduate School of Hotel Management and Catering Technology, Belagavi — empowering students to lead the global hospitality industry since 1997.',
    accreditation: 'AICTE Approved · Affiliated to KLE University',
    cta_primary: 'Apply Now',
    cta_secondary: 'Explore Programs',
    bg_image: `${R2_CDN}/images/campus.webp`,
    stats: [
      { value: 25,   suffix: '+', label: 'Years of Excellence' },
      { value: 5000, suffix: '+', label: 'Alumni Worldwide' },
      { value: 100,  suffix: '%', label: 'Placement Support' },
      { value: 50,   suffix: '+', label: 'Industry Partners' },
    ],
  },
  about: {
    heading: 'About KLE Hotel Management',
    subheading: 'Where Hospitality Meets Excellence',
    desc_1:
      "KLE Graduate School of Hotel Management & Catering Technology is a premier institution at JNMC Campus, Nehru Nagar, Belagavi. Part of the prestigious KLE Society — one of Karnataka's largest educational groups with 270+ institutions since 1916.",
    desc_2:
      'We provide world-class hospitality education through an industry-integrated curriculum, expert faculty with leading hotel experience, and 100% placement assistance to every student.',
    image: `${R2_CDN}/images/team.webp`,
    section_label: 'About KLE Hotel Management',
    heading_main: 'A Legacy of',
    heading_em: 'Hospitality Excellence',
    heading_after: 'Since 1997',
    tagline: 'Learn · Prosper · Excel',
    established_year: '1997',
    established_caption: 'Belagavi, Karnataka',
    stats: [
      { value: '25+',   label: 'Years of Excellence' },
      { value: '5000+', label: 'Successful Alumni' },
      { value: '100%',  label: 'Placement Support' },
    ],
    pillars: [
      {
        title: 'Academic Excellence',
        desc: 'NEP-aligned curriculum, industry faculty, and hands-on practical training in fully equipped labs.',
      },
      {
        title: 'Global Exposure',
        desc: 'International internship opportunities, cultural exchange, and placements with 5-star brands worldwide.',
      },
      {
        title: 'Industry Integration',
        desc: 'Partnerships with Taj, Marriott, ITC, Oberoi, Hyatt and 50+ leading hospitality companies.',
      },
    ],
  },
  programs: [
    {
      title: 'Culinary Operations',
      subtitle: 'Food Production & Patisserie',
      duration: '3 Years',
      desc: 'Master classical and modern culinary techniques. Bread & pastry, garde manger, live kitchens with professional-grade equipment.',
      tags: ['Food Production', 'Bakery & Confectionery', 'Nutrition'],
      image: `${R2_CDN}/images/chef-students.webp`,
    },
    {
      title: 'Food & Beverage Service',
      subtitle: 'Restaurant & Bar Operations',
      duration: '3 Years',
      desc: 'Comprehensive training in dining room operations, beverage management, and fine dining etiquette for 5-star establishments.',
      tags: ['Service Skills', 'Beverage Knowledge', 'Fine Dining'],
      image: `${R2_CDN}/images/fb-service.webp`,
    },
    {
      title: 'Accommodation Management',
      subtitle: 'Housekeeping & Room Division',
      duration: '3 Years',
      desc: 'Professional laundry, housekeeping, room division management and guest services in modern hotel environments.',
      tags: ['Housekeeping', 'Laundry', 'Room Division'],
      image: `${R2_CDN}/images/accommodation.webp`,
    },
    {
      title: 'Front Office Operations',
      subtitle: 'Guest Relations & Hotel Operations',
      duration: '3 Years',
      desc: 'Front desk operations, reservations management, guest relations and Property Management Systems (PMS) training.',
      tags: ['Front Desk', 'PMS Systems', 'Guest Relations'],
      image: `${R2_CDN}/images/front-office.webp`,
    },
  ],
  contact: {
    phone: '+91 63645 04056',
    email: 'admissions@klehotelmanagement.edu.in',
    address: 'JNMC Campus, Nehru Nagar, Belagavi, Karnataka 590010',
    whatsapp: '916364504056',
    batch_year: '2026',
    admission_open: true,
  },
  programs_header: {
    section_label: 'Our Programs',
    heading_main: 'Degrees That Open',
    heading_em: 'Hotel Doors',
    subtitle: '3-year undergraduate programs with 6-month industrial training in leading hotel chains.',
    bottom_note: 'All programs include 6-month industrial training + AICTE approved · Affiliated to KLE University',
  },
  placements: {
    section_label: 'Industrial Training & Placements',
    heading_main: 'Careers That Begin',
    heading_em: 'Before Graduation',
    description:
      "Our intensive 6 to 12-month industrial training program places students in India's finest hotel chains and international properties — ensuring every graduate enters the industry job-ready with real-world experience.",
    stats: [
      { value: '100%',  label: 'Placement Assistance' },
      { value: '50+',   label: 'Partner Brands' },
      { value: '6-12',  label: 'Month Internship' },
      { value: 'Global',label: 'International Placements' },
    ],
    career_paths: [
      'Executive Chef', 'F&B Manager', 'Front Office Manager', 'Hotel Operations Manager',
      'Guest Relations Executive', 'Revenue Manager', 'Event Coordinator', 'Housekeeping Manager',
    ],
    partners: [
      'Taj Hotels & Resorts', 'ITC Hotels', 'Marriott International', 'Hyatt Hotels',
      'Oberoi Group', 'Radisson Hotels', 'Leela Palaces', 'JW Marriott',
      'Novotel', 'Holiday Inn', 'The Westin', 'Crowne Plaza',
    ],
    partners_label: 'Our Placement Partners',
    career_label: 'Career Opportunities',
    badge_value: '50+',
    badge_caption: 'Partner Hotels & Brands',
    image: `${R2_CDN}/images/front-office.webp`,
  },
  facilities: {
    section_label: 'Campus & Facilities',
    heading_main: 'Equipped for the',
    heading_em: 'Real World',
    description: 'Industry-standard training facilities at the JNMC Campus, designed to replicate actual hotel environments.',
    features: [
      { title: 'Professional Kitchen Labs', desc: 'State-of-the-art kitchen equipment including commercial ranges, convection ovens, and pastry stations.' },
      { title: 'Training Restaurant',       desc: 'Live training restaurant where students gain real service experience in a fine-dining environment.' },
      { title: 'Student Hostel',            desc: 'On-campus accommodation with modern facilities, Wi-Fi, and 24-hour security at JNMC Campus.' },
      { title: 'Convention Center',         desc: 'Multipurpose event hall for workshops, cultural programs, and industry interaction meets.' },
    ],
    caption_1: 'Kitchen Laboratory',
    caption_2: 'Hostel & Accommodation',
    caption_3: 'JNMC Campus',
  },
  curriculum: {
    section_label: 'Curriculum Highlights',
    heading_main: 'A Curriculum Built for',
    heading_em: 'Industry Readiness',
    description:
      'Our NEP 2020-aligned, 3-year program combines academic theory with intensive practical training — preparing students for immediate employment in premium hospitality roles.',
    subjects: [
      { name: 'Food Production & Cooking', detail: 'Classical & modern culinary arts, nutrition, menu planning' },
      { name: 'Food & Beverage Service',   detail: 'Restaurant operations, bar management, fine dining etiquette' },
      { name: 'Front Office Operations',   detail: 'PMS systems, reservations, guest relations, check-in/out' },
      { name: 'Housekeeping Management',   detail: 'Room care, laundry, public area maintenance standards' },
      { name: 'Bakery & Confectionery',    detail: 'Bread making, pastry, chocolate work, dessert arts' },
      { name: 'Event Management',          detail: 'Banquet planning, MICE, conference coordination' },
    ],
    highlights: [
      'NEP 2020 aligned curriculum',
      '6–12 month industrial training',
      'Practical lab sessions daily',
      'Industry expert guest lectures',
      'International exposure visits',
      'Career mentorship program',
    ],
    features_label: 'Program Features',
    quote: 'Theory without practice is incomplete. We ensure students learn by doing.',
    quote_attribution: '— Department of Culinary Arts',
    image: `${R2_CDN}/images/chef-students.webp`,
  },
  student_life: {
    section_label: 'Student Life',
    heading_main: 'Life Beyond',
    heading_em: 'the Classroom',
    description:
      "At KLE Hotel Management, students don't just learn — they live the hospitality experience through cultural events, industry visits, and daily practical training.",
    experiences: [
      { number: '01', title: 'Practical Lab Sessions', desc: 'Daily hands-on labs in kitchens, training restaurants, and front office setups.' },
      { number: '02', title: 'Cultural Events & Fests', desc: 'Annual hospitality fest, talent shows, and inter-college competitions.' },
      { number: '03', title: 'Industry Visits & Tours', desc: 'Regular visits to 5-star hotels, food expos, and international conferences.' },
      { number: '04', title: 'Sports & Wellness',       desc: 'Dedicated sports facilities, gym, and wellness programs for holistic development.' },
    ],
    caption_1: 'Culinary Competitions',
    caption_2: 'F&B Service',
    caption_3: 'Campus Events',
    caption_4: 'Front Office',
    caption_5: 'Hostel Life',
  },
  testimonials: {
    section_label: 'Student Stories',
    heading_main: 'Words from Our',
    heading_em: 'Alumni',
    items: [
      {
        name: 'Priya Desai',
        role: 'F&B Supervisor, Taj Hotels',
        batch: 'Batch of 2020',
        quote: 'KLE Hotel Management gave me the foundation I needed to crack placements at Taj. The practical training was so thorough that my first day at work felt familiar.',
        image: `${R2_CDN}/images/team.webp`,
      },
      {
        name: 'Arjun Naik',
        role: 'Senior Chef, ITC Hotels, Bangalore',
        batch: 'Batch of 2018',
        quote: 'The culinary labs at KLE are world-class. By the time I graduated, I had already cooked over 200 professional recipes. That confidence is priceless.',
        image: `${R2_CDN}/images/chef-students.webp`,
      },
      {
        name: 'Sneha Kulkarni',
        role: 'Front Office Manager, JW Marriott',
        batch: 'Batch of 2021',
        quote: 'The faculty brought real hotel experience into the classroom. I learned guest handling, PMS systems, and revenue management — all before my internship.',
        image: `${R2_CDN}/images/front-office.webp`,
      },
      {
        name: 'Rahul Patil',
        role: 'Housekeeping Executive, Oberoi Group',
        batch: 'Batch of 2019',
        quote: 'The placement cell at KLE is extremely supportive. They connected me with Oberoi Group and prepared me with mock interviews and grooming sessions.',
        image: `${R2_CDN}/images/accommodation.webp`,
      },
    ],
  },
  admission: {
    section_label: 'Admissions Open',
    heading_main: 'Begin Your Journey in',
    heading_em: 'Hospitality',
    description: "Join the next batch at KLE Graduate School of Hotel Management — Belagavi's premier hotel management institute.",
    steps: [
      { number: '01', title: 'Submit Application',     desc: 'Fill the online application form with personal details, academic records, and program preference.' },
      { number: '02', title: 'Document Verification',  desc: '10th & 12th mark sheets, Transfer Certificate, Aadhaar card, and passport-size photographs.' },
      { number: '03', title: 'Counseling Interview',   desc: 'Personal interaction with faculty to assess aptitude, interest, and communication skills.' },
      { number: '04', title: 'Admission Confirmation', desc: 'Fee submission and issue of admission letter. Begin your journey into hospitality!' },
    ],
    eligibility: [
      'Minimum 10+2 (any stream) from a recognized board',
      'Minimum 50% aggregate marks (45% for SC/ST)',
      'Age: 17–23 years as on July 1st of admission year',
      'English proficiency is essential',
      'Physical fitness and good communication skills',
    ],
    eligibility_label: 'Eligibility Criteria',
    contact_label: 'Get In Touch',
    whatsapp_message: 'Hello, I am interested in admission at KLE Graduate School of Hotel Management, Belagavi. Please guide me through the process.',
    cta_apply:    'Apply for Admission',
    cta_whatsapp: 'WhatsApp Us',
    cta_call:     'Call Admissions',
    call_number:  '08312444348',
  },
  footer: {
    brand_name: 'KLE Graduate School of Hotel Management',
    tagline: 'Learn · Prosper · Excel',
    description:
      'A premier hotel management institution under the KLE Society, providing world-class hospitality education since 1997 at JNMC Campus, Belagavi.',
    contact_label: 'Contact',
    address_lines: [
      'JNMC Campus, Nehru Nagar',
      'Belagavi - 590 010, Karnataka, India',
    ],
    phones: ['0831-2444348', '+91 97315 95657'],
    email: 'info@klehotelmanagement.edu.in',
    website: 'www.klehotelmanagement.edu.in',
    copyright: 'KLE Graduate School of Hotel Management & Catering Technology. All rights reserved.',
    copyright_subtext: 'Part of the KLE Society · Since 1916',
  },
};
