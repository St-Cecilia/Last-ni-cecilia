/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  MapPin,
  ShieldCheck,
  Calendar,
  ArrowUpRight,
  BookOpen,
  Building2,
  Users,
  Compass,
  FileBadge
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { QuickStatusSelector, getStatusConfig } from './QuickStatusSelector';
import { GooeyBackground } from '../common/GooeyBackground';

interface CollegiateGreetingBannerProps {
  onOpenDigitalCard?: () => void;
}

export const CollegiateGreetingBanner: React.FC<CollegiateGreetingBannerProps> = ({
  onOpenDigitalCard
}) => {
  const { currentUser, users, events, opportunities, friendRequests, setActiveTab } = useAlumni();

  // Natural time-of-day human salutation (Morning, Afternoon, Evening)
  const salutation = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Formatted human calendar date (e.g., Wednesday, September 24, 2026)
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date());
  }, []);

  // Compute live contextual metrics
  const activeEventsCount = events.filter((e) => new Date(e.startDate) >= new Date()).length;
  const activeOpportunitiesCount = opportunities.length;
  const pendingRequestsCount = friendRequests.filter(
    (r) => r.toUid === currentUser?.uid && r.status === 'pending'
  ).length;

  // Authentic human-crafted summary based on real institutional context
  const contextualNote = useMemo(() => {
    if (!currentUser) {
      return "Welcome to the official St. Cecilia's College alumni commons. Connect with fellow graduates and explore alumni community updates.";
    }

    if (currentUser.role === 'admin' || currentUser.role === 'registrar' || currentUser.role === 'superadmin') {
      return `Institutional governance session active. You have oversight over ${users.length} registered Cecilians across ${new Set(users.map((u) => u.course).filter(Boolean)).size} academic degree programs, with ${activeEventsCount} upcoming campus engagements.`;
    }

    if (currentUser.role === 'employer') {
      return `Partner portal active for ${currentUser.company || 'Partner Organization'}. Review verified student credentials, publish career openings, and coordinate recruitment drives with Cecilian talent.`;
    }

    // Default Alumni
    const batchText = currentUser.batch ? `Class of ${currentUser.batch}` : 'Cecilian Alumni';
    return `Welcome to your lifelong Cecilian gateway. You are connected with ${users.length} alumni, with ${activeEventsCount} scheduled campus events and ${activeOpportunitiesCount} verified partner career postings available.`;
  }, [currentUser, users, activeEventsCount, activeOpportunitiesCount]);

  // Determine user title or academic degree display
  const academicAffiliation = useMemo(() => {
    if (!currentUser) return 'Cecilian Community Member';
    if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
      return 'Office of Systems & Institutional Governance';
    }
    if (currentUser.role === 'registrar') {
      return 'Office of the Registrar & Academic Masterlist';
    }
    if (currentUser.role === 'employer') {
      return currentUser.company ? `Corporate Liaison · ${currentUser.company}` : 'Industry Partner Representative';
    }
    if (currentUser.course) {
      return currentUser.course;
    }
    return 'Bachelor of Science Graduate';
  }, [currentUser]);

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Alumnus';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden w-full max-w-full overflow-x-hidden rounded-2xl bg-gradient-to-br from-white via-[#FAF9F5] to-[#F5F2EA] border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.03)]"
    >
      {/* Institutional St. Cecilia Crimson Architectural Top Trim */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#8B181B] via-[#991B1B] to-[#B45309]" />

      <GooeyBackground variant="crimson" intensity="subtle" />

      <div className="relative z-10 p-4 sm:p-7 lg:p-8 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 lg:gap-8 w-full">
          {/* Main Editorial Greetings Column */}
          <div className="space-y-3 sm:space-y-3.5 max-w-3xl min-w-0 w-full">
            {/* Collegiate Institutional Kicker & Quick Status Badge Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-2.5">
              <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-2.5 gap-y-1 text-[10px] sm:text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
                <span className="text-[#8B181B] font-bold">St. Cecilia's College - Cebu, Inc.</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>Office of Alumni Relations</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-stone-400">Minglanilla Campus</span>
              </div>

              {/* Quick Status Selector with color-coded availability */}
              <QuickStatusSelector />
            </div>

              {/* Salutation with Profile Avatar & Indicator */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={
                    currentUser?.profilePictureUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser?.name || 'Alumni'}
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-white shadow-sm border border-stone-200/80"
                />
                {/* Live color-coded availability indicator dot on avatar */}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-white shadow-2xs">
                  <span
                    className={`block h-2.5 w-2.5 rounded-full ${
                      getStatusConfig(currentUser?.quickStatus).dotColor
                    }`}
                  />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl text-stone-900 font-bold tracking-tight leading-snug sm:leading-tight break-words">
                  {salutation}, <span className="text-[#8B181B] font-bold">{currentUser?.name || 'Cecilian'}</span>.
                </h1>
              </div>
            </div>

            {/* Clean Unboxed Metadata Line (No generic pill tags, no candy dots) */}
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-2.5 md:gap-x-3 gap-y-1 text-[10px] sm:text-xs md:text-sm text-stone-600 break-words">
              {currentUser?.batch && (
                <>
                  <span className="font-medium text-stone-800">
                    Class of {currentUser.batch}
                  </span>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                </>
              )}

              <span className="text-stone-700 font-medium truncate max-w-full">
                {academicAffiliation}
              </span>

              {currentUser?.location && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="inline-flex items-center gap-1 text-stone-500 truncate max-w-full">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 stroke-[1.75] shrink-0" />
                    <span className="truncate">{currentUser.location}</span>
                  </span>
                </>
              )}

              {/* Verified Institutional Registry Marker */}
              {currentUser?.isVerified && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[1.75]" />
                    Verified Cecilian Record
                  </span>
                </>
              )}
            </div>

            {/* Authentic Institutional Contextual Copy */}
            <p className="text-xs sm:text-sm md:text-[15px] text-stone-600 leading-relaxed max-w-2xl pt-0.5 break-words">
              {contextualNote}
            </p>

            {/* Direct Collegiate Utility Action Links */}
            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onOpenDigitalCard) {
                    onOpenDigitalCard();
                  } else {
                    setActiveTab('profile');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#8B181B] text-white hover:bg-[#721316] transition-colors shadow-2xs cursor-pointer active:scale-98"
              >
                <FileBadge className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Digital Alumni Pass</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.75] opacity-80" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('network')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-stone-700 border border-stone-200/90 hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-stone-500 stroke-[1.75]" />
                <span>Batch Directory</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-stone-700 border border-stone-200/90 hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-stone-500 stroke-[1.75]" />
                <span>Reunions & Events</span>
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-700 stroke-[1.75]" />
                  <span>Admin Workspace</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: St. Cecilia Institutional Almanac & Heritage Medallion */}
          <div className="hidden sm:flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-stone-200/80 pt-4 lg:pt-0 lg:pl-8 shrink-0">
            <div className="flex items-center gap-3.5 lg:flex-row-reverse text-left lg:text-right">
              {/* Embossed St. Cecilia's College Crest */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 ring-1 ring-stone-200/90 shadow-sm shrink-0">
                <img
                  src="/assets/st-cecilias-college-seal.jpg"
                  alt="St. Cecilia's College Official Seal"
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    // Fallback to alumni seal if college seal has issue
                    const target = e.currentTarget;
                    if (target.src !== window.location.origin + '/assets/cecilians-seal.jpg') {
                      target.src = '/assets/cecilians-seal.jpg';
                    }
                  }}
                />
              </div>

              <div>
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                  Collegiate Almanac
                </p>
                <p className="text-xs font-semibold text-stone-800 mt-0.5">
                  {formattedDate}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  First Term · A.Y. 2026–2027
                </p>
              </div>
            </div>

            {/* Subtle Institutional Motto Badge */}
            <div className="mt-4 pt-3 border-t border-stone-200/60 hidden lg:block text-right">
              <p className="italic text-[13px] font-medium text-stone-600">
                "Virtus, Scientia, Charitas"
              </p>
              <p className="text-[10px] text-stone-400 tracking-wider uppercase font-semibold mt-0.5">
                Motto of St. Cecilia's College
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
