import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { X, Clock, Calendar, AlertOctagon, CheckCircle2, ShieldCheck, Home } from 'lucide-react';

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useStudio();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8DFD8] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-[#E8DFD8] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9E616B] block">
              Atelier Etiquette & Standards
            </span>
            <h3 className="font-serif text-2xl font-medium text-[#2D2424]">
              Sadika's Bridal Boutique Policies
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Operating Hours & Home Studio Boundaries */}
          <div className="bg-[#F7E7E6] p-5 rounded-xl border border-[#E8DFD8] space-y-3">
            <div className="flex items-center gap-2 text-[#9E616B]">
              <Home className="w-5 h-5" />
              <h4 className="font-serif text-lg font-medium text-[#2D2424]">
                Home-Based Atelier Operating Boundaries
              </h4>
            </div>
            <p className="text-xs text-[#4A3E3D] leading-relaxed">
              While Sadika's Bridal Boutique is proudly situated within a dedicated residential garden atelier in
              Rondebosch/Claremont, <strong>working from home does not mean 24/7 availability or walk-in service</strong>.
              All consultations and fittings are strictly conducted by pre-scheduled appointment.
            </p>
            <div className="pt-2 border-t border-[#E8DFD8] flex flex-wrap items-center justify-between text-xs text-[#2D2424] font-medium gap-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#9E616B]" />
                Trading Hours: Mon–Fri, 09:00 – 17:00
              </span>
              <span className="flex items-center gap-1.5 text-rose-800 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                <AlertOctagon className="w-4 h-4" />
                Weekends (Sat & Sun): Strictly Closed
              </span>
            </div>
          </div>

          {/* Lead Times & Peak Seasons */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#9E616B]" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2424]">
                Recommended Lead Times
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg">
                <span className="font-medium text-[#2D2424] block mb-1">
                  Standard Bespoke Garments:
                </span>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Ideally <strong>2 to 3 months (8–12 weeks)</strong> prior to event date. This allows for initial sketching, toile mockup, and multiple fitting stages.
                </p>
              </div>
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg">
                <span className="font-medium text-[#9E616B] block mb-1">
                  Matric Balls & December Weddings:
                </span>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Matric season (Sept–Nov) and December rush fill up fast. We urge clients to reserve cutting slots <strong>3 to 4 months in advance</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Fabric Deposit Policy */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9E616B]" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2424]">
                Booking Confirmation via Fabric Deposit
              </h4>
            </div>
            <p className="text-xs text-stone-700 bg-[#FAF8F5] p-3.5 rounded-lg border border-[#E8DFD8] leading-relaxed">
              {settings.fabricDepositPolicy}
            </p>
          </div>

          {/* Late Arrival Policy */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#9E616B]" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2424]">
                Fitting Duration & Late Arrival Grace Period
              </h4>
            </div>
            <p className="text-xs text-stone-700 bg-[#FAF8F5] p-3.5 rounded-lg border border-[#E8DFD8] leading-relaxed">
              {settings.lateArrivalPolicy}
            </p>
          </div>

          {/* Fitting Attire Advice */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2D2424]">
              What to Bring to Your Fittings:
            </h4>
            <ul className="text-xs text-stone-600 space-y-1.5 pl-4 list-disc">
              <li>The exact bridal/evening shoes or heel height you plan to wear.</li>
              <li>Appropriate seamless undergarments or shapewear intended for the event.</li>
              <li>A hair tie or clips if your chosen silhouette features back or shoulder detailing.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#E8DFD8] text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2D2424] text-white hover:bg-[#4A3E3D] rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
