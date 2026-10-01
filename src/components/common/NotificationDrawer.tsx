import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { X, MessageSquare, Send, CheckCheck, Clock } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications } = useStudio();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E8DFD8] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-[#E8DFD8] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#9E616B]" />
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#2D2424]">
                  Automated Customer Dispatch
                </h3>
                <p className="text-xs text-[#6B5E59]">
                  Live simulated notifications sent to clients
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

          {/* Policy reassurance banner */}
          <div className="bg-[#F7E7E6] px-6 py-3 border-b border-[#E8DFD8]">
            <p className="text-xs text-[#6B5E59] leading-relaxed">
              <span className="font-medium text-[#2D2424]">Automated Business Communication:</span> Keeps
              clients informed regarding appointments, fabric confirmations, and invoicing reminders without
              requiring Sadika to stop sewing.
            </p>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-sm">
                No notifications logged yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white border border-[#E8DFD8] rounded-lg p-4 shadow-xs hover:border-[#D4C5B9] transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-semibold tracking-wider uppercase text-[#9E616B] block">
                        {notif.type}
                      </span>
                      <h4 className="text-sm font-medium text-[#2D2424]">
                        To: {notif.recipientName}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.sentAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {notif.channel}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#4A3E3D] leading-relaxed bg-[#FAF8F5] p-2.5 rounded border border-[#F3ECE4] whitespace-pre-wrap font-sans">
                    {notif.content}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400 pt-1">
                    <span>Target: {notif.recipientContact}</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCheck className="w-3.5 h-3.5" />
                      Delivered
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[#E8DFD8] bg-white text-center">
            <p className="text-xs text-stone-500">
              Sadika's Bridal Boutique · Atelier Dispatch System · Cape Town
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
