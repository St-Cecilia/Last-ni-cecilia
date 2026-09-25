import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Briefcase,
  MessageSquare,
  Calendar,
  Bell,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Eye,
  Search,
  Copy,
  Check,
  RefreshCw,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import {
  DispatchedEmail,
  getDispatchedEmails,
  deleteDispatchedEmail,
  clearDispatchedEmails,
  sendJobPostingEmail,
  sendDirectMessageEmail,
  sendEventRsvpEmail,
  sendAnnouncementEmail,
  sendSecurityAlertEmail
} from '../../services/emailNotificationService';

interface EmailDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailDispatchModal: React.FC<EmailDispatchModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, opportunities, events, users, showToast } = useAlumni();
  const [emails, setEmails] = useState<DispatchedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<DispatchedEmail | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'job' | 'message' | 'event' | 'announcement' | 'security'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const loadEmails = () => {
    const list = getDispatchedEmails();
    setEmails(list);
    // If selectedEmail is deleted, reset
    if (selectedEmail && !list.find((e) => e.id === selectedEmail.id)) {
      setSelectedEmail(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEmails();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleDispatched = () => {
      loadEmails();
    };
    window.addEventListener('sc_email_dispatched', handleDispatched);
    return () => window.removeEventListener('sc_email_dispatched', handleDispatched);
  }, []);

  if (!isOpen) return null;

  const filteredEmails = emails.filter((e) => {
    const matchesFilter = activeFilter === 'all' || e.category === activeFilter;
    if (!matchesFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.subject.toLowerCase().includes(q) ||
      e.toName.toLowerCase().includes(q) ||
      e.toEmail.toLowerCase().includes(q) ||
      e.previewText.toLowerCase().includes(q)
    );
  });

  const handleClearAll = () => {
    if (window.confirm('Clear all dispatched email logs?')) {
      clearDispatchedEmails();
      setEmails([]);
      setSelectedEmail(null);
      showToast('Dispatched email log cleared.');
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteDispatchedEmail(id);
    if (selectedEmail?.id === id) {
      setSelectedEmail(null);
    }
    loadEmails();
    showToast('Email entry removed from outbox.');
  };

  const handleCopyHtml = () => {
    if (!selectedEmail) return;
    navigator.clipboard?.writeText(selectedEmail.htmlContent);
    setCopiedHtml(true);
    showToast('Email HTML copied to clipboard!', 'success');
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleSendTest = (type: 'job' | 'event' | 'message' | 'security') => {
    if (!currentUser) return;
    setTestSending(true);

    setTimeout(() => {
      if (type === 'job') {
        const job = opportunities[0] || {
          id: 'job_sample_test',
          title: 'Senior Full-Stack Engineer',
          company: 'Accenture Technology Solutions',
          location: 'Cebu IT Park, Cebu City',
          type: 'Full-time',
          salary: '₱55,000 - ₱80,000',
          description: 'Looking for Cecilian computer studies graduates with React & Node experience.'
        };
        sendJobPostingEmail(job as any, [currentUser]);
        showToast(`Test career opportunity email sent to ${currentUser.email}!`, 'success');
      } else if (type === 'event') {
        const event = events[0] || {
          id: 'event_sample_test',
          title: 'Cecilian Grand Alumni Homecoming 2026',
          location: 'Main Gymnasium, Minglanilla Campus',
          startDate: new Date(Date.now() + 86400000 * 30).toISOString(),
          isVirtual: false
        };
        sendEventRsvpEmail(event as any, currentUser, 'going');
        showToast(`Test event confirmation email sent to ${currentUser.email}!`, 'success');
      } else if (type === 'security') {
        sendSecurityAlertEmail(
          currentUser,
          'Password Updated Successfully',
          'Your account credentials were confirmed and the password was updated from a verified browser session.'
        );
        showToast(`Test security notice email dispatched to ${currentUser.email}!`, 'success');
      } else {
        const dummySender = users.find((u) => u.uid !== currentUser.uid) || {
          uid: 'user_admin',
          name: 'Alumni Relations Office',
          email: 'alumni@stcecilia.edu',
          role: 'admin' as const
        };
        sendDirectMessageEmail(
          dummySender as any,
          currentUser,
          'Hello Cecilian! We are pleased to welcome you to the new institutional alumni portal.',
          'test_chat'
        );
        showToast(`Test direct message email sent to ${currentUser.email}!`, 'success');
      }
      loadEmails();
      setTestSending(false);
    }, 300);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'job':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Briefcase className="w-2.5 h-2.5" /> Job Alert
          </span>
        );
      case 'message':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <MessageSquare className="w-2.5 h-2.5" /> Message
          </span>
        );
      case 'event':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" /> Event RSVP
          </span>
        );
      case 'announcement':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Bell className="w-2.5 h-2.5" /> Broadcast
          </span>
        );
      case 'security':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
            <ShieldAlert className="w-2.5 h-2.5" /> Security
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
            System
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B181B] text-white flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  Email Notification Outbox & Simulator
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Dispatch Stream
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Inspect transactional email payloads generated for job opportunities, RSVPs, direct messages, and security notices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 sm:px-6 py-3 bg-white border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {(['all', 'job', 'message', 'event', 'announcement', 'security'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-[#8B181B] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {filter === 'all' ? `All (${emails.length})` : filter}
              </button>
            ))}
          </div>

          {/* Search Input & Test Actions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject / recipient..."
                className="pl-8 pr-3 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs w-44 sm:w-52 focus:outline-none focus:ring-1 focus:ring-[#8B181B]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSendTest('job')}
                disabled={testSending}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-medium transition-all cursor-pointer"
                title="Dispatch a mock career opportunity email"
              >
                + Job
              </button>
              <button
                onClick={() => handleSendTest('event')}
                disabled={testSending}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-medium transition-all cursor-pointer"
                title="Dispatch a mock event confirmation email"
              >
                + Event
              </button>
              <button
                onClick={() => handleSendTest('message')}
                disabled={testSending}
                className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg font-medium transition-all cursor-pointer"
                title="Dispatch a mock direct message email"
              >
                + Message
              </button>
              <button
                onClick={() => handleSendTest('security')}
                disabled={testSending}
                className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-all cursor-pointer"
                title="Dispatch a mock security notice email"
              >
                + Security
              </button>
              {emails.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1 cursor-pointer"
                  title="Clear all dispatched email logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: Email List */}
          <div
            className={`border-r border-stone-200 overflow-y-auto ${
              selectedEmail ? 'hidden md:block md:col-span-5' : 'col-span-12'
            }`}
          >
            {filteredEmails.length === 0 ? (
              <div className="p-12 text-center text-stone-400">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-30 text-stone-400" />
                <p className="text-sm font-semibold text-stone-600">No dispatched emails match filter</p>
                <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                  Use the quick test buttons above to simulate transactional email dispatches for jobs, RSVPs, or security notices.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {filteredEmails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  const timeFormatted = new Date(email.sentAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const dateFormatted = new Date(email.sentAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`w-full text-left p-4 hover:bg-stone-50 transition-colors flex flex-col gap-1.5 cursor-pointer relative group ${
                        isSelected ? 'bg-amber-50/50 border-l-4 border-l-[#8B181B]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {getCategoryBadge(email.category)}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-stone-400 font-mono">
                            {dateFormatted} • {timeFormatted}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem(e, email.id)}
                            className="text-stone-300 hover:text-red-600 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete this dispatch log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-stone-900 truncate pr-6">{email.subject}</h4>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{email.previewText}</p>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                        <span className="truncate max-w-[200px]">To: {email.toName} ({email.toEmail})</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Delivered
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Email Preview */}
          {selectedEmail ? (
            <div className="col-span-12 md:col-span-7 flex flex-col h-full bg-stone-100/50 overflow-hidden">
              {/* Preview Bar */}
              <div className="p-3 bg-white border-b border-stone-200 flex items-center justify-between shrink-0">
                <div className="text-xs truncate flex items-center gap-2">
                  <span className="font-bold text-stone-800">Email Preview</span>
                  <span className="text-stone-300">|</span>
                  <span className="text-stone-600 truncate">{selectedEmail.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyHtml}
                    className="text-xs text-stone-600 hover:text-stone-900 font-medium px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded flex items-center gap-1 cursor-pointer transition-colors"
                    title="Copy full HTML source"
                  >
                    {copiedHtml ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy HTML</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="md:hidden text-xs text-blue-600 font-semibold cursor-pointer"
                  >
                    Back to List
                  </button>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="hidden md:inline text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>

              {/* Email Envelope Metadata */}
              <div className="p-4 bg-white border-b border-stone-200 text-xs space-y-1.5 shrink-0">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-stone-400 w-16 text-[11px] uppercase">Subject:</span>
                  <span className="font-bold text-stone-900">{selectedEmail.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-400 w-16 text-[11px] uppercase">To:</span>
                  <span className="text-stone-700">
                    <span className="font-semibold">{selectedEmail.toName}</span> &lt;{selectedEmail.toEmail}&gt;
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-400 w-16 text-[11px] uppercase">Sent:</span>
                  <span className="text-stone-500 font-mono text-[11px]">
                    {new Date(selectedEmail.sentAt).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Rendered HTML Email Container */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div
                  className="bg-white rounded-xl shadow-xs border border-stone-200 p-2 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
                />
              </div>
            </div>
          ) : (
            <div className="hidden md:flex md:col-span-7 items-center justify-center p-8 text-center text-stone-400 bg-stone-50/50">
              <div className="max-w-sm">
                <Eye className="w-10 h-10 mx-auto mb-2 opacity-30 text-stone-400" />
                <p className="text-xs font-semibold text-stone-600">Select an email to view full rendered content</p>
                <p className="text-[11px] text-stone-400 mt-1">
                  All templates follow official St. Cecilia’s College crimson typography, responsive tables, and security disclaimers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Institutional Transactional Email Dispatcher Active (Local Outbox Store)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

