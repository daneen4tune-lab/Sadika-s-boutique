import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { OrderStatus, Appointment } from '../../types';
import {
  Search,
  Clock,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Scissors,
  Package,
  Layers,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface CustomerOrderTrackerProps {
  onOpenPolicies: () => void;
}

const ORDER_STAGES: OrderStatus[] = [
  'New Enquiry',
  'Consultation',
  'Booking Confirmed',
  'Fabric Received',
  'Fitting',
  'In Production',
  'Final Fitting',
  'Completed',
];

export const CustomerOrderTracker: React.FC<CustomerOrderTrackerProps> = ({
  onOpenPolicies,
}) => {
  const {
    orders,
    customers,
    appointments,
    invoices,
    settings,
    rescheduleAppointment,
    cancelAppointment,
  } = useStudio();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-02'); // Defaults to Chloe for quick demo
  const [rescheduleAptId, setRescheduleAptId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('11:00');

  // Find customer and related orders
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerOrders = orders.filter((o) => o.customerId === selectedCustomerId);
  const customerAppointments = appointments.filter(
    (a) => a.customerId === selectedCustomerId && a.status !== 'Cancelled'
  );
  const customerInvoices = invoices.filter((i) => i.customerId === selectedCustomerId);

  // Search filter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const matchedCust = customers.find(
      (c) =>
        c.phone.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );

    if (matchedCust) {
      setSelectedCustomerId(matchedCust.id);
    } else {
      // Try finding by order number
      const matchedOrder = orders.find((o) => o.orderNumber.toLowerCase().includes(q));
      if (matchedOrder) {
        setSelectedCustomerId(matchedOrder.customerId);
      }
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent, aptId: string) => {
    e.preventDefault();
    if (!newDate || !newTime) return;
    rescheduleAppointment(aptId, newDate, newTime);
    setRescheduleAptId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Search Header */}
      <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-xs uppercase tracking-widest text-[#9E616B] font-semibold mb-1 block">
            Customer Portal
          </span>
          <h2 className="font-serif text-3xl text-[#2D2424] font-medium">
            Track Your Bespoke Order & Fittings
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#6B5E59]">
            Lookup your active order progress, upcoming fittings, and invoice details.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter phone number or order # (e.g. SAD-2026-082)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2D2424] text-white hover:bg-[#4A3E3D] rounded-lg text-xs font-medium transition-all cursor-pointer shadow-xs"
            >
              Lookup
            </button>
          </form>

          {/* Sample quick switcher for review ease */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[11px] text-stone-500">Quick Test Clients:</span>
            {customers.slice(0, 4).map((cust) => (
              <button
                key={cust.id}
                onClick={() => setSelectedCustomerId(cust.id)}
                className={`px-2.5 py-1 rounded text-[11px] border transition-all cursor-pointer ${
                  selectedCustomerId === cust.id
                    ? 'bg-[#9E616B] text-white border-[#9E616B] font-medium'
                    : 'bg-[#FAF8F5] text-stone-600 border-[#E8DFD8] hover:border-stone-400'
                }`}
              >
                {cust.name} ({cust.occasion})
              </button>
            ))}
          </div>
        </div>
      </div>

      {currentCustomer ? (
        <div className="space-y-8">
          {/* Customer Profile Banner */}
          <div className="bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
                <span>Client ID: {currentCustomer.id}</span>
                <span>·</span>
                <span className="font-medium text-[#9E616B]">{currentCustomer.occasion}</span>
                <span>·</span>
                <span>Event Date: {currentCustomer.eventDate}</span>
              </div>
              <h3 className="font-serif text-2xl font-medium text-[#2D2424]">
                {currentCustomer.name}
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                {currentCustomer.phone} · {currentCustomer.email}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-500 block">Total Active Orders</span>
              <span className="font-serif text-2xl font-semibold text-[#2D2424]">
                {customerOrders.length}
              </span>
            </div>
          </div>

          {/* Active Orders Section */}
          <div className="space-y-6">
            <h4 className="font-serif text-xl font-medium text-[#2D2424] flex items-center gap-2">
              <Scissors className="w-5 h-5 text-[#9E616B]" />
              <span>Active Garment Orders</span>
            </h4>

            {customerOrders.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#E8DFD8] rounded-xl text-stone-500 text-xs">
                No active orders recorded for this client.
              </div>
            ) : (
              customerOrders.map((order) => {
                const currentStageIdx = ORDER_STAGES.indexOf(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-[#E8DFD8] rounded-xl p-6 shadow-xs"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F3ECE4]">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
                          <span className="font-mono font-medium text-stone-800">{order.orderNumber}</span>
                          <span>·</span>
                          <span className="text-[#9E616B] font-medium">{order.serviceCategory}</span>
                        </div>
                        <h4 className="font-serif text-xl font-medium text-[#2D2424]">
                          {order.garmentTitle}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] uppercase text-[#6B5E59] block">Event Date</span>
                          <span className="font-medium text-xs text-[#2D2424]">
                            {order.eventDate}
                          </span>
                        </div>
                        <div className="pl-3 border-l border-[#E8DFD8] text-right">
                          <span className="text-[10px] uppercase text-[#6B5E59] block">Status</span>
                          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-[#F7E7E6] text-[#9E616B]">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Workflow Tracker */}
                    <div className="py-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#2D2424]">
                          Couture Production Workflow
                        </span>
                        <span className="text-xs text-[#6B5E59]">
                          Stage {currentStageIdx + 1} of {ORDER_STAGES.length}
                        </span>
                      </div>

                      {/* Stage progress line */}
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-2">
                        {ORDER_STAGES.map((stg, sIdx) => {
                          const isComplete = sIdx <= currentStageIdx;
                          const isCurrent = sIdx === currentStageIdx;

                          return (
                            <div key={stg} className="text-center group">
                              <div
                                className={`h-2 rounded-full mb-1.5 transition-all ${
                                  isComplete
                                    ? 'bg-[#9E616B]'
                                    : 'bg-[#E8DFD8]'
                                } ${isCurrent ? 'ring-2 ring-[#9E616B]/40' : ''}`}
                              />
                              <span
                                className={`text-[10px] block leading-tight ${
                                  isCurrent
                                    ? 'font-bold text-[#9E616B]'
                                    : isComplete
                                    ? 'text-[#2D2424] font-medium'
                                    : 'text-stone-400'
                                }`}
                              >
                                {stg}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fabric Received Confirmation Card */}
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 text-xs mb-4 ${
                        order.fabricReceived
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <Package className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold flex items-center justify-between">
                          <span>
                            {order.fabricReceived
                              ? 'Fabric Received & Slot Officially Confirmed'
                              : 'Awaiting Fabric Drop-off (Required to Confirm Booking)'}
                          </span>
                          {order.fabricReceivedDate && (
                            <span className="text-[11px] font-mono">
                              Received: {order.fabricReceivedDate}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
                          {order.fabricReceived
                            ? order.fabricNotes ||
                              'Your fabric is safely catalogued in Sadika’s cutting room.'
                            : "Reminder: As per Sadika's Bridal Boutique policy, your booking slot on the cutting calendar is only officially locked once your fabric has been physically handed over to the atelier."}
                        </p>
                      </div>
                    </div>

                    {/* Design details */}
                    <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#F3ECE4] text-xs text-stone-700">
                      <span className="font-semibold text-[#2D2424] block mb-1">
                        Garment Specifications & Design Notes:
                      </span>
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {order.designNotes}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Appointments & Fittings Schedule */}
          <div className="bg-white border border-[#E8DFD8] rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F3ECE4] mb-4">
              <h4 className="font-serif text-xl font-medium text-[#2D2424] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#9E616B]" />
                <span>Your Studio Appointments</span>
              </h4>
              <button
                onClick={onOpenPolicies}
                className="text-xs text-[#9E616B] hover:underline cursor-pointer"
              >
                View Fitting Policies & Hours
              </button>
            </div>

            {customerAppointments.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">
                No active appointments scheduled. Contact Sadika to request a fitting slot.
              </p>
            ) : (
              <div className="space-y-3">
                {customerAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
                        <span className="font-semibold text-[#2D2424]">{apt.type}</span>
                        <span>·</span>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-white border border-[#E8DFD8]">
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-700 font-medium">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#9E616B]" />
                          {apt.date}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#9E616B]" />
                          {apt.time} (45 mins)
                        </span>
                      </div>
                      {apt.notes && (
                        <p className="text-[11px] text-stone-500 mt-1 italic">
                          Note: {apt.notes}
                        </p>
                      )}
                    </div>

                    {/* Reschedule / Cancel action buttons */}
                    <div className="flex items-center gap-2 text-xs">
                      {rescheduleAptId === apt.id ? (
                        <form
                          onSubmit={(e) => handleRescheduleSubmit(e, apt.id)}
                          className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#E8DFD8]"
                        >
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="px-2 py-1 text-xs border rounded focus:outline-none"
                          />
                          <select
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="px-2 py-1 text-xs border rounded focus:outline-none"
                          >
                            {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="px-2.5 py-1 bg-[#9E616B] text-white rounded text-[11px] font-medium"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setRescheduleAptId(null)}
                            className="text-stone-400 hover:text-stone-700 text-xs px-1"
                          >
                            ✕
                          </button>
                        </form>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleAptId(apt.id);
                              setNewDate(apt.date);
                              setNewTime(apt.time);
                            }}
                            className="px-3 py-1.5 bg-white border border-[#E8DFD8] hover:border-[#9E616B] rounded text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelAppointment(apt.id)}
                            className="px-3 py-1.5 text-stone-400 hover:text-rose-600 rounded text-xs transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices & Payment Status */}
          <div className="bg-white border border-[#E8DFD8] rounded-xl p-6 shadow-xs">
            <h4 className="font-serif text-xl font-medium text-[#2D2424] flex items-center gap-2 mb-4 pb-4 border-b border-[#F3ECE4]">
              <CreditCard className="w-5 h-5 text-[#9E616B]" />
              <span>Invoices & Payment Status</span>
            </h4>

            {customerInvoices.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">
                No invoices issued yet. Invoices are generated once design details and fabric are confirmed.
              </p>
            ) : (
              <div className="space-y-4">
                {customerInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
                        <span className="font-mono font-semibold text-stone-800">
                          {inv.invoiceNumber}
                        </span>
                        <span>·</span>
                        <span>Issued: {inv.issueDate}</span>
                        <span>·</span>
                        <span className="text-red-700">Due: {inv.dueDate}</span>
                      </div>
                      <h5 className="font-serif text-lg font-medium text-[#2D2424]">
                        {inv.garmentTitle}
                      </h5>
                      <p className="text-xs text-stone-500 mt-1">
                        {inv.notes || '50% deposit required upon fabric drop-off.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-[#6B5E59] block">Total Amount</span>
                        <span className="font-serif text-xl font-bold text-[#2D2424]">
                          R{inv.total.toLocaleString()}
                        </span>
                        <span className="block text-[11px] text-stone-500">
                          Paid: R{inv.depositPaid.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'Overdue'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Bank EFT Instructions */}
                <div className="bg-[#F3ECE4] p-4 rounded-xl border border-[#E8DFD8] text-xs">
                  <span className="font-semibold text-[#2D2424] block mb-1">
                    EFT Payment Details for Sadika's Bridal Boutique:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-700 text-[11px]">
                    <div>
                      <span className="text-stone-500 block">Bank:</span>
                      <strong>{settings.bankDetails.bankName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Account Holder:</span>
                      <strong>{settings.bankDetails.accountHolder}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Account Number:</span>
                      <strong className="font-mono">{settings.bankDetails.accountNumber}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Branch Code:</span>
                      <strong className="font-mono">{settings.bankDetails.branchCode}</strong>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-stone-500 italic">
                    Please use your Invoice Number (e.g. INV-2026-040) and Surname as the payment reference.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#E8DFD8] rounded-2xl p-8">
          <p className="text-sm text-stone-500">
            Please search for your phone number or select a client above to view your booking.
          </p>
        </div>
      )}
    </div>
  );
};
