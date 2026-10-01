import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../lib/i18n';
import {
  Bell,
  Sparkles,
  User,
  Scissors,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  LogOut,
  Database,
  Globe,
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenAiIntake?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications, onOpenAiIntake }) => {
  const {
    currentView,
    setCurrentView,
    settings,
    notifications,
    metrics,
    isAuthorizedUser,
    setIsAuthorizedUser,
    isFirestoreLive,
  } = useStudio();

  const { user, isAdmin, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const { language, setLanguage, t } = useTranslation();

  const unreadCount = notifications.slice(0, 5).length;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8DFD8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Monogram */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#D4C5B9] bg-[#F7E7E6] flex items-center justify-center text-[#9E616B] font-serif text-xl font-medium shadow-xs">
              S
            </div>
            <div>
              <button
                onClick={() => setCurrentView('customer')}
                className="text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl tracking-wide text-[#2D2424] font-medium group-hover:text-[#9E616B] transition-colors">
                    {t('atelierTitle', "Sadika's Bridal Boutique")}
                  </span>
                  {isFirestoreLive && (
                    <span
                      title="Connected to Firebase Firestore"
                      className="hidden sm:inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                    >
                      <Database className="w-2.5 h-2.5" />
                      <span>Firestore Live</span>
                    </span>
                  )}
                </div>
                <span className="block text-[11px] tracking-widest uppercase text-[#6B5E59]">
                  Sadika Karbary · Bespoke Couture · Mon–Fri
                </span>
              </button>
            </div>
          </div>

          {/* Mode Switcher, Translation, Auth & Quick Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Translation Language Selector */}
            <div className="flex items-center gap-1 px-2 py-1 bg-[#F3ECE4] rounded-lg border border-[#E8DFD8]">
              <Globe className="w-3.5 h-3.5 text-[#9E616B]" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs font-medium text-[#2D2424] focus:outline-none cursor-pointer"
                title="Select Language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Switcher Pill-free Segmented Control */}
            <div className="flex items-center p-1 bg-[#F3ECE4] rounded-lg border border-[#E8DFD8]">
              <button
                onClick={() => setCurrentView('customer')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  currentView === 'customer'
                    ? 'bg-white text-[#2D2424] shadow-xs font-semibold'
                    : 'text-[#6B5E59] hover:text-[#2D2424]'
                }`}
              >
                Customer Portal
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-white text-[#2D2424] shadow-xs font-semibold'
                    : 'text-[#6B5E59] hover:text-[#2D2424]'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 text-[#9E616B]" />
                <span>Sadika’s Atelier</span>
                {metrics.newEnquiriesCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-[#9E616B] rounded-full">
                    {metrics.newEnquiriesCount}
                  </span>
                )}
              </button>
            </div>

            {/* Quick AI Intake button when in admin mode */}
            {currentView === 'admin' && onOpenAiIntake && (
              <button
                onClick={onOpenAiIntake}
                title="Paste raw WhatsApp text to extract with Gemini AI"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#9E616B] bg-[#F7E7E6] hover:bg-[#EEDCDA] rounded-md border border-[#E8DFD8] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI WhatsApp Intake</span>
              </button>
            )}

            {/* Confidential measurements authorization toggle */}
            {currentView === 'admin' && (
              <button
                onClick={() => setIsAuthorizedUser(!isAuthorizedUser)}
                title={
                  isAuthorizedUser
                    ? 'Authorized Mode (Measurements visible)'
                    : 'Restricted Mode (Personal data masked)'
                }
                className={`p-2 rounded-md border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                  isAuthorizedUser
                    ? 'bg-stone-50 border-stone-300 text-stone-700'
                    : 'bg-amber-50 border-amber-300 text-amber-800'
                }`}
              >
                {isAuthorizedUser ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                )}
                <span className="hidden xl:inline text-[11px]">
                  {isAuthorizedUser ? 'Authorised Access' : 'Privacy Gate'}
                </span>
              </button>
            )}

            {/* Google Authentication with Firebase */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-[#E8DFD8]">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-[#D4C5B9] object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#9E616B] text-white flex items-center justify-center text-xs font-semibold">
                    {user.displayName ? user.displayName[0] : 'U'}
                  </div>
                )}
                <div className="hidden md:block text-left text-xs leading-tight">
                  <span className="font-medium text-[#2D2424] block truncate max-w-[120px]">
                    {user.displayName || user.email}
                  </span>
                  <span className="text-[10px] text-stone-500 block">
                    {isAdmin ? 'Studio Owner' : 'Signed In'}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  title="Sign out of Firebase"
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                disabled={authLoading}
                className="px-3 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#2D2424] border border-[#E8DFD8] hover:border-[#D4C5B9] rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-[#9E616B]" />
                <span className="hidden sm:inline">Google Sign-in</span>
              </button>
            )}

            {/* Notifications Drawer Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-[#6B5E59] hover:text-[#2D2424] hover:bg-[#F3ECE4] rounded-md transition-colors cursor-pointer"
              title="Automated Customer Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#9E616B] ring-2 ring-[#FAF8F5]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
