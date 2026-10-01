import React, { useState, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { useAuth } from '../../context/AuthContext';
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
  Lock,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  RotateCcw,
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
  } = useStudio();
  const { user } = useAuth();

  const [orderRefInput, setOrderRefInput] = useState<string>('');
  const [contactInput, setContactInput] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [rescheduleAptId, setRescheduleAptId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('11:00');

  // If user signs in with Google and has an associated email, auto-match their private record
  useEffect(() => {
    if (user?.email && !selectedCustomerId) {
      const match = customers.find(
        (c) => c.email.toLowerCase() === user.email?.toLowerCase()
      );
      if (match) {
        setSelectedCustomerId(match.id);
      }
    }
  }, [user, customers, selectedCustomerId]);

  // Find customer and related orders
  const currentCustomer = selectedCustomerId
    ? customers.find((c) => c.id === selectedCustomerId)
    : null;
  const customerOrders = selectedCustomerId
    ? orders.filter((o) => o.customerId === selectedCustomerId)
    : [];
  const customerAppointments = selectedCustomerId
    ? appointments.filter(
        (a) => a.customerId === selectedCustomerId && a.status !== 'Cancelled'
      )
    : [];
  const customerInvoices = selectedCustomerId
    ? invoices.filter((i) => i.customerId === selectedCustomerId)
    : [];

  // Secure two-factor search filter to protect customer info
  const handleSecureSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const ref = orderRefInput.trim().toLowerCase();
    const contact = contactInput.trim().toLowerCase().replace(/\s+/g, '');

    if (!ref || !contact) {
      setSearchError(
        'Please enter both your Order/Invoice Reference and your registered Phone or Email for verification.'
      );
      return;
    }

    // Match order reference against orderNumber or invoiceNumber
    const matchedOrder = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === ref ||
        o.id.toLowerCase() === ref ||
        (o.invoiceId && o.invoiceId.toLowerCase() === ref)
    );

    const matchedInvoice = invoices.find(
      (i) => i.invoiceNumber.toLowerCase() === ref || i.id.toLowerCase() === ref
    );

    const targetCustomerId = matchedOrder?.customerId || matchedInvoice?.customerId;

    if (!targetCustomerId) {
      setSearchError(
        `No order found with reference "${orderRefInput.trim()}". Please check your confirmation SMS, email, or invoice.`
      );
      return;
    }

    const targetCustomer = customers.find((c) => c.id === targetCustomerId);
    if (!targetCustomer) {
      setSearchError('Client record could not be located. Please contact the atelier directly.');
      return;
    }

    // Verify contact details match (phone or email)
    const cleanCustPhone = targetCustomer.phone.toLowerCase().replace(/\s+/g, '');
    const cleanCustEmail = targetCustomer.email.toLowerCase();

    const isPhoneMatch =
      cleanCustPhone.includes(contact) || contact.includes(cleanCustPhone.slice(-7));
    const isEmailMatch = cleanCustEmail === contact || cleanCustEmail.includes(contact);

    if (isPhoneMatch || isEmailMatch) {
      setSelectedCustomerId(targetCustomer.id);
      setSearchError(null);
    } else {
      setSearchError(
        'Verification failed. The contact information provided does not match the customer on file for this order. Customer information is kept confidential.'
      );
    }
  };

  const handleClearSession = () => {
    setSelectedCustomerId(null);
    setOrderRefInput('');
    setContactInput('');
    setSearchError(null);
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
      <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFD8] text-xs text-[#9E616B] font-medium mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Private & Encrypted Client Portal</span>
          </div>

          <h2 className="font-serif text-3xl text-[#2D2424] font-medium">
            Track Your Bespoke Order & Fittings
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#6B5E59] leading-relaxed">
            To protect client privacy, enter your booking reference and registered contact info to view your garment's cutting schedule, fitting dates, and invoice.
          </p>

          {!selectedCustomerId ? (
            <form onSubmit={handleSecureSearch} className="mt-6 space-y-3 max-w-lg mx-auto text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Order Ref or Invoice #
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAD-2026-082 or INV-2026-040"
                    value={orderRefInput}
                    onChange={(e) => setOrderRefInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Your Phone or Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0728841029 or email@domain.com"
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B]"
                  />
                </div>
              </div>

              {searchError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{searchError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2D2424] text-white hover:bg-[#4A3E3D] rounded-lg text-xs font-medium transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Verify & Unlock My Order Records</span>
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-stone-400">
                  🔒 Customer measurements and other clients' records are strictly confidential and inaccessible to the public.
                </span>
              </div>
            </form>
          ) : (
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="text-xs text-emerald-800 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Client: {currentCustomer?.name}</span>
              </span>
              <button
                onClick={handleClearSession}
                className="text-xs text-stone-500 hover:text-stone-800 underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Lock / Exit Order View</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {currentCustomer ? (
        <div className="space-y-8 animate-in fade-in">
          {/* Customer Profile Banner */}
          <div className="bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
                <span>Client Ref: {currentCustomer.id}</span>
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

                    {/* Fabric Received Confirmation Callout */}
                    <div className="mt-4 p-4 rounded-xl border flex items-start gap-3 bg-[#FAF8F5] border-[#E8DFD8]">
                      <Package className="w-5 h-5 text-[#9E616B] shrink-0 mt-0.5" />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#2D2424]">
                            Fabric Booking Confirmation Status:
                          </span>
                          {order.fabricReceivedDate && (
                            <span className="text-[11px] text-stone-500">
                              Received: {order.fabricReceivedDate}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] opacity-90 leading-relaxed text-[#6B5E59]">
                          {order.fabricReceived
                            ? order.fabricNotes ||
                              'Your fabric is safely catalogued in Sadika’s cutting room.'
                            : "Reminder: As per Sadika's Bridal Boutique policy, your booking slot on the cutting calendar is only officially locked once your fabric has been physically handed over to the atelier."}
                        </p>
                      </div>
                    </div>

                    {/* Design details */}
                    <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#F3ECE4] text-xs text-stone-700 mt-4">
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

          {/* Appointments & Fittings Section */}
          <div className="space-y-4">
            <h4 className="font-serif text-xl font-medium text-[#2D2424] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#9E616B]" />
              <span>Your Atelier Appointments & Fittings</span>
            </h4>

            {customerAppointments.length === 0 ? (
              <div className="p-6 bg-white border border-[#E8DFD8] rounded-xl text-center text-xs text-stone-500">
                No active appointments scheduled. Contact Sadika to request a fitting slot.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white border border-[#E8DFD8] rounded-xl p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[#9E616B] block">
                          {apt.type}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-stone-400" />
                          <span className="font-serif text-lg font-medium text-[#2D2424]">
                            {apt.date} at {apt.time}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          apt.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    {apt.notes && (
                      <p className="text-xs text-stone-600 bg-[#FAF8F5] p-2.5 rounded-lg border border-[#F3ECE4]">
                        {apt.notes}
                      </p>
                    )}

                    {/* Reschedule Button / Modal */}
                    <div className="pt-2 border-t border-[#F3ECE4] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-stone-400">
                        Duration: {apt.durationMinutes} mins · Rondebosch
                      </span>
                      <button
                        onClick={() => {
                          setRescheduleAptId(apt.id);
                          setNewDate(apt.date);
                          setNewTime(apt.time);
                        }}
                        className="text-[#9E616B] font-medium hover:underline cursor-pointer"
                      >
                        Reschedule
                      </button>
                    </div>

                    {rescheduleAptId === apt.id && (
                      <form
                        onSubmit={(e) => handleRescheduleSubmit(e, apt.id)}
                        className="mt-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8] space-y-2 text-xs"
                      >
                        <span className="font-semibold text-[#2D2424] block">
                          Request New Weekday Time (Mon–Fri):
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="p-1.5 bg-white border border-[#E8DFD8] rounded text-xs"
                          />
                          <select
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="p-1.5 bg-white border border-[#E8DFD8] rounded text-xs"
                          >
                            <option value="09:30">09:30</option>
                            <option value="11:00">11:00</option>
                            <option value="14:00">14:00</option>
                            <option value="15:30">15:30</option>
                          </select>
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setRescheduleAptId(null)}
                            className="px-2.5 py-1 text-stone-500 hover:text-stone-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-[#2D2424] text-white rounded font-medium"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices & Payment Status Section */}
          <div className="space-y-4">
            <h4 className="font-serif text-xl font-medium text-[#2D2424] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#9E616B]" />
              <span>Invoices & Payment Status</span>
            </h4>

            {customerInvoices.length === 0 ? (
              <div className="p-6 bg-white border border-[#E8DFD8] rounded-xl text-center text-xs text-stone-500">
                No invoices issued yet.
              </div>
            ) : (
              <div className="space-y-3">
                {customerInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white border border-[#E8DFD8] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
                        <span className="font-mono font-medium text-stone-800">{inv.invoiceNumber}</span>
                        <span>·</span>
                        <span>Issued: {inv.issueDate}</span>
                        <span>·</span>
                        <span>Due: {inv.dueDate}</span>
                      </div>
                      <h5 className="font-serif text-lg font-medium text-[#2D2424]">
                        {inv.garmentTitle}
                      </h5>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] text-stone-400 block uppercase">Total Amount</span>
                        <span className="font-serif text-xl font-semibold text-[#2D2424]">
                          R{inv.total.toLocaleString()}
                        </span>
                      </div>

                      <div className="pl-3 border-l border-[#E8DFD8]">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : inv.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
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
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
