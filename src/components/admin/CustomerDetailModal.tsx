import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Customer } from '../../types';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Scissors,
  CreditCard,
  Clock,
  Edit3,
  Plus,
  Save,
} from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onNewOrderForCustomer?: (customer: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onNewOrderForCustomer,
}) => {
  const {
    isAuthorizedUser,
    setIsAuthorizedUser,
    orders,
    appointments,
    invoices,
    updateCustomer,
  } = useStudio();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'measurements' | 'orders' | 'invoices'>('profile');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [notesDraft, setNotesDraft] = useState<string>('');

  if (!isOpen || !customer) return null;

  const customerOrders = orders.filter((o) => o.customerId === customer.id);
  const customerAppointments = appointments.filter(
    (a) => a.customerId === customer.id && a.status !== 'Cancelled'
  );
  const customerInvoices = invoices.filter((i) => i.customerId === customer.id);

  const handleSaveNotes = () => {
    updateCustomer(customer.id, { notes: notesDraft });
    setIsEditingNotes(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8DFD8] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-[#E8DFD8] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
              <span>Client Profile #{customer.id}</span>
              <span>·</span>
              {customer.isRecurring && (
                <span className="font-semibold text-[#9E616B]">
                  ★ 98% Recurring Family Client ({customer.previousOrdersCount} past orders)
                </span>
              )}
            </div>
            <h3 className="font-serif text-2xl font-medium text-[#2D2424]">
              {customer.name}
            </h3>
            <p className="text-xs text-[#6B5E59] mt-0.5">
              {customer.suburb} · {customer.phone} · {customer.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNewOrderForCustomer && (
              <button
                onClick={() => {
                  onClose();
                  onNewOrderForCustomer(customer);
                }}
                className="px-3.5 py-1.5 bg-[#2D2424] hover:bg-[#4A3E3D] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Garment Order</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="px-6 border-b border-[#E8DFD8] bg-white flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'profile'
                ? 'border-[#9E616B] text-[#2D2424]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Overview & Occasion
          </button>
          <button
            onClick={() => setActiveSubTab('measurements')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'measurements'
                ? 'border-[#9E616B] text-[#2D2424]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Confidential Measurements</span>
            {!isAuthorizedUser && <Lock className="w-3 h-3 text-stone-400" />}
          </button>
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'orders'
                ? 'border-[#9E616B] text-[#2D2424]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Orders ({customerOrders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'invoices'
                ? 'border-[#9E616B] text-[#2D2424]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Invoices ({customerInvoices.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* PROFILE SUB-TAB */}
          {activeSubTab === 'profile' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8]">
                  <span className="text-[10px] uppercase text-[#6B5E59] block mb-1 font-semibold">
                    Current Milestone Occasion
                  </span>
                  <p className="font-serif text-lg text-[#2D2424] font-medium">
                    {customer.occasion}
                  </p>
                  <p className="text-stone-600 mt-1">
                    Event Date: <strong>{customer.eventDate}</strong>
                  </p>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8]">
                  <span className="text-[10px] uppercase text-[#6B5E59] block mb-1 font-semibold">
                    Fabric Handover Status
                  </span>
                  <p className="font-medium text-[#2D2424]">
                    {customer.fabricSuppliedByCustomer
                      ? 'Fabric Handed Over to Atelier'
                      : 'Fabric Pending / Sourcing Consultation'}
                  </p>
                  <p className="text-stone-500 text-[11px] mt-1">
                    {customer.fabricDetails || 'Customer supplies primary fabric and notions.'}
                  </p>
                </div>
              </div>

              {/* Design preferences */}
              <div className="p-4 bg-white border border-[#E8DFD8] rounded-xl text-xs">
                <span className="text-[10px] uppercase text-[#6B5E59] block mb-1 font-semibold">
                  Client Design Preferences & Silhouette:
                </span>
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {customer.designPreferences}
                </p>
              </div>

              {/* Atelier Notes */}
              <div className="p-4 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase text-[#6B5E59] block font-semibold">
                    Sadika's Atelier Notes & Fit Idiosyncrasies:
                  </span>
                  {!isEditingNotes ? (
                    <button
                      onClick={() => {
                        setNotesDraft(customer.notes);
                        setIsEditingNotes(true);
                      }}
                      className="text-[#9E616B] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Notes</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveNotes}
                      className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <textarea
                    rows={3}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none"
                  />
                ) : (
                  <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">
                    {customer.notes || 'No specific notes recorded.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* MEASUREMENTS SUB-TAB (Authorised Access Protected) */}
          {activeSubTab === 'measurements' && (
            <div className="space-y-4">
              {/* Authorization Gate Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                  isAuthorizedUser
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isAuthorizedUser ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>
                    {isAuthorizedUser
                      ? 'Authorised Atelier Access: Measurements and anatomical fit notes are unlocked.'
                      : 'Privacy Gate: Measurements masked to authorized studio staff.'}
                  </span>
                </div>
                <button
                  onClick={() => setIsAuthorizedUser(!isAuthorizedUser)}
                  className="px-2.5 py-1 bg-white border border-stone-300 rounded text-[11px] font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  {isAuthorizedUser ? 'Lock Privacy' : 'Unlock Authorised View'}
                </button>
              </div>

              {isAuthorizedUser ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[
                      { label: 'Bust', value: customer.measurements.bust },
                      { label: 'Underbust', value: customer.measurements.underbust },
                      { label: 'Natural Waist', value: customer.measurements.waist },
                      { label: 'High Hip', value: customer.measurements.highHip },
                      { label: 'Full Hip', value: customer.measurements.fullHip },
                      { label: 'Shoulder to Waist', value: customer.measurements.shoulderToWaist },
                      { label: 'Waist to Floor', value: customer.measurements.waistToFloor },
                      { label: 'Nape to Floor', value: customer.measurements.napeToFloor },
                      { label: 'Arm Circumference', value: customer.measurements.armCircumference },
                      { label: 'Sleeve Length', value: customer.measurements.sleeveLength },
                      { label: 'Back Width', value: customer.measurements.backWidth },
                    ].map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-center"
                      >
                        <span className="text-[10px] text-[#6B5E59] block uppercase">
                          {m.label}
                        </span>
                        <span className="font-serif text-lg font-semibold text-[#2D2424] block mt-0.5">
                          {m.value ? `${m.value} cm` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-xs">
                    <span className="text-[10px] uppercase text-[#6B5E59] block font-semibold mb-1">
                      Measurement Notes & Fit Adjustments:
                    </span>
                    <p className="text-stone-700 italic">
                      {customer.measurements.notes || 'Standard fit pattern block used.'}
                    </p>
                    <span className="text-[10px] text-stone-400 block mt-1">
                      Last measured on: {customer.measurements.lastUpdated || 'Initial session'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8DFD8]">
                  <Lock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">
                    Client measurements are encrypted under studio privacy guidelines. Click "Unlock Authorised View" above to reveal.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ORDERS SUB-TAB */}
          {activeSubTab === 'orders' && (
            <div className="space-y-3">
              {customerOrders.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">
                  No orders recorded for this customer.
                </p>
              ) : (
                customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-medium text-stone-800">
                          {ord.orderNumber}
                        </span>
                        <span>·</span>
                        <span className="text-[#9E616B] font-medium">{ord.serviceCategory}</span>
                      </div>
                      <h5 className="font-serif text-base font-medium text-[#2D2424]">
                        {ord.garmentTitle}
                      </h5>
                      <span className="text-[11px] text-stone-500">
                        Event: {ord.eventDate} · Fabric:{' '}
                        {ord.fabricReceived ? 'Received in Studio' : 'Pending'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-white border border-[#E8DFD8]">
                        {ord.status}
                      </span>
                      <span className="block font-serif text-sm font-semibold text-[#2D2424] mt-1">
                        R{ord.estimatedPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* INVOICES SUB-TAB */}
          {activeSubTab === 'invoices' && (
            <div className="space-y-3">
              {customerInvoices.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">
                  No invoices issued yet for this customer.
                </p>
              ) : (
                customerInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-semibold text-stone-800">
                        {inv.invoiceNumber}
                      </span>
                      <h5 className="font-medium text-[#2D2424] mt-0.5">{inv.garmentTitle}</h5>
                      <span className="text-[11px] text-stone-500">
                        Issued: {inv.issueDate} · Due: {inv.dueDate}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'Overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                      <span className="block font-serif text-base font-semibold text-[#2D2424] mt-0.5">
                        R{inv.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#E8DFD8] flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            Registered: {customer.createdAt}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2D2424] text-white hover:bg-[#4A3E3D] rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
