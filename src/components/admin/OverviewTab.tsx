import React from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Inbox,
  Calendar,
  Clock,
  Scissors,
  CreditCard,
  AlertTriangle,
  FilePlus,
  UserPlus,
  Sparkles,
  ArrowRight,
  PackageCheck,
  CheckCircle2,
  Phone,
} from 'lucide-react';

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
  onOpenQuickAiIntake: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  onNavigateTab,
  onOpenQuickAiIntake,
}) => {
  const {
    metrics,
    enquiries,
    appointments,
    orders,
    invoices,
    settings,
    toggleFabricReceived,
  } = useStudio();

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's appointments
  const todayAppointments = appointments.filter(
    (a) => a.date === todayStr && a.status !== 'Cancelled'
  );

  // Upcoming fittings in next 7 days
  const upcomingFittings = appointments
    .filter(
      (a) =>
        a.date >= todayStr &&
        a.status !== 'Cancelled' &&
        a.type.toLowerCase().includes('fitting')
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  // Upcoming event dates (urgency countdown)
  const upcomingEvents = orders
    .filter((o) => o.status !== 'Completed' && o.eventDate >= todayStr)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .slice(0, 5);

  // Orders needing invoices (the owner's biggest admin headache)
  const ordersNeedingInvoices = orders.filter(
    (o) =>
      (o.status === 'Fabric Received' ||
        o.status === 'Fitting' ||
        o.status === 'In Production' ||
        o.status === 'Final Fitting') &&
      (!o.invoiceId || !invoices.some((i) => i.id === o.invoiceId))
  );

  return (
    <div className="space-y-8">
      {/* Welcome & Atelier Quick Action Bar */}
      <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
            <span>Sadika's Bridal Boutique Dashboard</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">Operating Hours: Mon–Fri 09:00–17:00</span>
          </div>
          <h2 className="font-serif text-3xl text-[#2D2424] font-medium">
            Welcome back, {settings.ownerName}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5E59] mt-1 max-w-2xl leading-relaxed">
            Your centralized couture diary, cutting calendar, customer registry, and automated invoice control.
          </p>
        </div>

        {/* Quick Atelier Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenQuickAiIntake}
            className="px-4 py-2.5 bg-[#9E616B] hover:bg-[#864F58] text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI WhatsApp Intake</span>
          </button>

          <button
            onClick={() => onNavigateTab('invoices')}
            className="px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#2D2424] border border-[#E8DFD8] hover:border-[#D4C5B9] rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5 text-[#9E616B]" />
            <span>New Invoice</span>
          </button>

          <button
            onClick={() => onNavigateTab('calendar')}
            className="px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#2D2424] border border-[#E8DFD8] hover:border-[#D4C5B9] rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#9E616B]" />
            <span>Diary & Calendar</span>
          </button>
        </div>
      </div>

      {/* CORE PROBLEM BANNER: Delayed Invoicing Alert */}
      {ordersNeedingInvoices.length > 0 && (
        <div className="bg-[#FAF0E6] border border-[#E0D2C7] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#9E616B] text-white rounded-lg shrink-0 mt-0.5">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-semibold text-[#2D2424]">
                Invoicing Attention Required ({ordersNeedingInvoices.length} Orders in Atelier)
              </h4>
              <p className="text-xs text-[#6B5E59] mt-0.5 leading-relaxed">
                You have active garments in production with fabric received where invoices have not yet been issued.
                Generate invoices promptly to secure deposits before sewing completes!
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('invoices')}
            className="px-4 py-2 bg-[#2D2424] text-white rounded-lg text-xs font-medium hover:bg-[#4A3E3D] transition-colors shrink-0 cursor-pointer"
          >
            Issue Invoices Now →
          </button>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* New Enquiries */}
        <div
          onClick={() => onNavigateTab('enquiries')}
          className="bg-white border border-[#E8DFD8] rounded-xl p-4 hover:border-[#9E616B] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">New Enquiries</span>
            <Inbox className="w-4 h-4 text-[#9E616B]" />
          </div>
          <span className="font-serif text-3xl font-medium text-[#2D2424] group-hover:text-[#9E616B] transition-colors block">
            {metrics.newEnquiriesCount}
          </span>
          <span className="text-[10px] text-stone-400 mt-1 block">Awaiting review</span>
        </div>

        {/* Today's Appointments */}
        <div
          onClick={() => onNavigateTab('calendar')}
          className="bg-white border border-[#E8DFD8] rounded-xl p-4 hover:border-[#9E616B] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Today's Slots</span>
            <Clock className="w-4 h-4 text-[#9E616B]" />
          </div>
          <span className="font-serif text-3xl font-medium text-[#2D2424] group-hover:text-[#9E616B] transition-colors block">
            {metrics.todayAppointmentsCount}
          </span>
          <span className="text-[10px] text-stone-400 mt-1 block">Mon–Fri fittings</span>
        </div>

        {/* Upcoming Fittings */}
        <div
          onClick={() => onNavigateTab('calendar')}
          className="bg-white border border-[#E8DFD8] rounded-xl p-4 hover:border-[#9E616B] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Upcoming Fittings</span>
            <Scissors className="w-4 h-4 text-[#9E616B]" />
          </div>
          <span className="font-serif text-3xl font-medium text-[#2D2424] group-hover:text-[#9E616B] transition-colors block">
            {metrics.upcomingFittingsCount}
          </span>
          <span className="text-[10px] text-stone-400 mt-1 block">This week</span>
        </div>

        {/* Orders in Production */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white border border-[#E8DFD8] rounded-xl p-4 hover:border-[#9E616B] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">In Production</span>
            <Scissors className="w-4 h-4 text-[#9E616B]" />
          </div>
          <span className="font-serif text-3xl font-medium text-[#2D2424] group-hover:text-[#9E616B] transition-colors block">
            {metrics.ordersInProductionCount}
          </span>
          <span className="text-[10px] text-stone-400 mt-1 block">On cutting tables</span>
        </div>

        {/* Outstanding Invoices */}
        <div
          onClick={() => onNavigateTab('invoices')}
          className="bg-white border border-[#E8DFD8] rounded-xl p-4 hover:border-[#9E616B] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Outstanding</span>
            <CreditCard className="w-4 h-4 text-[#9E616B]" />
          </div>
          <span className="font-serif text-3xl font-medium text-[#2D2424] group-hover:text-[#9E616B] transition-colors block">
            {metrics.outstandingInvoicesCount}
          </span>
          <span className="text-[10px] text-stone-400 mt-1 block">
            R{metrics.outstandingInvoicesAmount.toLocaleString()} total
          </span>
        </div>

        {/* Overdue Invoices */}
        <div
          onClick={() => onNavigateTab('invoices')}
          className={`border rounded-xl p-4 transition-all cursor-pointer shadow-xs group ${
            metrics.overdueInvoicesCount > 0
              ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
              : 'bg-white border-[#E8DFD8]'
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-rose-800">
              Overdue
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <span className="font-serif text-3xl font-medium text-rose-900 group-hover:text-rose-700 transition-colors block">
            {metrics.overdueInvoicesCount}
          </span>
          <span className="text-[10px] text-rose-700 mt-1 block">
            R{metrics.overdueInvoicesAmount.toLocaleString()} unpaid
          </span>
        </div>

        {/* Invoices Needing Issuance */}
        <div
          onClick={() => onNavigateTab('invoices')}
          className="bg-white border border-[#E8DFD8] rounded-xl p-4 hover:border-[#9E616B] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-800">
              Needs Invoice
            </span>
            <FilePlus className="w-4 h-4 text-amber-600" />
          </div>
          <span className="font-serif text-3xl font-medium text-amber-900 block">
            {metrics.ordersNeedingInvoicesCount}
          </span>
          <span className="text-[10px] text-stone-400 mt-1 block">Delayed invoicing</span>
        </div>
      </div>

      {/* Main Two-Column Atelier Schedule & Orders Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Today's Appointments & Upcoming Fittings */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F3ECE4] mb-4">
              <div>
                <h3 className="font-serif text-xl font-medium text-[#2D2424]">
                  Today’s Atelier Schedule
                </h3>
                <p className="text-xs text-[#6B5E59]">
                  {new Date().toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-xs text-[#9E616B] hover:underline font-medium cursor-pointer"
              >
                View Full Calendar →
              </button>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs">
                No consultations or fittings scheduled for today.
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-[#9E616B]">
                          {apt.time}
                        </span>
                        <span className="text-xs font-medium text-[#2D2424]">
                          {apt.customerName}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B5E59]">{apt.type}</p>
                      {apt.notes && (
                        <p className="text-[10px] text-stone-400 mt-0.5 italic">
                          Note: {apt.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-stone-500">
                        {apt.customerPhone}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Fittings */}
          <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F3ECE4] mb-4">
              <h3 className="font-serif text-xl font-medium text-[#2D2424]">
                Upcoming Fittings This Week
              </h3>
              <span className="text-xs text-stone-400">Strictly 45-min slots</span>
            </div>

            <div className="space-y-2.5">
              {upcomingFittings.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#9E616B] font-semibold">
                      {apt.date}
                    </span>
                    <div>
                      <span className="font-medium text-[#2D2424] block">
                        {apt.customerName}
                      </span>
                      <span className="text-[11px] text-[#6B5E59]">{apt.type}</span>
                    </div>
                  </div>
                  <span className="font-mono text-stone-500">{apt.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Event Dates & In Production Tracker */}
        <div className="space-y-6">
          {/* Upcoming Event Dates (Milestone deadlines) */}
          <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F3ECE4] mb-4">
              <div>
                <h3 className="font-serif text-xl font-medium text-[#2D2424]">
                  Upcoming Client Event Dates
                </h3>
                <p className="text-xs text-[#6B5E59]">
                  Critical delivery targets sorted by urgency
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('orders')}
                className="text-xs text-[#9E616B] hover:underline font-medium cursor-pointer"
              >
                All Orders →
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((ord) => {
                const now = new Date();
                const evt = new Date(ord.eventDate);
                const diffDays = Math.ceil(
                  (evt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                const isUrgent = diffDays <= 28; // under 4 weeks

                return (
                  <div
                    key={ord.id}
                    className="p-3.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-xs text-[#2D2424]">
                          {ord.customerName}
                        </span>
                        <span>·</span>
                        <span className="text-[11px] text-[#9E616B] font-medium">
                          {ord.occasion}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-1">
                        {ord.garmentTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-stone-400">
                          Status: <strong className="text-stone-700">{ord.status}</strong>
                        </span>
                        <span>·</span>
                        <span
                          className={`text-[10px] font-medium ${
                            ord.fabricReceived ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {ord.fabricReceived ? 'Fabric in Studio' : 'Awaiting Fabric'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-semibold text-[#2D2424] block">
                        {ord.eventDate}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          isUrgent ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {diffDays} days left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Enquiries Preview & Quick AI Evaluation */}
          <div className="bg-[#FAF8F5] border border-[#E8DFD8] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD8] mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9E616B]" />
                <h3 className="font-serif text-xl font-medium text-[#2D2424]">
                  Latest Enquiries (AI Analyzed)
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('enquiries')}
                className="text-xs text-[#9E616B] hover:underline font-medium cursor-pointer"
              >
                View All Enquiries ({metrics.newEnquiriesCount}) →
              </button>
            </div>

            <div className="space-y-3">
              {enquiries.slice(0, 3).map((enq) => (
                <div
                  key={enq.id}
                  onClick={() => onNavigateTab('enquiries')}
                  className="p-3 bg-white border border-[#E8DFD8] rounded-xl hover:border-[#9E616B] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs text-[#2D2424]">
                      {enq.customerName}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                        enq.aiAnalysis?.urgencyLevel === 'Urgent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {enq.aiAnalysis?.urgencyLevel || 'Standard'} Lead Time
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-1 mb-1.5">
                    {enq.garmentDescription}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 border-t border-[#F3ECE4] pt-1.5">
                    <span>Occasion: {enq.occasion}</span>
                    <span>Event: {enq.eventDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
