import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Check, Sliders } from 'lucide-react';

interface PrivacyConsentCardProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const PrivacyConsentCard: React.FC<PrivacyConsentCardProps> = ({
  forceOpen = false,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [cookiePrefs, setCookiePrefs] = useState({
    essential: true,
    analytics: true,
    marketing: false
  });

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    const accepted = localStorage.getItem('cecilian_privacy_accepted');
    if (!accepted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleAccept = () => {
    localStorage.setItem('cecilian_privacy_accepted', 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cecilian_privacy_accepted', 'true');
    localStorage.setItem('cecilian_cookie_prefs', JSON.stringify(cookiePrefs));
    setShowOptionsModal(false);
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="privacy-consent-card"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 flex justify-end"
          >
            <div className="[--shadow:rgba(60,64,67,0.3)_0_1px_2px_0,rgba(60,64,67,0.15)_0_2px_6px_2px] w-full sm:w-[320px] max-w-[320px] h-auto rounded-2xl bg-white [box-shadow:var(--shadow)] border border-stone-200/80">
              <div className="flex flex-col items-center justify-between pt-9 px-6 pb-6 relative">
                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (onClose) onClose();
                  }}
                  className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100 transition-colors"
                  aria-label="Dismiss Privacy Notice"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Shield / Cookie emblem SVG */}
                <span className="relative mx-auto -mt-16 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" height={46} width={65}>
                    <path
                      stroke="#000"
                      fill="#EAB789"
                      d="M49.157 15.69L44.58.655l-12.422 1.96L21.044.654l-8.499 2.615-6.538 5.23-4.576 9.153v11.114l4.576 8.5 7.846 5.23 10.46 1.96 7.845-2.614 9.153 2.615 11.768-2.615 7.846-7.846 1.96-5.884.655-7.191-7.846-1.308-6.537-3.922z"
                    />
                    <path
                      fill="#9C6750"
                      d="M32.286 3.749c-6.94 3.65-11.69 11.053-11.69 19.591 0 8.137 4.313 15.242 10.724 19.052a20.513 20.513 0 01-8.723 1.937c-11.598 0-21-9.626-21-21.5 0-11.875 9.402-21.5 21-21.5 3.495 0 6.79.874 9.689 2.42z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    />
                    <path
                      fill="#634647"
                      d="M64.472 20.305a.954.954 0 00-1.172-.824 4.508 4.508 0 01-3.958-.934.953.953 0 00-1.076-.11c-.46.252-.977.383-1.502.382a3.154 3.154 0 01-2.97-2.11.954.954 0 00-.833-.634 4.54 4.54 0 01-4.205-4.507c.002-.23.022-.46.06-.687a.952.952 0 00-.213-.767 3.497 3.497 0 01-.614-3.5.953.953 0 00-.382-1.138 3.522 3.522 0 01-1.5-3.992.951.951 0 00-.762-1.227A22.611 22.611 0 0032.3 2.16 22.41 22.41 0 0022.657.001a22.654 22.654 0 109.648 43.15 22.644 22.644 0 0032.167-22.847zM22.657 43.4a20.746 20.746 0 110-41.493c2.566-.004 5.11.473 7.501 1.407a22.64 22.64 0 00.003 38.682 20.6 20.6 0 01-7.504 1.404zm19.286 0a20.746 20.746 0 112.131-41.384 5.417 5.417 0 001.918 4.635 5.346 5.346 0 00-.133 1.182A5.441 5.441 0 0046.879 11a5.804 5.804 0 00-.028.568 6.456 6.456 0 005.38 6.345 5.053 5.053 0 006.378 2.472 6.412 6.412 0 004.05 1.12 20.768 20.768 0 01-20.716 21.897z"
                    />
                    <path
                      fill="#644647"
                      d="M54.962 34.3a17.719 17.719 0 01-2.602 2.378.954.954 0 001.14 1.53 19.637 19.637 0 002.884-2.634.955.955 0 00-1.422-1.274z"
                    />
                    <path
                      strokeWidth="1.8"
                      stroke="#644647"
                      fill="#845556"
                      d="M44.5 32.829c-.512 0-1.574.215-2 .5-.426.284-.342.263-.537.736a2.59 2.59 0 104.98.99c0-.686-.458-1.241-.943-1.726-.485-.486-.814-.5-1.5-.5zm-30.916-2.5c-.296 0-.912.134-1.159.311-.246.177-.197.164-.31.459a1.725 1.725 0 00-.086.932c.058.312.2.6.41.825.21.226.477.38.768.442.291.062.593.03.867-.092s.508-.329.673-.594a1.7 1.7 0 00.253-.896c0-.428-.266-.774-.547-1.076-.281-.302-.471-.31-.869-.311zm17.805-11.375c-.143-.492-.647-1.451-1.04-1.78-.392-.33-.348-.255-.857-.31a2.588 2.588 0 10.441 5.06c.66-.194 1.064-.788 1.395-1.39.33-.601.252-.92.06-1.58zm-22 2c-.143-.492-.647-1.451-1.04-1.78-.391-.33-.347-.255-.856-.31a2.589 2.589 0 10.44 5.06c.66-.194 1.064-.788 1.395-1.39.33-.601.252-.92.06-1.58zM38.112 7.329c-.395 0-1.216.179-1.545.415-.328.236-.263.218-.415.611-.151.393-.19.826-.114 1.243.078.417.268.8.548 1.1.28.301.636.506 1.024.59.388.082.79.04 1.155-.123.366-.163.678-.438.898-.792.22-.354.337-.77.337-1.195 0-.57-.354-1.031-.73-1.434-.374-.403-.628-.415-1.158-.415zm-19.123.703c.023-.296-.062-.92-.219-1.18-.157-.26-.148-.21-.432-.347a1.726 1.726 0 00-.922-.159 1.654 1.654 0 00-.856.344 1.471 1.471 0 00-.501.73c-.085.285-.077.589.023.872.1.282.287.532.538.718a1.7 1.7 0 00.873.323c.427.033.793-.204 1.116-.46.324-.256.347-.445.38-.841z"
                    />
                    <path
                      fill="#634647"
                      d="M15.027 15.605a.954.954 0 00-1.553 1.108l1.332 1.863a.955.955 0 001.705-.77.955.955 0 00-.153-.34l-1.331-1.861z"
                    />
                    <path
                      fill="#644647"
                      d="M43.31 23.21a.954.954 0 101.553-1.11l-1.266-1.772a.954.954 0 10-1.552 1.11l1.266 1.772z"
                    />
                    <path
                      fill="#634647"
                      d="M19.672 35.374a.954.954 0 00-.954.953v2.363a.954.954 0 001.907 0v-2.362a.954.954 0 00-.953-.954z"
                    />
                    <path
                      fill="#644647"
                      d="M33.129 29.18l-2.803 1.065a.953.953 0 00-.053 1.764.957.957 0 00.73.022l2.803-1.065a.953.953 0 00-.677-1.783v-.003zm24.373-3.628l-2.167.823a.956.956 0 00-.054 1.764.954.954 0 00.73.021l2.169-.823a.954.954 0 10-.678-1.784v-.001z"
                    />
                  </svg>
                </span>

                <h5 className="text-sm font-semibold mb-2 text-left mr-auto text-zinc-700">
                  Your privacy is important to us
                </h5>
                <p className="w-full mb-4 text-xs text-stone-600 leading-relaxed text-justify">
                  We process your personal information to measure and improve our sites and
                  services, to assist our campaigns and to provide personalised content.
                  <br />
                  For more information see our{' '}
                  <button
                    type="button"
                    onClick={() => setShowOptionsModal(true)}
                    className="inline cursor-pointer font-semibold transition-colors hover:text-[#634647] text-[#8B181B] underline underline-offset-2"
                  >
                    Privacy Policy
                  </button>
                </p>

                <div className="w-full flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowOptionsModal(true)}
                    className="text-xs text-zinc-600 cursor-pointer font-semibold transition-colors hover:text-[#634647] hover:underline underline-offset-2"
                  >
                    More Options
                  </button>

                  <button
                    type="button"
                    onClick={handleAccept}
                    className="font-semibold cursor-pointer py-1.5 px-6 w-max break-keep text-xs rounded-lg transition-colors text-[#634647] hover:text-[#ddad81] bg-[#ddad81] hover:bg-[#634647] active:scale-95 shadow-2xs"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* More Options / Detailed Privacy Modal */}
      {showOptionsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-[#8B181B]">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Privacy & Consent Preferences</h4>
                  <p className="text-[11px] text-stone-500">St. Cecilia's College Alumni Data Protection</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOptionsModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <span>Strictly Necessary Services</span>
                    <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-semibold">Always Active</span>
                  </div>
                  <p className="text-stone-500 text-[11px] mt-1">
                    Required for member authentication, security credentials, session integrity, and registrar verification.
                  </p>
                </div>
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-stone-800">Alumni Directory & Analytics</div>
                  <p className="text-stone-500 text-[11px] mt-1">
                    Allows us to analyze batch distribution and improve reunion invitations and portal features.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={cookiePrefs.analytics}
                  onChange={(e) => setCookiePrefs({ ...cookiePrefs, analytics: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded text-[#8B181B] focus:ring-[#8B181B] cursor-pointer"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-stone-800">Career & Institutional Bulletins</div>
                  <p className="text-stone-500 text-[11px] mt-1">
                    Enables targeted job opportunities from partner employers and tailored homecoming announcements.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={cookiePrefs.marketing}
                  onChange={(e) => setCookiePrefs({ ...cookiePrefs, marketing: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded text-[#8B181B] focus:ring-[#8B181B] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowOptionsModal(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#8B181B] hover:bg-[#721316] rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrivacyConsentCard;
