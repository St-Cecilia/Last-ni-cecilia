import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  Megaphone,
  Briefcase,
  ShieldCheck,
  User as UserIcon,
  Settings as SettingsIcon,
  Building2,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAlumni } from '../../context/AlumniContext';
import { BouncyAccordion, type BouncyAccordionItem } from '../ui/skiper-ui/skiper103';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { GlassDock, type DockItem } from '../ui/glass-dock';

interface NavigationProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

// Framer Motion animation variants for mobile burger menu
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
};

const drawerVariants: Variants = {
  hidden: { y: '100%', opacity: 0.6 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 28,
      stiffness: 300,
      staggerChildren: 0.045,
      delayChildren: 0.06
    }
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const navItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -24,
    filter: 'blur(2px)'
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 22,
      stiffness: 280
    }
  }
};

export const Navigation: React.FC<NavigationProps> = ({ onOpenAuth }) => {
  const { activeTab, setActiveTab, chats, currentUser, permissions } = useAlumni();
  const [showMobileMore, setShowMobileMore] = useState(false);

  // Listen for global custom events to open mobile navigation
  useEffect(() => {
    const handleOpenMobile = () => setShowMobileMore(true);
    window.addEventListener('applet:open-mobile-menu', handleOpenMobile);
    return () => {
      window.removeEventListener('applet:open-mobile-menu', handleOpenMobile);
    };
  }, []);

  // Compute total unread messages for current user
  const totalUnreadMessages = React.useMemo(() => {
    if (!currentUser || !chats) return 0;
    return chats.reduce((acc, chat) => {
      if (!chat || !chat.unreadCount) return acc;
      return acc + (chat.unreadCount[currentUser.uid] || 0);
    }, 0);
  }, [chats, currentUser]);

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | null;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(currentUser?.role === 'employer'
      ? [{ id: 'employer_portal', label: 'Employer Dashboard', icon: Building2 }]
      : []),
    { id: 'network', label: 'My Network', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: totalUnreadMessages > 0 ? totalUnreadMessages : null },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'opportunities', label: 'Job Board', icon: Briefcase },
    ...(permissions.canAccessAdminPanel
      ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldCheck }]
      : [])
  ];

  const isDrawerActive = !['dashboard', 'network', 'events', 'opportunities'].includes(activeTab);

  // Mobile Floating Glass Dock Items: Home, My network, Events, Jobs, Menu
  const mobileDockItems: DockItem[] = [
    {
      id: 'dashboard',
      title: 'Home',
      icon: LayoutDashboard,
      isActive: activeTab === 'dashboard' && !showMobileMore,
      onClick: () => {
        setActiveTab('dashboard');
        setShowMobileMore(false);
      }
    },
    {
      id: 'network',
      title: 'My network',
      icon: Users,
      isActive: activeTab === 'network' && !showMobileMore,
      onClick: () => {
        setActiveTab('network');
        setShowMobileMore(false);
      }
    },
    {
      id: 'events',
      title: 'Events',
      icon: Calendar,
      isActive: activeTab === 'events' && !showMobileMore,
      onClick: () => {
        setActiveTab('events');
        setShowMobileMore(false);
      }
    },
    {
      id: 'opportunities',
      title: 'Jobs',
      icon: Briefcase,
      isActive: activeTab === 'opportunities' && !showMobileMore,
      onClick: () => {
        setActiveTab('opportunities');
        setShowMobileMore(false);
      }
    },
    {
      id: 'menu',
      title: 'Menu',
      icon: Menu,
      isActive: showMobileMore || isDrawerActive,
      badge: totalUnreadMessages > 0 ? (totalUnreadMessages > 9 ? '9+' : totalUnreadMessages) : null,
      onClick: () => {
        setShowMobileMore((prev) => !prev);
      }
    }
  ];

  // Complete items in the mobile burger navigation drawer
  const mobileDrawerItems = [
    {
      id: 'dashboard',
      label: 'Home & Overview',
      icon: LayoutDashboard,
      desc: 'Alumni dashboard, feed & recent updates'
    },
    {
      id: 'network',
      label: 'Alumni Network',
      icon: Users,
      desc: 'Batch directory & verified Cecilian graduates'
    },
    {
      id: 'messages',
      label: 'Direct Messaging & Chat',
      icon: MessageSquare,
      desc: 'Connect directly with batchmates & alumni',
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : null
    },
    {
      id: 'events',
      label: 'Events & Reunions',
      icon: Calendar,
      desc: 'Grand alumni homecoming & campus gatherings'
    },
    {
      id: 'announcements',
      label: 'Official Announcements',
      icon: Megaphone,
      desc: 'Campus bulletins, alerts & college news'
    },
    {
      id: 'opportunities',
      label: 'Career Job Board',
      icon: Briefcase,
      desc: 'Alumni hiring, internships & career listings'
    },
    ...(currentUser?.role === 'employer'
      ? [
          {
            id: 'employer_portal',
            label: 'Employer Recruitment Portal',
            icon: Building2,
            desc: 'Post job openings & evaluate candidates'
          }
        ]
      : []),
    ...(permissions.canAccessAdminPanel
      ? [
          {
            id: 'admin',
            label: 'Administration Console',
            icon: ShieldCheck,
            desc: 'User verification, moderation & records'
          }
        ]
      : []),
    {
      id: 'gallery',
      label: 'Campus & Heritage Gallery',
      icon: ImageIcon,
      desc: 'Campus landmarks, archival images & historical photos'
    },
    {
      id: 'profile',
      label: 'My Alumni Profile',
      icon: UserIcon,
      desc: 'Manage your degree, work & contact info'
    },
    {
      id: 'settings',
      label: 'Account & Privacy Settings',
      icon: SettingsIcon,
      desc: 'Password, notifications & directory privacy'
    }
  ];

  const handleMobileNavClick = (tabId: string) => {
    if (tabId === 'gallery') {
      window.dispatchEvent(new CustomEvent('applet:open-gallery'));
      setShowMobileMore(false);
      return;
    }
    setActiveTab(tabId);
    setShowMobileMore(false);
  };

  return (
    <>
      {/* Desktop / Tablet Navigation Bar */}
      <nav className="hidden md:block bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 py-2 sm:py-2.5">
            {/* Redesigned Collegiate Segmented Tab Strip */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 px-1 bg-stone-100/75 rounded-2xl border border-stone-200/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] shrink-0 min-w-0 max-w-full">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer select-none active:scale-[0.98] ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="desktopActiveNavBubble"
                        className="absolute inset-0 bg-[#8B181B] rounded-xl -z-10 shadow-[0_2px_8px_rgba(139,24,27,0.28)]"
                        transition={{ type: 'spring', bounce: 0.18, duration: 0.35 }}
                      />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-stone-500'}`} />
                    <span className="tracking-tight">{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold transition-colors ${
                          isActive
                            ? 'bg-white text-[#8B181B] shadow-2xs'
                            : 'bg-[#8B181B] text-white shadow-2xs'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Supplemental Institutional Action */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('applet:open-gallery'))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-[#8B181B] hover:bg-stone-50 border border-stone-200/80 shadow-2xs transition-all cursor-pointer"
                title="Open Campus Heritage Gallery"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#8B181B]" />
                <span>Campus Gallery</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Floating Glass Dock (VengeanceUI) */}
      <div className="md:hidden fixed bottom-3 inset-x-0 z-40 flex justify-center pointer-events-none px-2 sm:px-3 pb-[calc(env(safe-area-inset-bottom,0px))]">
        <div className="pointer-events-auto max-w-full">
          <GlassDock
            items={mobileDockItems}
            className="mx-auto"
            dockClassName="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/90 dark:border-stone-700/80 shadow-[0_12px_36px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] px-2 sm:px-3.5 py-1.5 rounded-2xl sm:rounded-3xl"
            showLabels={true}
          />
        </div>
      </div>

      {/* Mobile Burger Drawer with Staggered Link Entry Animation */}
      <AnimatePresence>
        {showMobileMore && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowMobileMore(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-t-3xl border-t border-stone-200 shadow-2xl p-5 max-h-[84vh] overflow-y-auto z-10 space-y-3 pb-28"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-1" />

              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-[#8B181B]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Alumni Portal Navigation</h3>
                    <p className="text-[11px] text-stone-500">St. Cecilia's College Global Alumni</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMore(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Skiper103 Bouncy Accordion Navigation Inside Burger Drawer */}
              <div className="pt-2">
                <BouncyAccordion
                  defaultOpenId="core-portals"
                  allowMultiple={false}
                  items={[
                    {
                      id: 'core-portals',
                      title: 'Core Alumni Portals',
                      subtitle: 'Home, Network directory, events & chats',
                      icon: LayoutDashboard,
                      iconBg: 'bg-red-50 text-[#8B181B]',
                      content: (
                        <div className="space-y-1 pt-1">
                          {mobileDrawerItems
                            .filter((i) => ['dashboard', 'network', 'messages', 'events', 'gallery'].includes(i.id))
                            .map((item) => {
                              const Icon = item.icon;
                              const isActive = activeTab === item.id;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => handleMobileNavClick(item.id)}
                                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left min-h-[44px] cursor-pointer group ${
                                    isActive
                                      ? 'bg-red-50 text-[#8B181B] font-bold border border-red-200 shadow-2xs'
                                      : 'hover:bg-stone-100/80 text-stone-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-[#8B181B] text-white' : 'bg-stone-200/70 text-stone-700'}`}>
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-stone-900 truncate">{item.label}</p>
                                        {item.badge !== null && item.badge !== undefined && (
                                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#8B181B] text-white">
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-stone-500 truncate">{item.desc}</p>
                                    </div>
                                  </div>
                                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#8B181B]' : 'text-stone-400'}`} />
                                </button>
                              );
                            })}
                        </div>
                      )
                    },
                    {
                      id: 'career-hub',
                      title: 'Career & Collaborative Hub',
                      subtitle: 'Job listings, announcements & opportunities',
                      icon: Briefcase,
                      iconBg: 'bg-amber-50 text-amber-700',
                      content: (
                        <div className="space-y-1 pt-1">
                          {mobileDrawerItems
                            .filter((i) => ['opportunities', 'announcements', 'employer_portal'].includes(i.id))
                            .map((item) => {
                              const Icon = item.icon;
                              const isActive = activeTab === item.id;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => handleMobileNavClick(item.id)}
                                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left min-h-[44px] cursor-pointer group ${
                                    isActive
                                      ? 'bg-red-50 text-[#8B181B] font-bold border border-red-200 shadow-2xs'
                                      : 'hover:bg-stone-100/80 text-stone-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-[#8B181B] text-white' : 'bg-stone-200/70 text-stone-700'}`}>
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-stone-900 truncate">{item.label}</p>
                                      <p className="text-[10px] text-stone-500 truncate">{item.desc}</p>
                                    </div>
                                  </div>
                                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#8B181B]' : 'text-stone-400'}`} />
                                </button>
                              );
                            })}
                        </div>
                      )
                    },
                    {
                      id: 'institutional',
                      title: 'Institutional & Settings',
                      subtitle: 'Administration, account privacy & settings',
                      icon: ShieldCheck,
                      iconBg: 'bg-stone-100 text-stone-800',
                      content: (
                        <div className="space-y-1 pt-1">
                          {mobileDrawerItems
                            .filter((i) => ['admin', 'profile', 'settings'].includes(i.id))
                            .map((item) => {
                              const Icon = item.icon;
                              const isActive = activeTab === item.id;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => handleMobileNavClick(item.id)}
                                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left min-h-[44px] cursor-pointer group ${
                                    isActive
                                      ? 'bg-red-50 text-[#8B181B] font-bold border border-red-200 shadow-2xs'
                                      : 'hover:bg-stone-100/80 text-stone-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-[#8B181B] text-white' : 'bg-stone-200/70 text-stone-700'}`}>
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-stone-900 truncate">{item.label}</p>
                                      <p className="text-[10px] text-stone-500 truncate">{item.desc}</p>
                                    </div>
                                  </div>
                                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#8B181B]' : 'text-stone-400'}`} />
                                </button>
                              );
                            })}
                        </div>
                      )
                    }
                  ]}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
