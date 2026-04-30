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
}

export interface AboutContent {
  heading: string;
  subheading: string;
  desc_1: string;
  desc_2: string;
  image: string;             // CDN URL for the about image
  stats: Array<{ value: string; label: string }>;
  pillars: Array<{ title: string; desc: string }>;
}

export interface ProgramItem {
  title: string;
  subtitle: string;
  duration: string;
  desc: string;
  tags: string[];
  image: string;
}

export interface ContactContent {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;         // digits only, e.g. "916364504056"
  batch_year: string;
  admission_open: boolean;
}

export interface SiteContent {
  hero: HeroContent;
  about: AboutContent;
  programs: ProgramItem[];
  contact: ContactContent;
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
      "Established in 1997 as part of the KLE Society, we are Karnataka's most prestigious hotel management institution, offering world-class hospitality education at our state-of-the-art JNMC Campus, Belagavi.",
    desc_2:
      'Our NEP-aligned curriculum, combined with industry partnerships with global brands like Taj, Marriott, ITC, and Oberoi, ensures our graduates are ready for the demands of modern hospitality.',
    image: `${R2_CDN}/images/team.webp`,
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
};
