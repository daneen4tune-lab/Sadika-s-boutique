import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { Clock, Scissors, Sparkles, ChevronRight, Check } from 'lucide-react';
import { ServiceDefinition } from '../../types';

interface ServicesShowcaseProps {
  onSelectService: (service: ServiceDefinition) => void;
}

export const ServicesShowcase: React.FC<ServicesShowcaseProps> = ({ onSelectService }) => {
  const { services, settings } = useStudio();

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest text-[#9E616B] font-semibold mb-2 block">
          Bespoke Couture & Fine Needlework
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2D2424] font-medium tracking-tight">
          Services Tailored to Your Milestone
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#6B5E59] leading-relaxed">
          Every gown and garment is individually drafted, cut, and hand-finished by Sadika Karbary in her private Cape Town atelier.
          Please note our recommended 2–3 months lead time for bespoke garments.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, idx) => (
          <div
            key={service.id}
            className="bg-white border border-[#E8DFD8] rounded-xl p-6 hover:shadow-md hover:border-[#D4C5B9] transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Category & Lead Time */}
              <div className="flex items-center justify-between text-xs text-[#6B5E59] mb-3 pb-3 border-b border-[#F3ECE4]">
                <span className="font-medium text-[#9E616B]">{service.category}</span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-stone-500">
                  <Clock className="w-3 h-3 text-[#9E616B]" />
                  {service.typicalLeadTime}
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="font-serif text-xl font-medium text-[#2D2424] group-hover:text-[#9E616B] transition-colors mb-2">
                {service.title}
              </h3>
              <p className="text-xs text-[#6B5E59] italic mb-4 leading-relaxed">
                "{service.tagline}"
              </p>

              <p className="text-xs text-[#4A3E3D] leading-relaxed mb-4">
                {service.description}
              </p>

              {/* Sub-services list */}
              <div className="space-y-1.5 mb-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2D2424] block mb-1">
                  Specialised Garments:
                </span>
                {service.subServices.map((sub, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2 text-xs text-stone-600">
                    <Check className="w-3.5 h-3.5 text-[#9E616B] mt-0.5 shrink-0" />
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Footer: Starting Price & Enquiry CTA */}
            <div className="pt-4 border-t border-[#F3ECE4] mt-auto">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[11px] text-[#6B5E59]">Investment from</span>
                <span className="font-serif text-lg font-semibold text-[#2D2424]">
                  R{service.startingPrice.toLocaleString()}
                </span>
              </div>

              <div className="text-[11px] text-stone-500 bg-[#FAF8F5] p-2 rounded mb-3 border border-[#F3ECE4]">
                <span className="font-medium text-stone-700">Fabric policy: </span>
                {service.fabricNotice}
              </div>

              <button
                onClick={() => onSelectService(service)}
                className="w-full py-2.5 px-4 bg-[#FAF8F5] hover:bg-[#F7E7E6] text-[#2D2424] hover:text-[#9E616B] border border-[#E8DFD8] hover:border-[#D4C5B9] rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Enquire & Check Lead Time</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking lead time reminder strip */}
      <div className="mt-12 bg-[#F3ECE4] border border-[#E8DFD8] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-serif text-lg text-[#2D2424] font-medium">
            Planning for December Weddings, Matric Dances or Eid?
          </h4>
          <p className="text-xs sm:text-sm text-[#6B5E59] mt-1">
            Sadika's Bridal Boutique strictly reserves cutting capacity based on event dates. Bookings become officially confirmed once customer fabric is handed over.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <span className="text-xs font-mono text-[#9E616B] font-semibold bg-white px-3 py-1.5 rounded border border-[#E8DFD8]">
            Lead Time: 2–3 Months
          </span>
        </div>
      </div>
    </section>
  );
};
