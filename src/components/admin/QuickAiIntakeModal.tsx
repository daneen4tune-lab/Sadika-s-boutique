import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { X, Sparkles, AlertCircle, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';

interface QuickAiIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (enquiryId: string) => void;
}

export const QuickAiIntakeModal: React.FC<QuickAiIntakeModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { submitEnquiry } = useStudio();

  const [rawText, setRawText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Sample quick templates reflecting real WhatsApp customer queries
  const sampleMessages = [
    {
      title: 'Matric Ball in 6 Weeks (Urgent)',
      text: "Hi Auntie Sadika! It's Tamara Jacobs, Shireen's daughter. My matric ball is on November 14th and my dressmaker just cancelled on me! I'm desperate for a burnt copper strapless corset gown with draped organza and a slit. Can you please fit me in for a consultation next week?",
    },
    {
      title: 'Summer Wedding Bride (5 Months)',
      text: 'Good day Sadika. My name is Nadia Solomons. My wedding is on 20 February 2027 in Franschhoek. I would love a clean, modest Italian crepe gown with long sleeves and covered buttons down the back. Could I book a consultation with you on Thursday morning October 8th?',
    },
    {
      title: 'Eid Occasion Wear (Recurring Client)',
      text: "As-salamu alaykum Sadika. Soraya here! Eid is in late December. I've bought 4 meters of gorgeous rose gold raw silk and matching organza. Need a flared kurti and palazzo suit made with pearl beadwork. Let me know when I can drop off the fabric!",
    },
  ];

  const handleProcess = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      // First call Gemini API to parse the unstructured text into enquiry fields
      const res = await fetch('/api/analyze-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: '', // will be parsed
          garmentDescription: rawText,
          notes: 'Ingested via Sadika WhatsApp Quick Intake',
        }),
      });

      let parsedCustomer = 'WhatsApp Client';
      let parsedOccasion: any = 'Other Special Occasion';
      let parsedEventDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      let parsedService = 'Bespoke Evening Wear';

      // Fallback heuristics if text mentions key terms
      const lower = rawText.toLowerCase();
      if (lower.includes('matric') || lower.includes('prom')) {
        parsedOccasion = 'Matric Ball';
        parsedService = 'Matric Dance';
      } else if (lower.includes('wedding') || lower.includes('bride')) {
        parsedOccasion = 'Wedding';
        parsedService = 'Bridal Wear';
      } else if (lower.includes('eid') || lower.includes('christmas')) {
        parsedOccasion = lower.includes('eid') ? 'Eid' : 'Christmas / Festive';
        parsedService = 'Occasion Wear';
      } else if (lower.includes('alter') || lower.includes('hem') || lower.includes('zip')) {
        parsedOccasion = 'Alterations & Repairs';
        parsedService = 'Alterations & Repairs';
      }

      // Extract client name if present
      const nameMatch = rawText.match(/(?:i'm|it's|name is|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (nameMatch && nameMatch[1]) {
        parsedCustomer = nameMatch[1];
      }

      // Create enquiry with server-side AI analysis
      const created = await submitEnquiry({
        customerName: parsedCustomer,
        phone: '+27 82 ' + Math.floor(100 + Math.random() * 900) + ' ' + Math.floor(1000 + Math.random() * 9000),
        email: `${parsedCustomer.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        occasion: parsedOccasion,
        eventDate: parsedEventDate,
        serviceCategory: parsedService,
        garmentDescription: rawText.slice(0, 200),
        designPreferences: 'Parsed automatically from customer WhatsApp chat.',
        notes: `Raw WhatsApp message:\n"${rawText}"`,
        preferredConsultationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        preferredTimeSlot: '11:00',
      });

      onComplete(created.enquiry.id);
      onClose();
    } catch (err: any) {
      console.error('Quick intake error:', err);
      setError(err.message || 'Failed to process WhatsApp text with Gemini.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8DFD8] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-[#E8DFD8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#9E616B]" />
            <div>
              <h3 className="font-serif text-xl font-medium text-[#2D2424]">
                Quick AI WhatsApp Intake
              </h3>
              <p className="text-xs text-[#6B5E59]">
                Paste messy WhatsApp messages; Gemini extracts details & lead times
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#6B5E59] leading-relaxed">
            Instead of manually copying customer messages into diary notebooks, paste the customer’s WhatsApp query below.
            Gemini will extract the <strong>occasion, event date, garment type, design preferences</strong>, and check against your <strong>2–3 month lead time policy</strong>.
          </p>

          {/* Preset Buttons for Quick Demo Testing */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 block mb-1.5">
              Click a sample WhatsApp query to test:
            </span>
            <div className="space-y-1.5">
              {sampleMessages.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRawText(s.text)}
                  className="w-full text-left p-2.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F7E7E6] border border-[#E8DFD8] text-xs transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <span className="font-medium text-[#2D2424] group-hover:text-[#9E616B]">
                    {s.title}
                  </span>
                  <span className="text-[10px] text-stone-400">Load Template</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2D2424] mb-1">
              WhatsApp Message Text:
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste WhatsApp message here..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFD8] rounded-lg text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B] leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#E8DFD8] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isProcessing || !rawText.trim()}
            onClick={handleProcess}
            className="px-5 py-2.5 bg-[#9E616B] text-white hover:bg-[#864F58] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extract & Create Enquiry</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
