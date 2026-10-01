import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { OverviewTab } from './OverviewTab';
import { EnquiriesTab } from './EnquiriesTab';
import { CustomersTab } from './CustomersTab';
import { CalendarTab } from './CalendarTab';
import { OrdersTab } from './OrdersTab';
import { InvoicesTab } from './InvoicesTab';
import { ServicesTab } from './ServicesTab';
import { SettingsTab } from './SettingsTab';
import { QuickAiIntakeModal } from './QuickAiIntakeModal';
import { Customer, Order } from '../../types';
import {
  LayoutDashboard,
  Inbox,
  Users,
  Calendar,
  Scissors,
  CreditCard,
  Tag,
  Settings,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface AdminDashboardProps {
  isAiIntakeOpen: boolean;
  onCloseAiIntake: () => void;
  onOpenAiIntake: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isAiIntakeOpen,
  onCloseAiIntake,
  onOpenAiIntake,
}) => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    setCurrentView,
    metrics,
    isAuthorizedUser,
    setIsAuthorizedUser,
  } = useStudio();

  // Navigation state passed between tabs (e.g. creating invoice for an order)
  const [initialOrderForInvoice, setInitialOrderForInvoice] = useState<Order | null>(null);

  const handleCreateInvoiceForOrder = (order: Order) => {
    setInitialOrderForInvoice(order);
    setActiveAdminTab('invoices');
  };

  const handleNewOrderForCustomer = (customer: Customer) => {
    setActiveAdminTab('orders');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'enquiries',
      label: 'Enquiries',
      icon: Inbox,
      badge: metrics.newEnquiriesCount > 0 ? metrics.newEnquiriesCount : undefined,
    },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'calendar', label: 'Calendar & Diary', icon: Calendar },
    {
      id: 'orders',
      label: 'Orders Workflow',
      icon: Scissors,
      badge: metrics.ordersInProductionCount > 0 ? metrics.ordersInProductionCount : undefined,
    },
    {
      id: 'invoices',
      label: 'Invoices & Billing',
      icon: CreditCard,
      badge:
        metrics.overdueInvoicesCount > 0
          ? `${metrics.overdueInvoicesCount} overdue`
          : metrics.ordersNeedingInvoicesCount > 0
          ? 'Needs bill'
          : undefined,
      badgeUrgent: metrics.overdueInvoicesCount > 0,
    },
    { id: 'services', label: 'Services Catalog', icon: Tag },
    { id: 'settings', label: 'Business Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Admin Secondary Bar */}
      <div className="bg-white border-b border-[#E8DFD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeAdminTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id !== 'invoices') setInitialOrderForInvoice(null);
                      setActiveAdminTab(item.id);
                    }}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#2D2424] text-white shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-[#9E616B] text-white'
                            : item.badgeUrgent
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="hidden xl:flex items-center gap-3 shrink-0 pl-4 border-l border-[#E8DFD8]">
              <button
                onClick={() => setCurrentView('customer')}
                className="text-xs text-[#9E616B] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Preview Customer Portal</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeAdminTab === 'overview' && (
          <OverviewTab
            onNavigateTab={(tab) => {
              if (tab !== 'invoices') setInitialOrderForInvoice(null);
              setActiveAdminTab(tab);
            }}
            onOpenQuickAiIntake={onOpenAiIntake}
          />
        )}

        {activeAdminTab === 'enquiries' && (
          <EnquiriesTab
            onOpenQuickAiIntake={onOpenAiIntake}
            onNavigateTab={(tab) => setActiveAdminTab(tab)}
          />
        )}

        {activeAdminTab === 'customers' && (
          <CustomersTab onNewOrderForCustomer={handleNewOrderForCustomer} />
        )}

        {activeAdminTab === 'calendar' && <CalendarTab />}

        {activeAdminTab === 'orders' && (
          <OrdersTab onCreateInvoiceForOrder={handleCreateInvoiceForOrder} />
        )}

        {activeAdminTab === 'invoices' && (
          <InvoicesTab initialOrderForInvoice={initialOrderForInvoice} />
        )}

        {activeAdminTab === 'services' && <ServicesTab />}

        {activeAdminTab === 'settings' && <SettingsTab />}
      </main>

      {/* Quick AI WhatsApp Intake Modal */}
      <QuickAiIntakeModal
        isOpen={isAiIntakeOpen}
        onClose={onCloseAiIntake}
        onComplete={(enquiryId) => {
          setActiveAdminTab('enquiries');
        }}
      />
    </div>
  );
};
