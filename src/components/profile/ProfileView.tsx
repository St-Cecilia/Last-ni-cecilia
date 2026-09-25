import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Edit,
  Camera,
  Share2,
  CheckCircle2,
  Users,
  Building,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  FileDown,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { EditProfileModal } from './EditProfileModal';
import { DigitalAlumniCard } from './DigitalAlumniCard';
import { RegistrarSelfVerificationModal } from './RegistrarSelfVerificationModal';
import { exportProfileToPdfResume } from '../../services/pdfResumeService';
import { compressImage } from '../../lib/utils';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile, updateUserProfile, showToast } = useAlumni();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const avatarFileInputRef = React.useRef<HTMLInputElement>(null);
  const coverFileInputRef = React.useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      showToast('Please select a valid image file (JPEG, PNG, or WebP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size must be less than 10MB.', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const dataUrl = await compressImage(file, 500, 500, 0.85);
      const updater = updateProfile || updateUserProfile;
      if (typeof updater === 'function') {
        updater({ profilePictureUrl: dataUrl });
      }
      setIsUploadingPhoto(false);
      showToast('Profile photo updated successfully!', 'success');
    } catch {
      setIsUploadingPhoto(false);
      showToast('Failed to process image. Please try again.', 'error');
    }
    e.target.value = '';
  };

  const processCoverFile = async (file: File) => {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      showToast('Please select a valid image file (JPEG, PNG, or WebP).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('Cover image size must be less than 15MB.', 'error');
      return;
    }

    setIsUploadingCover(true);
    try {
      // Compress and resize cover image to lightweight 1200x480 banner (~60KB)
      const dataUrl = await compressImage(file, 1200, 480, 0.82);
      const updater = updateProfile || updateUserProfile;
      if (typeof updater === 'function') {
        updater({ coverPhotoUrl: dataUrl });
      }
      setIsUploadingCover(false);
      showToast('Cover photo uploaded and saved successfully!', 'success');
    } catch {
      setIsUploadingCover(false);
      showToast('Failed to process cover image. Please try again.', 'error');
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processCoverFile(file);
    }
    e.target.value = '';
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Profile Card Container */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        
        {/* Cover Photo with Drag and Drop & Direct Device Upload */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingCover(true);
          }}
          onDragLeave={() => setIsDraggingCover(false)}
          onDrop={async (e) => {
            e.preventDefault();
            setIsDraggingCover(false);
            const file = e.dataTransfer.files?.[0];
            if (file) {
              await processCoverFile(file);
            }
          }}
          className={`relative h-48 sm:h-64 bg-stone-900 group transition-all duration-200 overflow-hidden ${
            isDraggingCover ? 'ring-4 ring-[#8B181B] ring-inset' : ''
          }`}
        >
          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleCoverFileChange}
          />
          <img
            src={currentUser.coverPhotoUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80'}
            alt="Cover"
            className="w-full h-full object-cover opacity-90 transition-opacity"
          />

          {/* Drag and Drop Active Overlay */}
          {isDraggingCover && (
            <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white font-medium text-sm z-30 animate-in fade-in">
              <Upload className="w-8 h-8 text-white animate-bounce" />
              <span className="font-semibold text-base">Drop photo here to update cover</span>
              <span className="text-xs text-stone-300">Supports JPG, PNG, WebP up to 15MB</span>
            </div>
          )}

          {/* Loading overlay during device upload & compression */}
          {isUploadingCover && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-2.5 text-white font-semibold text-xs sm:text-sm z-30">
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
              <span>Optimizing & saving cover photo...</span>
            </div>
          )}

          {/* Cover Action Buttons */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => coverFileInputRef.current?.click()}
              disabled={isUploadingCover}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-black/65 hover:bg-black/85 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-95"
              title="Upload cover photo from your device"
            >
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>Upload Cover</span>
            </button>
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-black/45 hover:bg-black/70 text-white/90 hover:text-white rounded-xl text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
              title="More cover options & campus presets"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Presets</span>
            </button>
          </div>
        </div>

        {/* Profile Details & Avatar Header */}
        <div className="px-4 sm:px-8 pb-7">
          <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 -mt-14 sm:-mt-20 mb-6">
            {/* Avatar & Photo Trigger */}
            <div className="relative self-start shrink-0 z-10">
              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <img
                src={currentUser.profilePictureUrl}
                alt={currentUser.name}
                className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] bg-stone-100 ring-1 ring-stone-900/5 aspect-square"
              />
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 sm:p-2 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl shadow-md transition-all cursor-pointer ring-2 ring-white hover:scale-105"
                title="Directly upload new profile photo"
              >
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
              </button>
            </div>

            {/* Profile Actions Toolbar */}
            {/* Responsive grid/flex approach on mobile to prevent overlapping and ensure full readability */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto pt-2 sm:pt-0">
              {/* Edit Profile (Primary Collegiate CTA - Prominent on mobile) */}
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="col-span-1 xs:col-span-2 sm:col-span-1 order-first sm:order-last justify-center flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs sm:text-sm font-bold shadow-[0_1px_3px_rgba(139,24,27,0.25)] hover:shadow-[0_4px_12px_rgba(139,24,27,0.2)] transition-all cursor-pointer shrink-0 min-h-[44px]"
              >
                <Edit className="w-4 h-4 stroke-[2]" />
                <span className="whitespace-nowrap">Edit Profile</span>
              </button>

              {/* Registrar Verification Status / Action */}
              <button
                type="button"
                onClick={() => setShowRegistrarModal(true)}
                className={`col-span-1 xs:col-span-2 sm:col-span-1 justify-center flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                  currentUser.isVerified
                    ? 'bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs font-bold'
                }`}
                title={currentUser.isVerified ? 'Official Office of the Registrar Verified Alum' : 'Verify academic standing with Registrar'}
              >
                <ShieldCheck className={`w-4 h-4 shrink-0 ${currentUser.isVerified ? 'text-emerald-700' : 'text-white'}`} />
                <span className="truncate">{currentUser.isVerified ? 'Registrar Verified' : 'Verify with Registrar'}</span>
              </button>

              {/* Export PDF Resume */}
              <button
                type="button"
                onClick={() => exportProfileToPdfResume(currentUser, currentUser)}
                className="justify-center flex items-center gap-2 px-3.5 py-2.5 bg-stone-50 hover:bg-white text-stone-700 hover:text-stone-950 border border-stone-200/90 hover:border-stone-300 rounded-xl text-xs sm:text-sm font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-all cursor-pointer min-h-[44px]"
                title="Download your profile formatted as an official PDF resume"
              >
                <FileDown className="w-4 h-4 text-stone-500 shrink-0" />
                <span className="truncate">Export PDF Resume</span>
              </button>

              {/* Digital Pass / ID */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('digital-id-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="justify-center flex items-center gap-2 px-3.5 py-2.5 bg-stone-50 hover:bg-white text-stone-700 hover:text-stone-950 border border-stone-200/90 hover:border-amber-300/80 rounded-xl text-xs sm:text-sm font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-all cursor-pointer group min-h-[44px]"
                title="Jump to Official Digital Alumni Pass"
              >
                <CreditCard className="w-4 h-4 text-amber-600 shrink-0 group-hover:scale-105 transition-transform" />
                <span className="truncate">Digital ID</span>
              </button>

              {/* Share Profile */}
              <button
                type="button"
                onClick={handleShareProfile}
                className="justify-center flex items-center gap-2 px-3.5 py-2.5 bg-stone-50 hover:bg-white text-stone-700 hover:text-stone-950 border border-stone-200/90 hover:border-stone-300 rounded-xl text-xs sm:text-sm font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-all cursor-pointer min-h-[44px]"
                title="Copy public profile link"
              >
                <Share2 className="w-4 h-4 text-stone-500 shrink-0" />
                <span className="truncate">{copiedLink ? 'Copied Link' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* User Bio Details */}
          <div className="mt-2 sm:mt-0">
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">{currentUser.name}</h1>
              {currentUser.isVerified && (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Verified Alum</span>
                </span>
              )}
              <span className="uppercase text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {currentUser.role}
              </span>
            </div>

            <p className="text-sm sm:text-base font-medium text-stone-700 mt-2 leading-relaxed">
              {currentUser.headline}
            </p>

            <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-xs sm:text-sm text-stone-600 font-medium">
              <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>Batch of {currentUser.batch} • {currentUser.course}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                <span>{currentUser.location}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="break-all">{currentUser.email}</span>
              </span>
              {currentUser.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{currentUser.phone}</span>
                </span>
              )}
            </div>

            {/* Unverified Alumni Guidance Callout */}
            {!currentUser.isVerified && currentUser.role === 'alumni' && (
              <div className="mt-5 p-4 sm:p-5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-amber-950">
                      Official Degree Verification Required
                    </h3>
                    <p className="text-[11px] sm:text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                      Cross-reference your student ID with the Office of the Registrar to earn the Verified Alum credential, unlock private peer messaging, and validate your Digital Pass.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegistrarModal(true)}
                  className="px-3.5 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
                >
                  Verify Now →
                </button>
              </div>
            )}
          </div>

          {/* Social Counts Bar */}
          <div className="mt-5 p-3.5 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-3 text-center">
            <div>
              <span className="text-lg font-bold text-stone-900 block">
                {currentUser.connectionsCount || 0}
              </span>
              <span className="text-xs text-stone-500 font-medium">Alumni Network</span>
            </div>
            <div>
              <span className="text-lg font-bold text-stone-900 block font-mono">
                {currentUser.batch || '2024'}
              </span>
              <span className="text-xs text-stone-500 font-medium">Graduation Batch</span>
            </div>
            <div>
              <span className="text-lg font-bold text-[#8B181B] block">
                {currentUser.isVerified ? 'Official Verified' : 'Portal Member'}
              </span>
              <span className="text-xs text-stone-500 font-medium">Cecilian Standing</span>
            </div>
          </div>

          {/* Official Alumni Digital Card (Banking App Style) */}
          <div id="digital-id-section" className="mt-8 p-6 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 rounded-2xl border border-stone-800 text-white shadow-xl scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-stone-800">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    Official Alumni Digital Pass (Banking Card)
                  </h2>
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  Interactive metallic access card with EMV chip, contactless gate verification, and QR turnstile code.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  <CheckCircle2 className="w-3 h-3" />
                  ACTIVE MEMBERSHIP
                </span>
              </div>
            </div>

            <DigitalAlumniCard user={currentUser} />
          </div>

          {/* About Section */}
          <div className="mt-6">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              About
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-stone-50/50 p-4 rounded-xl border border-stone-100">
              {currentUser.about || 'No bio written yet. Click "Edit Profile" to add your story.'}
            </p>
          </div>

          {/* Professional Experience Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Experience ({(currentUser.experience || []).length})</span>
              </h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Add / Edit
              </button>
            </div>

            <div className="space-y-3">
              {(currentUser.experience || []).length === 0 ? (
                <div className="p-4 bg-stone-50 rounded-xl text-center text-xs text-stone-400">
                  No experience listed yet.
                </div>
              ) : (
                (currentUser.experience || []).map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-stone-50 rounded-xl border border-stone-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-stone-900">{exp.title}</h3>
                      <span className="text-xs text-stone-400 font-medium">{exp.startDate}</span>
                    </div>
                    <div className="text-xs text-stone-600 font-semibold mt-0.5">
                      {exp.company} • <span className="text-stone-500">{exp.location}</span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Education Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Education ({(currentUser.education || []).length})</span>
              </h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Add / Edit
              </button>
            </div>

            <div className="space-y-3">
              {(currentUser.education || []).length === 0 ? (
                <div className="p-4 bg-stone-50 rounded-xl text-center text-xs text-stone-400">
                  No education listed yet.
                </div>
              ) : (
                (currentUser.education || []).map((edu) => (
                  <div
                    key={edu.id}
                    className="p-4 bg-stone-50 rounded-xl border border-stone-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-stone-900">{edu.degree}</h3>
                      <span className="text-xs text-stone-400 font-medium">
                        {edu.startYear} - {edu.endYear}
                      </span>
                    </div>
                    <div className="text-xs text-stone-600 font-semibold mt-0.5">
                      {edu.institution} • {edu.fieldOfStudy}
                    </div>
                    {edu.honors && (
                      <div className="mt-1.5 text-xs text-blue-700 font-semibold">
                        Honors: {edu.honors}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />

      {/* Registrar Degree Self-Verification Modal */}
      <RegistrarSelfVerificationModal
        isOpen={showRegistrarModal}
        onClose={() => setShowRegistrarModal(false)}
      />
    </div>
  );
};
