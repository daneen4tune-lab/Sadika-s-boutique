import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Order, OrderStatus } from '../../types';
import {
  Scissors,
  Package,
  Calendar,
  Clock,
  Plus,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Filter,
  PackageCheck,
  FilePlus,
  Sparkles,
} from 'lucide-react';

interface OrdersTabProps {
  onCreateInvoiceForOrder: (order: Order) => void;
}

const WORKFLOW_STAGES: OrderStatus[] = [
  'New Enquiry',
  'Consultation',
  'Booking Confirmed',
  'Fabric Received',
  'Fitting',
  'In Production',
  'Final Fitting',
  'Completed',
];

export const OrdersTab: React.FC<OrdersTabProps> = ({ onCreateInvoiceForOrder }) => {
  const {
    orders,
    customers,
    invoices,
    updateOrderStatus,
    toggleFabricReceived,
    addOrder,
  } = useStudio();

  const [filterStage, setFilterStage] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New order form state
  const [newCustId, setNewCustId] = useState<string>(customers[0]?.id || '');
  const [newGarmentTitle, setNewGarmentTitle] = useState<string>('');
  const [newServiceCategory, setNewServiceCategory] = useState<string>('Bridal Wear');
  const [newEventDate, setNewEventDate] = useState<string>('');
  const [newEstimatedPrice, setNewEstimatedPrice] = useState<number>(4500);
  const [newDesignNotes, setNewDesignNotes] = useState<string>('');

  const filteredOrders = orders.filter((o) => {
    if (filterStage === 'All') return true;
    if (filterStage === 'In Production Active') {
      return o.status === 'In Production' || o.status === 'Fitting' || o.status === 'Fabric Received';
    }
    return o.status === filterStage;
  });

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newCustId);
    if (!cust) return;

    addOrder({
      orderNumber: `SAD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerEmail: cust.email,
      serviceCategory: newServiceCategory,
      garmentTitle: newGarmentTitle,
      occasion: cust.occasion,
      eventDate: newEventDate || cust.eventDate,
      status: 'Consultation',
      fabricReceived: false,
      designNotes: newDesignNotes,
      estimatedPrice: Number(newEstimatedPrice),
      appointmentIds: [],
      targetCompletionDate: newEventDate || cust.eventDate,
    });

    setIsAddModalOpen(false);
    setNewGarmentTitle('');
    setNewDesignNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header & New Order Action */}
      <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
            <span>Atelier Garment Production</span>
            <span>·</span>
            <span className="text-[#9E616B] font-semibold">
              Fabric Receipt Confirms Booking
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2D2424] font-medium">
            Couture Order Tracking & Milestones
          </h2>
          <p className="text-xs text-[#6B5E59] mt-1 max-w-xl">
            Track garments through Sadika's bespoke workflow: from consultation and fabric handover to final fitting and collection.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#2D2424] hover:bg-[#4A3E3D] text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Garment Order</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-stone-400 font-medium">Workflow Filter:</span>
        {['All', 'In Production Active', 'Consultation', 'Fabric Received', 'In Production', 'Final Fitting', 'Completed'].map((stage) => (
          <button
            key={stage}
            onClick={() => setFilterStage(stage)}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterStage === stage
                ? 'bg-[#2D2424] text-white border-[#2D2424] font-medium'
                : 'bg-white text-stone-600 border-[#E8DFD8] hover:border-stone-400'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E8DFD8] rounded-xl text-stone-400 text-xs">
            No orders found under this workflow stage.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const currentStageIdx = WORKFLOW_STAGES.indexOf(order.status);
            const now = new Date();
            const evt = new Date(order.eventDate);
            const diffDays = Math.ceil((evt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const isUrgent = diffDays <= 30;

            const hasInvoice = order.invoiceId && invoices.some((i) => i.id === order.invoiceId);

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs hover:border-[#D4C5B9] transition-all space-y-5"
              >
                {/* Order Top Bar: Title, Event Date & Price */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3ECE4]">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
                      <span className="font-mono font-bold text-stone-900">{order.orderNumber}</span>
                      <span>·</span>
                      <span className="font-semibold text-[#9E616B]">{order.serviceCategory}</span>
                      <span>·</span>
                      <span>Client: <strong className="text-[#2D2424]">{order.customerName}</strong> ({order.customerPhone})</span>
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-[#2D2424]">
                      {order.garmentTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Event Date Counter Prominent */}
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-[#6B5E59] block">
                        Target Event Date
                      </span>
                      <span className="font-mono text-sm font-bold text-[#2D2424]">
                        {order.eventDate}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          isUrgent ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {diffDays} days remaining
                      </span>
                    </div>

                    <div className="pl-4 border-l border-[#E8DFD8] text-right">
                      <span className="text-[10px] uppercase font-semibold text-[#6B5E59] block">
                        Estimated Value
                      </span>
                      <span className="font-serif text-lg font-semibold text-[#2D2424]">
                        R{order.estimatedPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workflow Stepper / Status Controller */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#2D2424]">
                      Update Production Workflow Stage:
                    </span>
                    <span className="text-xs text-[#9E616B] font-medium">
                      Current: {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
                    {WORKFLOW_STAGES.map((stg, sIdx) => {
                      const isComplete = sIdx <= currentStageIdx;
                      const isCurrent = sIdx === currentStageIdx;

                      return (
                        <button
                          key={stg}
                          onClick={() => updateOrderStatus(order.id, stg)}
                          className={`p-2 rounded-lg text-center border text-[11px] transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-[#9E616B] text-white border-[#9E616B] font-semibold shadow-xs ring-2 ring-[#9E616B]/30'
                              : isComplete
                              ? 'bg-[#F7E7E6] text-[#2D2424] border-[#E8DFD8] font-medium hover:bg-[#EEDCDA]'
                              : 'bg-[#FAF8F5] text-stone-400 border-stone-200 hover:text-stone-700'
                          }`}
                        >
                          <span className="block text-[9px] opacity-75">Stage {sIdx + 1}</span>
                          <span className="block truncate">{stg}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Core Policy Rule: Fabric Received Deposit Toggle */}
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                    order.fabricReceived
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <PackageCheck className="w-5 h-5 shrink-0 text-[#9E616B] mt-0.5" />
                    <div>
                      <span className="font-semibold block text-sm">
                        {order.fabricReceived
                          ? 'Fabric Received · Booking Officially Locked'
                          : 'Awaiting Customer Fabric Drop-off'}
                      </span>
                      <p className="text-[11px] opacity-85 mt-0.5">
                        {order.fabricReceived
                          ? `Fabric logged into cutting room on ${order.fabricReceivedDate}. Automated WhatsApp confirmation dispatched.`
                          : 'As per atelier policy, cutting capacity is strictly reserved only when fabric is physically delivered by client.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFabricReceived(order.id, !order.fabricReceived)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                      order.fabricReceived
                        ? 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/50'
                        : 'bg-[#9E616B] hover:bg-[#864F58] text-white shadow-xs'
                    }`}
                  >
                    {order.fabricReceived ? 'Undo Fabric Received' : 'Log Fabric Received Now'}
                  </button>
                </div>

                {/* Bottom Row: Design Notes & Invoicing Shortcut */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="text-stone-600 max-w-xl">
                    <strong className="text-stone-800">Design Specs: </strong>
                    <span className="line-clamp-1">{order.designNotes}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasInvoice ? (
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Invoice Linked</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onCreateInvoiceForOrder(order)}
                        className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#F7E7E6] text-[#9E616B] border border-[#E8DFD8] rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <FilePlus className="w-3.5 h-3.5" />
                        <span>Create Invoice for this Garment</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Garment Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DFD8] rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-xl font-medium text-[#2D2424]">
              Start New Couture Garment Order
            </h3>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#6B5E59] mb-1 font-medium">Customer *</label>
                <select
                  value={newCustId}
                  onChange={(e) => setNewCustId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.occasion}) - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#6B5E59] mb-1 font-medium">Garment Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cathedral Mikado Bridal Gown or Velvet Gala Dress"
                  value={newGarmentTitle}
                  onChange={(e) => setNewGarmentTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">Service Category</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="Bridal Wear">Bridal Wear</option>
                    <option value="Matric Dance">Matric Dance</option>
                    <option value="Occasion Wear">Occasion Wear</option>
                    <option value="Evening Wear">Evening Wear</option>
                    <option value="Alterations & Repairs">Alterations & Repairs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B5E59] mb-1 font-medium">Estimated Total Price (ZAR)</label>
                <input
                  type="number"
                  value={newEstimatedPrice}
                  onChange={(e) => setNewEstimatedPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#6B5E59] mb-1 font-medium">Design & Silhouette Notes</label>
                <textarea
                  rows={3}
                  value={newDesignNotes}
                  onChange={(e) => setNewDesignNotes(e.target.value)}
                  placeholder="Neckline, boning, drape, lining specifications..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DFD8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2D2424] text-white hover:bg-[#4A3E3D] rounded-lg font-medium cursor-pointer"
                >
                  Create Order in Atelier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
