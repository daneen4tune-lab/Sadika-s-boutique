import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { useTranslation } from '../../context/TranslationContext';
import { ServicesShowcase } from './ServicesShowcase';
import { EnquiryBookingWizard } from './EnquiryBookingWizard';
import { CustomerOrderTracker } from './CustomerOrderTracker';
import { PoliciesModal } from './PoliciesModal';
import { BoutiqueChatbot } from './BoutiqueChatbot';
import { ServiceDefinition } from '../../types';
import {
  Calendar,
  Clock,
  Scissors,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  PackageCheck,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const { settings, services, setCurrentView } = useStudio();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'services' | 'tracker' | 'booking'>('services');
  const [selectedService, setSelectedService] = useState<ServiceDefinition | null>(null);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState<boolean>(false);

  const handleStartBooking = (service?: ServiceDefinition) => {
    if (service) setSelectedService(service);
    setActiveTab('booking');
  };

  const handleSelectServiceFromChat = (serviceCategoryName: string) => {
    const matched = services.find(
      (s) =>
        s.category.toLowerCase().includes(serviceCategoryName.toLowerCase()) ||
        s.title.toLowerCase().includes(serviceCategoryName.toLowerCase())
    );
    if (matched) setSelectedService(matched);
    setActiveTab('booking');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Editorial Boutique Hero Section */}
      <div className="relative border-b border-[#E8DFD8] bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5] to-[#F3ECE4]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          {/* Subtle Atelier Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7E7E6] border border-[#E8DFD8] text-[#9E616B] text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('heroTag', 'Artisanal Dressmaking & Couture Atelier · Cape Town')}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-[#2D2424] font-normal tracking-tight max-w-4xl mx-auto leading-[1.1]">
            {t('heroHeadline', 'Where your most cherished moments are tailored to perfection.')}
          </h1>

          <p className="mt-6 text-sm sm:text-base text-[#6B5E59] max-w-2xl mx-auto leading-relaxed">
            {t(
              'heroSubhead',
              'Specialising in custom bridal gowns, show-stopping matric ball couture, festive occasion wear, and master alterations. Individually draped and handcrafted by Sadika Karbary.'
            )}
          </p>

          {/* Quick Stats & Core Policies Pill-free Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B5E59] max-w-3xl mx-auto pt-6 border-t border-[#E8DFD8]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#9E616B]" />
              <span>{t('leadTimeCallout', 'Recommended Lead Time: 2–3 Months Ahead')}</span>
            </div>
            <div className="hidden sm:inline" aria-hidden="true">·</div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#9E616B]" />
              <span>{t('tradingHoursCallout', 'Trading Hours: Mon–Fri, 09:00 – 17:00')}</span>
            </div>
            <div className="hidden sm:inline" aria-hidden="true">·</div>
            <div className="flex items-center gap-1.5 text-stone-700">
              <PackageCheck className="w-4 h-4 text-[#9E616B]" />
              <span>{t('fabricRuleCallout', 'Fabric Delivery Confirms Booking Slot')}</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleStartBooking()}
              className="px-6 py-3 bg-[#2D2424] hover:bg-[#4A3E3D] text-white rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>{t('bookConsultationBtn', 'Submit Enquiry & Book Fitting')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('tracker')}
              className="px-6 py-3 bg-white hover:bg-[#F7E7E6] text-[#2D2424] border border-[#E8DFD8] hover:border-[#D4C5B9] rounded-lg text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer"
            >
              {t('trackOrderBtn', 'Track Existing Order & Appointments')}
            </button>

            <button
              onClick={() => setIsPoliciesOpen(true)}
              className="px-4 py-3 text-stone-600 hover:text-[#2D2424] text-xs sm:text-sm font-medium cursor-pointer"
            >
              {t('policiesBtn', 'Studio Policies & Hours')}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Navigation Bar */}
      <div className="border-b border-[#E8DFD8] bg-white sticky top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('services')}
                className={`px-4 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'services'
                    ? 'border-[#9E616B] text-[#2D2424]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {t('servicesTab', 'Atelier Services')}
              </button>
              <button
                onClick={() => setActiveTab('booking')}
                className={`px-4 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'booking'
                    ? 'border-[#9E616B] text-[#2D2424]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {t('bookingTab', 'Enquire & Book')}
              </button>
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'tracker'
                    ? 'border-[#9E616B] text-[#2D2424]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {t('myOrdersTab', 'My Orders & Appointments')}
              </button>
            </div>

            <div className="text-right hidden md:block">
              <span className="text-[11px] text-stone-400">
                Cape Town Atelier · By Appointment Only (Mon–Fri)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      <main className="pb-24">
        {activeTab === 'services' && (
          <ServicesShowcase
            onSelectService={(srv) => {
              setSelectedService(srv);
              setActiveTab('booking');
            }}
          />
        )}

        {activeTab === 'booking' && (
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <EnquiryBookingWizard
              initialService={selectedService}
              onSuccess={() => setActiveTab('tracker')}
              onCancel={() => setActiveTab('services')}
            />
          </div>
        )}

        {activeTab === 'tracker' && (
          <CustomerOrderTracker onOpenPolicies={() => setIsPoliciesOpen(true)} />
        )}
      </main>

      {/* AI-Powered Chatbot Concierge Widget */}
      <BoutiqueChatbot onSelectServiceAndBook={handleSelectServiceFromChat} />

      {/* Policies Modal */}
      <PoliciesModal
        isOpen={isPoliciesOpen}
        onClose={() => setIsPoliciesOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-[#E8DFD8] bg-[#FAF8F5] py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Sadika's Bridal Boutique. Owned & Operated by Sadika Karbary.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPoliciesOpen(true)}
              className="hover:text-stone-800 hover:underline cursor-pointer"
            >
              Operating Hours & Policies
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentView('admin')}
              className="text-[#9E616B] font-medium hover:underline cursor-pointer"
            >
              Switch to Owner Atelier Dashboard →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
