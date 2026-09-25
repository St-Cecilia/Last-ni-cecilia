/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlumniProvider, useAlumni, STORAGE_KEYS } from './context/AlumniContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { DashboardView } from './components/dashboard/DashboardView';
import { NetworkView } from './components/network/NetworkView';
import { MessagesView } from './components/messages/MessagesView';
import { EventsView } from './components/events/EventsView';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { OpportunitiesView } from './components/opportunities/OpportunitiesView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminPanelView } from './components/admin/AdminPanelView';
import { EmployerDashboardView } from './components/opportunities/EmployerDashboardView';
import { PublicProfileModal } from './components/profile/PublicProfileModal';
import { FirstTimeProfileSetupModal } from './components/profile/FirstTimeProfileSetupModal';
import { AuthPage } from './components/auth/AuthPage';
import { LandingPage } from './components/landing/LandingPage';
import { ToastContainer } from './components/common/ToastContainer';
import { VerificationGate } from './components/common/VerificationGate';
import { CecilianLoader } from './components/common/CecilianLoader';
import { PrivacyConsentCard } from './components/common/PrivacyConsentCard';
import { CampusGalleryModal } from './components/gallery/CampusGalleryModal';
import { GraduationCap, LogIn, UserPlus, Globe } from 'lucide-react';

function AppContent() {
  const { activeTab, setActiveTab, currentUser, authReady, logout } = useAlumni();
  const [currentView, setCurrentView] = useState<'landing' | 'portal' | 'auth'>(() => {
    try {
      const savedSession =
        localStorage.getItem(STORAGE_KEYS.USER_ID) ||
        localStorage.getItem('alumni_auth_session_real_v1');
      const savedView = localStorage.getItem(STORAGE_KEYS.VIEW);
      if (savedSession) {
        return savedView === 'landing' ? 'landing' : 'portal';
      }
      return savedView === 'landing' ? 'landing' : 'auth';
    } catch {
      return 'auth';
    }
  });
  const [authViewMode, setAuthViewMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<'alumni' | 'employer'>('alumni');
  const [showProfileSetupModal, setShowProfileSetupModal] = useState(false);

  // Global click anywhere listener: If anything is hovering in the UI, clicking anywhere causes it to vanish
  React.useEffect(() => {
    const handleGlobalClickDismiss = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      // Do not force blur if the user is interacting with form controls or interactive buttons
      if (target && target.closest('input, textarea, select, button, a, [contenteditable="true"]')) {
        return;
      }
      // Blur active element to clear any CSS focus/hover states on neutral surfaces
      if (document.activeElement && document.activeElement instanceof HTMLElement && !document.activeElement.closest('input, textarea, select')) {
        document.activeElement.blur();
      }
      // Dispatch dismiss-hover for all custom hover cards, tooltips, and popovers
      window.dispatchEvent(new CustomEvent('applet:dismiss-hover', { detail: { target: e.target } }));
    };

    window.addEventListener('pointerdown', handleGlobalClickDismiss);
    return () => {
      window.removeEventListener('pointerdown', handleGlobalClickDismiss);
    };
  }, []);

  // Sync currentView changes to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW, currentView);
    } catch {}
  }, [currentView]);

  // Synchronize view state with user authentication status & verification enforcement
  React.useEffect(() => {
    if (currentUser) {
      // Strict Verification Enforcement: Do not let unverified accounts access the portal
      if (currentUser.role === 'alumni' && !currentUser.isVerified) {
        logout();
        setCurrentView('auth');
        return;
      }
      if (currentUser.role === 'employer' && (!currentUser.isVerified || currentUser.employerVerificationStatus === 'rejected')) {
        logout();
        setCurrentView('auth');
        return;
      }
      if (currentView === 'auth') {
        setCurrentView('portal');
      }
    } else {
      const hasStoredSession =
        typeof window !== 'undefined' &&
        (!!localStorage.getItem(STORAGE_KEYS.USER_ID) ||
         !!localStorage.getItem('alumni_auth_session_real_v1'));
      if (!hasStoredSession && currentView === 'portal') {
        setCurrentView('auth');
      }
    }
  }, [currentUser, currentView, logout]);

  React.useEffect(() => {
    // Prioritize Profile Setup on first-time login
    if (
      currentUser &&
      currentUser.role === 'alumni' &&
      (!currentUser.isProfileSetupCompleted || !currentUser.currentPosition || !currentUser.company)
    ) {
      const dismissed = sessionStorage.getItem(`dismissed_setup_${currentUser.uid}`);
      if (!dismissed) {
        setShowProfileSetupModal(true);
      }
    }
  }, [currentUser]);

  const handleLoginSuccess = (_role?: string) => {
    setCurrentView('portal');
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW, 'portal');
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, 'dashboard');
    } catch {}
    // User requested: Always direct to home (dashboard) on login
    setActiveTab('dashboard');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Protected Member Portal View Check
  const hasStoredSession =
    typeof window !== 'undefined' &&
    (!!localStorage.getItem(STORAGE_KEYS.USER_ID) ||
     !!localStorage.getItem('alumni_auth_session_real_v1'));

  if (!currentUser && hasStoredSession && !authReady) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
        <CecilianLoader text="Restoring your Cecilian session..." />
      </div>
    );
  }

  // Animate view transitions (landing, auth, portal)
  return (
    <AnimatePresence mode="wait">
      {/* Landing page view */}
      {currentView === 'landing' && (
        <motion.div
          key="view-landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          <LandingPage
            onNavigateToAuth={(mode, role = 'alumni') => {
              setAuthViewMode(mode);
              setAuthRole(role);
              setCurrentView('auth');
            }}
          />
        </motion.div>
      )}

      {/* Authentication page view */}
      {currentView === 'auth' && (
        <motion.div
          key="view-auth"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          <AuthPage
            initialMode={authViewMode}
            initialRole={authRole}
            onLoginSuccess={handleLoginSuccess}
            onBackToApp={() => {
              if (currentUser) {
                handleLoginSuccess(currentUser.role);
              } else {
                setCurrentView('landing');
              }
            }}
          />
        </motion.div>
      )}

      {/* Authenticated Member Portal View or Fallback to Auth */}
      {currentView === 'portal' && (!currentUser ? (
        <motion.div
          key="view-auth-fallback"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          <AuthPage
            initialMode="login"
            onLoginSuccess={handleLoginSuccess}
            onBackToApp={() => setCurrentView('landing')}
          />
        </motion.div>
      ) : (
        <motion.div
          key="view-portal"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-[#111827] antialiased selection:bg-[#991B1B] selection:text-white"
        >
          {/* Top Global Header */}
          <Header
            onOpenAuth={(mode) => {
              setAuthViewMode(mode);
              setCurrentView('auth');
            }}
            onGoToLanding={() => setCurrentView('landing')}
          />

          {/* Main Navigation Bar */}
          <Navigation
            onOpenAuth={(mode) => {
              setAuthViewMode(mode);
              setCurrentView('auth');
            }}
          />

          {/* Primary Content Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-24 md:pb-8 overflow-x-hidden">
            <div key={activeTab} className="w-full max-w-full overflow-x-hidden animate-in fade-in duration-200">
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'network' && (
                <VerificationGate routeName="Alumni Directory & Networking">
                  <NetworkView />
                </VerificationGate>
              )}
              {activeTab === 'messages' && (
                <VerificationGate routeName="Direct Peer Messaging">
                  <MessagesView />
                </VerificationGate>
              )}
              {activeTab === 'events' && (
                <VerificationGate routeName="Campus Reunions & Official Events">
                  <EventsView />
                </VerificationGate>
              )}
              {activeTab === 'announcements' && (
                <VerificationGate routeName="Institutional Announcements">
                  <AnnouncementsView />
                </VerificationGate>
              )}
              {activeTab === 'opportunities' && (
                <VerificationGate routeName="Career Opportunities & Job Board">
                  <OpportunitiesView />
                </VerificationGate>
              )}
              {activeTab === 'employer_portal' && <EmployerDashboardView />}
              {activeTab === 'profile' && <ProfileView />}
              {activeTab === 'settings' && <SettingsView />}
              {activeTab === 'admin' && <AdminPanelView />}
            </div>
          </main>

          {/* Public Profile Modal (Available anywhere in the app) */}
          <PublicProfileModal />

          {/* Priority First-Time Profile Setup Modal */}
          <FirstTimeProfileSetupModal
            isOpen={showProfileSetupModal}
            onClose={() => {
              setShowProfileSetupModal(false);
              if (currentUser) {
                sessionStorage.setItem(`dismissed_setup_${currentUser.uid}`, 'true');
              }
            }}
          />

          {/* Privacy and Cookie Consent Card */}
          <PrivacyConsentCard />

          {/* Footer */}
          <footer className="bg-white border-t border-[#E5E7EB] py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/cecilians-seal.jpg"
                  alt="Alumni Cecilian's Logo"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-stone-200 shadow-2xs shrink-0"
                />
                <span className="font-bold text-[#111827]">St. Cecilia's College Global Alumni Association</span>
                <span>•</span>
                <span>Official Institutional Network</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('applet:open-privacy'))}
                  className="text-stone-500 hover:text-[#8B181B] transition-colors cursor-pointer"
                >
                  Privacy & Cookies
                </button>
                <span>•</span>
                <span className="text-stone-500 font-medium">St. Cecilia’s College - Cebu, Inc.</span>
                <span>•</span>
                <span className="text-stone-400">© {new Date().getFullYear()} All Rights Reserved.</span>
              </div>
            </div>
          </footer>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AlumniProvider>
      <AppContent />
      <ToastContainer />
    </AlumniProvider>
  );
}
