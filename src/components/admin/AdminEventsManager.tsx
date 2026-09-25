import React, { useState, useMemo, useRef } from 'react';
import {
  Calendar,
  Search,
  Plus,
  Trash2,
  Users,
  MapPin,
  Clock,
  Video,
  ExternalLink,
  Check,
  X,
  Sparkles,
  LayoutGrid,
  List,
  Flame,
  Award,
  Compass,
  Upload,
  Camera,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { AlumniEvent } from '../../types';
import { GooeyBackground } from '../common/GooeyBackground';
import { compressImage } from '../../lib/utils';

export const AdminEventsManager: React.FC = () => {
  const { events, createEvent, deleteEvent, permissions, showToast } = useAlumni();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Form State with sensible defaults
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<AlumniEvent['type']>('reunion');
  const [formStartDate, setFormStartDate] = useState('2026-10-15T09:00');
  const [formEndDate, setFormEndDate] = useState('2026-10-15T17:00');
  const [formLocation, setFormLocation] = useState('St. Cecilia College Quadrangle');
  const [formIsVirtual, setFormIsVirtual] = useState(false);
  const [formHeroImage, setFormHeroImage] = useState(
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80'
  );
  const [photoFileName, setPhotoFileName] = useState('');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [showDirectUrlInput, setShowDirectUrlInput] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const [formMaxAttendees, setFormMaxAttendees] = useState(250);

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
      setFormHeroImage(compressed);
      setPhotoFileName(file.name);
    } catch (err) {
      console.error('Failed to compress image:', err);
      setPhotoError('Failed to process image. Please try another file.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (e.title || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || e.type === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [events, searchQuery, selectedCategory]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Event title is required.', 'error');
      return;
    }

    createEvent({
      title: formTitle.trim(),
      description: formDesc.trim() || 'Join fellow alumni and faculty for this campus gathering.',
      location: formLocation.trim() || 'Campus Grounds',
      type: formCategory,
      startDate: new Date(formStartDate).toISOString(),
      endDate: new Date(formEndDate).toISOString(),
      heroImageUrl: formHeroImage,
      isVirtual: formIsVirtual,
      isImportant: false,
      maxAttendees: Number(formMaxAttendees) || 200
    });

    setFormTitle('');
    setFormDesc('');
    setShowCreateModal(false);
    showToast('Event published successfully!', 'success');
  };

  const totalRsvps = useMemo(() => events.reduce((acc, ev) => acc + (ev.attendeesCount || 0), 0), [events]);
  const reunionCount = useMemo(() => events.filter((e) => e.type === 'reunion').length, [events]);
  const virtualCount = useMemo(() => events.filter((e) => e.isVirtual).length, [events]);

  const confirmDelete = () => {
    if (!eventToDelete) return;
    deleteEvent(eventToDelete.id);
    setEventToDelete(null);
    showToast('Event removed successfully.');
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
              <span>Campus Events & Reunions</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>Alumni Relations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight leading-tight">
              Campus Events & Alumni Gatherings
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Coordinate grand alumni homecomings, academic symposiums, regional webinars, and career networking conferences across all graduating classes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {permissions.canCreateEvents && (
              <button
                onClick={() => setShowCreateModal(true)}
                id="admin-events-add-event-btn"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold transition-all shadow-[0_2px_8px_rgba(139,24,27,0.25)] cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Event</span>
              </button>
            )}
          </div>
        </div>

        {/* Bento 4-Tile Metrics Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-200/70">
          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Scheduled Events</span>
              <Calendar className="w-3.5 h-3.5 text-[#8B181B]" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-stone-900">{events.length}</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">Campus calendar</span>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Confirmed RSVPs</span>
              <Users className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-blue-900">{totalRsvps}</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">Registered attendees</span>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Grand Reunions</span>
              <Award className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-amber-800">{reunionCount}</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">Jubilee & homecomings</span>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Hybrid / Virtual</span>
              <Video className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-emerald-800">{virtualCount}</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">Online accessible</span>
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
              placeholder="Search events by title, venue, or description..."
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
              <option value="reunion">Reunions</option>
              <option value="workshop">Workshops</option>
              <option value="networking">Networking</option>
              <option value="webinar">Webinars</option>
              <option value="social">Social</option>
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

      {/* Main Display: Bento Cards View or Structured Table View */}
      {viewMode === 'cards' ? (
        filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-2xs">
            <Calendar className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-stone-900">No Events Found</h3>
            <p className="text-xs text-stone-500 mt-1">No gatherings match your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {filteredEvents.map((ev, idx) => (
              <div
                key={ev.id}
                className={`group relative overflow-hidden bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#8B181B]/40 transition-all duration-200 flex flex-col justify-between ${
                  idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                <div>
                  <div className={`relative w-full overflow-hidden bg-stone-100 ${idx === 0 ? 'h-52 sm:h-64' : 'h-44'}`}>
                    <img
                      src={ev.heroImageUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-900/80 text-white backdrop-blur-md border border-white/10 shadow-xs">
                        {ev.type}
                      </span>
                      {ev.isVirtual && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1 shadow-xs">
                          <Video className="w-3 h-3" />
                          <span>Virtual</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#8B181B] text-white shadow-xs">
                        {ev.startDate
                          ? new Date(ev.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'TBA'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-base sm:text-xl font-bold font-serif text-white drop-shadow-xs line-clamp-1 leading-snug">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-stone-200 line-clamp-1 mt-0.5 text-shadow-xs flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                        <span>{ev.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-3 sm:px-5 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-stone-700 font-semibold">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>{ev.attendeesCount || 0} RSVPs</span>
                  </div>

                  {permissions.canDeleteEvents && (
                    <button
                      onClick={() => setEventToDelete({ id: ev.id, title: ev.title })}
                      title="Delete Event"
                      className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Structured Dense Table View */
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Event Title & Category</th>
                  <th className="p-3.5">Date & Schedule</th>
                  <th className="p-3.5">Location / Format</th>
                  <th className="p-3.5">RSVP Count</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-stone-500">
                      No events scheduled matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                            <img
                              src={ev.heroImageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-stone-900 truncate font-serif">{ev.title}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-stone-100 text-stone-600 border border-stone-200">
                              {ev.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-stone-800 font-medium">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>
                            {ev.startDate
                              ? new Date(ev.startDate).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : 'Date TBA'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {ev.startDate
                            ? new Date(ev.startDate).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ''}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-stone-800">
                          {ev.isVirtual ? (
                            <Video className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-[#8B181B]" />
                          )}
                          <span className="truncate max-w-[200px]">{ev.location}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <Users className="w-3 h-3" />
                          <span>{ev.attendeesCount || 0} RSVPs</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        {permissions.canDeleteEvents && (
                          <button
                            onClick={() => setEventToDelete({ id: ev.id, title: ev.title })}
                            title="Delete Event"
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

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-stone-900">+ Add Campus Event</h3>
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
                <label className="block text-xs font-bold text-stone-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grand Alumni Homecoming 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none cursor-pointer"
                  >
                    <option value="reunion">Reunion</option>
                    <option value="workshop">Workshop</option>
                    <option value="networking">Networking</option>
                    <option value="webinar">Webinar</option>
                    <option value="social">Social</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Max Attendees</label>
                  <input
                    type="number"
                    value={formMaxAttendees}
                    onChange={(e) => setFormMaxAttendees(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Location / Venue</label>
                <input
                  type="text"
                  placeholder="e.g. St. Cecilia College Quadrangle, Minglanilla"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Event details, schedule outline, guidelines..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
                />
              </div>

              {/* Event Hero Photo / Cover Upload (Saved directly to database) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#8B181B]" />
                    <span>Upload Event Hero Photo / Banner</span>
                    <span className="text-[10px] font-normal text-stone-500">(Direct database sync)</span>
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

                {formHeroImage ? (
                  <div className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs">
                    <img
                      src={formHeroImage}
                      alt="Event hero banner preview"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-emerald-900/85 backdrop-blur-xs text-white rounded-md text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                      <Check className="w-3 h-3 text-emerald-300 stroke-[2.5]" />
                      <span>Ready for Database</span>
                    </div>
                    {photoFileName && (
                      <div className="absolute bottom-2 left-2 right-2 px-2.5 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded-md text-[10px] truncate">
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
                        <span>Replace Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormHeroImage('');
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
                        <span className="text-xs font-medium">Optimizing photo for database storage...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-1">
                        <div className="w-9 h-9 rounded-full bg-red-50 text-[#8B181B] border border-red-100 flex items-center justify-center mb-1.5 shadow-2xs">
                          <Upload className="w-4 h-4 stroke-[1.75]" />
                        </div>
                        <span className="text-xs font-bold text-stone-800">
                          Click to upload event photo or drag & drop
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
                      value={formHeroImage}
                      onChange={(e) => {
                        setFormHeroImage(e.target.value);
                        setPhotoFileName('');
                      }}
                      placeholder="Or enter direct image URL: https://..."
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#8B181B] outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="form-is-virtual"
                  checked={formIsVirtual}
                  onChange={(e) => setFormIsVirtual(e.target.checked)}
                  className="rounded border-stone-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="form-is-virtual" className="text-xs text-stone-700 cursor-pointer select-none">
                  This is an online / virtual event (Zoom, Google Meet)
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
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">Delete Event</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-stone-900">{eventToDelete.title}</span>? This will cancel RSVPs and remove the event listing.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEventToDelete(null)}
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
