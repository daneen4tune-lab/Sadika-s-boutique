import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Customer } from '../../types';
import { CustomerDetailModal } from './CustomerDetailModal';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Lock,
  Scissors,
  Star,
  ShieldCheck,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface CustomersTabProps {
  onNewOrderForCustomer: (customer: Customer) => void;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  onNewOrderForCustomer,
}) => {
  const { customers, searchCustomers, addCustomer, isAuthorizedUser } = useStudio();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // New customer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSuburb, setNewSuburb] = useState('Cape Town');
  const [newOccasion, setNewOccasion] = useState<any>('Wedding');
  const [newEventDate, setNewEventDate] = useState('');
  const [newDesignPrefs, setNewDesignPrefs] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(true); // 98% default

  const filteredCustomers = searchQuery ? searchCustomers(searchQuery) : customers;

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addCustomer({
      name: newName,
      phone: newPhone,
      email: newEmail,
      suburb: newSuburb,
      occasion: newOccasion,
      eventDate: newEventDate || new Date().toISOString().split('T')[0],
      measurements: { notes: 'Awaiting measurements session' },
      designPreferences: newDesignPrefs,
      fabricSuppliedByCustomer: true,
      notes: newNotes,
      isRecurring,
      previousOrdersCount: isRecurring ? 1 : 0,
    });

    setIsCreateModalOpen(false);
    setSelectedCustomer(created);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header & Recurring Callout */}
      <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
            <span>Atelier Client Database</span>
            <span>·</span>
            <span className="font-semibold text-[#9E616B]">
              ★ 98% Returning Client Fast Lookup
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2D2424] font-medium">
            Customer Registry & Bespoke Profiles
          </h2>
          <p className="text-xs text-[#6B5E59] mt-1 max-w-xl">
            Quickly pull up returning clients' saved measurements, occasion histories, and design preferences to avoid re-entering details.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-[#2D2424] hover:bg-[#4A3E3D] text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Fast Search Bar */}
      <div className="bg-white border border-[#E8DFD8] rounded-xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone (+27), occasion, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B]"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
          <span>Showing {filteredCustomers.length} clients</span>
          <span>
            {isAuthorizedUser ? (
              <span className="text-emerald-700 font-medium">Authorised: Measurements accessible</span>
            ) : (
              <span className="text-amber-700">Privacy Gate: Measurements protected</span>
            )}
          </span>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="bg-white border border-[#E8DFD8] rounded-xl p-5 hover:border-[#D4C5B9] hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-[#F3ECE4]">
                <div>
                  <h4 className="font-serif text-lg font-medium text-[#2D2424] group-hover:text-[#9E616B] transition-colors">
                    {cust.name}
                  </h4>
                  <span className="text-[11px] text-stone-500">{cust.suburb}</span>
                </div>

                {cust.isRecurring && (
                  <span
                    title={`${cust.previousOrdersCount} past bespoke orders`}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#9E616B] bg-[#F7E7E6] px-2 py-0.5 rounded-full"
                  >
                    <Star className="w-3 h-3 fill-current" />
                    <span>Recurring ({cust.previousOrdersCount})</span>
                  </span>
                )}
              </div>

              {/* Contact info */}
              <div className="space-y-1 text-xs text-stone-600 mb-3">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-[#9E616B]" />
                  <span>{cust.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Mail className="w-3 h-3 text-[#9E616B]" />
                  <span className="truncate">{cust.email}</span>
                </div>
              </div>

              {/* Recent Occasion */}
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#F3ECE4] text-xs text-stone-700 mb-3">
                <span className="text-[10px] uppercase font-semibold text-[#6B5E59] block mb-0.5">
                  Latest Milestone:
                </span>
                <span className="font-medium text-[#2D2424] block">{cust.occasion}</span>
                <span className="text-[11px] text-stone-500 font-mono">
                  Target Event: {cust.eventDate}
                </span>
              </div>

              {/* Design preferences snippet */}
              <p className="text-[11px] text-stone-600 line-clamp-2 italic mb-3">
                "{cust.designPreferences}"
              </p>
            </div>

            {/* Card Actions */}
            <div className="pt-3 border-t border-[#F3ECE4] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedCustomer(cust);
                  setIsDetailModalOpen(true);
                }}
                className="text-xs text-[#9E616B] hover:underline font-medium cursor-pointer"
              >
                View Full Profile & Measurements →
              </button>

              <button
                onClick={() => onNewOrderForCustomer(cust)}
                title="Create a new order for this client using saved measurements"
                className="p-1.5 bg-[#FAF8F5] hover:bg-[#F7E7E6] text-stone-700 rounded-md border border-[#E8DFD8] transition-colors cursor-pointer"
              >
                <Scissors className="w-3.5 h-3.5 text-[#9E616B]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Detail & Measurement Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onNewOrderForCustomer={onNewOrderForCustomer}
      />

      {/* Add New Customer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DFD8] rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-xl font-medium text-[#2D2424]">
              Add New Customer to Registry
            </h3>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#6B5E59] mb-1 font-medium">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Zahira Jacobs"
                  className="w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:border-[#9E616B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+27 82 555 1234"
                    className="w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:border-[#9E616B]"
                  />
                </div>
                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">Suburb / Location</label>
                  <input
                    type="text"
                    value={newSuburb}
                    onChange={(e) => setNewSuburb(e.target.value)}
                    placeholder="e.g. Rondebosch"
                    className="w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:border-[#9E616B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B5E59] mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="zahira@gmail.com"
                  className="w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:border-[#9E616B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">Occasion</label>
                  <select
                    value={newOccasion}
                    onChange={(e) => setNewOccasion(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Attending a Wedding">Attending a Wedding</option>
                    <option value="Matric Ball">Matric Ball</option>
                    <option value="Eid">Eid</option>
                    <option value="Christmas / Festive">Christmas / Festive</option>
                    <option value="Evening Gala">Evening Gala</option>
                    <option value="Alterations & Repairs">Alterations & Repairs</option>
                    <option value="Other Special Occasion">Other Special Occasion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">Event Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B5E59] mb-1 font-medium">
                  Design Preferences & Silhouette
                </label>
                <textarea
                  rows={2}
                  value={newDesignPrefs}
                  onChange={(e) => setNewDesignPrefs(e.target.value)}
                  placeholder="Preferred cuts, colours, fabric types..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurring-check"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-[#9E616B] rounded"
                />
                <label htmlFor="recurring-check" className="text-[#2D2424] font-medium cursor-pointer">
                  Mark as Returning Family Client (98% of Sadika's clientele)
                </label>
              </div>

              <div className="pt-3 border-t border-[#E8DFD8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2D2424] text-white hover:bg-[#4A3E3D] rounded-lg font-medium cursor-pointer"
                >
                  Save Customer & Enter Measurements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
