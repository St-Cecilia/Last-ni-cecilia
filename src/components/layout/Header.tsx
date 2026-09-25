import React, { useState } from 'react';
import {
  Bell,
  Search,
  UserCheck,
  Check,
  X,
  Shield,
  GraduationCap,
  LogOut,
  Settings as SettingsIcon,
  User as UserIcon,
  ExternalLink,
  Image as ImageIcon,
  LogIn,
  UserPlus,
  ArrowRightLeft,
  MessageSquare,
  Menu,
  HelpCircle,
  Briefcase,
  Calendar,
  Megaphone,
  Users,
  Building2,
  Mail,
  Phone,
  Clock,
  Sparkles,
  ChevronRight,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { UserRole } from '../../types';
import { CampusGalleryModal } from '../gallery/CampusGalleryModal';

export const Header: React.FC<{
  onOpenSearch?: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onGoToLanding?: () => void;
}> = ({ onOpenAuth, onGoToLanding }) => {
  const {
    currentUser,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    acceptFriendRequest,
    declineFriendRequest,
    isConnected,
    getConnectionStatus,
    setActiveTab,
    logout,
    switchUser,
    setSelectedUserIdForModal,
    chats,
    users,
    activeChatId,
    setActiveChatId,
    markChatAsRead
  } = useAlumni();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessagesPopover, setShowMessagesPopover] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Compute unread messages count for current user
  const totalUnreadMessages = React.useMemo(() => {
    if (!currentUser) return 0;
    return (chats || []).reduce((acc, chat) => {
      return acc + (chat.unreadCount?.[currentUser.uid] || 0);
    }, 0);
  }, [chats, currentUser]);

  // Recent chats list for popover
  const recentUserChats = React.useMemo(() => {
    if (!currentUser) return [];
    return (chats || [])
      .filter((chat) => (chat.memberIds || (chat as any).participants || []).includes(currentUser.uid))
      .sort((a, b) => {
        const timeB = new Date(b.lastMessageAt || (b as any).updatedAt || 0).getTime();
        const timeA = new Date(a.lastMessageAt || (a as any).updatedAt || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [chats, currentUser]);

  // Close any active popovers when user clicks outside, but protect clicks inside dropdowns
  React.useEffect(() => {
    const handleGlobalDismiss = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest('[data-header-dropdown]')) {
        setShowNotifications(false);
        setShowMessagesPopover(false);
        setShowNavMenu(false);
        setShowProfileMenu(false);
      }
    };

    const handleCustomDismiss = (e: Event) => {
      const customDetail = (e as CustomEvent)?.detail;
      const target = customDetail?.target as HTMLElement | null;
      // Do not dismiss if user clicked inside any header dropdown
      if (target && target.closest && target.closest('[data-header-dropdown]')) {
        return;
      }
      setShowNotifications(false);
      setShowMessagesPopover(false);
      setShowNavMenu(false);
      setShowProfileMenu(false);
    };

    const handleOpenGallery = () => {
      setShowNavMenu(false);
      setShowProfileMenu(false);
      setShowNotifications(false);
      setShowMessagesPopover(false);
      setShowGalleryModal(true);
    };

    window.addEventListener('pointerdown', handleGlobalDismiss);
    window.addEventListener('click', handleGlobalDismiss);
    window.addEventListener('applet:dismiss-hover', handleCustomDismiss);
    window.addEventListener('applet:open-gallery', handleOpenGallery);
    return () => {
      window.removeEventListener('pointerdown', handleGlobalDismiss);
      window.removeEventListener('click', handleGlobalDismiss);
      window.removeEventListener('applet:dismiss-hover', handleCustomDismiss);
      window.removeEventListener('applet:open-gallery', handleOpenGallery);
    };
  }, []);

  // Helper to ensure clean redirection from portal burger menu and header controls
  const handlePortalRedirect = (action: string | (() => void)) => {
    setShowNavMenu(false);
    setShowProfileMenu(false);
    setShowNotifications(false);
    setShowMessagesPopover(false);
    if (typeof action === 'string') {
      setActiveTab(action);
    } else {
      action();
    }
  };

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'registrar':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'staff':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'moderator':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  const userNotifications = notifications.filter(
    (n) => n.toUid === currentUser?.uid
  );

  const handleLogoClick = () => {
    setActiveTab('dashboard');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('applet:refresh-home'));
    }
  };

  return (
    <>
      {/* Mobile Popover Backdrop Overlay */}
      {(showNotifications || showMessagesPopover || showNavMenu || showProfileMenu) && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden transition-opacity duration-200"
          onClick={() => {
            setShowNotifications(false);
            setShowMessagesPopover(false);
            setShowNavMenu(false);
            setShowProfileMenu(false);
          }}
        />
      )}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo and Brand */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
            onClick={handleLogoClick}
            title="Return to Home & Refresh"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogoClick();
              }
            }}
          >
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#8B181B] to-amber-500 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 group-active:scale-95 transition-transform">
              <img
                src="/assets/cecilians-seal.jpg"
                alt="Alumni Cecilian's Seal"
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif font-bold text-sm sm:text-lg text-stone-900 tracking-tight truncate">
                  St. Cecilia's
                </span>
                <span className="hidden xs:inline text-stone-900 font-serif font-bold text-sm sm:text-lg tracking-tight">
                  College
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-bold rounded-full bg-red-50 text-[#8B181B] border border-red-200">
                  Alumni Portal
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block truncate">
                Official Alumni & Institutional Network
              </p>
            </div>
          </div>

          {/* Center search trigger */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => setActiveTab('network')}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-stone-400 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors text-left cursor-pointer"
            >
              <Search className="w-4 h-4 text-stone-400" />
              <span>Search alumni by name, course, batch, or company...</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* View Landing Page (Only when not logged in) */}
            {onGoToLanding && !currentUser && (
              <button
                onClick={onGoToLanding}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors whitespace-nowrap min-h-[36px]"
                title="View Public Landing Page"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#991B1B]" />
                <span>Landing Page</span>
              </button>
            )}

            {/* Campus & Heritage Gallery trigger (Only when not logged in) */}
            {!currentUser && (
              <button
                onClick={() => setShowGalleryModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors whitespace-nowrap min-h-[36px]"
                title="View Campus & Heritage Gallery"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#991B1B]" />
                <span>Campus Gallery</span>
              </button>
            )}

            {/* Sign In & Register when not logged in */}
            {!currentUser && onOpenAuth && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold rounded-xl text-stone-700 hover:text-[#991B1B] hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer min-h-[36px] whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#991B1B]" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl bg-[#991B1B] hover:bg-[#7f1616] text-white shadow-xs transition-colors cursor-pointer min-h-[36px] whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}

            {/* Notifications Bell with Popover */}
            <div className="relative" data-header-dropdown="true">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMessagesPopover(false);
                  setShowNavMenu(false);
                  setShowProfileMenu(false);
                }}
                className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                  showNotifications
                    ? 'text-[#8B181B] bg-red-50 ring-1 ring-red-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed left-3 right-3 top-15 max-h-[calc(100dvh-5rem)] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-w-none bg-white rounded-2xl shadow-2xl border border-stone-200/90 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900">Notifications</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 font-medium rounded-full">
                          {unreadNotificationsCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadNotificationsCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="sm:hidden p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
                        aria-label="Close notifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-stone-100">
                    {userNotifications.length === 0 ? (
                      <div className="p-6 text-center text-stone-400 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      userNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3.5 transition-colors cursor-pointer ${
                            !n.read ? 'bg-blue-50/60' : 'hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-xs font-semibold text-stone-900">{n.title}</div>
                            <span className="text-[10px] text-stone-400 shrink-0">
                              {new Date(n.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed">{n.body}</p>

                          {/* Inline Accept/Decline for Friend Requests */}
                          {n.type === 'friend_request' && (
                            <div className="mt-2.5">
                              {n.actionStatus === 'accepted' || isConnected(n.fromUid || '') || getConnectionStatus(n.fromUid || '') === 'accepted' ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-md border border-emerald-200">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Connection Accepted</span>
                                </div>
                              ) : n.actionStatus === 'declined' || getConnectionStatus(n.fromUid || '') === 'declined' ? (
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-500 bg-stone-100 rounded-md">
                                  <span>Request declined</span>
                                </div>
                              ) : n.refId ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      acceptFriendRequest(n.refId!);
                                      markNotificationAsRead(n.id);
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#991B1B] hover:bg-[#7f1616] rounded-md shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      declineFriendRequest(n.refId!);
                                      markNotificationAsRead(n.id);
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-md transition-colors cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Decline</span>
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Messaging Logo Button beside Notification */}
            {currentUser && (
              <div className="relative" data-header-dropdown="true">
                <button
                  onClick={() => {
                    setShowMessagesPopover(!showMessagesPopover);
                    setShowNotifications(false);
                    setShowNavMenu(false);
                    setShowProfileMenu(false);
                  }}
                  className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                    showMessagesPopover
                      ? 'text-[#8B181B] bg-red-50 ring-1 ring-red-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                  aria-label="Messaging"
                  title="Messaging & Chats"
                >
                  <MessageSquare className="w-5 h-5" />
                  {totalUnreadMessages > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B181B] text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                      {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                    </span>
                  )}
                </button>

                {showMessagesPopover && (
                  <div className="fixed left-3 right-3 top-15 max-h-[calc(100dvh-5rem)] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-w-none bg-white rounded-2xl shadow-2xl border border-stone-200/90 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50 shrink-0">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#8B181B]" />
                        <span className="text-sm font-semibold text-stone-900">Conversations</span>
                        {totalUnreadMessages > 0 && (
                          <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 font-medium rounded-full">
                            {totalUnreadMessages} unread
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('messages');
                            setShowMessagesPopover(false);
                          }}
                          className="text-xs text-[#8B181B] hover:underline font-semibold cursor-pointer"
                        >
                          Full Messenger
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowMessagesPopover(false)}
                          className="sm:hidden p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
                          aria-label="Close conversations"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                      {recentUserChats.length === 0 ? (
                        <div className="p-6 text-center">
                          <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-stone-700">No conversations yet</p>
                          <p className="text-[11px] text-stone-500 mt-1">Connect with alumni in My Network to start chatting.</p>
                          <button
                            onClick={() => {
                              setActiveTab('network');
                              setShowMessagesPopover(false);
                            }}
                            className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                          >
                            Explore Network
                          </button>
                        </div>
                      ) : (
                        recentUserChats.map((chat) => {
                          const members = chat.memberIds || (chat as any).participants || [];
                          const otherUid = members.find((uid: string) => uid !== currentUser.uid);
                          const otherUser = chat.otherUser || (users || []).find((u) => u.uid === otherUid);
                          const unreadCount = chat.unreadCount?.[currentUser.uid] || 0;
                          const lastMsg = (chat as any).messages?.[(chat as any).messages.length - 1];
                          const lastMsgText = lastMsg?.text || chat.lastMessage || 'Start a conversation...';
                          const lastMsgTime = lastMsg?.timestamp || lastMsg?.createdAt || chat.lastMessageAt;
                          const chatTitle = chat.groupName || (chat as any).title || otherUser?.name || 'Cecilian Chat';
                          const isGroup = Boolean(chat.isGroupChat || (chat as any).type === 'group' || chat.isEventChat);

                          return (
                            <div
                              key={chat.id}
                              onClick={() => {
                                setActiveChatId(chat.id);
                                markChatAsRead(chat.id);
                                setActiveTab('messages');
                                setShowMessagesPopover(false);
                              }}
                              className={`p-3.5 flex items-center gap-3 hover:bg-stone-50 transition-colors cursor-pointer ${
                                unreadCount > 0 ? 'bg-amber-50/40' : ''
                              }`}
                            >
                              <img
                                src={
                                  isGroup
                                    ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80'
                                    : otherUser?.profilePictureUrl ||
                                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                                }
                                alt="Participant avatar"
                                className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-stone-900 truncate">
                                    {chatTitle}
                                  </h4>
                                  {lastMsgTime && (
                                    <span className="text-[10px] text-stone-400 shrink-0 ml-1">
                                      {new Date(lastMsgTime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-stone-600 truncate mt-0.5">
                                  {lastMsgText}
                                </p>
                              </div>

                              {unreadCount > 0 && (
                                <span className="w-2.5 h-2.5 rounded-full bg-[#8B181B] shrink-0" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="p-2.5 bg-stone-50 border-t border-stone-100">
                      <button
                        onClick={() => {
                          setActiveTab('messages');
                          setShowMessagesPopover(false);
                        }}
                        className="w-full py-2 px-3 text-xs font-bold text-center text-white bg-[#8B181B] hover:bg-[#721316] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Go to All Messages</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Menu Logo Button beside Messaging and Notifications (Desktop only; mobile and tablet use the dedicated navigation systems) */}
            <div className="relative hidden lg:block" data-header-dropdown="true">
              <button
                onClick={() => {
                  setShowNavMenu(!showNavMenu);
                  setShowNotifications(false);
                  setShowMessagesPopover(false);
                  setShowProfileMenu(false);
                }}
                className={`relative p-2 rounded-lg transition-colors cursor-pointer border ${
                  showNavMenu
                    ? 'text-[#8B181B] bg-red-50/90 border-red-200 shadow-2xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100 border-stone-200/80 bg-stone-50/50'
                }`}
                aria-label="Portal Menu"
                title="Cecilian Services Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {showNavMenu && (
                <div
                  className="fixed left-3 right-3 top-15 max-h-[calc(100dvh-5rem)] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:max-w-none bg-white rounded-2xl shadow-2xl border border-stone-200/90 p-3 z-50 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Institutional Header in Menu */}
                  <div className="px-3 py-2.5 border-b border-stone-100 bg-stone-50 rounded-xl mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="/assets/cecilians-seal.jpg"
                        alt="Seal"
                        className="w-9 h-9 rounded-full object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900">Cecilian Portal Menu</div>
                        <div className="text-[10px] text-stone-500">Quick Access & Institutional Hub</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNavMenu(false)}
                      className="sm:hidden p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
                      aria-label="Close portal menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Institutional Services Group */}
                  <div className="space-y-1">
                    <div className="px-2 pt-1 pb-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Services & Portals
                    </div>

                    {/* Dashboard */}
                    <button
                      type="button"
                      onClick={() => handlePortalRedirect('dashboard')}
                      className="w-full flex items-center justify-between p-2 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-stone-100 text-[#8B181B] flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-800">Alumni Dashboard</div>
                          <div className="text-[10px] text-stone-500">Overview, feed & quick updates</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
                    </button>

                    {/* Campus Gallery */}
                    <button
                      type="button"
                      onClick={() => handlePortalRedirect(() => setShowGalleryModal(true))}
                      className="w-full flex items-center justify-between p-2 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#8B181B] flex items-center justify-center shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-800">Campus Gallery</div>
                          <div className="text-[10px] text-stone-500">Campus landmarks & memory archive</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
                    </button>

                    {/* Events & Reunions */}
                    <button
                      type="button"
                      onClick={() => handlePortalRedirect('events')}
                      className="w-full flex items-center justify-between p-2 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-800">Events & Reunions</div>
                          <div className="text-[10px] text-stone-500">Homecoming and gatherings</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
                    </button>

                    {/* Career Job Board */}
                    <button
                      type="button"
                      onClick={() => handlePortalRedirect('opportunities')}
                      className="w-full flex items-center justify-between p-2 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-800">Career Job Board</div>
                          <div className="text-[10px] text-stone-500">Alumni hiring & opportunities</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
                    </button>

                    {/* My Network */}
                    <button
                      type="button"
                      onClick={() => handlePortalRedirect('network')}
                      className="w-full flex items-center justify-between p-2 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-800">My Network</div>
                          <div className="text-[10px] text-stone-500">Batch directory & Cecilian alumni</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
                    </button>

                    {/* Direct Messages */}
                    <button
                      type="button"
                      onClick={() => handlePortalRedirect('messages')}
                      className="w-full flex items-center justify-between p-2 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-800">Peer Messages</div>
                          <div className="text-[10px] text-stone-500">Direct chats & batch conversations</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
                    </button>

                    {/* Announcements */}
                    <button
                      type="button"
                      onClick={() => handlePortalRedirect('announcements')}
                      className="w-full flex items-center justify-between p-2 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-800">Announcements</div>
                          <div className="text-[10px] text-stone-500">Institutional advisories & notices</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
                    </button>

                    {/* Admin Panel (for admin/registrar/staff/moderator) */}
                    {currentUser && ['admin', 'registrar', 'staff', 'moderator'].includes(currentUser.role) && (
                      <button
                        type="button"
                        onClick={() => handlePortalRedirect('admin')}
                        className="w-full flex items-center justify-between p-2 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4 text-rose-300" />
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900">Administration Console</div>
                            <div className="text-[10px] text-stone-500">Official management & records</div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
                      </button>
                    )}

                    {/* Employer Portal (for employers) */}
                    {currentUser?.role === 'employer' && (
                      <button
                        type="button"
                        onClick={() => handlePortalRedirect('employer_portal')}
                        className="w-full flex items-center justify-between p-2 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-900 text-white flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900">Employer Recruitment</div>
                            <div className="text-[10px] text-stone-500">Job postings & applicant reviews</div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
                      </button>
                    )}
                  </div>

                  {/* Help, Account & Settings Group */}
                  <div className="mt-2 pt-2 border-t border-stone-100 space-y-1">
                    <div className="px-2 pt-0.5 pb-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Account & Assistance
                    </div>

                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => handlePortalRedirect('profile')}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer text-left"
                      >
                        <UserIcon className="w-4 h-4 text-stone-500 shrink-0" />
                        <span>My Alumni Profile</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePortalRedirect('settings')}
                      className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer text-left"
                    >
                      <SettingsIcon className="w-4 h-4 text-stone-500 shrink-0" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handlePortalRedirect(() => {
                          window.dispatchEvent(new CustomEvent('applet:open-privacy'));
                        });
                      }}
                      className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer text-left"
                    >
                      <Shield className="w-4 h-4 text-stone-500 shrink-0" />
                      <span>Privacy & Cookie Preferences</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePortalRedirect(() => setShowHelpModal(true))}
                      className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer text-left"
                    >
                      <HelpCircle className="w-4 h-4 text-stone-500 shrink-0" />
                      <span>Help & Alumni Support</span>
                    </button>

                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => handlePortalRedirect(() => logout())}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Log Out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current User Avatar & Dropdown */}
            {currentUser && (
              <div className="relative" data-header-dropdown="true">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                    setShowMessagesPopover(false);
                    setShowNavMenu(false);
                  }}
                  className="flex items-center justify-center p-1 rounded-full hover:ring-2 hover:ring-[#8B181B]/40 focus:ring-2 focus:ring-[#8B181B]/40 transition-all cursor-pointer min-w-[38px] min-h-[38px] shrink-0 ml-0.5"
                  aria-label="Current User Profile and Account Menu"
                >
                  <img
                    src={currentUser.profilePictureUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-stone-200 shadow-2xs"
                  />
                </button>

                {showProfileMenu && (
                  <div className="fixed left-3 right-3 sm:left-auto sm:right-0 top-15 sm:top-full sm:mt-2 max-w-xs ml-auto sm:w-60 bg-white rounded-2xl shadow-2xl border border-stone-200/90 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-stone-100 bg-stone-50/70 rounded-xl mb-1">
                      <p className="text-xs font-bold text-stone-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                      <span
                        className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] rounded-full uppercase font-bold border ${getRoleBadgeColor(
                          currentUser.role
                        )}`}
                      >
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1 space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl cursor-pointer min-h-[38px] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-stone-500" />
                        <span>View Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl cursor-pointer min-h-[38px] transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4 text-stone-500" />
                        <span>Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl border-t border-stone-100 mt-1 pt-2 cursor-pointer min-h-[38px] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    <CampusGalleryModal
      isOpen={showGalleryModal}
      onClose={() => setShowGalleryModal(false)}
    />

    {/* Help & Support Desk Modal */}
    {showHelpModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8B181B] to-[#5a1012] p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">Alumni Affairs Help & Support</h3>
                <p className="text-xs text-stone-200">St. Cecilia's College Official Support Desk</p>
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#8B181B]" />
                <span>Office of Alumni & Student Affairs</span>
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                2nd Floor, St. Cecilia's College Administration Building, Minglanilla, Cebu, Philippines.
              </p>
              <div className="pt-2 border-t border-stone-200/70 space-y-1.5 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#8B181B]" />
                  <span>alumni.affairs@stcecilias.edu.ph</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#8B181B]" />
                  <span>(032) 268-4746 / (032) 268-4747 local 105</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#8B181B]" />
                  <span>Mon – Fri: 8:00 AM – 5:00 PM • Sat: 8:00 AM – 12:00 PM</span>
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Frequently Asked Questions</h4>

              <div className="p-3 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors">
                <h5 className="text-xs font-bold text-stone-800">How do I request official transcripts or diplomas?</h5>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  Contact the Registrar's Office with your verified Cecilian Student ID number or submit an online verification request via your alumni profile.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors">
                <h5 className="text-xs font-bold text-stone-800">How do I RSVP for reunions & campus events?</h5>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  Navigate to the <strong>Events</strong> tab in your navigation and click "RSVP Attendance". You can cancel anytime before the cancellation deadline.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors">
                <h5 className="text-xs font-bold text-stone-800">How do I post job openings for fellow Cecilians?</h5>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  Employer partners and alumni business owners can sign up as an Employer or contact Alumni Affairs to publish verified job openings on the Job Board.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
            <button
              onClick={() => setShowHelpModal(false)}
              className="px-4 py-2 text-xs font-bold text-white bg-[#8B181B] hover:bg-[#721316] rounded-xl transition-colors cursor-pointer"
            >
              Close Help Desk
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
};
