import React, { useState, useMemo } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Appointment, AppointmentType } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  AlertOctagon,
  Users,
  Home,
} from 'lucide-react';

export const CalendarTab: React.FC = () => {
  const {
    appointments,
    customers,
    settings,
    addAppointment,
    updateAppointmentStatus,
    rescheduleAppointment,
    cancelAppointment,
    checkSlotConflict,
  } = useStudio();

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [filterType, setFilterType] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Reschedule state
  const [reschedulingAptId, setReschedulingAptId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('10:00');

  // New appointment form state
  const [newCustId, setNewCustId] = useState<string>(customers[0]?.id || '');
  const [newAptType, setNewAptType] = useState<AppointmentType>('Initial Consultation');
  const [newAptDate, setNewAptDate] = useState<string>(selectedDate);
  const [newAptTime, setNewAptTime] = useState<string>('10:00');
  const [newAptNotes, setNewAptNotes] = useState<string>('');

  // Calculate day appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (filterType !== 'All' && !a.type.toLowerCase().includes(filterType.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [appointments, filterType]);

  // Conflict & back-to-back detector
  const conflictReport = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    filteredAppointments.forEach((a) => {
      if (a.status === 'Cancelled') return;
      const key = `${a.date}_${a.time}`;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });

    const conflicts = Object.values(map).filter((list) => list.length > 1);

    // Detect back-to-back appointments (e.g. 10:00 and 11:00 on same date)
    const backToBackDates: string[] = [];
    const dateGroups: Record<string, string[]> = {};
    filteredAppointments.forEach((a) => {
      if (a.status === 'Cancelled') return;
      if (!dateGroups[a.date]) dateGroups[a.date] = [];
      dateGroups[a.date].push(a.time);
    });

    return {
      conflictsCount: conflicts.length,
      hasConflicts: conflicts.length > 0,
    };
  }, [filteredAppointments]);

  // Week days calculation around selectedDate
  const currentWeekDays = useMemo(() => {
    const curr = new Date(selectedDate + 'T00:00:00');
    const day = curr.getDay(); // 0 is Sun
    const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);

    const days: Array<{ dateStr: string; dayName: string; isWeekend: boolean }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(diffToMonday + i));
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      days.push({ dateStr, dayName, isWeekend });
    }
    return days;
  }, [selectedDate]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newCustId);
    if (!cust) return;

    addAppointment({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      type: newAptType,
      date: newAptDate,
      time: newAptTime,
      durationMinutes: 45,
      status: 'Confirmed',
      notes: newAptNotes,
    });

    setIsAddModalOpen(false);
    setNewAptNotes('');
  };

  const handleRescheduleSubmit = (e: React.FormEvent, aptId: string) => {
    e.preventDefault();
    rescheduleAppointment(aptId, rescheduleDate, rescheduleTime);
    setReschedulingAptId(null);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Top Header */}
      <div className="bg-white border border-[#E8DFD8] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6B5E59] mb-1">
            <span>Atelier Diary & Fitting Schedule</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">Monday–Friday 09:00 – 17:00</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2D2424] font-medium">
            Fittings & Consultations Diary
          </h2>
          <p className="text-xs text-[#6B5E59] mt-1">
            45-minute allocated slots with automated conflict detection and weekend closure enforcement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-[#F3ECE4] rounded-lg border border-[#E8DFD8]">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize cursor-pointer ${
                  viewMode === mode
                    ? 'bg-white text-[#2D2424] shadow-xs'
                    : 'text-[#6B5E59] hover:text-[#2D2424]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#2D2424] hover:bg-[#4A3E3D] text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Appointment</span>
          </button>
        </div>
      </div>

      {/* Operating Hours & Weekend Closure Strict Notice */}
      <div className="bg-[#F7E7E6] border border-[#E8DFD8] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-800">
          <Home className="w-4 h-4 text-[#9E616B] shrink-0" />
          <span>
            <strong>Home Studio Boundary Policy:</strong> Sadika's Bridal Boutique operates{' '}
            <strong>Mon–Fri, 09:00 – 17:00</strong>. Strictly <strong>closed on Saturdays & Sundays</strong>.
            Fittings are by appointment only.
          </span>
        </div>

        {conflictReport.hasConflicts && (
          <div className="flex items-center gap-1 text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded font-semibold shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Slot Conflict Detected!</span>
          </div>
        )}
      </div>

      {/* Date Navigation & Type Filters */}
      <div className="bg-white border border-[#E8DFD8] rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-lg text-xs font-medium text-[#2D2424] focus:outline-none"
          />

          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - (viewMode === 'day' ? 1 : 7));
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-1.5 hover:bg-stone-100 rounded border border-[#E8DFD8] text-stone-600 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1 text-xs border border-[#E8DFD8] rounded hover:bg-stone-50 cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + (viewMode === 'day' ? 1 : 7));
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-1.5 hover:bg-stone-100 rounded border border-[#E8DFD8] text-stone-600 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter by appointment type */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-stone-400 font-medium">Filter:</span>
          {['All', 'Consultation', 'Fitting', 'Fabric Drop-off'].map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-2.5 py-1 rounded text-[11px] border transition-colors cursor-pointer ${
                filterType === ft
                  ? 'bg-[#9E616B] text-white border-[#9E616B] font-medium'
                  : 'bg-white text-stone-600 border-[#E8DFD8] hover:border-stone-400'
              }`}
            >
              {ft}
            </button>
          ))}
        </div>
      </div>

      {/* WEEK VIEW (Standard Atelier View) */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {currentWeekDays.map(({ dateStr, dayName, isWeekend }) => {
            const dayApts = filteredAppointments.filter((a) => a.date === dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <div
                key={dateStr}
                className={`rounded-xl border p-3.5 flex flex-col justify-between min-h-[300px] transition-all ${
                  isWeekend
                    ? 'bg-stone-100/60 border-stone-200 opacity-70'
                    : isToday
                    ? 'bg-[#FAF8F5] border-[#9E616B] ring-1 ring-[#9E616B]/20'
                    : 'bg-white border-[#E8DFD8]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#F3ECE4] mb-3">
                    <span
                      className={`text-xs font-semibold ${
                        isToday ? 'text-[#9E616B]' : 'text-[#2D2424]'
                      }`}
                    >
                      {dayName}
                    </span>
                    {isWeekend && (
                      <span className="text-[9px] font-bold uppercase text-stone-400">
                        Closed
                      </span>
                    )}
                  </div>

                  {isWeekend ? (
                    <div className="py-8 text-center text-stone-400 text-[11px]">
                      Studio Closed for Weekend
                    </div>
                  ) : dayApts.length === 0 ? (
                    <div className="py-8 text-center text-stone-300 text-[11px]">
                      No appointments
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {dayApts.map((apt) => (
                        <div
                          key={apt.id}
                          className={`p-2.5 rounded-lg border text-xs shadow-2xs ${
                            apt.status === 'Cancelled'
                              ? 'bg-stone-50 border-stone-200 text-stone-400 line-through'
                              : apt.status === 'Requested'
                              ? 'bg-amber-50 border-amber-200 text-amber-950'
                              : 'bg-white border-[#E8DFD8] text-stone-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[11px] font-bold text-[#9E616B]">
                              {apt.time}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {apt.durationMinutes}m
                            </span>
                          </div>

                          <div className="font-medium text-[#2D2424] text-[11px] leading-tight">
                            {apt.customerName}
                          </div>
                          <div className="text-[10px] text-[#6B5E59] truncate mt-0.5">
                            {apt.type}
                          </div>

                          {apt.notes && (
                            <p className="text-[9px] text-stone-500 italic mt-1 truncate">
                              "{apt.notes}"
                            </p>
                          )}

                          {/* Quick Approval / Reschedule Buttons */}
                          <div className="mt-2 pt-1 border-t border-[#F3ECE4] flex items-center justify-between gap-1">
                            {apt.status === 'Requested' ? (
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'Confirmed')}
                                className="text-[10px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                              >
                                Approve Slot
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setReschedulingAptId(apt.id);
                                  setRescheduleDate(apt.date);
                                  setRescheduleTime(apt.time);
                                }}
                                className="text-[10px] text-stone-500 hover:text-[#9E616B] cursor-pointer"
                              >
                                Reschedule
                              </button>
                            )}

                            {apt.status !== 'Cancelled' && (
                              <button
                                onClick={() => cancelAppointment(apt.id)}
                                className="text-[10px] text-stone-400 hover:text-rose-600 cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!isWeekend && (
                  <button
                    onClick={() => {
                      setNewAptDate(dateStr);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full mt-3 py-1 border border-dashed border-[#E8DFD8] hover:border-[#9E616B] rounded text-[10px] text-stone-500 hover:text-[#9E616B] transition-colors cursor-pointer"
                  >
                    + Book Slot
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DAY OR MONTH VIEW FALLBACK */}
      {viewMode !== 'week' && (
        <div className="bg-white border border-[#E8DFD8] rounded-xl p-6 shadow-xs">
          <h3 className="font-serif text-lg font-medium text-[#2D2424] mb-4">
            Appointments for {selectedDate} ({viewMode} view)
          </h3>

          <div className="space-y-3">
            {filteredAppointments
              .filter((a) => (viewMode === 'day' ? a.date === selectedDate : true))
              .map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold text-[#9E616B]">
                        {apt.date} at {apt.time}
                      </span>
                      <span>·</span>
                      <span className="font-medium text-[#2D2424]">{apt.customerName}</span>
                    </div>
                    <p className="text-[#6B5E59]">{apt.type}</p>
                    {apt.notes && (
                      <p className="text-[11px] text-stone-400 italic mt-0.5">{apt.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 bg-white border border-[#E8DFD8] rounded">
                      {apt.status}
                    </span>
                    <button
                      onClick={() => cancelAppointment(apt.id)}
                      className="text-stone-400 hover:text-rose-600 text-xs px-2 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DFD8] rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-xl font-medium text-[#2D2424]">
              Book Fitting / Consultation Slot
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#6B5E59] mb-1 font-medium">Select Customer *</label>
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
                <label className="block text-[#6B5E59] mb-1 font-medium">Appointment Type *</label>
                <select
                  value={newAptType}
                  onChange={(e) => setNewAptType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                >
                  <option value="Initial Consultation">Initial Consultation (Design & Measurements)</option>
                  <option value="Measurements & Fabric Drop-off">Measurements & Fabric Drop-off</option>
                  <option value="First Fitting (Toile / Baste)">First Fitting (Toile / Baste Mockup)</option>
                  <option value="Second Fitting">Second Fitting (Main Fabric & Zip)</option>
                  <option value="Final Fitting & Collection">Final Fitting & Collection</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">Weekday Date *</label>
                  <input
                    type="date"
                    required
                    value={newAptDate}
                    onChange={(e) => setNewAptDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#6B5E59] mb-1 font-medium">Time Slot (Mon–Fri) *</label>
                  <select
                    value={newAptTime}
                    onChange={(e) => setNewAptTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map((t) => (
                      <option key={t} value={t}>
                        {t} (45 mins)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#6B5E59] mb-1 font-medium">Atelier Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Bring heels, calico toile ready for pinning"
                  value={newAptNotes}
                  onChange={(e) => setNewAptNotes(e.target.value)}
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
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Inline Modal */}
      {reschedulingAptId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DFD8] rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4">
            <h4 className="font-serif text-lg font-medium text-[#2D2424]">
              Reschedule Appointment
            </h4>

            <form
              onSubmit={(e) => handleRescheduleSubmit(e, reschedulingAptId)}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-stone-600 mb-1">New Weekday Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1">New Time Slot</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t flex justify-between">
                <button
                  type="button"
                  onClick={() => setReschedulingAptId(null)}
                  className="text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#9E616B] text-white rounded font-medium"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
