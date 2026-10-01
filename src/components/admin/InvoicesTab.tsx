import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Invoice, Order, InvoiceItem } from '../../types';
import { InvoiceViewModal } from './InvoiceViewModal';
import {
  CreditCard,
  FilePlus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Printer,
  DollarSign,
  Search,
  Filter,
  Plus,
  Trash2,
  MessageCircle,
} from 'lucide-react';

interface InvoicesTabProps {
  initialOrderForInvoice?: Order | null;
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({
  initialOrderForInvoice,
}) => {
  const {
    invoices,
    orders,
    customers,
    createInvoice,
    markInvoiceAsPaid,
    sendInvoiceNotification,
  } = useStudio();

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(
    Boolean(initialOrderForInvoice)
  );

  // New Invoice Form State
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialOrderForInvoice?.id || ''
  );
  const [selectedCustId, setSelectedCustId] = useState<string>(
    initialOrderForInvoice?.customerId || customers[0]?.id || ''
  );
  const [garmentTitle, setGarmentTitle] = useState<string>(
    initialOrderForInvoice?.garmentTitle || 'Bespoke Garment'
  );
  const [eventDate, setEventDate] = useState<string>(
    initialOrderForInvoice?.eventDate || new Date().toISOString().split('T')[0]
  );
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(
    '50% deposit required upon fabric drop-off to confirm cutting schedule.'
  );

  // Line items state
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'it-1',
      description: 'Bespoke Couturier Pattern & Construction',
      category: 'Labor / Dressmaking',
      quantity: 1,
      unitPrice: initialOrderForInvoice?.estimatedPrice || 3800,
    },
    {
      id: 'it-2',
      description: 'Notions, Interfacing & Invisible Fastenings',
      category: 'Fabric / Notions',
      quantity: 1,
      unitPrice: 350,
    },
  ]);

  // Identify orders that need an invoice (fabric received or fitting stage without invoice)
  const ordersNeedingInvoice = orders.filter(
    (o) =>
      (o.status === 'Fabric Received' ||
        o.status === 'Fitting' ||
        o.status === 'In Production' ||
        o.status === 'Final Fitting') &&
      (!o.invoiceId || !invoices.some((i) => i.id === o.invoiceId))
  );

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const depositRequired = Math.round(subtotal * 0.5);

  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: `it-${Date.now()}`,
        description: '',
        category: 'Labor / Dressmaking',
        quantity: 1,
        unitPrice: 500,
      },
    ]);
  };

  const removeItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItemRow = (idx: number, updates: Partial<InvoiceItem>) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, ...updates } : item)));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustId);
    if (!cust) return;

    const created = createInvoice({
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      customerPhone: cust.phone,
      orderId: selectedOrderId || undefined,
      garmentTitle,
      eventDate,
      items,
      subtotal,
      depositRequired,
      depositPaid: 0,
      total: subtotal,
      issueDate,
      dueDate,
      status: 'Issued',
      notes,
    });

    setIsCreateModalOpen(false);
    setSelectedInvoice(created);
    setIsViewModalOpen(true);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus !== 'All' && inv.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inv.customerName.toLowerCase().includes(q) ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.garmentTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
            <span>Boutique Financials & Billing</span>
            <span>·</span>
            <span className="text-[#9E616B] font-semibold">
              Delayed Invoicing Prevention
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2D2424] font-medium">
            Invoice Control & Automated Reminders
          </h2>
          <p className="text-xs text-[#6B5E59] mt-1 max-w-xl">
            Generate professional boutique invoices, track 50% fabric deposits, and send WhatsApp payment notifications in one click.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedOrderId('');
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#2D2424] hover:bg-[#4A3E3D] text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* CORE ADMINISTRATIVE HIGHLIGHT 1: Orders that still need invoices issued */}
      {ordersNeedingInvoice.length > 0 && (
        <div className="bg-[#FAF0E6] border border-[#E0D2C7] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD8] mb-3">
            <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-[#9E616B]" />
              <span>Invoices Waiting to be Issued ({ordersNeedingInvoice.length} Garments in Atelier)</span>
            </div>
            <span className="text-[11px] text-stone-500">
              Fabric received but no invoice billed yet
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ordersNeedingInvoice.map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-3.5 rounded-lg border border-[#E8DFD8] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-medium text-[#2D2424] block">{ord.customerName}</span>
                  <span className="text-[11px] text-[#9E616B] block truncate max-w-[180px]">
                    {ord.garmentTitle}
                  </span>
                  <span className="text-[10px] text-stone-400">Status: {ord.status}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedOrderId(ord.id);
                    setSelectedCustId(ord.customerId);
                    setGarmentTitle(ord.garmentTitle);
                    setEventDate(ord.eventDate);
                    setItems([
                      {
                        id: 'it-1',
                        description: `Bespoke Creation: ${ord.garmentTitle}`,
                        category: 'Labor / Dressmaking',
                        quantity: 1,
                        unitPrice: ord.estimatedPrice || 3500,
                      },
                    ]);
                    setIsCreateModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-[#9E616B] hover:bg-[#864F58] text-white rounded text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                >
                  Issue Invoice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E8DFD8] rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Status filters */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400 font-medium">Status:</span>
          {['All', 'Issued', 'Overdue', 'Paid'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#2D2424] text-white border-[#2D2424] font-medium'
                  : 'bg-white text-stone-600 border-[#E8DFD8] hover:border-stone-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client or invoice #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg text-xs focus:outline-none focus:border-[#9E616B]"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E8DFD8] rounded-xl text-stone-400 text-xs">
            No invoices found.
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                inv.status === 'Overdue'
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-[#E8DFD8] hover:border-[#D4C5B9]'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
                  <span className="font-mono font-bold text-stone-900">{inv.invoiceNumber}</span>
                  <span>·</span>
                  <span>Issued: {inv.issueDate}</span>
                  <span>·</span>
                  <span className={inv.status === 'Overdue' ? 'text-rose-700 font-semibold' : ''}>
                    Due: {inv.dueDate}
                  </span>
                  {inv.status === 'Overdue' && (
                    <span className="text-[10px] font-bold uppercase text-rose-800 bg-rose-100 px-2 py-0.2 rounded-full">
                      Overdue Follow-up Needed
                    </span>
                  )}
                </div>

                <h4 className="font-serif text-lg font-medium text-[#2D2424]">
                  {inv.customerName} · {inv.garmentTitle}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Phone: {inv.customerPhone} · Event Date: {inv.eventDate}
                </p>
              </div>

              {/* Amounts & Actions */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-between md:justify-end">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-[#6B5E59] block">
                    Total Invoiced
                  </span>
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

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setIsViewModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F3ECE4] text-[#2D2424] border border-[#E8DFD8] rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    View / Print
                  </button>

                  <button
                    onClick={() => sendInvoiceNotification(inv.id, 'WhatsApp')}
                    title="Send pre-filled WhatsApp reminder"
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  {inv.status !== 'Paid' && (
                    <button
                      onClick={() => markInvoiceAsPaid(inv.id)}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invoice View Modal */}
      <InvoiceViewModal
        invoice={selectedInvoice}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />

      {/* Create New Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DFD8] rounded-2xl max-w-2xl w-full shadow-2xl p-6 sm:p-8 space-y-5 my-8">
            <h3 className="font-serif text-2xl font-medium text-[#2D2424]">
              Generate Professional Boutique Invoice
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">Customer *</label>
                  <select
                    value={selectedCustId}
                    onChange={(e) => {
                      setSelectedCustId(e.target.value);
                      const c = customers.find((cust) => cust.id === e.target.value);
                      if (c) {
                        setGarmentTitle(c.occasion + ' Garment');
                        setEventDate(c.eventDate);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.occasion})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">Link to Order (Optional)</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => {
                      setSelectedOrderId(e.target.value);
                      const ord = orders.find((o) => o.id === e.target.value);
                      if (ord) {
                        setGarmentTitle(ord.garmentTitle);
                        setEventDate(ord.eventDate);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="">No linked order (standalone)</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber}: {o.garmentTitle} ({o.customerName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#6B5E59] mb-1 font-medium">Garment Title / Description *</label>
                <input
                  type="text"
                  required
                  value={garmentTitle}
                  onChange={(e) => setGarmentTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">Event Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">Invoice Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">Payment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Line Items Editor */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[#6B5E59] font-semibold uppercase tracking-wider text-[11px]">
                    Invoice Line Items & Services
                  </label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-[#9E616B] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E8DFD8]">
                      <input
                        type="text"
                        placeholder="Description (e.g. Corset construction)"
                        value={item.description}
                        onChange={(e) => updateItemRow(idx, { description: e.target.value })}
                        className="flex-1 px-2.5 py-1.5 bg-white border rounded text-xs"
                      />
                      <select
                        value={item.category}
                        onChange={(e) => updateItemRow(idx, { category: e.target.value as any })}
                        className="w-36 px-2 py-1.5 bg-white border rounded text-xs"
                      >
                        <option value="Labor / Dressmaking">Labor</option>
                        <option value="Fabric / Notions">Fabric/Notions</option>
                        <option value="Design / Pattern">Pattern</option>
                        <option value="Rush Fee">Rush Fee</option>
                        <option value="Alteration">Alteration</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItemRow(idx, { quantity: Number(e.target.value) })}
                        className="w-14 px-2 py-1.5 bg-white border rounded text-xs text-center"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateItemRow(idx, { unitPrice: Number(e.target.value) })}
                        className="w-24 px-2 py-1.5 bg-white border rounded text-xs text-right"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Subtotals & 50% deposit calculation */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8] flex items-center justify-between text-xs font-semibold">
                  <span>Total Invoiced: R{subtotal.toLocaleString()}</span>
                  <span className="text-[#9E616B]">
                    Initial 50% Deposit Due: R{depositRequired.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[#6B5E59] mb-1 font-medium">Invoice Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                />
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
                  className="px-6 py-2 bg-[#2D2424] text-white hover:bg-[#4A3E3D] rounded-lg font-medium cursor-pointer"
                >
                  Create & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
