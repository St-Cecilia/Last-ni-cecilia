import React, { useState, useMemo, useRef } from 'react';
import {
  Megaphone,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  User,
  X,
  Sparkles,
  Check,
  LayoutGrid,
  List,
  AlertTriangle,
  Radio,
  Building2,
  Bell,
  Upload,
  Camera,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { Announcement } from '../../types';
import { GooeyBackground } from '../common/GooeyBackground';
import { compressImage } from '../../lib/utils';

export const AdminAnnouncementsManager: React.FC = () => {
  const { announcements, createAnnouncement, deleteAnnouncement, permissions, showToast } = useAlumni();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<Announcement['category']>('institutional');
  const [formIsImportant, setFormIsImportant] = useState(false);
  const [formIsUrgent, setFormIsUrgent] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [photoFileName, setPhotoFileName] = useState('');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [showDirectUrlInput, setShowDirectUrlInput] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setPhotoError('Selected image is too large (max 20MB).');
      return;
    }
    setPhotoError('');
    setIsProcessingPhoto(true);
    try {
      const compressed = await compressImage(file, 1280, 800, 0.85);
      setFormImageUrl(compressed);
      setPhotoFileName(file.name);
    } catch (err) {
      console.error('Failed to compress image:', err);
      setPhotoError('Failed to process image. Please try another file.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (a.title || '').toLowerCase().includes(q) ||
        (a.content || '').toLowerCase().includes(q) ||
        (a.authorName || '').toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [announcements, searchQuery, selectedCategory]);

  const urgentCount = useMemo(() => announcements.filter((a) => a.urgent).length, [announcements]);
  const institutionalCount = useMemo(
    () => announcements.filter((a) => a.category === 'institutional').length,
    [announcements]
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Announcement headline is required.', 'error');
      return;
    }

    createAnnouncement({
      title: formTitle.trim(),
      content: formContent.trim() || 'Official announcement broadcasted from the Alumni Office.',
      category: formCategory,
      important: formIsImportant,
      urgent: formIsUrgent,
      imageUrl: formImageUrl.trim() || undefined
    });

    setFormTitle('');
    setFormContent('');
    setFormImageUrl('');
    setPhotoFileName('');
    setPhotoError('');
    setShowDirectUrlInput(false);
    setFormIsImportant(false);
    setFormIsUrgent(false);
    setShowCreateModal(false);
    showToast('Announcement posted successfully!', 'success');
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteAnnouncement(itemToDelete.id);
    setItemToDelete(null);
    showToast('Announcement removed.');
  };

  return (
    <div className="space-y-6">
      {/* Bento Hero Header Tile */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FAF9F5] to-[#F5F2EA] p-6 sm:p-7 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.03)]">
        {/* Institutional St. Cecilia Crimson Architectural Top Trim */}
        <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#8B181B] via-[#991B1B] to-[#B45309]" />

        <GooeyBackground variant="crimson" intensity="subtle" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
              <span className="text-[#8B181B] font-bold">St. Cecilia's College</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>Communications Office</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>Broadcast Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight leading-tight">
              Institutional Announcements & Bulletins
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Broadcast urgent campus alerts, institutional milestones, academic notices, and official newsletters to all Cecilian alumni cohorts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {permissions.canPostAnnouncements && (
              <button
                onClick={() => setShowCreateModal(true)}
                id="admin-announcements-add-btn"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold transition-all shadow-[0_2px_8px_rgba(139,24,27,0.25)] cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Publish Notice</span>
              </button>
            )}
          </div>
        </div>

        {/* Bento 4-Tile Metrics Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-200/70">
          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Total Bulletins</span>
              <Megaphone className="w-3.5 h-3.5 text-[#8B181B]" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-stone-900">{announcements.length}</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">Published records</span>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Urgent Alerts</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="mt-2">
              <span className={`text-xl font-bold ${urgentCount > 0 ? 'text-rose-700' : 'text-stone-900'}`}>
                {urgentCount}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5">Campus priority</span>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Institutional</span>
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-amber-800">{institutionalCount}</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">College official</span>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Audience Scope</span>
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-emerald-800">100%</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">All alumni cohorts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar with View Mode Switcher */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search announcements by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B181B]/20 focus:border-[#8B181B] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#8B181B]/20 focus:border-[#8B181B] cursor-pointer w-full sm:w-auto"
            >
              <option value="all">All Categories</option>
              <option value="institutional">Institutional</option>
              <option value="department">Department</option>
              <option value="batch">Batch</option>
              <option value="emergency">Emergency</option>
            </select>

            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Bento Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Structured Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Display: Bento Cards View or Table View */}
      {viewMode === 'cards' ? (
        filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-2xs">
            <Megaphone className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-stone-900">No Announcements Found</h3>
            <p className="text-xs text-stone-500 mt-1">No broadcast bulletins match your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnnouncements.map((a, idx) => (
              <div
                key={a.id}
                className={`group relative overflow-hidden bg-white rounded-2xl border transition-all duration-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-md flex flex-col justify-between ${
                  idx === 0 ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white via-rose-50/15 to-white border-stone-200/90' : 'border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        a.category === 'emergency'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : a.category === 'institutional'
                          ? 'bg-[#8B181B]/10 text-[#8B181B] border-[#8B181B]/20'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}>
                        {a.category || 'General'}
                      </span>
                      {a.urgent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200 animate-pulse">
                          Urgent Priority
                        </span>
                      )}
                      {a.important && !a.urgent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          Important Notice
                        </span>
                      )}
                    </div>

                    {permissions.canDeleteEvents && (
                      <button
                        onClick={() => setItemToDelete({ id: a.id, title: a.title })}
                        title="Delete Announcement"
                        className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                    <div className="mt-3.5">
                      {a.imageUrl && (
                        <div className="mb-3 relative h-36 rounded-xl overflow-hidden border border-stone-100 bg-stone-50">
                          <img
                            src={a.imageUrl}
                            alt={a.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 tracking-tight leading-snug group-hover:text-[#8B181B] transition-colors">
                        {a.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                        {a.content}
                      </p>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-semibold text-stone-800">{a.authorName || 'Alumni Office'}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="text-stone-400">{a.authorRole || 'Official'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-stone-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {a.publishedAt
                        ? new Date(a.publishedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Dense Structured Table View */
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Headline & Priority</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Author & Role</th>
                  <th className="p-3.5">Date Published</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAnnouncements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-stone-500">
                      No announcements found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAnnouncements.map((a) => (
                    <tr key={a.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {a.imageUrl && (
                            <img
                              src={a.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0 max-w-md">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-stone-900 truncate font-serif">{a.title}</p>
                              {a.urgent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  Urgent
                                </span>
                              )}
                              {a.important && !a.urgent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  Notice
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{a.content}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-stone-100 text-stone-700 border border-stone-200">
                          {a.category || 'General'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-stone-800">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-medium truncate">{a.authorName || 'Alumni Office'}</span>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-0.5 truncate">{a.authorRole || 'Official'}</p>
                      </td>

                      <td className="p-3.5 text-stone-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>
                            {a.publishedAt
                              ? new Date(a.publishedAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : 'Recent'}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        {permissions.canDeleteEvents && (
                          <button
                            onClick={() => setItemToDelete({ id: a.id, title: a.title })}
                            title="Delete Announcement"
                            className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-stone-900">+ Post Announcement</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule of 2026 Commencement Exercises"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none cursor-pointer"
                >
                  <option value="institutional">Institutional / Official</option>
                  <option value="department">Academic Department</option>
                  <option value="batch">Batch Specific</option>
                  <option value="emergency">Emergency / Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Content / Body *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write the announcement message..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
                />
              </div>

              {/* Photo Upload (Saved to Firestore Database) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#8B181B]" />
                    <span>Upload Hero Photo / Image</span>
                    <span className="text-[10px] font-normal text-stone-500">(Database persistent)</span>
                  </label>
                  {!showDirectUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setShowDirectUrlInput(true)}
                      className="text-[11px] text-stone-500 hover:text-[#8B181B] underline cursor-pointer"
                    >
                      Paste image link instead
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDirectUrlInput(false)}
                      className="text-[11px] text-stone-500 hover:text-[#8B181B] underline cursor-pointer"
                    >
                      Use photo file uploader
                    </button>
                  )}
                </div>

                {photoError && (
                  <div className="p-2 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                    <span>{photoError}</span>
                  </div>
                )}

                {formImageUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs">
                    <img
                      src={formImageUrl}
                      alt="Uploaded preview"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-900/85 backdrop-blur-xs text-white rounded-md text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                      <Check className="w-3 h-3 text-emerald-300 stroke-[2.5]" />
                      <span>Photo Attached</span>
                    </div>
                    {photoFileName && (
                      <div className="absolute bottom-2 left-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded-md text-[10px] truncate">
                        {photoFileName}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => photoFileInputRef.current?.click()}
                        className="px-2 py-1 bg-white/95 hover:bg-white text-stone-800 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-[#8B181B]" />
                        <span>Replace</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormImageUrl('');
                          setPhotoFileName('');
                          if (photoFileInputRef.current) photoFileInputRef.current.value = '';
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingPhoto(true);
                    }}
                    onDragLeave={() => setIsDraggingPhoto(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingPhoto(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                    onClick={() => photoFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                      isDraggingPhoto
                        ? 'border-[#8B181B] bg-red-50/70 ring-2 ring-red-200'
                        : 'border-stone-300 bg-stone-50 hover:bg-stone-100/80 hover:border-stone-400'
                    }`}
                  >
                    <input
                      ref={photoFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file);
                      }}
                    />

                    {isProcessingPhoto ? (
                      <div className="py-2 flex flex-col items-center justify-center gap-1.5 text-stone-600">
                        <Loader2 className="w-5 h-5 animate-spin text-[#8B181B]" />
                        <span className="text-xs font-medium">Processing photo...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-1">
                        <div className="w-9 h-9 rounded-full bg-red-50 text-[#8B181B] border border-red-100 flex items-center justify-center mb-1.5 shadow-2xs">
                          <Upload className="w-4 h-4 stroke-[1.75]" />
                        </div>
                        <span className="text-xs font-bold text-stone-800">
                          Click to upload photo or drag & drop
                        </span>
                        <span className="text-[10px] text-stone-500 mt-0.5">
                          PNG, JPG, or WebP. Auto-compressed and uploaded to database.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {showDirectUrlInput && (
                  <div className="pt-1.5 animate-in fade-in duration-150">
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => {
                        setFormImageUrl(e.target.value);
                        setPhotoFileName('');
                      }}
                      placeholder="Or enter direct image URL: https://..."
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#8B181B] outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsImportant}
                    onChange={(e) => setFormIsImportant(e.target.checked)}
                    className="rounded border-stone-300 text-red-600 focus:ring-red-500"
                  />
                  <span>Mark as Notice / Important</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-red-700 font-bold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsUrgent}
                    onChange={(e) => setFormIsUrgent(e.target.checked)}
                    className="rounded border-red-300 text-red-600 focus:ring-red-500"
                  />
                  <span>🚨 Urgent Alert</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">Delete Announcement</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-stone-900">{itemToDelete.title}</span>? This broadcast will no longer be visible to alumni.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
