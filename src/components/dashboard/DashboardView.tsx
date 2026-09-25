import React, { useState, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  BookOpen,
  MapPin,
  Briefcase,
  UserCheck,
  Check,
  X,
  ArrowRight,
  MessageSquare,
  Megaphone,
  Compass,
  Building2,
  Clock,
  Heart,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Award,
  SlidersHorizontal,
  Bell,
  GraduationCap
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { filterAnnouncementsForUser, calculateProfileCompletion } from '../../services/automationService';
import { RecentActivityFeed } from './RecentActivityFeed';
import { DashboardWidget } from './DashboardWidget';
import { HelpAndInfoSection } from './HelpAndInfoSection';
import { InstitutionalSocialFeed } from './InstitutionalSocialFeed';
import { CollegiateGreetingBanner } from './CollegiateGreetingBanner';
import { GooeyBackground } from '../common/GooeyBackground';
import {
  Link001,
  Link002,
  Link003,
  Link004,
  Link005
} from '../ui/skiper-ui/skiper40';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

interface DashboardErrorBoundaryProps {
  children: ReactNode;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class DashboardErrorBoundary extends React.Component<DashboardErrorBoundaryProps, DashboardErrorBoundaryState> {
  public state: DashboardErrorBoundaryState = { hasError: false };

  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): DashboardErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard recovered from runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-white rounded-2xl border border-stone-200/90 shadow-sm text-center max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#8B181B] flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h3 className="text-base font-bold text-stone-900 tracking-tight">
            Dashboard Display Refresh
          </h3>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            A temporary viewport rendering adjustment occurred. You can restore your full alumni overview immediately.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const DashboardView: React.FC = () => {
  return (
    <DashboardErrorBoundary>
      <DashboardViewContent />
    </DashboardErrorBoundary>
  );
};

const DashboardViewContent: React.FC = () => {
  const {
    currentUser,
    users,
    events,
    announcements,
    feedPosts,
    friendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    opportunities,
    chapters,
    setActiveTab,
    getOrCreateChat,
    sendFriendRequest,
    isConnected,
    hasPendingRequestWith,
    setSelectedUserIdForModal,
    unreadNotificationsCount,
    permissions
  } = useAlumni();

  React.useEffect(() => {
    const handleRefresh = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('applet:refresh-home', handleRefresh);
    return () => window.removeEventListener('applet:refresh-home', handleRefresh);
  }, []);

  const [announcementFilter, setAnnouncementFilter] = useState<'all' | 'personalized' | 'urgent'>('all');
  const [selectedAnnouncementForModal, setSelectedAnnouncementForModal] = useState<any | null>(null);

  // Personalized announcement feed using automation service algorithm
  const personalizedAnnouncements = useMemo(() => {
    return filterAnnouncementsForUser(announcements, currentUser);
  }, [announcements, currentUser]);

  const displayedAnnouncements = useMemo(() => {
    if (announcementFilter === 'personalized') {
      const matchOnly = personalizedAnnouncements.filter((a) => a.isPersonalized);
      return matchOnly.length > 0 ? matchOnly : personalizedAnnouncements;
    }
    if (announcementFilter === 'urgent') {
      return personalizedAnnouncements.filter((a) => a.urgent || a.important);
    }
    return personalizedAnnouncements;
  }, [personalizedAnnouncements, announcementFilter]);

  // Profile completion status
  const profileCompletion = useMemo(() => {
    if (!currentUser) return { percentage: 100, missingFields: [], isComplete: true };
    return calculateProfileCompletion(currentUser);
  }, [currentUser]);

  // Pending friend requests directed to current user
  const incomingRequests = (friendRequests || [])
    .filter((r) => r && r.toUid === currentUser?.uid && r.status === 'pending')
    .map((r) => {
      const sender = (users || []).find((u) => u && u.uid === r.fromUid);
      return { request: r, sender };
    })
    .filter((item) => Boolean(item.sender));

  // Live stats calculation
  const totalMembers = (users || []).length;
  const upcomingEventsCount = (events || []).filter((e) => {
    if (!e || !e.startDate) return false;
    const d = new Date(e.startDate);
    return !isNaN(d.getTime()) && d >= new Date();
  }).length;
  // Unique courses count
  const activeCoursesCount = Array.from(new Set((users || []).map((u) => u?.course).filter(Boolean))).length;
  const chaptersCount = (chapters || []).length;

  // Progressive See More for local Cecilians in vicinity
  const [visibleLocalAlumniCount, setVisibleLocalAlumniCount] = useState<number>(4);

  // Alumni near you: filter other users whose location matches or is in the same city/region
  const alumniNearYou = React.useMemo(() => {
    const allUsers = users || [];
    if (!currentUser) return allUsers.filter((u) => u && u.role === 'alumni');
    // Find users with matching location first, then others
    const userCity = currentUser?.location ? String(currentUser.location).split(',')[0].trim().toLowerCase() : '';
    const matches = userCity
      ? allUsers.filter(
          (u) =>
            u &&
            u.uid !== currentUser.uid &&
            u.role === 'alumni' &&
            String(u.location || '').toLowerCase().includes(userCity)
        )
      : [];
    const others = allUsers.filter(
      (u) =>
        u &&
        u.uid !== currentUser.uid &&
        u.role === 'alumni' &&
        (!userCity || !String(u.location || '').toLowerCase().includes(userCity))
    );
    return [...matches, ...others];
  }, [currentUser, users]);

  // Upcoming events with robust chronological sorting and fallback
  const upcomingEvents = useMemo(() => {
    const all = events || [];
    const future = all
      .filter((e) => {
        if (!e || !e.startDate) return false;
        const d = new Date(e.startDate);
        return !isNaN(d.getTime()) && d >= new Date();
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    if (future.length > 0) return future.slice(0, 3);
    return all.slice(0, 3);
  }, [events]);

  // Curated opportunities
  const curatedOpportunities = useMemo(() => {
    return (opportunities || []).slice(0, 3);
  }, [opportunities]);

  return (
    <motion.div
      className="w-full max-w-full overflow-x-hidden space-y-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Redesigned Collegiate Greeting & Institutional Almanac Banner */}
      <motion.div variants={cardItemVariants} className="w-full max-w-full overflow-x-hidden">
        <CollegiateGreetingBanner onOpenDigitalCard={() => setActiveTab('profile')} />
      </motion.div>

      {/* Precision Collegiate Routing: Cecilian Express Directives */}
      <motion.div
        variants={cardItemVariants}
        className="w-full max-w-full overflow-x-hidden bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] relative"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#8B181B] via-[#B45309] to-stone-200 absolute top-0 left-0 right-0" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 mb-3.5 border-b border-stone-100 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#8B181B] border border-red-200/60 flex items-center justify-center shrink-0 shadow-2xs">
              <Compass className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-stone-900 uppercase break-words">
                  Cecilian Express Directives
                </h3>
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B181B] animate-pulse" />
              </div>
              <p className="text-[10px] sm:text-[11px] md:text-xs text-stone-500 font-medium break-words leading-relaxed">
                Rapid Institutional Routing • Official St. Cecilia's Alumni Gateway
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-50 text-stone-700 border border-stone-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Directives Cycle 2026
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Directive 01: Alumni Directory */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
            onClick={() => setActiveTab('network')}
            className="group relative p-3 sm:p-3.5 rounded-xl border border-stone-200/80 bg-[#FAF9F6] hover:bg-white hover:border-[#8B181B]/50 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(139,24,27,0.08)] transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-stone-200/80 text-[#8B181B] group-hover:bg-[#8B181B] group-hover:text-white transition-colors flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-3.5 h-3.5 stroke-[1.75]" />
              </div>
              <span className="text-[11px] font-bold text-stone-400 group-hover:text-[#8B181B] transition-colors">
                01
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-[13px] font-bold text-stone-900 group-hover:text-[#8B181B] transition-colors">
                <Link001
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    setActiveTab('network');
                  }}
                  className="hover:text-[#8B181B]"
                >
                  Alumni Directory
                </Link001>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 line-clamp-1">
                Verified batch members & chapters
              </p>
            </div>
          </motion.div>

          {/* Directive 02: Campus Events */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
            onClick={() => setActiveTab('events')}
            className="group relative p-3 sm:p-3.5 rounded-xl border border-stone-200/80 bg-[#FAF9F6] hover:bg-white hover:border-[#8B181B]/50 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(139,24,27,0.08)] transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-stone-200/80 text-[#8B181B] group-hover:bg-[#8B181B] group-hover:text-white transition-colors flex items-center justify-center shrink-0 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 stroke-[1.75]" />
              </div>
              <span className="text-[11px] font-bold text-stone-400 group-hover:text-[#8B181B] transition-colors">
                02
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-[13px] font-bold text-stone-900 group-hover:text-[#8B181B] transition-colors">
                <Link002
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    setActiveTab('events');
                  }}
                  className="hover:text-[#8B181B]"
                >
                  Campus Events
                </Link002>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 line-clamp-1">
                Reunions, galas & webinars
              </p>
            </div>
          </motion.div>

          {/* Directive 03: Career Opportunities */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
            onClick={() => setActiveTab('opportunities')}
            className="group relative p-3 sm:p-3.5 rounded-xl border border-stone-200/80 bg-[#FAF9F6] hover:bg-white hover:border-[#8B181B]/50 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(139,24,27,0.08)] transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-stone-200/80 text-[#8B181B] group-hover:bg-[#8B181B] group-hover:text-white transition-colors flex items-center justify-center shrink-0 shadow-2xs">
                <Briefcase className="w-3.5 h-3.5 stroke-[1.75]" />
              </div>
              <span className="text-[11px] font-bold text-stone-400 group-hover:text-[#8B181B] transition-colors">
                03
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-[13px] font-bold text-stone-900 group-hover:text-[#8B181B] transition-colors">
                <Link003
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    setActiveTab('opportunities');
                  }}
                  className="hover:text-[#8B181B]"
                >
                  Career Board
                </Link003>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 line-clamp-1">
                Curated jobs & partner roles
              </p>
            </div>
          </motion.div>

          {/* Directive 04: Official Announcements */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
            onClick={() => setActiveTab('announcements')}
            className="group relative p-3 sm:p-3.5 rounded-xl border border-stone-200/80 bg-[#FAF9F6] hover:bg-white hover:border-[#8B181B]/50 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(139,24,27,0.08)] transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-stone-200/80 text-[#8B181B] group-hover:bg-[#8B181B] group-hover:text-white transition-colors flex items-center justify-center shrink-0 shadow-2xs">
                <Megaphone className="w-3.5 h-3.5 stroke-[1.75]" />
              </div>
              <span className="text-[11px] font-bold text-stone-400 group-hover:text-[#8B181B] transition-colors">
                04
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-[13px] font-bold text-stone-900 group-hover:text-[#8B181B] transition-colors">
                <Link004
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    setActiveTab('announcements');
                  }}
                  className="hover:text-[#8B181B]"
                >
                  Bulletins & News
                </Link004>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 line-clamp-1">
                Institutional notices & releases
              </p>
            </div>
          </motion.div>

          {/* Directive 05: Direct Peer Messaging */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
            onClick={() => setActiveTab('messages')}
            className="col-span-2 sm:col-span-1 group relative p-3 sm:p-3.5 rounded-xl border border-stone-200/80 bg-[#FAF9F6] hover:bg-white hover:border-[#8B181B]/50 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(139,24,27,0.08)] transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-stone-200/80 text-[#8B181B] group-hover:bg-[#8B181B] group-hover:text-white transition-colors flex items-center justify-center shrink-0 shadow-2xs">
                <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
              </div>
              <span className="text-[11px] font-bold text-stone-400 group-hover:text-[#8B181B] transition-colors">
                05
              </span>
            </div>
            <div>
              <div className="text-xs sm:text-[13px] font-bold text-stone-900 group-hover:text-[#8B181B] transition-colors">
                <Link005
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    setActiveTab('messages');
                  }}
                  className="hover:text-[#8B181B]"
                >
                  Peer Messaging
                </Link005>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 line-clamp-1">
                Encrypted graduate communication
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Social Posts Feed: Displayed for alumni, and for admins strictly showing posts from alumni */}
      {(currentUser?.role === 'alumni' || (feedPosts && feedPosts.some((p) => p.authorRole === 'alumni'))) && (
        <motion.div variants={cardItemVariants} className="w-full max-w-full overflow-x-hidden">
          <InstitutionalSocialFeed />
        </motion.div>
      )}

      {/* Live Institutional Census & Reach Bento Strip - Harmonized Collegiate Palette */}
      <motion.div variants={cardItemVariants} className="w-full max-w-full overflow-x-hidden grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Members - Flagship Institutional Card (Redesigned with Collegiate Precision) */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          onClick={() => setActiveTab('network')}
          className="group relative w-full min-w-0 bg-gradient-to-br from-[#FAF9F6] via-white to-stone-50/60 p-4 sm:p-5 pt-4 pb-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(139,24,27,0.09)] hover:border-[#8B181B]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle Institutional Crimson Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B181B] via-[#B45309] to-stone-300 opacity-90 group-hover:opacity-100 transition-opacity" />

          <div>
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider truncate">
                  Verified Cecilians
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-red-50 text-[#8B181B] border border-red-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#8B181B] group-hover:text-white transition-colors duration-200">
                <Users className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-none font-mono">
                {totalMembers}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Roster
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-1">
            <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">
              Graduates across rosters
            </p>
            <span className="text-[10px] font-semibold text-[#8B181B] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
              <span>View</span>
              <ChevronRight className="w-3 h-3 stroke-[2]" />
            </span>
          </div>
        </motion.div>

        {/* Card 2: Campus Convocations */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          onClick={() => setActiveTab('events')}
          className="w-full min-w-0 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(180,83,9,0.08)] hover:border-amber-400/60 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider truncate">
                Campus Convocations
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                <Calendar className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-none">
                {upcomingEventsCount}
              </span>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-full">
                Scheduled
              </span>
            </div>
          </div>
          <p className="text-[11px] text-stone-500 mt-2 line-clamp-1">
            Homecoming galas, reunions & lectures
          </p>
        </motion.div>

        {/* Card 3: Academic Disciplines */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          className="w-full min-w-0 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(4,120,87,0.08)] hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider truncate">
                Degree Disciplines
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/70 flex items-center justify-center shrink-0 shadow-2xs">
                <BookOpen className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-none">
                {activeCoursesCount}
              </span>
              <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                Programs
              </span>
            </div>
          </div>
          <p className="text-[11px] text-stone-500 mt-2 line-clamp-1">
            IT, Criminology, Education, Business
          </p>
        </motion.div>

        {/* Card 4: Global Chapters */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          onClick={() => setActiveTab('network')}
          className="w-full min-w-0 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(71,85,105,0.08)] hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider truncate">
                Regional Chapters
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <Compass className="w-4 h-4 stroke-[1.75]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-none">
                {chaptersCount}
              </span>
              <span className="text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                Active Hubs
              </span>
            </div>
          </div>
          <p className="text-[11px] text-stone-500 mt-2 line-clamp-1">
            Cebu, Manila & international networks
          </p>
        </motion.div>
      </motion.div>

      {/* Actionable Bento Tier: Connection Inquiries & Accreditation Tracer */}
      {(incomingRequests.length > 0 || (currentUser && profileCompletion.percentage < 80)) && (
        <motion.div variants={cardItemVariants} className="w-full max-w-full overflow-x-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Connection Requests Bento Card */}
          {incomingRequests.length > 0 && (
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
              className={`w-full min-w-0 ${currentUser && profileCompletion.percentage < 80 ? 'lg:col-span-6' : 'lg:col-span-12'} bg-white border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col justify-between relative overflow-hidden transition-shadow duration-200`}
            >
              <div className="h-1 bg-amber-500 absolute top-0 left-0 right-0" />
              <div>
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-stone-100 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm md:text-base font-bold text-stone-900 tracking-tight break-words">
                        Peer Connection Inquiries
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-stone-500 break-words leading-normal">
                        {incomingRequests.length} fellow {incomingRequests.length === 1 ? 'graduate is' : 'graduates are'} requesting to link with your profile
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('network')}
                    className="text-xs text-[#8B181B] hover:text-[#721316] font-semibold flex items-center gap-0.5 cursor-pointer shrink-0"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {incomingRequests.slice(0, 3).map(({ request, sender }) => (
                    <div
                      key={request.id}
                      className="p-3 bg-stone-50/70 hover:bg-stone-50/90 rounded-xl border border-stone-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer min-w-0"
                        onClick={() => sender && setSelectedUserIdForModal(sender.uid)}
                      >
                        <img
                          src={sender?.profilePictureUrl || '/assets/st-cecilias-college-seal.jpg'}
                          alt={sender?.name || 'Alumnus'}
                          onError={(e) => {
                            e.currentTarget.src = '/assets/st-cecilias-college-seal.jpg';
                          }}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-2xs shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate hover:text-[#8B181B]">
                            {sender?.name}
                          </h4>
                          <p className="text-[10px] sm:text-[11px] text-stone-500 truncate">
                            Batch {sender?.batch || 'Alumni'} · {sender?.course || 'Graduate'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => acceptFriendRequest(request.id)}
                          className="px-3 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => declineFriendRequest(request.id)}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Profile Completion / Institutional Accreditation Card */}
          {currentUser && profileCompletion.percentage < 80 && (
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
              className={`w-full min-w-0 ${incomingRequests.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12'} bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col justify-between relative overflow-hidden transition-shadow duration-200`}
            >
              <div className="h-1 bg-amber-600 absolute top-0 left-0 right-0" />
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-amber-100/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <GraduationCap className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm md:text-base font-bold text-amber-950 tracking-tight break-words">
                        Institutional Career Tracer Study
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-amber-800 break-words">
                        Commission on Higher Education & Alumni Tracking
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md shrink-0">
                    {profileCompletion.percentage}% Completed
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed break-words">
                    Help St. Cecilia's College maintain CHED and PACUCOA institutional accreditation by updating your current professional trajectory.
                  </p>

                  <div className="w-full bg-stone-200/80 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className="bg-[#8B181B] h-full rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletion.percentage}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500">
                    <span className="truncate">
                      Pending: <span className="font-semibold text-stone-700">{profileCompletion.missingFields.slice(0, 2).join(', ')}</span>
                    </span>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="font-semibold text-[#8B181B] hover:text-[#721316] flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                    >
                      <span>Complete Record</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Alumni Engagement & Growth Metrics Widget */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
        className="w-full max-w-full overflow-x-hidden rounded-2xl transition-shadow duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)]"
      >
        <DashboardWidget
          users={users}
          events={events}
          friendRequestsCount={friendRequests.length}
          currentUser={currentUser}
        />
      </motion.div>

      {/* Main Collegiate Bento Grid Showcase (Desktop only: Official Circulars, Campus Gatherings, Curated Careers, Nearby Cecilians; hidden on mobile and tablet) */}
      <motion.div variants={cardItemVariants} className="hidden lg:grid w-full max-w-full overflow-x-hidden grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6">
        
        {/* Bento Tile 1 (col-span-1 lg:col-span-8): Announcements & Department Advisories */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          className="w-full max-w-full overflow-x-hidden col-span-1 lg:col-span-8 bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col justify-between relative transition-shadow duration-200 overflow-hidden"
        >
          <GooeyBackground variant="crimson" intensity="subtle" />
          <div className="relative z-10 w-full min-w-0">
            {/* Header with Title & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#8B181B] border border-red-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <Megaphone className="w-4.5 h-4.5 stroke-[1.75]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 tracking-tight break-words">
                    Official Circulars & Department Bulletins
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 leading-snug mt-0.5 break-words">
                    Institutional notices targeted to your academic department and cohort
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl shrink-0 self-start sm:self-center overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => setAnnouncementFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    announcementFilter === 'all'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>All ({announcements.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnnouncementFilter('personalized')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    announcementFilter === 'personalized'
                      ? 'bg-white text-[#8B181B] shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <UserCheck className="w-3 h-3" />
                  <span>Cohort</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnnouncementFilter('urgent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    announcementFilter === 'urgent'
                      ? 'bg-white text-red-600 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>Urgent</span>
                </button>
              </div>
            </div>

            {/* Announcement Items inside Bento */}
            <div className="mt-4">
              {displayedAnnouncements.length === 0 ? (
                <div className="py-10 text-center bg-stone-50/70 rounded-xl border border-dashed border-stone-200 px-4">
                  <Bell className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-stone-700">No circulars matching this filter</p>
                  <p className="text-[11px] text-stone-500 mt-1 max-w-sm mx-auto">
                    Switch to general campus advisories to browse all active institutional announcements.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAnnouncementFilter('all')}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 bg-[#8B181B] hover:bg-[#721316] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs min-h-[38px]"
                  >
                    <span>View All Campus Bulletins</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {displayedAnnouncements.slice(0, 4).map((ann: any) => {
                    const isUrgent = ann.urgent || ann.important;
                    const hasPersonalMatch = ann.isPersonalized && ann.matchReasons && ann.matchReasons.length > 0;

                    return (
                      <div
                        key={ann.id}
                        onClick={() => setSelectedAnnouncementForModal(ann)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-sm group min-w-0 ${
                          isUrgent
                            ? 'bg-red-50/30 border-red-200/80 hover:border-red-300'
                            : hasPersonalMatch
                            ? 'bg-amber-50/20 border-amber-200/70 hover:border-amber-300'
                            : 'bg-stone-50/50 border-stone-200/80 hover:border-stone-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 truncate">
                              {ann.category || 'Institutional'}
                            </span>
                            {isUrgent && (
                              <span className="text-[10px] font-extrabold text-red-700 bg-red-100/80 px-1.5 py-0.5 rounded shrink-0">
                                URGENT
                              </span>
                            )}
                            {hasPersonalMatch && !isUrgent && (
                              <span className="text-[10px] font-semibold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                                <GraduationCap className="w-2.5 h-2.5 text-amber-700" />
                                Batch Notice
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-[#8B181B] transition-colors break-words">
                            {ann.title}
                          </h4>
                          <p className="text-[10px] sm:text-[11px] md:text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed break-words">
                            {ann.content}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500">
                          <span className="truncate pr-2">{ann.authorName || 'Alumni Affairs'}</span>
                          <span className="font-semibold text-[#8B181B] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
                            <span>Read</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-stone-500">
            <span className="text-[11px] sm:text-xs">Showing {Math.min(4, displayedAnnouncements.length)} of {announcements.length} releases</span>
            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className="font-semibold text-[#8B181B] hover:text-[#721316] flex items-center gap-1 cursor-pointer py-1 min-h-[38px]"
            >
              <span>View Full Bulletin Board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Bento Tile 2 (col-span-1 lg:col-span-4): Upcoming Events & Gatherings */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          className="w-full max-w-full overflow-x-hidden col-span-1 lg:col-span-4 bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col justify-between transition-shadow duration-200 relative overflow-hidden"
        >
          <GooeyBackground variant="amber" intensity="subtle" />
          <div className="relative z-10 w-full min-w-0">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                  <Calendar className="w-4.5 h-4.5 stroke-[1.75]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 tracking-tight break-words">
                    Campus Gatherings
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 leading-snug mt-0.5 break-words">
                    Reunions, galas & webinars
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className="text-xs text-[#8B181B] hover:text-[#721316] font-semibold flex items-center gap-1 cursor-pointer shrink-0 py-1.5 px-2.5 bg-amber-50/60 hover:bg-amber-100/60 rounded-lg transition-colors"
              >
                <span>Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
              {upcomingEvents.length === 0 ? (
                <div className="col-span-full py-8 text-center bg-stone-50/70 rounded-xl border border-dashed border-stone-200 px-3">
                  <Calendar className="w-7 h-7 text-stone-300 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-stone-700">No upcoming events scheduled</p>
                  <p className="text-[11px] text-stone-500 mt-1">Check back soon or explore past campus reunions.</p>
                </div>
              ) : (
                upcomingEvents.map((evt) => {
                  const eventDate = new Date(evt.startDate);
                  const isValidDate = !isNaN(eventDate.getTime());
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setActiveTab('events')}
                      className="p-3.5 rounded-xl border border-stone-200/80 hover:border-amber-300 hover:bg-amber-50/20 transition-all cursor-pointer flex items-start gap-3 group min-w-0"
                    >
                      {/* Architectural Date Placard */}
                      <div className="w-11 h-12 rounded-lg bg-stone-50 border border-stone-200/80 flex flex-col items-center justify-center shrink-0 text-center group-hover:bg-[#8B181B] group-hover:border-[#8B181B] transition-colors">
                        <span className="text-[9px] uppercase font-bold text-stone-500 group-hover:text-red-100">
                          {isValidDate ? eventDate.toLocaleString('default', { month: 'short' }) : 'EVT'}
                        </span>
                        <span className="text-base font-bold text-stone-900 group-hover:text-white leading-none">
                          {isValidDate ? eventDate.getDate() : '--'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mb-0.5">
                          <span className="font-semibold text-[#8B181B]">{evt.isVirtual ? 'Virtual' : 'In-Person'}</span>
                          <span>·</span>
                          <span>{evt.attendeesCount} RSVPed</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1 sm:line-clamp-2 group-hover:text-[#8B181B] transition-colors leading-snug break-words">
                          {evt.title}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-stone-500 truncate mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className="w-full py-2.5 min-h-[44px] bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/80 rounded-xl text-xs font-semibold transition-colors text-center cursor-pointer flex items-center justify-center"
            >
              Browse Event Calendar & RSVP
            </button>
          </div>
        </motion.div>

        {/* Bento Tile 3 (col-span-1 lg:col-span-6): Curated Career Opportunities */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          className="w-full max-w-full overflow-x-hidden col-span-1 lg:col-span-6 bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col justify-between transition-shadow duration-200 relative overflow-hidden"
        >
          <GooeyBackground variant="emerald" intensity="subtle" />
          <div className="relative z-10 w-full min-w-0">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <Briefcase className="w-4.5 h-4.5 stroke-[1.75]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 tracking-tight break-words">
                    Curated Career Placements
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 leading-snug mt-0.5 break-words">
                    Corporate partnerships & alumni-backed openings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('opportunities')}
                className="text-xs text-[#8B181B] hover:text-[#721316] font-semibold flex items-center gap-1 cursor-pointer shrink-0 py-1.5 px-2.5 bg-blue-50/60 hover:bg-blue-100/60 rounded-lg transition-colors"
              >
                <span>Job Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
              {curatedOpportunities.length === 0 ? (
                <div className="col-span-full py-8 text-center bg-stone-50/70 rounded-xl border border-dashed border-stone-200 px-3">
                  <Briefcase className="w-7 h-7 text-stone-300 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-stone-700">No open partner positions</p>
                  <p className="text-[11px] text-stone-500 mt-1">Check back soon or submit a career opening for fellow alumni.</p>
                </div>
              ) : (
                curatedOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => setActiveTab('opportunities')}
                    className="p-3.5 rounded-xl border border-stone-200/80 hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer flex items-start gap-3.5 group min-w-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 border border-stone-200/70 flex items-center justify-center shrink-0 group-hover:bg-[#8B181B] group-hover:text-white transition-colors">
                      <Building2 className="w-5 h-5 stroke-[1.75]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#8B181B] transition-colors leading-snug line-clamp-1 sm:line-clamp-2 break-words">
                          {opp.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                          {opp.type}
                        </span>
                      </div>

                      <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1 truncate">
                        {opp.company} · <span>{opp.location}</span>
                      </p>

                      {opp.salaryOrStipend && (
                        <div className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold mt-1">
                          {opp.salaryOrStipend}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setActiveTab('opportunities')}
              className="w-full py-2.5 min-h-[44px] bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/80 rounded-xl text-xs font-semibold transition-colors text-center cursor-pointer flex items-center justify-center"
            >
              Post or Apply for Opportunities
            </button>
          </div>
        </motion.div>

        {/* Bento Tile 4 (col-span-1 lg:col-span-6): Cecilians in Your Vicinity */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          className="w-full max-w-full overflow-x-hidden col-span-1 lg:col-span-6 bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col justify-between transition-shadow duration-200 relative overflow-hidden"
        >
          <GooeyBackground variant="multi" intensity="subtle" />
          <div className="relative z-10 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <MapPin className="w-4.5 h-4.5 stroke-[1.75]" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 tracking-tight break-words">
                      Cecilians in Your Vicinity
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md inline-block max-w-[220px] truncate">
                      {currentUser?.location || 'Cebu Province'}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-500 leading-snug mt-0.5 break-words">
                    Graduates living or working across your regional chapter
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('network')}
                className="text-xs text-[#8B181B] hover:text-[#721316] font-semibold flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-center py-1.5 px-3 bg-red-50/60 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span>Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4">
              {alumniNearYou.length === 0 ? (
                <div className="py-8 text-center bg-stone-50/70 rounded-xl border border-dashed border-stone-200 px-3">
                  <Users className="w-7 h-7 text-stone-300 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-stone-700">No alumni in this immediate radius</p>
                  <p className="text-[11px] text-stone-500 mt-1">Explore all verified Cecilians across regional chapters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {alumniNearYou.slice(0, visibleLocalAlumniCount).map((alumnus) => {
                    const connected = isConnected(alumnus.uid);
                    const reqStatus = hasPendingRequestWith(alumnus.uid);

                    return (
                      <div
                        key={alumnus.uid}
                        className="p-3.5 bg-stone-50/70 hover:bg-stone-50 rounded-xl border border-stone-200/80 transition-all flex flex-col justify-between shadow-2xs min-w-0"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <img
                              src={alumnus.profilePictureUrl || '/assets/st-cecilias-college-seal.jpg'}
                              alt={alumnus.name}
                              onError={(e) => {
                                e.currentTarget.src = '/assets/st-cecilias-college-seal.jpg';
                              }}
                              onClick={() => setSelectedUserIdForModal(alumnus.uid)}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-2xs cursor-pointer hover:opacity-90 shrink-0"
                            />
                            <span className="text-[10px] font-bold text-stone-600 bg-white border border-stone-200/70 px-2 py-0.5 rounded shrink-0">
                              Batch {alumnus.batch || '2024'}
                            </span>
                          </div>

                          <div className="mt-2.5 min-w-0">
                            <h4
                              onClick={() => setSelectedUserIdForModal(alumnus.uid)}
                              className="font-bold text-xs sm:text-sm text-stone-900 hover:text-[#8B181B] cursor-pointer truncate"
                            >
                              {alumnus.name}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-[#8B181B] font-medium truncate">
                              {alumnus.course || 'Cecilian Graduate'}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-stone-500 truncate mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                              <span className="truncate">{alumnus.location || 'Cebu'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-stone-200/60">
                          {connected ? (
                            <button
                              type="button"
                              onClick={() => {
                                getOrCreateChat(alumnus.uid);
                                setActiveTab('messages');
                              }}
                              className="w-full py-2 min-h-[40px] text-xs font-semibold text-[#8B181B] bg-red-50 hover:bg-red-100/80 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message</span>
                            </button>
                          ) : reqStatus === 'sent' ? (
                            <span className="block w-full py-2 min-h-[40px] text-center text-[11px] font-medium text-stone-500 bg-stone-100 rounded-lg flex items-center justify-center">
                              Request Sent
                            </span>
                          ) : reqStatus === 'received' ? (
                            <button
                              type="button"
                              onClick={() => setActiveTab('network')}
                              className="w-full py-2 min-h-[40px] text-center text-xs font-semibold text-amber-800 bg-amber-100/80 rounded-lg cursor-pointer flex items-center justify-center"
                            >
                              Respond
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => sendFriendRequest(alumnus.uid)}
                              className="w-full py-2 min-h-[40px] text-xs font-semibold text-white bg-[#8B181B] hover:bg-[#721316] rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Connect</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Progressive See More for Local Cecilians */}
            {alumniNearYou.length > visibleLocalAlumniCount && (
              <div className="mt-3.5 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleLocalAlumniCount((prev) => prev + 4)}
                  className="w-full py-2.5 min-h-[44px] bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  See More Local Cecilians (+{Math.min(4, alumniNearYou.length - visibleLocalAlumniCount)})
                </button>
              </div>
            )}
            {visibleLocalAlumniCount > 4 && alumniNearYou.length > 4 && (
              <div className="mt-1.5 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleLocalAlumniCount(4)}
                  className="text-[11px] text-stone-500 hover:text-stone-800 font-medium underline cursor-pointer py-1 min-h-[38px] inline-flex items-center"
                >
                  Show Less
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3.5 border-t border-stone-100 relative z-10">
            <button
              type="button"
              onClick={() => setActiveTab('network')}
              className="w-full py-2.5 min-h-[44px] bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/80 rounded-xl text-xs font-semibold transition-colors text-center cursor-pointer flex items-center justify-center"
            >
              Search Chapter Members Worldwide ({users.length} Total)
            </button>
          </div>
        </motion.div>

        {/* Bento Tile 5 (col-span-12): Recent Community Pulse Activity Feed */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          className="w-full max-w-full overflow-x-hidden col-span-12 rounded-2xl transition-shadow duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] relative overflow-hidden"
        >
          <GooeyBackground variant="crimson" intensity="subtle" />
          <div className="relative z-10 w-full min-w-0">
            <RecentActivityFeed onOpenAnnouncement={(ann) => setSelectedAnnouncementForModal(ann)} />
          </div>
        </motion.div>

      </motion.div>

      {/* Help and Information Section at the bottom of the User Dashboard */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
        className="w-full max-w-full overflow-x-hidden rounded-2xl transition-shadow duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)]"
      >
        <HelpAndInfoSection />
      </motion.div>

      {/* Selected Announcement Detail Modal */}
      {selectedAnnouncementForModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-stone-100 flex items-start justify-between gap-3 bg-stone-50/50">
              <div className="flex items-center gap-2 flex-wrap">
                {selectedAnnouncementForModal.urgent && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    URGENT ADVISORY
                  </span>
                )}
                {selectedAnnouncementForModal.important && !selectedAnnouncementForModal.urgent && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-600 text-white">
                    IMPORTANT
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-200 text-stone-800 uppercase">
                  {selectedAnnouncementForModal.category || 'Institutional'}
                </span>
                {selectedAnnouncementForModal.isPersonalized && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-amber-700" />
                    Targeted Cohort Bulletin
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedAnnouncementForModal(null)}
                className="p-1 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h2 className="text-lg font-bold text-stone-900 leading-snug">
                {selectedAnnouncementForModal.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-stone-500 pb-3 border-b border-stone-100">
                <span className="font-semibold text-stone-700">
                  {selectedAnnouncementForModal.authorName || 'Alumni Affairs Office'}
                </span>
                <span>•</span>
                <span>
                  {selectedAnnouncementForModal.publishedAt && !isNaN(new Date(selectedAnnouncementForModal.publishedAt).getTime())
                    ? new Date(selectedAnnouncementForModal.publishedAt).toLocaleDateString([], {
                        dateStyle: 'medium'
                      })
                    : 'Recent Release'}
                </span>
              </div>

              {selectedAnnouncementForModal.matchReasons && selectedAnnouncementForModal.matchReasons.length > 0 && (
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-900">
                  <span className="font-bold block mb-1">Why this was delivered to your feed:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAnnouncementForModal.matchReasons.map((r: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-white rounded-md font-medium text-blue-800 shadow-2xs">
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {selectedAnnouncementForModal.content}
              </p>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedAnnouncementForModal(null);
                  setActiveTab('announcements');
                }}
                className="text-xs text-[#991B1B] font-semibold hover:underline"
              >
                View in Announcement Board →
              </button>
              <button
                onClick={() => setSelectedAnnouncementForModal(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
