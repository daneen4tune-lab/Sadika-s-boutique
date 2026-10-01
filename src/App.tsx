import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TranslationProvider } from './context/TranslationContext';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Header } from './components/common/Header';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OwnerAuthGateModal } from './components/common/OwnerAuthGateModal';
import { Lock, ShieldAlert, ArrowLeft } from 'lucide-react';

function StudioApp() {
  const { currentView, setCurrentView, isOwnerAuthenticated, setIsOwnerAuthenticated } = useStudio();
  const { isAdmin } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAiIntakeOpen, setIsAiIntakeOpen] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);

  const isOwner = isAdmin || isOwnerAuthenticated;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2424] flex flex-col font-sans selection:bg-[#EEDCDA] selection:text-[#2D2424]">
      {/* Universal Boutique Atelier Header */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAiIntake={() => setIsAiIntakeOpen(true)}
      />

      {/* Main View: Customer Boutique Portal vs Sadika's Atelier Dashboard */}
      <div className="flex-1">
        {currentView === 'customer' ? (
          <CustomerPortal />
        ) : isOwner ? (
          <AdminDashboard
            isAiIntakeOpen={isAiIntakeOpen}
            onCloseAiIntake={() => setIsAiIntakeOpen(false)}
            onOpenAiIntake={() => setIsAiIntakeOpen(true)}
          />
        ) : (
          /* Privacy Guard for Unauthorized Access Attempt */
          <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-[#2D2424] font-medium">
                Atelier Access Restricted
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5E59] leading-relaxed">
                Sadika's Atelier Dashboard contains confidential client measurements, bespoke cutting calendars, and private financial records. Access is restricted to authorized studio personnel only.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCurrentView('customer')}
                className="px-5 py-2.5 bg-white hover:bg-stone-50 border border-[#E8DFD8] text-[#2D2424] rounded-xl text-xs font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Customer Portal</span>
              </button>
              <button
                onClick={() => setIsGateOpen(true)}
                className="px-5 py-2.5 bg-[#2D2424] hover:bg-[#4A3E3D] text-white rounded-xl text-xs font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#9E616B]" />
                <span>Owner Sign-In</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Automated Dispatch Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Owner Auth Gate Modal */}
      <OwnerAuthGateModal
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        onSuccess={() => {
          setIsOwnerAuthenticated(true);
          setIsGateOpen(false);
          setCurrentView('admin');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TranslationProvider>
        <StudioProvider>
          <StudioApp />
        </StudioProvider>
      </TranslationProvider>
    </AuthProvider>
  );
}


