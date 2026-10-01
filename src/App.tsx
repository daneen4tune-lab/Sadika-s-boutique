import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TranslationProvider } from './context/TranslationContext';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Header } from './components/common/Header';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';

function StudioApp() {
  const { currentView } = useStudio();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAiIntakeOpen, setIsAiIntakeOpen] = useState(false);

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
        ) : (
          <AdminDashboard
            isAiIntakeOpen={isAiIntakeOpen}
            onCloseAiIntake={() => setIsAiIntakeOpen(false)}
            onOpenAiIntake={() => setIsAiIntakeOpen(true)}
          />
        )}
      </div>

      {/* Automated Dispatch Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
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


