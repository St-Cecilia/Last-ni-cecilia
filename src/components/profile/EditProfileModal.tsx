import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Camera,
  Upload,
  Briefcase,
  GraduationCap,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { Experience, Education } from '../../types';
import { compressImage } from '../../lib/utils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModalContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser, updateProfile, updateUserProfile, showToast } = useAlumni();

  const [name, setName] = useState(currentUser?.name || '');
  const [headline, setHeadline] = useState(currentUser?.headline || '');
  const [about, setAbout] = useState(currentUser?.about || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(currentUser?.profilePictureUrl || '');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(currentUser?.coverPhotoUrl || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [showCoverUrlInput, setShowCoverUrlInput] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPG, PNG, or WebP).');
      showToast('Please select a valid image file (JPG, PNG, or WebP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB. Please choose a smaller photo.');
      showToast('Image size exceeds 10MB limit.', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Compress and resize image to lightweight 500x500 thumbnail
      const optimizedDataUrl = await compressImage(file, 500, 500, 0.85);
      setProfilePictureUrl(optimizedDataUrl);
      setIsUploadingPhoto(false);
      showToast('Profile photo ready! Save to update your profile.', 'success');
    } catch (err) {
      console.warn('Failed to compress avatar photo:', err);
      setIsUploadingPhoto(false);
      setUploadError('Failed to process image. Please try another photo.');
      showToast('Failed to process image. Please try another photo.', 'error');
    }
    e.target.value = '';
  };

  const processCoverFile = async (file: File) => {
    setCoverUploadError(null);
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setCoverUploadError('Please select a valid image file (JPG, PNG, or WebP).');
      showToast('Please select a valid image file (JPG, PNG, or WebP).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setCoverUploadError('Cover image size exceeds 15MB. Please choose a smaller file.');
      showToast('Cover image size exceeds 15MB limit.', 'error');
      return;
    }

    setIsUploadingCover(true);
    try {
      // Compress and resize cover image to lightweight 1200x480 banner (~60KB)
      const optimizedDataUrl = await compressImage(file, 1200, 480, 0.82);
      setCoverPhotoUrl(optimizedDataUrl);
      setIsUploadingCover(false);
      showToast('Cover photo uploaded! Click "Save Changes" to apply.', 'success');
    } catch (err) {
      console.warn('Failed to compress cover photo:', err);
      setIsUploadingCover(false);
      setCoverUploadError('Failed to process cover image. Please try another photo.');
      showToast('Failed to process cover image. Please try another photo.', 'error');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processCoverFile(file);
    }
    e.target.value = '';
  };

  const handleRemoveCover = () => {
    setCoverPhotoUrl('');
    showToast('Cover photo cleared. Click "Save Changes" to confirm.', 'info');
  };

  const [experience, setExperience] = useState<Experience[]>(
    currentUser?.experience ? [...currentUser.experience] : []
  );
  const [education, setEducation] = useState<Education[]>(
    currentUser?.education ? [...currentUser.education] : []
  );

  if (!currentUser) return null;

  // Handle adding experience
  const addExperience = () => {
    setExperience([
      ...experience,
      {
        id: 'exp_' + Date.now(),
        title: '',
        company: '',
        location: '',
        startDate: '',
        current: true,
        description: ''
      }
    ]);
  };

  const removeExperience = (id: string) => {
    setExperience(experience.filter((exp) => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setExperience(
      experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  // Handle adding education
  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: 'edu_' + Date.now(),
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: ''
      }
    ]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setEducation(
      education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    const updater = updateProfile || updateUserProfile;
    if (typeof updater === 'function') {
      updater({
        name: name.trim(),
        headline: headline.trim(),
        about: about.trim(),
        location: location.trim(),
        phone: phone.trim(),
        profilePictureUrl,
        coverPhotoUrl,
        experience,
        education
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">Edit Your Alumni Profile</h2>
            <p className="text-xs text-stone-500">Update your bio, photos, professional experience, and degrees</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-6 text-xs sm:text-sm">
          {/* Media Pickers (Simulating Cloudinary Upload) */}
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs">Profile Imagery</h3>
            
            {/* Cover Photo Upload & Customization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 block">
                  Cover Photo (Upload from Device or Presets)
                </label>
                {coverPhotoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="text-[11px] text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Clear Cover
                  </button>
                )}
              </div>

              {/* Cover Preview & Drop Zone */}
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
                onClick={() => coverInputRef.current?.click()}
                className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 h-36 sm:h-40 group ${
                  isDraggingCover
                    ? 'border-[#8B181B] bg-red-50/50 ring-4 ring-[#8B181B]/15'
                    : 'border-stone-200 hover:border-stone-400 bg-stone-100'
                }`}
              >
                {coverPhotoUrl ? (
                  <img
                    src={coverPhotoUrl}
                    alt="Cover Preview"
                    className="w-full h-full object-cover transition-transform group-hover:scale-[1.01]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100 p-4 text-center">
                    <ImageIcon className="w-8 h-8 stroke-1 text-stone-400 mb-1.5" />
                    <span className="text-xs font-medium text-stone-600">Click or Drag & Drop image here</span>
                    <span className="text-[11px] text-stone-400 mt-0.5">Upload JPG, PNG, or WebP from your device</span>
                  </div>
                )}

                {/* Hover overlay instructing user to click to upload */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white text-xs font-semibold">
                  <Upload className="w-5 h-5 text-white" />
                  <span>Click to choose photo from device</span>
                </div>

                {/* Drag and Drop Active Overlay */}
                {isDraggingCover && (
                  <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white text-xs font-semibold z-20">
                    <Upload className="w-7 h-7 text-white animate-bounce" />
                    <span>Drop image to upload cover</span>
                  </div>
                )}

                {isUploadingCover && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-2 text-white text-xs font-semibold z-20">
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Optimizing cover image...</span>
                  </div>
                )}
              </div>

              {/* Upload & Preset Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
                
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="px-3 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{coverPhotoUrl ? 'Upload New Cover Photo' : 'Upload Cover Photo'}</span>
                </button>

                {/* Campus Presets */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCoverPhotoUrl('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80')
                    }
                    className="px-2.5 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition-colors cursor-pointer"
                    title="Classic St. Cecilia Campus Quad"
                  >
                    Campus Quad
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCoverPhotoUrl('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80')
                    }
                    className="px-2.5 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition-colors cursor-pointer"
                    title="Academic Hall & Graduation"
                  >
                    Graduation Hall
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCoverPhotoUrl('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&auto=format&fit=crop&q=80')
                    }
                    className="px-2.5 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium transition-colors cursor-pointer"
                    title="University Library"
                  >
                    Library
                  </button>
                </div>

                {/* Toggle Custom URL */}
                <button
                  type="button"
                  onClick={() => setShowCoverUrlInput(!showCoverUrlInput)}
                  className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg font-medium transition-colors cursor-pointer ml-auto"
                >
                  {showCoverUrlInput ? 'Hide URL Option' : 'Or Paste URL'}
                </button>
              </div>

              {/* Collapsible custom URL input */}
              {showCoverUrlInput && (
                <div className="pt-2">
                  <input
                    type="url"
                    value={coverPhotoUrl}
                    onChange={(e) => setCoverPhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    placeholder="https://example.com/cover.jpg"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Enter direct link to an HTTPS image.
                  </p>
                </div>
              )}

              {coverUploadError && (
                <p className="text-[11px] text-red-600 font-medium">{coverUploadError}</p>
              )}
              <p className="text-[11px] text-stone-500">
                Supports JPG, PNG, WebP up to 15MB. Automatically optimized for crisp display on all screen sizes.
              </p>
            </div>

            {/* Avatar Photo Upload (Direct Device Upload, No URL Required) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 block">Profile Photo (Direct Upload)</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="relative shrink-0">
                  <img
                    src={profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="Profile Preview"
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs bg-stone-200"
                  />
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="px-3 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{profilePictureUrl ? 'Upload New Photo' : 'Upload Photo'}</span>
                    </button>

                    {profilePictureUrl && (
                      <button
                        type="button"
                        onClick={() => setProfilePictureUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')}
                        className="px-2.5 py-1.5 text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Upload a JPEG, PNG, or WebP photo directly from your device (Max 5MB).
                  </p>
                  {uploadError && (
                    <p className="text-[11px] text-red-600 font-medium">{uploadError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Details */}
          <div className="space-y-3 pt-4 border-t border-stone-200">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs">Basic Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Senior Engineering Lead at Acme Corp"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">About / Bio</label>
              <textarea
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Share your passions, university memories, or what you are working on..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Experience Section */}
          <div className="space-y-3 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Professional Experience</span>
              </h3>
              <button
                type="button"
                onClick={addExperience}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role</span>
              </button>
            </div>

            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 relative">
                <button
                  type="button"
                  onClick={() => removeExperience(exp.id)}
                  className="absolute top-2.5 right-2.5 text-stone-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-2 pr-6">
                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 block">Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                      placeholder="e.g. Director of Engineering"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 block">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      placeholder="e.g. Google"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 block">Time Period</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      placeholder="2021 - Present"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 block">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block">Description</label>
                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    placeholder="Key achievements and technologies..."
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div className="space-y-3 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Education & Degrees</span>
              </h3>
              <button
                type="button"
                onClick={addEducation}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Degree</span>
              </button>
            </div>

            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 relative">
                <button
                  type="button"
                  onClick={() => removeEducation(edu.id)}
                  className="absolute top-2.5 right-2.5 text-stone-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-2 pr-6">
                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 block">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      placeholder="B.S. Computer Science"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 block">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      placeholder="University Alumni Board"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 block">Years</label>
                    <input
                      type="text"
                      value={`${edu.startYear} - ${edu.endYear}`}
                      onChange={(e) => {
                        const parts = e.target.value.split('-');
                        updateEducation(edu.id, 'startYear', parts[0]?.trim() || '');
                        updateEducation(edu.id, 'endYear', parts[1]?.trim() || '');
                      }}
                      placeholder="2016 - 2020"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 block">Honors</label>
                    <input
                      type="text"
                      value={edu.honors || ''}
                      onChange={(e) => updateEducation(edu.id, 'honors', e.target.value)}
                      placeholder="Magna Cum Laude"
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return <EditProfileModalContent onClose={onClose} />;
};
