import React from 'react';
import {
  X,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  MessageSquare,
  UserCheck,
  UserPlus,
  Building,
  Calendar,
  CheckCircle2,
  Sparkles,
  FileDown
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { exportProfileToPdfResume } from '../../services/pdfResumeService';

export const PublicProfileModal: React.FC = () => {
  const {
    users,
    currentUser,
    selectedUserIdForModal,
    setSelectedUserIdForModal,
    isConnected,
    hasPendingRequestWith,
    sendFriendRequest,
    getOrCreateChat,
    setActiveTab
  } = useAlumni();

  if (!selectedUserIdForModal) return null;

  const targetUser = users.find((u) => u.uid === selectedUserIdForModal);
  if (!targetUser) return null;

  const isSelf = currentUser?.uid === targetUser.uid;
  const connected = isConnected(targetUser.uid);
  const reqState = hasPendingRequestWith(targetUser.uid);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedUserIdForModal(null);
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Scrollable Container wrapping both Cover and Body to prevent avatar clipping */}
        <div className="flex-1 overflow-y-auto">
          {/* Cover Photo Header */}
          <div className="relative h-44 sm:h-52 bg-stone-800 shrink-0">
            <img
              src={targetUser.coverPhotoUrl}
              alt="Cover"
              className="w-full h-full object-cover opacity-90"
            />
            <button
              onClick={() => setSelectedUserIdForModal(null)}
              className="absolute top-4 right-4 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer z-20"
              aria-label="Close profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Card Body */}
          <div className="px-4 sm:px-6 pb-6">
            {/* Avatar and Action Buttons Row */}
            <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-3.5 -mt-12 sm:-mt-14 mb-5">
              <div className="relative self-start shrink-0 z-10">
                <img
                  src={targetUser.profilePictureUrl}
                  alt={targetUser.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-lg bg-stone-100 ring-1 ring-stone-900/5 aspect-square"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></span>
              </div>

            {/* Action buttons: responsive grid on mobile, flex on desktop */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto pt-1 sm:pt-0">
              {isSelf && (
                <button
                  type="button"
                  onClick={() => exportProfileToPdfResume(targetUser, currentUser)}
                  className="justify-center flex items-center gap-2 px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-colors min-h-[42px]"
                  title="Download verified resume as PDF"
                >
                  <FileDown className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="whitespace-nowrap">Export PDF Resume</span>
                </button>
              )}

              {!isSelf && (
                <>
                  {connected ? (
                    <button
                      onClick={() => {
                        getOrCreateChat(targetUser.uid);
                        setSelectedUserIdForModal(null);
                        setActiveTab('messages');
                      }}
                      className="justify-center flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs cursor-pointer min-h-[42px]"
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span>Message</span>
                    </button>
                  ) : reqState === 'sent' ? (
                    <span className="justify-center flex items-center gap-2 px-3.5 py-2.5 bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold min-h-[42px]">
                      <span>Request Sent</span>
                    </span>
                  ) : reqState === 'received' ? (
                    <button
                      onClick={() => {
                        setSelectedUserIdForModal(null);
                        setActiveTab('network');
                      }}
                      className="justify-center flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold cursor-pointer shadow-xs min-h-[42px]"
                    >
                      <span>Respond</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => sendFriendRequest(targetUser.uid)}
                      className="justify-center flex items-center gap-2 px-4 py-2.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md cursor-pointer transition-all active:scale-98 min-h-[42px]"
                    >
                      <UserPlus className="w-4 h-4 shrink-0" />
                      <span>Connect</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* User Details */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">{targetUser.name}</h2>
              {targetUser.isVerified && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Verified Alum</span>
                </span>
              )}
              <span className="uppercase text-[11px] px-2 py-0.5 rounded-full font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                {targetUser.role}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-stone-700 mt-1">
              {targetUser.headline}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
              <span className="flex items-center gap-1 text-blue-700 font-semibold">
                <GraduationCap className="w-3.5 h-3.5" />
                Batch of {targetUser.batch} • {targetUser.course}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {targetUser.location}
              </span>
            </div>
          </div>

          {/* Metrics Row - Network & Academic Focus */}
          <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-3 text-center">
            <div>
              <span className="text-base font-bold text-stone-900 block">{targetUser.connectionsCount || 0}</span>
              <span className="text-[11px] text-stone-500 font-medium">Connections</span>
            </div>
            <div>
              <span className="text-base font-bold text-stone-900 block font-mono">{targetUser.batch || '2024'}</span>
              <span className="text-[11px] text-stone-500 font-medium">Graduation Batch</span>
            </div>
            <div>
              <span className="text-base font-bold text-[#8B181B] block">{targetUser.isVerified ? 'Verified' : 'Member'}</span>
              <span className="text-[11px] text-stone-500 font-medium">Portal Status</span>
            </div>
          </div>

          {/* About Section */}
          <div className="mt-5">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
              About
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {targetUser.about}
            </p>
          </div>

          {/* Experience Timeline */}
          {(targetUser.experience || []).length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Professional Experience</span>
              </h3>

              <div className="space-y-3">
                {(targetUser.experience || []).map((exp) => (
                  <div key={exp.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-stone-900 text-sm">{exp.title}</h4>
                      <span className="text-[10px] text-stone-400 font-medium">{exp.startDate}</span>
                    </div>
                    <div className="text-stone-600 font-medium mt-0.5">
                      {exp.company} • {exp.location}
                    </div>
                    {exp.description && (
                      <p className="text-stone-600 mt-1.5 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Timeline */}
          {(targetUser.education || []).length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Education & Academics</span>
              </h3>

              <div className="space-y-3">
                {(targetUser.education || []).map((edu) => (
                  <div key={edu.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-stone-900 text-sm">{edu.degree}</h4>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {edu.startYear} - {edu.endYear}
                      </span>
                    </div>
                    <div className="text-stone-600 font-medium mt-0.5">
                      {edu.institution} • {edu.fieldOfStudy}
                    </div>
                    {edu.honors && (
                      <div className="text-[11px] text-blue-700 font-semibold mt-1">
                        Honors: {edu.honors}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};
