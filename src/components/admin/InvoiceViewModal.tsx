import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Invoice } from '../../types';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  Send,
  CreditCard,
  Building,
  Phone,
  Mail,
  Copy,
  Check,
} from 'lucide-react';

interface InvoiceViewModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const { settings, markInvoiceAsPaid, sendInvoiceNotification } = useStudio();
  const [copiedBank, setCopiedBank] = useState<boolean>(false);
  const [paymentToast, setPaymentToast] = useState<string | null>(null);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppSend = () => {
    sendInvoiceNotification(invoice.id, 'WhatsApp');
    setPaymentToast('WhatsApp invoice notification dispatched to client!');
    setTimeout(() => setPaymentToast(null), 3000);
  };

  const handleEmailSend = () => {
    sendInvoiceNotification(invoice.id, 'Email');
    setPaymentToast('Email invoice notification dispatched to client!');
    setTimeout(() => setPaymentToast(null), 3000);
  };

  const handleMarkPaid = () => {
    markInvoiceAsPaid(invoice.id, 'EFT First National Bank');
    setPaymentToast('Invoice marked as Paid in Full!');
    setTimeout(() => setPaymentToast(null), 3000);
  };

  const copyBankDetails = () => {
    const text = `Sadika's Bridal Boutique Banking:\nBank: ${settings.bankDetails.bankName}\nAccount: ${settings.bankDetails.accountNumber}\nBranch: ${settings.bankDetails.branchCode}\nRef: ${invoice.invoiceNumber} / ${invoice.customerName}`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8DFD8] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:my-0 print:max-w-none">
        {/* Modal Top Actions (Hidden when printing) */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E8DFD8] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-stone-900">
              {invoice.invoiceNumber}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                invoice.status === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : invoice.status === 'Overdue'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-stone-600 hover:text-stone-900 border border-[#E8DFD8] hover:border-stone-400 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleWhatsAppSend}
              className="px-3 py-1.5 bg-[#9E616B] hover:bg-[#864F58] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>

            {invoice.status !== 'Paid' && (
              <button
                onClick={handleMarkPaid}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Paid</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {paymentToast && (
          <div className="p-3 bg-emerald-50 text-emerald-900 text-xs text-center border-b border-emerald-200">
            {paymentToast}
          </div>
        )}

        {/* PRINTABLE BOUTIQUE INVOICE DOCUMENT */}
        <div className="p-8 sm:p-12 space-y-8 bg-white text-[#2D2424]">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#E8DFD8]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-[#D4C5B9] bg-[#F7E7E6] flex items-center justify-center text-[#9E616B] font-serif text-2xl font-semibold">
                S
              </div>
              <div>
                <h1 className="font-serif text-3xl font-medium tracking-tight text-[#2D2424]">
                  {settings.studioName}
                </h1>
                <p className="text-xs text-[#6B5E59] tracking-widest uppercase">
                  Bespoke Bridal, Haute Evening Wear & Alterations
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {settings.studioAddress} · {settings.phone}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-serif text-3xl text-stone-400 font-light block">
                INVOICE
              </span>
              <span className="font-mono text-sm font-semibold text-[#2D2424] block mt-1">
                {invoice.invoiceNumber}
              </span>
              <span className="text-xs text-stone-500 block">
                Issue Date: {invoice.issueDate}
              </span>
              <span className="text-xs font-semibold text-red-700 block">
                Payment Due: {invoice.dueDate}
              </span>
            </div>
          </div>

          {/* Client & Garment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8]">
              <span className="text-[10px] uppercase font-semibold text-[#6B5E59] block mb-1">
                Billed To Client:
              </span>
              <h4 className="font-serif text-lg font-medium text-[#2D2424]">
                {invoice.customerName}
              </h4>
              <p className="text-stone-600 mt-1">Phone: {invoice.customerPhone}</p>
              <p className="text-stone-600">Email: {invoice.customerEmail}</p>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8]">
              <span className="text-[10px] uppercase font-semibold text-[#6B5E59] block mb-1">
                Commissioned Garment & Event:
              </span>
              <h4 className="font-serif text-base font-medium text-[#2D2424]">
                {invoice.garmentTitle}
              </h4>
              <p className="text-stone-600 mt-1">
                Target Event Date: <strong>{invoice.eventDate}</strong>
              </p>
              {invoice.orderId && (
                <p className="text-stone-500 font-mono text-[11px]">
                  Order Ref: {invoice.orderId}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-[#2D2424] text-[#2D2424]">
                  <th className="py-2.5 font-semibold">Service Description / Line Item</th>
                  <th className="py-2.5 font-semibold">Category</th>
                  <th className="py-2.5 text-center font-semibold">Qty</th>
                  <th className="py-2.5 text-right font-semibold">Unit Price</th>
                  <th className="py-2.5 text-right font-semibold">Total (ZAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3ECE4]">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium text-[#2D2424] max-w-xs">
                      {item.description}
                    </td>
                    <td className="py-3 text-stone-500">{item.category}</td>
                    <td className="py-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 text-right font-mono">
                      R{item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-[#2D2424]">
                      R{(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal, Deposit, and Balance Breakdown */}
          <div className="border-t border-[#E8DFD8] pt-4 flex flex-col sm:flex-row justify-between gap-6 text-xs">
            <div className="max-w-md space-y-2">
              <span className="font-semibold text-[#2D2424] block">Terms & Deposit Condition:</span>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                As per Sadika's Bridal Boutique business policy, 50% deposit and physical receipt of client fabric are required to officially lock cutting dates. Full balance is payable at final fitting prior to collection.
              </p>
              {invoice.notes && (
                <p className="text-[11px] text-stone-500 italic mt-1">
                  Note: {invoice.notes}
                </p>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-2 text-right">
              <div className="flex justify-between py-1 border-b border-[#F3ECE4]">
                <span className="text-stone-500">Subtotal:</span>
                <span className="font-mono font-medium">R{invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F3ECE4]">
                <span className="text-stone-500">Deposit Required (50%):</span>
                <span className="font-mono font-medium text-[#9E616B]">
                  R{invoice.depositRequired.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F3ECE4]">
                <span className="text-stone-500">Deposit Paid:</span>
                <span className="font-mono font-medium text-emerald-700">
                  R{invoice.depositPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-[#2D2424] text-sm">
                <span className="font-bold text-[#2D2424]">Outstanding Balance:</span>
                <span className="font-serif text-lg font-bold text-[#2D2424]">
                  R{(invoice.total - invoice.depositPaid).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Payment Details */}
          <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E8DFD8] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#9E616B] font-semibold">
                <Building className="w-4 h-4" />
                <span>Electronic Funds Transfer (EFT) Banking Details:</span>
              </div>
              <button
                type="button"
                onClick={copyBankDetails}
                className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer print:hidden"
              >
                {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBank ? 'Copied!' : 'Copy Bank Info'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-700 text-[11px] pt-1">
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
            <p className="text-[10px] text-stone-500 pt-1">
              Payment Reference: <strong className="text-stone-800">{invoice.invoiceNumber} / {invoice.customerName.split(' ').slice(-1)[0]}</strong>
            </p>
          </div>

          {/* Signoff */}
          <div className="text-center pt-4 text-xs text-stone-400">
            <p className="font-serif italic text-sm text-[#2D2424]">
              Thank you for trusting Sadika's Bridal Boutique with your bespoke garment.
            </p>
            <p className="mt-1">{settings.ownerName || 'Sadika Karbary'} · Couture Designer & Master Dressmaker</p>
          </div>
        </div>
      </div>
    </div>
  );
};
