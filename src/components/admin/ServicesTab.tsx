import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { ServiceDefinition } from '../../types';
import { Scissors, Clock, Check, Plus, Edit2, Sparkles } from 'lucide-react';

export const ServicesTab: React.FC = () => {
  const { services } = useStudio();
  const [selectedService, setSelectedService] = useState<ServiceDefinition | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
            <span>Atelier Offerings & Tariffs</span>
            <span>·</span>
            <span className="text-[#9E616B] font-semibold">Boutique Portfolio</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2D2424] font-medium">
            Services & Lead Time Catalog
          </h2>
          <p className="text-xs text-[#6B5E59] mt-1 max-w-xl">
            Configure your atelier service categories, starting base fees, fabric policies, and required lead times.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#6B5E59] pb-3 border-b border-[#F3ECE4] mb-3">
                <span className="font-semibold text-[#9E616B]">{srv.category}</span>
                <span className="font-mono text-stone-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {srv.typicalLeadTime}
                </span>
              </div>

              <h3 className="font-serif text-xl font-medium text-[#2D2424] mb-1.5">
                {srv.title}
              </h3>
              <p className="text-xs text-[#6B5E59] italic mb-3">
                "{srv.tagline}"
              </p>

              <p className="text-xs text-stone-700 leading-relaxed mb-4">
                {srv.description}
              </p>

              <div className="space-y-1.5 mb-4">
                <span className="text-[10px] uppercase font-semibold text-stone-500 block">
                  Included Specialisms:
                </span>
                {srv.subServices.map((sub, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                    <Check className="w-3.5 h-3.5 text-[#9E616B] shrink-0 mt-0.5" />
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#F3ECE4] mt-auto">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs text-stone-500">Starting Investment</span>
                <span className="font-serif text-xl font-semibold text-[#2D2424]">
                  R{srv.startingPrice.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#F3ECE4] text-[11px] text-stone-600">
                <strong className="text-stone-800">Fabric Notice: </strong>
                {srv.fabricNotice}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
