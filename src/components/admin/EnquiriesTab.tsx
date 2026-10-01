import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Enquiry } from '../../types';
import {
  Inbox,
  Sparkles,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Phone,
  Mail,
  ChevronRight,
  Filter,
  RefreshCw,
  Scissors,
  Check,
} from 'lucide-react';

interface EnquiriesTabProps {
  onOpenQuickAiIntake: () => void;
  onNavigateTab: (tab: string) => void;
}

export const EnquiriesTab: React.FC<EnquiriesTabProps> = ({
  onOpenQuickAiIntake,
  onNavigateTab,
}) => {
  const {
    enquiries,
    analyzeEnquiryWithGemini,
    convertEnquiryToOrderAndCustomer,
    updateEnquiryStatus,
  } = useStudio();

  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>(
    enquiries[0]?.id || ''
  );
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const selectedEnquiry = enquiries.find((e) => e.id === selectedEnquiryId) || enquiries[0];

  const filteredEnquiries = enquiries.filter((e) => {
    if (filterStatus === 'All') return true;
    return e.status === filterStatus;
  });

  // Re-run AI Analysis with Gemini
  const handleReAnalyze = async () => {
    if (!selectedEnquiry) return;
    setIsAnalyzing(true);
    try {
      await analyzeEnquiryWithGemini(selectedEnquiry.id);
      setSuccessToast('Enquiry re-analyzed with Gemini 3.8 Flash!');
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 1-Click Convert Enquiry to Customer Profile & Order
  const handleConvert = () => {
    if (!selectedEnquiry) return;
    const { customer, order } = convertEnquiryToOrderAndCustomer(selectedEnquiry.id);
    setSuccessToast(
      `Successfully converted to customer "${customer.name}" and order ${order.orderNumber}!`
    );
    setTimeout(() => {
      setSuccessToast(null);
      onNavigateTab('orders');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header & Action Bar */}
      <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
            <span>Client Inquiries & Bookings</span>
            <span>·</span>
            <span className="text-[#9E616B] font-medium">Gemini-Assisted Intake</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2D2424] font-medium">
            Enquiries & AI Lead-Time Assessment
          </h2>
          <p className="text-xs text-[#6B5E59] mt-1 max-w-xl">
            Gemini automatically extracts garment parameters and checks against Sadika's Bridal Boutique's 2–3 months lead time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenQuickAiIntake}
            className="px-4 py-2 bg-[#9E616B] hover:bg-[#864F58] text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI WhatsApp Intake</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-stone-400 font-medium">Filter Status:</span>
        {['All', 'New', 'Reviewed', 'Accepted'].map((st) => (
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

      {/* Main Split View: Enquiry List (Left) & Gemini Deep Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Enquiry List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredEnquiries.length === 0 ? (
            <div className="bg-white border border-[#E8DFD8] rounded-xl p-8 text-center text-xs text-stone-400">
              No enquiries match the selected filter.
            </div>
          ) : (
            filteredEnquiries.map((enq) => {
              const isSelected = selectedEnquiry?.id === enq.id;
              const urgency = enq.aiAnalysis?.urgencyLevel || 'Standard';

              return (
                <div
                  key={enq.id}
                  onClick={() => setSelectedEnquiryId(enq.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-white border-[#9E616B] shadow-sm ring-1 ring-[#9E616B]/30'
                      : 'bg-white border-[#E8DFD8] hover:border-[#D4C5B9]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="font-serif text-base font-medium text-[#2D2424]">
                        {enq.customerName}
                      </h4>
                      <span className="text-[11px] text-[#9E616B] font-medium">
                        {enq.occasion} · {enq.serviceCategory}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                          urgency === 'Urgent' || urgency === 'Critical'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {urgency}
                      </span>
                      <span className="block text-[10px] text-stone-400 font-mono mt-0.5">
                        {new Date(enq.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="text-stone-600 line-clamp-2 text-[11px] mb-2 leading-relaxed">
                    {enq.garmentDescription}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-[#F3ECE4]">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-[#9E616B]" />
                      Event: {enq.eventDate}
                    </span>
                    <span className="text-stone-400">Status: {enq.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Enquiry Detailed AI Summary (Right) */}
        <div className="lg:col-span-7">
          {selectedEnquiry ? (
            <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F3ECE4]">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
                    <span>Enquiry #{selectedEnquiry.id}</span>
                    <span>·</span>
                    <span className="font-semibold text-stone-800">{selectedEnquiry.occasion}</span>
                  </div>
                  <h3 className="font-serif text-2xl font-medium text-[#2D2424]">
                    {selectedEnquiry.customerName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#9E616B]" />
                      {selectedEnquiry.phone}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#9E616B]" />
                      {selectedEnquiry.email}
                    </span>
                  </div>
                </div>

                {/* Status Switcher & Re-analyze */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReAnalyze}
                    disabled={isAnalyzing}
                    className="p-2 border border-[#E8DFD8] hover:border-[#9E616B] rounded-lg text-stone-600 hover:text-[#9E616B] transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                    title="Refresh analysis using Gemini 3.8 Flash"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Re-analyze</span>
                  </button>

                  <select
                    value={selectedEnquiry.status}
                    onChange={(e) =>
                      updateEnquiryStatus(selectedEnquiry.id, e.target.value as any)
                    }
                    className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg text-xs font-medium text-[#2D2424] focus:outline-none"
                  >
                    <option value="New">Status: New</option>
                    <option value="Reviewed">Status: Reviewed</option>
                    <option value="Accepted">Status: Accepted</option>
                    <option value="Archived">Status: Archived</option>
                  </select>
                </div>
              </div>

              {/* RAW CUSTOMER ENQUIRY */}
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DFD8] text-xs text-stone-700">
                <span className="font-semibold text-[#2D2424] block mb-1">
                  Customer's Original Brief & Notes:
                </span>
                <p className="whitespace-pre-wrap leading-relaxed">
                  "{selectedEnquiry.garmentDescription}"
                </p>
                {selectedEnquiry.designPreferences && (
                  <p className="mt-2 text-[11px] text-[#6B5E59]">
                    <strong>Design Preferences:</strong> {selectedEnquiry.designPreferences}
                  </p>
                )}
                {selectedEnquiry.notes && (
                  <p className="mt-1 text-[11px] text-[#6B5E59]">
                    <strong>Notes:</strong> {selectedEnquiry.notes}
                  </p>
                )}
                {selectedEnquiry.preferredConsultationDate && (
                  <div className="mt-3 pt-2 border-t border-[#E8DFD8] text-[11px] text-[#2D2424] font-medium flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#9E616B]" />
                    <span>
                      Requested Consultation Slot: {selectedEnquiry.preferredConsultationDate} at{' '}
                      {selectedEnquiry.preferredTimeSlot || '10:00'} (Weekday)
                    </span>
                  </div>
                )}
              </div>

              {/* GEMINI AI ENQUIRY SUMMARY */}
              {selectedEnquiry.aiAnalysis ? (
                <div className="bg-gradient-to-br from-[#FAF8F5] via-white to-[#F7E7E6]/30 border border-[#E8DFD8] rounded-2xl p-5 shadow-xs space-y-4">
                  {/* AI Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD8]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#F7E7E6] text-[#9E616B] flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg font-medium text-[#2D2424]">
                          AI Enquiry Summary & Feasibility
                        </h4>
                        <span className="text-[10px] text-stone-400">
                          Powered by Gemini 3.8 Flash · Couture Studio Rules
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        selectedEnquiry.aiAnalysis.urgencyLevel === 'Urgent' ||
                        selectedEnquiry.aiAnalysis.urgencyLevel === 'Critical'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedEnquiry.aiAnalysis.urgencyLevel} Urgency
                    </span>
                  </div>

                  {/* Core Extracted Parameters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white border border-[#E8DFD8] rounded-xl">
                      <span className="text-[10px] uppercase text-[#6B5E59] block">
                        Requested Service
                      </span>
                      <span className="font-medium text-[#2D2424] mt-0.5 block">
                        {selectedEnquiry.aiAnalysis.requestedService}
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-[#E8DFD8] rounded-xl">
                      <span className="text-[10px] uppercase text-[#6B5E59] block">
                        Occasion & Function
                      </span>
                      <span className="font-medium text-[#2D2424] mt-0.5 block">
                        {selectedEnquiry.aiAnalysis.occasion}
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-[#E8DFD8] rounded-xl">
                      <span className="text-[10px] uppercase text-[#6B5E59] block">
                        Event Date / Target
                      </span>
                      <span className="font-mono font-medium text-[#2D2424] mt-0.5 block">
                        {selectedEnquiry.aiAnalysis.eventDate}
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-[#E8DFD8] rounded-xl col-span-2">
                      <span className="text-[10px] uppercase text-[#6B5E59] block">
                        Garment Type & Silhouette
                      </span>
                      <span className="font-medium text-[#2D2424] mt-0.5 block">
                        {selectedEnquiry.aiAnalysis.garmentType}
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-[#E8DFD8] rounded-xl">
                      <span className="text-[10px] uppercase text-[#6B5E59] block">
                        Lead Time
                      </span>
                      <span className="font-medium text-[#9E616B] mt-0.5 block">
                        {selectedEnquiry.aiAnalysis.leadTimeWeeks || '~6'} Weeks Remaining
                      </span>
                    </div>
                  </div>

                  {/* Urgency / Lead Time Assessment */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-900 mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Studio Urgency & Capacity Assessment:</span>
                    </div>
                    <p className="leading-relaxed text-[11px]">
                      {selectedEnquiry.aiAnalysis.urgencyReason}
                    </p>
                  </div>

                  {/* Suggested Administrative Actions for Sadika */}
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2D2424] block mb-2">
                      Suggested Atelier Administrative Actions:
                    </span>
                    <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-[#E8DFD8]">
                      {selectedEnquiry.aiAnalysis.suggestedActions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                          <Check className="w-3.5 h-3.5 text-[#9E616B] mt-0.5 shrink-0" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Milestone Roadmap */}
                  {selectedEnquiry.aiAnalysis.estimatedFittingSchedule && (
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2D2424] block mb-2">
                        Suggested Fitting Timeline Roadmap:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedEnquiry.aiAnalysis.estimatedFittingSchedule.map((stg, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2.5 bg-white border border-[#E8DFD8] rounded-lg text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-[#2D2424]">{stg.stage}</span>
                              <span className="font-mono text-[10px] text-[#9E616B]">
                                {stg.suggestedTiming}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-500">{stg.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-[#FAF8F5] border border-dashed border-[#E8DFD8] rounded-2xl text-center">
                  <Sparkles className="w-6 h-6 text-[#9E616B] mx-auto mb-2" />
                  <p className="text-xs text-stone-600 mb-3">
                    This enquiry has not yet been processed with Gemini.
                  </p>
                  <button
                    onClick={handleReAnalyze}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-[#9E616B] text-white rounded-lg text-xs font-medium hover:bg-[#864F58] cursor-pointer"
                  >
                    Run Gemini AI Extraction
                  </button>
                </div>
              )}

              {/* Conversion Action Bar */}
              <div className="pt-4 border-t border-[#F3ECE4] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#6B5E59]">
                  Ready to accept this booking into Sadika’s cutting diary?
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-white border border-[#E8DFD8] hover:border-[#D4C5B9] text-stone-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Client</span>
                  </a>

                  <button
                    onClick={handleConvert}
                    className="px-5 py-2.5 bg-[#2D2424] hover:bg-[#4A3E3D] text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-[#9E616B]" />
                    <span>Accept & Create Order + Profile</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E8DFD8] rounded-2xl p-12 text-center text-xs text-stone-400">
              Select an enquiry on the left to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
