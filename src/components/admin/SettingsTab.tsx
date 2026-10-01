import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Clock,
  Calendar,
  ShieldCheck,
  Building,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Home,
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useStudio();

  // Local form state
  const [studioName, setStudioName] = useState(settings.studioName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [studioAddress, setStudioAddress] = useState(settings.studioAddress);
  const [operatingHoursStart, setOperatingHoursStart] = useState(settings.operatingHoursStart);
  const [operatingHoursEnd, setOperatingHoursEnd] = useState(settings.operatingHoursEnd);
  const [minimumLeadTimeWeeks, setMinimumLeadTimeWeeks] = useState(settings.minimumLeadTimeWeeks);
  const [peakSeasonLeadTimeWeeks, setPeakSeasonLeadTimeWeeks] = useState(
    settings.peakSeasonLeadTimeWeeks
  );
  const [fabricDepositPolicy, setFabricDepositPolicy] = useState(settings.fabricDepositPolicy);
  const [lateArrivalPolicy, setLateArrivalPolicy] = useState(settings.lateArrivalPolicy);

  // Bank details state
  const [bankName, setBankName] = useState(settings.bankDetails.bankName);
  const [accountHolder, setAccountHolder] = useState(settings.bankDetails.accountHolder);
  const [accountNumber, setAccountNumber] = useState(settings.bankDetails.accountNumber);
  const [branchCode, setBranchCode] = useState(settings.bankDetails.branchCode);

  const [toast, setToast] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studioName,
      ownerName,
      phone,
      whatsapp: phone,
      email,
      studioAddress,
      operatingHoursStart,
      operatingHoursEnd,
      minimumLeadTimeWeeks: Number(minimumLeadTimeWeeks),
      peakSeasonLeadTimeWeeks: Number(peakSeasonLeadTimeWeeks),
      fabricDepositPolicy,
      lateArrivalPolicy,
      bankDetails: {
        ...settings.bankDetails,
        bankName,
        accountHolder,
        accountNumber,
        branchCode,
      },
    });

    setToast('Studio policies and configurations saved successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
            <span>Atelier Operating Guidelines</span>
            <span>·</span>
            <span className="text-[#9E616B] font-semibold">Rules & Banking</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2D2424] font-medium">
            Business Settings & Policies
          </h2>
          <p className="text-xs text-[#6B5E59] mt-1 max-w-xl">
            Configure your operating hours, closed weekend policy, 2–3 months minimum lead times, and fabric deposit rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#2D2424] hover:bg-[#4A3E3D] text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Operating Hours & Home Studio Boundaries */}
        <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F3ECE4]">
            <Clock className="w-4 h-4 text-[#9E616B]" />
            <h3 className="font-serif text-lg font-medium text-[#2D2424]">
              Trading Hours & Closed Days
            </h3>
          </div>

          <div className="bg-[#F7E7E6] p-3.5 rounded-xl border border-[#E8DFD8] text-xs text-[#4A3E3D] space-y-1">
            <span className="font-semibold block text-[#2D2424]">
              Home-Studio Boundary Protection:
            </span>
            <p className="leading-relaxed">
              Sadika's Bridal Boutique does not operate on Saturdays or Sundays. The booking engine automatically prevents clients from selecting weekend slots or arriving outside operating hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#6B5E59] mb-1 font-medium">
                Weekday Opening Time (Monday–Friday)
              </label>
              <input
                type="time"
                value={operatingHoursStart}
                onChange={(e) => setOperatingHoursStart(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[#6B5E59] mb-1 font-medium">
                Weekday Closing Time (Monday–Friday)
              </label>
              <input
                type="time"
                value={operatingHoursEnd}
                onChange={(e) => setOperatingHoursEnd(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Lead Times & Peak Seasons */}
        <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F3ECE4]">
            <Calendar className="w-4 h-4 text-[#9E616B]" />
            <h3 className="font-serif text-lg font-medium text-[#2D2424]">
              Lead Times & Peak Season Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#6B5E59] mb-1 font-medium">
                Standard Minimum Lead Time (Weeks)
              </label>
              <input
                type="number"
                min={4}
                max={24}
                value={minimumLeadTimeWeeks}
                onChange={(e) => setMinimumLeadTimeWeeks(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Standard recommendation: 8–12 weeks (2–3 months)
              </span>
            </div>

            <div>
              <label className="block text-[#6B5E59] mb-1 font-medium">
                Peak Season Lead Time (Weeks: Oct–Dec)
              </label>
              <input
                type="number"
                min={8}
                max={30}
                value={peakSeasonLeadTimeWeeks}
                onChange={(e) => setPeakSeasonLeadTimeWeeks(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                December Matric Dance & Wedding threshold: 12 weeks (3 months)
              </span>
            </div>
          </div>
        </div>

        {/* Fabric Deposit & Late Arrival Policies */}
        <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F3ECE4]">
            <ShieldCheck className="w-4 h-4 text-[#9E616B]" />
            <h3 className="font-serif text-lg font-medium text-[#2D2424]">
              Booking Confirmation & Studio Etiquette Rules
            </h3>
          </div>

          <div>
            <label className="block text-[#6B5E59] mb-1 font-medium">
              Fabric Deposit Requirement (Official Confirmation Rule)
            </label>
            <textarea
              rows={3}
              value={fabricDepositPolicy}
              onChange={(e) => setFabricDepositPolicy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[#6B5E59] mb-1 font-medium">
              Late Arrival & Fitting Duration Policy
            </label>
            <textarea
              rows={3}
              value={lateArrivalPolicy}
              onChange={(e) => setLateArrivalPolicy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg leading-relaxed"
            />
          </div>
        </div>

        {/* Electronic Banking Details (for Invoices) */}
        <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F3ECE4]">
            <Building className="w-4 h-4 text-[#9E616B]" />
            <h3 className="font-serif text-lg font-medium text-[#2D2424]">
              Electronic Funds Transfer (EFT) Banking Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#6B5E59] mb-1 font-medium">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[#6B5E59] mb-1 font-medium">Account Holder</label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[#6B5E59] mb-1 font-medium">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-[#6B5E59] mb-1 font-medium">Branch Code</label>
              <input
                type="text"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Studio Reset */}
        <div className="pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={resetAllData}
            className="text-stone-400 hover:text-stone-700 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Prototype Data</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#2D2424] hover:bg-[#4A3E3D] text-white rounded-lg font-medium transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Atelier Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
};
