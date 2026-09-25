import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Briefcase,
  Megaphone,
  GraduationCap,
  Trophy,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlumni } from '../../context/AlumniContext';
import { CampusGalleryModal } from '../gallery/CampusGalleryModal';
import {
  Link000,
  Link001,
  Link002,
  Link003,
  Link004,
  Link005
} from '../ui/skiper-ui/skiper40';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register', role?: 'alumni' | 'employer') => void;
}

// 3 Slideshow images corresponding directly to the user's authentic uploaded campus photographs
const CAMPUS_SLIDES = [
  {
    id: 1,
    image: '/assets/landing-building-1.jpg',
    badge: 'SLIDE 01 • CAMPUS TOWER',
    title: 'St. Cecilia’s Modern Tower',
    caption: 'Towering academic high-rise architecture under the open sky.'
  },
  {
    id: 2,
    image: '/assets/landing-building-2.jpg',
    badge: 'SLIDE 02 • MAIN INSTITUTIONAL HALL',
    title: 'St. Cecilia’s College Main Building',
    caption: 'Official campus facade featuring the distinctive red column and main entrance canopy.'
  },
  {
    id: 3,
    image: '/assets/landing-building-3.jpg',
    badge: 'SLIDE 03 • CEBU CAMPUS COMPLEX',
    title: 'St. Cecilia’s Institutional Complex',
    caption: 'Academic grounds and collegiate learning facilities of St. Cecilia’s College - Cebu, Inc.'
  }
];

// Professional, welcoming messages tailored to St. Cecilia Alumni
const CECILIAN_WELCOME_MESSAGES = [
  "Welcome home, Cecilians.",
  "Reconnecting batches across generations.",
  "Honoring traditions of Virtus, Scientia & Charitas.",
  "Carrying the legacy of St. Cecilia's College forward.",
  "Your lifelong alumni community begins here."
];

// Staggered fade animation variants for hero heading, sub-headline, and CTAs
const heroHeadingContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.25
    }
  }
};

const heroHeadingLineVariants = {
  hidden: {
    opacity: 0,
    y: 38,
    filter: 'blur(8px)'
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

const heroSubheadlineVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: 'blur(6px)'
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.85,
      delay: 0.75,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

const heroCtaVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: 0.95,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToAuth
}) => {
  const { currentUser } = useAlumni();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Slideshow state for background images 1 to 3
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHoveringControls, setIsHoveringControls] = useState(false);

  // Auto-advance slideshow every 6 seconds
  useEffect(() => {
    if (isHoveringControls) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % CAMPUS_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHoveringControls]);

  const goToNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % CAMPUS_SLIDES.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + CAMPUS_SLIDES.length) % CAMPUS_SLIDES.length);
  };

  // Track scroll position for dynamic sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sophisticated Typewriter Greeting Effect tailored to St. Cecilia Alumni
  const [welcomeIndex, setWelcomeIndex] = useState(0);
  const [displayedWelcomeText, setDisplayedWelcomeText] = useState('');
  const [isDeletingWelcome, setIsDeletingWelcome] = useState(false);

  useEffect(() => {
    const fullText = CECILIAN_WELCOME_MESSAGES[welcomeIndex];
    let timer: NodeJS.Timeout;

    if (!isDeletingWelcome) {
      if (displayedWelcomeText.length < fullText.length) {
        timer = setTimeout(() => {
          setDisplayedWelcomeText(fullText.slice(0, displayedWelcomeText.length + 1));
        }, 48);
      } else {
        // Pause at the end of the full welcoming message
        timer = setTimeout(() => {
          setIsDeletingWelcome(true);
        }, 3400);
      }
    } else {
      if (displayedWelcomeText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedWelcomeText(fullText.slice(0, displayedWelcomeText.length - 1));
        }, 22);
      } else {
        setIsDeletingWelcome(false);
        setWelcomeIndex((prev) => (prev + 1) % CECILIAN_WELCOME_MESSAGES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedWelcomeText, isDeletingWelcome, welcomeIndex]);


  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] text-[#111827] font-sans selection:bg-[#991B1B] selection:text-white">
      
      {/* ========================================================
          STICKY HEADER
          Matches Screenshots 1, 2, 3:
          Left: ALUMNI / ST. CECILIA'S
          Right: Home | Gallery | Sign In | Apply Now
          Seamlessly adapts between dark hero overlay and crisp white on scroll
          ======================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
          isScrolled
            ? 'bg-[#FFFFFF] border-b border-[#E5E7EB] shadow-xs py-3 sm:py-4'
            : 'bg-black/40 backdrop-blur-xs py-3.5 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          
          {/* Logo Brand: "ALUMNI" / "ST. CECILIA'S" with Team Seal */}
          <div
            onClick={() => {
              setIsMobileNavOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 sm:gap-4 cursor-pointer select-none group"
          >
            <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#991B1B] to-amber-500 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/assets/cecilians-seal.jpg"
                alt="Alumni Cecilian's Seal"
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <div className="flex flex-col">
              <span
                className="font-display tracking-[0.35em] text-[#991B1B] text-lg sm:text-2xl font-bold leading-none group-hover:opacity-90 transition-opacity"
                style={{ letterSpacing: '0.35em' }}
              >
                ALUMNI
              </span>
              <span
                className="text-[9px] sm:text-[11px] tracking-[0.22em] text-[#991B1B] font-bold uppercase mt-0.5 sm:mt-1"
                style={{ letterSpacing: '0.22em' }}
              >
                ST. CECILIA'S
              </span>
            </div>
          </div>

          {/* Desktop Nav items - Styled with Skiper40 fluid directional animations */}
          <nav className="hidden sm:flex items-center gap-4 sm:gap-7 text-sm sm:text-[15px] font-bold">
            <Link000
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`py-1 cursor-pointer transition-colors ${
                isScrolled ? 'text-[#111827] hover:text-[#991B1B]' : 'text-stone-200 hover:text-white'
              }`}
            >
              Home
            </Link000>

            <Link001
              onClick={(e) => {
                e.preventDefault();
                setShowGalleryModal(true);
              }}
              className={`py-1 cursor-pointer transition-colors ${
                isScrolled ? 'text-[#4B5563] hover:text-[#111827]' : 'text-stone-200 hover:text-white'
              }`}
            >
              Gallery
            </Link001>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link002
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateToAuth('login');
                }}
                className={`py-1 text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
                  isScrolled ? 'text-[#4B5563] hover:text-[#111827]' : 'text-stone-200 hover:text-white'
                }`}
              >
                Sign In
              </Link002>

              <button
                onClick={() => onNavigateToAuth('register')}
                className="bg-[#991B1B] hover:bg-[#7f1616] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold tracking-wider text-xs sm:text-sm shadow-md transition-all hover:scale-102 cursor-pointer"
              >
                Register
              </button>
            </div>
          </nav>

          {/* Mobile Right Controls: Compact Sign In + Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={() => onNavigateToAuth('login')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                isScrolled
                  ? 'text-stone-700 hover:text-[#991B1B] hover:bg-stone-100'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isScrolled
                  ? 'text-stone-800 hover:bg-stone-100'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Menu Drawer */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="sm:hidden bg-white border-b border-stone-200 shadow-xl overflow-hidden"
            >
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/cecilians-seal.jpg"
                      alt="Seal"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Cecilian Community
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">ST. CECILIA'S</span>
                </div>

                <div className="flex flex-col space-y-2 text-sm font-semibold text-stone-700">
                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 text-left transition-colors cursor-pointer"
                  >
                    <span>Home</span>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      setShowGalleryModal(true);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 text-left transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#991B1B]" />
                      <span>Campus Heritage Gallery</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      const el = document.getElementById('features');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 text-left transition-colors cursor-pointer"
                  >
                    <span>Alumni Network Features</span>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </button>
                </div>

                <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      onNavigateToAuth('register', 'alumni');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#991B1B] text-white font-bold text-xs uppercase tracking-wider text-center shadow-xs hover:bg-[#7f1616] transition-colors cursor-pointer"
                  >
                    Register as Cecilian Alumni
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      onNavigateToAuth('register', 'employer');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-100 text-stone-800 font-bold text-xs uppercase tracking-wider text-center hover:bg-stone-200 transition-colors cursor-pointer"
                  >
                    Employer Career Portal
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================
          HERO SECTION (Matches Screenshot 1)
          - Dark architectural building backdrop with 3-image slideshow (Image 1 to 3)
          - Top-left red corner decorative element
          - "• EST. 2026 • ST. CECILIA'S" badge with team seal
          - "Where / Legacy / Lives On." (Legacy italic)
          - Left red accent bar with subtext
          - "APPLY NOW" and "SIGN IN" buttons
          - Right vertical text: "ALUMNI • ST. CECILIA'S • 2026"
          - Bottom pagination indicators & slide switcher
          ======================================================== */}
      <section className="relative min-h-screen flex items-center bg-[#111827] text-white overflow-hidden pt-20">
        
        {/* Slideshow Architecture Backdrop: Images 1 to 3 with smooth AnimatePresence fade & zoom */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={CAMPUS_SLIDES[currentSlideIndex].id}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1.02 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img
                src={CAMPUS_SLIDES[currentSlideIndex].image}
                alt={CAMPUS_SLIDES[currentSlideIndex].title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter contrast-110 brightness-80"
              />
            </motion.div>
          </AnimatePresence>

          {/* Gradients for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/50 pointer-events-none" />
        </div>

        {/* Decorative corner red bracket on the top-left */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute left-8 sm:left-12 top-28 z-10 w-10 h-10 border-t border-l border-[#991B1B]/70 pointer-events-none"
        />

        {/* Vertical tracking text along right edge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:flex absolute right-8 sm:right-10 top-1/2 -translate-y-1/2 z-10 select-none pointer-events-none"
        >
          <span
            className="text-[10px] font-semibold text-white/30 tracking-[0.4em] uppercase"
            style={{ writingMode: 'vertical-rl' }}
          >
            ALUMNI • ST. CECILIA'S • 2026
          </span>
        </motion.div>

        {/* Slideshow Prev & Next Floating Arrow Controls (Desktop only to prevent obstructing mobile text) */}
        <div
          className="hidden sm:flex absolute inset-y-0 left-3 sm:left-6 z-20 items-center"
          onMouseEnter={() => setIsHoveringControls(true)}
          onMouseLeave={() => setIsHoveringControls(false)}
        >
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(153, 27, 27, 0.85)' }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={goToPrevSlide}
            aria-label="Previous Slide"
            className="p-2.5 sm:p-3 rounded-full bg-black/40 text-white/70 hover:text-white border border-white/10 hover:border-white/30 backdrop-blur-md transition-colors shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        </div>

        <div
          className="hidden sm:flex absolute inset-y-0 right-3 sm:right-6 z-20 items-center"
          onMouseEnter={() => setIsHoveringControls(true)}
          onMouseLeave={() => setIsHoveringControls(false)}
        >
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(153, 27, 27, 0.85)' }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={goToNextSlide}
            aria-label="Next Slide"
            className="p-2.5 sm:p-3 rounded-full bg-black/40 text-white/70 hover:text-white border border-white/10 hover:border-white/30 backdrop-blur-md transition-colors shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-5 sm:px-8 py-20 sm:py-32">
          <div className="max-w-3xl">
            
            {/* Sophisticated Typewriter Greeting with Official Cecilian Seal & Slide Badge */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              <div className="inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#8B181B]/60 bg-black/60 backdrop-blur-md shadow-[0_4px_24px_rgba(139,24,27,0.25)] text-stone-200 text-xs sm:text-sm">
                <div className="relative w-5 h-5 rounded-full ring-1 ring-amber-400/60 overflow-hidden shrink-0">
                  <img
                    src="/assets/cecilians-seal.jpg"
                    alt="Alumni Cecilian's Seal"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase text-[#fca5a5]">
                  Alumni Portal
                </span>
                <span aria-hidden="true" className="text-stone-500">·</span>
                <div className="flex items-center min-h-[22px]">
                  <span className="font-serif italic text-xs sm:text-[14px] text-white tracking-wide">
                    {displayedWelcomeText}
                  </span>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-[2px] h-3.5 sm:h-4 bg-[#f87171] ml-1 shadow-[0_0_8px_#ef4444]"
                  />
                </div>
              </div>

              {/* Active Slide Tracker Chip */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={CAMPUS_SLIDES[currentSlideIndex].id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-black/30 backdrop-blur-md text-[11px] font-semibold text-stone-300"
                >
                  <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                  <span>{CAMPUS_SLIDES[currentSlideIndex].badge}</span>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Giant Cormorant Garamond Display Headline with Dynamic Staggered-Fade Animation */}
            <motion.h1
              variants={heroHeadingContainerVariants}
              initial="hidden"
              animate="visible"
              className="font-display text-4xl xs:text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-normal text-white leading-[1.08] tracking-tight mb-6 sm:mb-8"
            >
              <motion.span variants={heroHeadingLineVariants} className="block">
                Where
              </motion.span>
              <motion.span variants={heroHeadingLineVariants} className="block italic font-normal text-[#fca5a5]/95">
                Legacy
              </motion.span>
              <motion.span variants={heroHeadingLineVariants} className="block">
                Lives On.
              </motion.span>
            </motion.h1>

            {/* Subtext with red accent mark on left & current slide title - Staggered Fade */}
            <motion.div
              variants={heroSubheadlineVariants}
              initial="hidden"
              animate="visible"
              className="flex items-start gap-4 max-w-xl mb-10"
            >
              <motion.span
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="w-6 h-[2px] bg-[#991B1B] mt-2.5 shrink-0 origin-left"
              />
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className="text-stone-200 text-sm sm:text-base leading-relaxed font-light"
                >
                  A private network for St. Cecilia's graduates. Connect with fellow alumni, attend exclusive reunions, and carry our shared heritage forward.
                </motion.p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={CAMPUS_SLIDES[currentSlideIndex].id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.35 }}
                    className="text-xs text-red-300/85 font-medium mt-2 italic"
                  >
                    Featured: {CAMPUS_SLIDES[currentSlideIndex].title} — {CAMPUS_SLIDES[currentSlideIndex].caption}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* CTA Buttons with staggered entrance */}
            <motion.div
              variants={heroCtaVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: '#7f1616' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateToAuth('register')}
                className="bg-[#991B1B] text-white px-8 py-3.5 rounded-xs font-semibold text-xs tracking-[0.18em] uppercase shadow-lg transition-colors cursor-pointer"
              >
                APPLY NOW
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateToAuth('login')}
                className="bg-transparent text-white border border-white/30 hover:border-white px-8 py-3.5 rounded-xs font-semibold text-xs tracking-[0.18em] uppercase transition-colors cursor-pointer"
              >
                SIGN IN
              </motion.button>
            </motion.div>

          </div>
        </div>

        {/* Bottom Interactive Slideshow Pagination (1, 2, 3) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/15"
          onMouseEnter={() => setIsHoveringControls(true)}
          onMouseLeave={() => setIsHoveringControls(false)}
        >
          {CAMPUS_SLIDES.map((slide, idx) => {
            const isSelected = idx === currentSlideIndex;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer relative ${
                  isSelected
                    ? 'text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeSlideIndicator"
                    className="absolute inset-0 bg-[#991B1B] rounded-full shadow-md -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span>0{slide.id}</span>
                <span className="hidden sm:inline text-[11px] font-medium opacity-90">
                  {idx === 0 ? 'Tower' : idx === 1 ? 'Main Hall' : 'Campus'}
                </span>
                <span
                  className={`h-1 rounded-full transition-all duration-300 ${
                    isSelected ? 'w-6 bg-white' : 'w-2 bg-white/30'
                  }`}
                />
              </button>
            );
          })}
        </motion.div>
      </section>

      {/* ========================================================
          STATS BAND (Matches Screenshot 2)
          Brand Red #991B1B Background, 4 columns:
          500+ GRADUATES | 12 ACTIVE CHAPTERS | 48+ ANNUAL EVENTS | 25+ YEARS OF LEGACY
          ======================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#991B1B] text-white border-y border-[#7f1616]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/20 py-8 sm:py-10">
            
            {/* Stat 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center py-4 md:py-2 px-4"
            >
              <div className="font-display text-4xl sm:text-5xl font-light tracking-tight text-white mb-1">
                500+
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                GRADUATES
              </div>
            </motion.div>

            {/* Stat 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center py-4 md:py-2 px-4"
            >
              <div className="font-display text-4xl sm:text-5xl font-light tracking-tight text-white mb-1">
                12
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                ACTIVE CHAPTERS
              </div>
            </motion.div>

            {/* Stat 3 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center py-4 md:py-2 px-4"
            >
              <div className="font-display text-4xl sm:text-5xl font-light tracking-tight text-white mb-1">
                48+
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                ANNUAL EVENTS
              </div>
            </motion.div>

            {/* Stat 4 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center py-4 md:py-2 px-4"
            >
              <div className="font-display text-4xl sm:text-5xl font-light tracking-tight text-white mb-1">
                25+
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                YEARS OF LEGACY
              </div>
            </motion.div>

          </div>
        </div>
      </motion.section>

      {/* ========================================================
          ABOUT SECTION (Matches Screenshot 2)
          — ABOUT
          A Network Built on Tradition.
          Right side: Two paragraphs + JOIN THE NETWORK →
          ======================================================== */}
      <motion.section
        id="about"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="py-24 sm:py-32 bg-[#FFFFFF]"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          {/* Red Label */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-5 h-[1.5px] bg-[#991B1B]" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#991B1B]">
              ABOUT
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Headline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6"
            >
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#111827] font-normal leading-[1.15] tracking-tight">
                A Network<br />
                Built on<br />
                Tradition.
              </h2>
            </motion.div>

            {/* Right Narrative */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 space-y-6 pt-2"
            >
              <p className="text-[#6B7280] text-sm sm:text-base leading-relaxed font-light">
                The St. Cecilia's Alumni Network is an exclusive community connecting graduates across generations. We preserve the legacy of our institution while empowering alumni to grow professionally and personally.
              </p>

              <p className="text-[#6B7280] text-sm sm:text-base leading-relaxed font-light">
                From batch reunions to career mentorship, our platform is the bridge between where you came from and where you're going.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigateToAuth('register')}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#991B1B] hover:text-[#7f1616] transition-colors group cursor-pointer"
                >
                  <span>JOIN THE NETWORK</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Skiper40 Micro-Interactions Showcase: Institutional Fast Directives */}
              <div className="pt-5 border-t border-stone-200/80">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3.5">
                  Direct Institutional Portals
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-[13px] font-semibold text-stone-700">
                  <Link001
                    onClick={() => onNavigateToAuth('login')}
                    className="hover:text-[#991B1B]"
                  >
                    Grand Homecoming 2026
                  </Link001>
                  <Link002
                    onClick={() => onNavigateToAuth('register', 'alumni')}
                    className="hover:text-[#991B1B]"
                  >
                    Verified Batch Directory
                  </Link002>
                  <Link003
                    onClick={() => setShowGalleryModal(true)}
                    className="hover:text-[#991B1B]"
                  >
                    Campus Photo Archives
                  </Link003>
                  <Link004
                    onClick={() => onNavigateToAuth('register', 'employer')}
                    className="hover:text-[#991B1B]"
                  >
                    Employer Career Board
                  </Link004>
                  <Link005
                    href="mailto:alumni@stcecilia.edu.ph"
                    className="hover:text-[#991B1B]"
                  >
                    Official Registrar Inquiries
                  </Link005>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </motion.section>

      {/* ========================================================
          FEATURES SECTION (Matches Screenshots 3 & 4)
          — FEATURES
          Everything You Need, In One Place.
          Right side: GET ACCESS button
          6-Card Bento Grid with hairline borders:
          1. Alumni Network
          2. Exclusive Events
          3. Career Board
          4. Announcements
          5. Batch Chapters
          6. Career Milestones
          ======================================================== */}
      <section id="features" className="py-24 bg-[#FFFFFF] border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          {/* Header Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          >
            <div>
              {/* Red Label */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-5 h-[1.5px] bg-[#991B1B]" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#991B1B]">
                  FEATURES
                </span>
              </div>

              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#111827] font-normal leading-[1.1] tracking-tight">
                Everything You<br />
                Need, In One<br />
                Place.
              </h2>
            </div>

            {/* GET ACCESS button */}
            <div>
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: '#991B1B', color: '#ffffff' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateToAuth('register')}
                className="border border-[#991B1B] text-[#991B1B] px-7 py-3 rounded-xs text-xs font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
              >
                GET ACCESS
              </motion.button>
            </div>
          </motion.div>

          {/* 6-Grid Feature Cards (3 columns x 2 rows) with subtle hover elevation */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-[#E5E7EB] bg-[#FFFFFF] divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB]"
          >
            
            {/* Card 1: Alumni Network */}
            <motion.div
              whileHover={{ y: -4, backgroundColor: '#F9FAFB' }}
              transition={{ duration: 0.2 }}
              className="p-8 sm:p-10 flex flex-col justify-between transition-colors group cursor-default"
            >
              <div>
                <div className="mb-6 text-[#991B1B] group-hover:scale-110 transition-transform origin-left">
                  <Users className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-bold text-[#111827] mb-2.5">
                  Alumni Network
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Connect with thousands of St. Cecilia's graduates across all generations and industries.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Exclusive Events */}
            <motion.div
              whileHover={{ y: -4, backgroundColor: '#F9FAFB' }}
              transition={{ duration: 0.2 }}
              className="p-8 sm:p-10 flex flex-col justify-between transition-colors border-t md:border-t-0 group cursor-default"
            >
              <div>
                <div className="mb-6 text-[#991B1B] group-hover:scale-110 transition-transform origin-left">
                  <Calendar className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-bold text-[#111827] mb-2.5">
                  Exclusive Events
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Access members-only reunions, homecomings, and career networking gatherings.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Career Board */}
            <motion.div
              whileHover={{ y: -4, backgroundColor: '#F9FAFB' }}
              transition={{ duration: 0.2 }}
              className="p-8 sm:p-10 flex flex-col justify-between transition-colors border-t lg:border-t-0 group cursor-default"
            >
              <div>
                <div className="mb-6 text-[#991B1B] group-hover:scale-110 transition-transform origin-left">
                  <Briefcase className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-bold text-[#111827] mb-2.5">
                  Career Board
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Discover and share career opportunities within the St. Cecilia's community.
                </p>
              </div>
            </motion.div>

            {/* Card 4: Announcements */}
            <motion.div
              whileHover={{ y: -4, backgroundColor: '#F9FAFB' }}
              transition={{ duration: 0.2 }}
              className="p-8 sm:p-10 flex flex-col justify-between transition-colors border-t border-[#E5E7EB] group cursor-default"
            >
              <div>
                <div className="mb-6 text-[#991B1B] group-hover:scale-110 transition-transform origin-left">
                  <Megaphone className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-bold text-[#111827] mb-2.5">
                  Announcements
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Stay informed with important institutional news and community announcements.
                </p>
              </div>
            </motion.div>

            {/* Card 5: Batch Chapters */}
            <motion.div
              whileHover={{ y: -4, backgroundColor: '#F9FAFB' }}
              transition={{ duration: 0.2 }}
              className="p-8 sm:p-10 flex flex-col justify-between transition-colors border-t border-[#E5E7EB] group cursor-default"
            >
              <div>
                <div className="mb-6 text-[#991B1B] group-hover:scale-110 transition-transform origin-left">
                  <GraduationCap className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-bold text-[#111827] mb-2.5">
                  Batch Chapters
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Stay connected with your batch and program through dedicated chapter groups.
                </p>
              </div>
            </motion.div>

            {/* Card 6: Career Milestones */}
            <motion.div
              whileHover={{ y: -4, backgroundColor: '#F9FAFB' }}
              transition={{ duration: 0.2 }}
              className="p-8 sm:p-10 flex flex-col justify-between transition-colors border-t border-[#E5E7EB] group cursor-default"
            >
              <div>
                <div className="mb-6 text-[#991B1B] group-hover:scale-110 transition-transform origin-left">
                  <Trophy className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-bold text-[#111827] mb-2.5">
                  Career Milestones
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Celebrate achievements and share your professional journey with the community.
                </p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ========================================================
          CALL TO ACTION FOOTER BANNER
          ======================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="py-20 bg-[#111827] text-white relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-12 h-12 rounded-sm bg-[#991B1B] mx-auto flex items-center justify-center text-white mb-6 shadow-md shadow-red-950/40 ring-4 ring-[#991B1B]/20"
          >
            <GraduationCap className="w-6 h-6" />
          </motion.div>
          <h2 className="font-display text-4xl sm:text-5xl font-normal text-white mb-4">
            Carry the Cecilian Spirit Forward
          </h2>
          <p className="text-stone-300 text-sm max-w-xl mx-auto mb-8 font-light leading-relaxed">
            Rejoin the alumni directory, connect with fellow graduates worldwide, and contribute to St. Cecilia's continuing heritage of excellence.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: '#7f1616' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateToAuth('register')}
              className="bg-[#991B1B] text-white px-8 py-3.5 rounded-xs font-semibold text-xs tracking-[0.18em] uppercase shadow-lg transition-colors cursor-pointer"
            >
              REGISTER ACCOUNT
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateToAuth('login')}
              className="bg-transparent text-white border border-white/30 hover:border-white px-8 py-3.5 rounded-xs font-semibold text-xs tracking-[0.18em] uppercase transition-colors cursor-pointer"
            >
              SIGN IN
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ========================================================
          INSTITUTIONAL FOOTER
          ======================================================== */}
      <footer className="bg-[#FFFFFF] border-t border-[#E5E7EB] py-12 text-[#6B7280] text-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start">
              <span className="font-display tracking-[0.35em] text-[#991B1B] text-lg font-normal">
                ALUMNI
              </span>
              <span className="text-[9px] tracking-[0.25em] text-[#991B1B] font-semibold uppercase -mt-0.5">
                ST. CECILIA'S
              </span>
              <p className="text-[11px] text-[#6B7280] mt-2">
                Official Institutional Alumni Network & Directory
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-[#6B7280]">
              <Link001
                onClick={() => setShowGalleryModal(true)}
                className="hover:text-[#111827] cursor-pointer"
              >
                Campus Gallery
              </Link001>
              <span>•</span>
              <Link002
                onClick={() => onNavigateToAuth('register', 'alumni')}
                className="hover:text-[#991B1B] cursor-pointer"
              >
                Alumni Registration
              </Link002>
              <span>•</span>
              <Link003
                onClick={() => onNavigateToAuth('register', 'employer')}
                className="hover:text-[#991B1B] font-medium cursor-pointer"
              >
                Employer Registration
              </Link003>
              <span>•</span>
              <Link004
                onClick={() => onNavigateToAuth('login')}
                className="hover:text-[#111827] cursor-pointer"
              >
                Sign In
              </Link004>
              <span>•</span>
              <Link005
                href="#features"
                className="hover:text-[#111827] cursor-pointer"
              >
                Community Guidelines
              </Link005>
            </div>

            <div className="text-[11px] text-stone-400">
              © {new Date().getFullYear()} St. Cecilia's College. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================
          CAMPUS & HERITAGE GALLERY MODAL (Supports Admin & Registrar Upload)
          ======================================================== */}
      <CampusGalleryModal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
      />

    </div>
  );
};
