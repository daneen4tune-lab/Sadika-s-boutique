import React, { useState, useMemo } from 'react';
import { useStudio } from '../../context/StudioContext';
import { OccasionType, ServiceDefinition, AIEnquiryAnalysis } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Info,
  Send,
  Scissors,
} from 'lucide-react';

interface EnquiryBookingWizardProps {
  initialService?: ServiceDefinition | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EnquiryBookingWizard: React.FC<EnquiryBookingWizardProps> = ({
  initialService,
  onSuccess,
  onCancel,
}) => {
  const { settings, appointments, submitEnquiry, checkSlotConflict } = useStudio();

  // Form State
  const [step, setStep] = useState<number>(1);
  const [occasion, setOccasion] = useState<OccasionType>('Wedding');
  const [serviceCategory, setServiceCategory] = useState<string>(
    initialService?.category || 'Bridal Wear'
  );
  const [eventDate, setEventDate] = useState<string>('');
  const [garmentDescription, setGarmentDescription] = useState<string>('');
  const [designPreferences, setDesignPreferences] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Consultation Slot State
  const [wantsConsultation, setWantsConsultation] = useState<boolean>(true);
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('');

  // Contact Info
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // Loading & Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedAnalysis, setCompletedAnalysis] = useState<AIEnquiryAnalysis | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Available Time Slots (Mon-Fri 09:00 - 17:00, 45-min slots)
  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '14:00',
    '15:00',
    '16:00',
  ];

  // Lead-time calculation & warnings based on eventDate
  const leadTimeInfo = useMemo(() => {
    if (!eventDate) return null;
    const now = new Date();
    const event = new Date(eventDate);
    const diffMs = event.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.max(1, Math.round(diffDays / 7));
    const isDecember = event.getMonth() === 11;

    let status: 'optimal' | 'tight' | 'urgent' = 'optimal';
    let message = "Timeline aligns comfortably with Sadika's Bridal Boutique 2–3 months standard lead time.";

    if (diffWeeks < 4) {
      status = 'urgent';
      message = `Event is only ${diffWeeks} weeks away (${diffDays} days). Standard turnaround is 8–12 weeks. An express consultation and rush slot confirmation is essential.`;
    } else if (diffWeeks < 8) {
      status = 'tight';
      message = `Event is in ${diffWeeks} weeks. Standard lead time is 8–12 weeks. Please submit promptly to secure your cutting slot.`;
    } else if (isDecember && diffWeeks < 12) {
      status = 'tight';
      message = `Event is in December peak season. December bookings fill up 3–4 months in advance. Fabric handover will be needed immediately upon consultation.`;
    }

    return {
      days: diffDays,
      weeks: diffWeeks,
      isDecember,
      status,
      message,
    };
  }, [eventDate]);

  // Weekend and operating hours validator for consultation slot
  const dateValidation = useMemo(() => {
    if (!preferredDate) return { isWeekend: false, isValid: true };
    const dateObj = new Date(preferredDate + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const isPast = dateObj.getTime() < new Date().setHours(0, 0, 0, 0);

    return {
      isWeekend,
      isPast,
      isValid: !isWeekend && !isPast,
    };
  }, [preferredDate]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await submitEnquiry({
        customerName,
        phone,
        email,
        occasion,
        eventDate,
        serviceCategory,
        garmentDescription,
        designPreferences,
        notes,
        preferredConsultationDate: wantsConsultation ? preferredDate : undefined,
        preferredTimeSlot: wantsConsultation ? preferredTime : undefined,
      });

      if (res.analysis) {
        setCompletedAnalysis(res.analysis);
      }
      setStep(4); // Success step
    } catch (err: any) {
      console.error('Error submitting enquiry:', err);
      setSubmitError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#E8DFD8] rounded-2xl shadow-xl overflow-hidden max-w-3xl mx-auto">
      {/* Wizard Header */}
      <div className="px-6 py-5 bg-[#FAF8F5] border-b border-[#E8DFD8] flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9E616B] block">
            Bespoke Enquiry & Booking
          </span>
          <h3 className="font-serif text-2xl font-medium text-[#2D2424]">
            {step === 4 ? 'Enquiry Received' : 'Reserve Your Atelier Consultation'}
          </h3>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="text-right">
            <span className="text-xs text-[#6B5E59]">
              Step <strong className="text-[#2D2424]">{step}</strong> of 3
            </span>
            <div className="flex gap-1.5 mt-1">
              <span className={`w-6 h-1 rounded-full ${step >= 1 ? 'bg-[#9E616B]' : 'bg-[#E8DFD8]'}`} />
              <span className={`w-6 h-1 rounded-full ${step >= 2 ? 'bg-[#9E616B]' : 'bg-[#E8DFD8]'}`} />
              <span className={`w-6 h-1 rounded-full ${step >= 3 ? 'bg-[#9E616B]' : 'bg-[#E8DFD8]'}`} />
            </div>
          </div>
        )}
      </div>

      {/* Booking Lead Time & Operating Policy Banner */}
      <div className="bg-[#F7E7E6] px-6 py-3 border-b border-[#E8DFD8] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#9E616B] shrink-0 mt-0.5" />
        <p className="text-xs text-[#6B5E59] leading-relaxed">
          <strong className="text-[#2D2424]">Studio Policy:</strong> Sadika's Bridal Boutique operates{' '}
          <strong>Monday to Friday (09:00–17:00)</strong> and is <strong>closed on weekends</strong>.
          We recommend booking <strong>2–3 months in advance</strong>. A booking is officially confirmed once customer fabric is received at the studio.
        </p>
      </div>

      {/* Wizard Content */}
      <div className="p-6 sm:p-8">
        {submitError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* STEP 1: Occasion & Event Date (Asked early as required!) */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D2424] mb-2">
                1. What is the occasion?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  'Wedding',
                  'Attending a Wedding',
                  'Matric Ball',
                  'Eid',
                  'Christmas / Festive',
                  'Evening Gala',
                  'Alterations & Repairs',
                  'Other Special Occasion',
                ].map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => {
                      setOccasion(occ as OccasionType);
                      if (occ === 'Wedding') setServiceCategory('Bridal Wear');
                      else if (occ === 'Matric Ball') setServiceCategory('Matric Dance');
                      else if (occ === 'Alterations & Repairs') setServiceCategory('Alterations & Repairs');
                      else if (occ === 'Eid' || occ === 'Christmas / Festive') setServiceCategory('Occasion Wear');
                      else setServiceCategory('Evening Wear');
                    }}
                    className={`p-3 text-left border rounded-lg transition-all cursor-pointer ${
                      occasion === occ
                        ? 'border-[#9E616B] bg-[#F7E7E6] text-[#2D2424] font-medium shadow-xs ring-1 ring-[#9E616B]'
                        : 'border-[#E8DFD8] hover:border-[#D4C5B9] bg-white text-[#6B5E59]'
                    }`}
                  >
                    <span className="text-xs block leading-tight">{occ}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Event / Function Date - Crucial lead time requirement */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D2424]">
                  2. Event / Function Date <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-[#9E616B] font-medium">
                  Ideal Lead Time: 2–3 Months Ahead
                </span>
              </div>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#E8DFD8] rounded-lg text-sm text-[#2D2424] focus:outline-none focus:border-[#9E616B] focus:ring-1 focus:ring-[#9E616B]"
              />

              {/* Dynamic Lead-time evaluation card */}
              {leadTimeInfo && (
                <div
                  className={`mt-3 p-4 rounded-xl border transition-all text-xs ${
                    leadTimeInfo.status === 'urgent'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : leadTimeInfo.status === 'tight'
                      ? 'bg-stone-50 border-stone-300 text-stone-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium mb-1">
                    {leadTimeInfo.status === 'urgent' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : leadTimeInfo.status === 'tight' ? (
                      <Clock className="w-4 h-4 text-stone-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span>
                      {leadTimeInfo.weeks} weeks until your event ({leadTimeInfo.days} days)
                      {leadTimeInfo.isDecember && ' · December Peak Season'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {leadTimeInfo.message}
                  </p>
                </div>
              )}
            </div>

            {/* Service Category confirmation */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D2424] mb-2">
                Service Category
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B]"
              >
                <option value="Bridal Wear">Bridal Wear (Gowns, Veils, Bridesmaids, Mother of Bride)</option>
                <option value="Matric Dance">Matric Ball / Prom Couture</option>
                <option value="Occasion Wear">Occasion Wear (Eid, Christmas, Cultural, Traditional)</option>
                <option value="Evening Wear">Evening & Gala Wear (Black Tie, Cocktail)</option>
                <option value="Alterations & Repairs">Alterations, Resizing & Restyling</option>
              </select>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!eventDate}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-[#2D2424] text-white hover:bg-[#4A3E3D] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Garment Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Garment Description & Design Preferences */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D2424] mb-1.5">
                Garment Description <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-[#6B5E59] mb-2">
                Describe what you envision: silhouette, neckline, length, structure, or alterations needed.
              </p>
              <textarea
                required
                rows={3}
                value={garmentDescription}
                onChange={(e) => setGarmentDescription(e.target.value)}
                placeholder="e.g. Strapless corseted matric ball gown in duchess satin with a draped cowl neckline and high side slit..."
                className="w-full px-4 py-3 bg-white border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D2424] mb-1.5">
                Design Preferences & Inspiration
              </label>
              <textarea
                rows={2}
                value={designPreferences}
                onChange={(e) => setDesignPreferences(e.target.value)}
                placeholder="e.g. Deep emerald green or bronze tone, minimalist finish, boned corset, floor length puddle train..."
                className="w-full px-4 py-3 bg-white border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D2424] mb-1.5">
                Fabric & Special Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Do you already have fabric or need Sadika to calculate meterage? Any fitting considerations or tight deadlines?"
                className="w-full px-4 py-3 bg-white border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B] leading-relaxed"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!garmentDescription.trim()}
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-[#2D2424] text-white hover:bg-[#4A3E3D] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Consultation Booking</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Consultation Fitting Slot & Contact Info */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Consultation toggle */}
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2424]">
                    Request an In-Person Consultation / Fitting
                  </h4>
                  <p className="text-[11px] text-[#6B5E59] mt-0.5">
                    45-minute private atelier slot at Sadika's Bridal Boutique (Rondebosch/Claremont)
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={wantsConsultation}
                  onChange={(e) => setWantsConsultation(e.target.checked)}
                  className="w-4 h-4 text-[#9E616B] rounded border-stone-300 focus:ring-[#9E616B] cursor-pointer"
                />
              </div>

              {wantsConsultation && (
                <div className="mt-4 pt-4 border-t border-[#E8DFD8] space-y-4">
                  {/* Date picker with weekday validation */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-[#2D2424]">
                        Select Weekday (Monday to Friday only)
                      </label>
                      <span className="text-[11px] text-[#9E616B] font-medium">
                        Closed Saturdays & Sundays
                      </span>
                    </div>
                    <input
                      type="date"
                      required={wantsConsultation}
                      min={new Date().toISOString().split('T')[0]}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B]"
                    />

                    {dateValidation.isWeekend && (
                      <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>
                          Sadika's Bridal Boutique does not operate on weekends. Please select a weekday (Monday to Friday).
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Time slot picker */}
                  <div>
                    <label className="block text-xs font-medium text-[#2D2424] mb-2">
                      Available Consultation Slot (45 mins)
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map((time) => {
                        const isConflict = preferredDate ? checkSlotConflict(preferredDate, time) : false;
                        const isSelected = preferredTime === time;

                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={isConflict || dateValidation.isWeekend}
                            onClick={() => setPreferredTime(time)}
                            className={`py-2 px-3 text-xs rounded-lg border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#9E616B] text-white border-[#9E616B] font-medium shadow-xs'
                                : isConflict
                                ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through'
                                : 'bg-white text-[#2D2424] border-[#E8DFD8] hover:border-[#9E616B]'
                            }`}
                          >
                            <span>{time}</span>
                            {isConflict && <span className="block text-[9px]">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2424]">
                Your Contact Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#6B5E59] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chloe Van Der Merwe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#6B5E59] mb-1">
                    WhatsApp / Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +27 82 555 1234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6B5E59] mb-1">
                  Email Address (For booking reminders & invoices)
                </label>
                <input
                  type="email"
                  placeholder="e.g. chloe.vdm@icloud.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B]"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex justify-between border-t border-[#E8DFD8]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !customerName ||
                  !phone ||
                  (wantsConsultation && (!preferredDate || !preferredTime || dateValidation.isWeekend))
                }
                className="px-6 py-2.5 bg-[#9E616B] text-white hover:bg-[#864F58] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Enquiry with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Enquiry & Request Slot</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Success & Intelligent AI Timeline Feedback */}
        {step === 4 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#F7E7E6] text-[#9E616B] flex items-center justify-center mx-auto border border-[#D4C5B9]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-[#9E616B] font-semibold block mb-1">
                Enquiry Successfully Dispatched
              </span>
              <h3 className="font-serif text-3xl font-medium text-[#2D2424]">
                Thank you, {customerName}!
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#6B5E59] max-w-lg mx-auto leading-relaxed">
                Sadika has received your request for your <strong>{occasion}</strong> on{' '}
                <strong>{eventDate}</strong>. We have generated an intelligent atelier feasibility breakdown below.
              </p>
            </div>

            {/* AI Enquiry Extraction & Feasibility Card */}
            {completedAnalysis && (
              <div className="bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl p-5 text-left max-w-xl mx-auto shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD8] mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#9E616B]" />
                    <span className="font-serif text-sm font-semibold text-[#2D2424]">
                      Gemini Atelier Extraction & Timeline Analysis
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      completedAnalysis.urgencyLevel === 'Urgent' ||
                      completedAnalysis.urgencyLevel === 'Critical'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {completedAnalysis.urgencyLevel} Lead Time
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-[10px] uppercase text-[#6B5E59] block">Garment Type</span>
                    <span className="font-medium text-[#2D2424]">{completedAnalysis.garmentType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#6B5E59] block">Event Date</span>
                    <span className="font-medium text-[#2D2424]">{completedAnalysis.eventDate}</span>
                  </div>
                </div>

                <div className="mb-3 text-xs">
                  <span className="text-[10px] uppercase text-[#6B5E59] block">Schedule Assessment</span>
                  <p className="text-stone-700 bg-white p-2.5 rounded border border-[#E8DFD8] text-[11px] leading-relaxed">
                    {completedAnalysis.urgencyReason}
                  </p>
                </div>

                {completedAnalysis.estimatedFittingSchedule && (
                  <div>
                    <span className="text-[10px] uppercase text-[#6B5E59] block mb-1">
                      Projected Milestone Roadmap:
                    </span>
                    <div className="space-y-1 bg-white p-2.5 rounded border border-[#E8DFD8]">
                      {completedAnalysis.estimatedFittingSchedule.map((stage, idx) => (
                        <div key={idx} className="flex items-start justify-between text-[11px] text-stone-600">
                          <span className="font-medium text-[#2D2424]">{stage.stage}</span>
                          <span className="text-[#9E616B] font-mono">{stage.suggestedTiming}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Next Steps Notice */}
            <div className="bg-[#F7E7E6] p-4 rounded-xl border border-[#E8DFD8] text-xs text-[#6B5E59] max-w-xl mx-auto">
              <span className="font-semibold text-[#2D2424] block mb-1">What happens next?</span>
              <p className="leading-relaxed">
                1. Sadika will review your requested consultation slot on her atelier calendar.
                <br />
                2. You will receive an automated WhatsApp confirmation with studio directions.
                <br />
                3. Remember: booking is officially locked once fabric is handed in.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onSuccess}
                className="px-8 py-2.5 bg-[#2D2424] text-white hover:bg-[#4A3E3D] rounded-lg text-xs font-medium transition-all cursor-pointer shadow-xs"
              >
                Return to Studio Portal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
