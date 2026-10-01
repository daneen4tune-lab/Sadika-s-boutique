import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';
import {
  Sparkles,
  MessageCircle,
  X,
  Send,
  Scissors,
  Calendar,
  Clock,
  ChevronRight,
  User,
  Bot,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendedService?: string;
  timestamp: string;
}

interface BoutiqueChatbotProps {
  onSelectServiceAndBook?: (serviceCategory: string) => void;
}

export const BoutiqueChatbot: React.FC<BoutiqueChatbotProps> = ({
  onSelectServiceAndBook,
}) => {
  const { language, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: `Welcome to Sadika's Bridal Boutique! I'm Sadika Karbary's AI Styling Concierge. If you aren't sure which service you need—whether it's custom Bridal Wear, Matric Dance Couture, Festive Occasion Wear, Evening Wear, or Fine Alterations—tell me about your upcoming event!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const quickPrompts = [
    { label: '👰 Wedding Gown & Veils', text: "I'm getting married and need guidance on a bridal gown and veil." },
    { label: '💃 Matric Dance Gown', text: "I need a matric ball dress made. What lead time is required?" },
    { label: '✨ Eid / Festive Occasion', text: "I have fabric for an Eid / festive kurti set. Can you help?" },
    { label: '✂️ Dress Alterations', text: "I have a designer gown that needs resizing and hem adjustment." },
    { label: '⏰ Hours & Fabric Rule', text: "What are your operating hours and how does booking confirmation work?" },
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: historyPayload,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: data.reply || "I'd love to help you with your garment needs. Feel free to ask more!",
          recommendedService: data.recommendedService,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('Server response error');
      }
    } catch (err) {
      console.warn('Chat error, using fallback response:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: `Sadika Karbary creates bespoke bridal gowns, matric couture, festive occasion wear, and master alterations in Rondebosch/Claremont. We recommend booking 2–3 months ahead (Mon–Fri 09:00–17:00, closed weekends). Would you like to submit an enquiry?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Trigger Badge */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#2D2424] hover:bg-[#4A3E3D] text-white rounded-full shadow-xl transition-all hover:scale-105 cursor-pointer border border-[#E8DFD8]/40"
        >
          <div className="w-8 h-8 rounded-full bg-[#9E616B] text-white flex items-center justify-center font-serif text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left pr-1">
            <span className="text-[11px] font-semibold block leading-tight">
              {t('chatbotTitle', 'Atelier AI Stylist & Concierge')}
            </span>
            <span className="text-[10px] text-stone-300 block">
              Not sure which service you need? Tap to chat
            </span>
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#9E616B] rounded-full ring-2 ring-white animate-pulse" />
        </button>
      )}

      {/* Expanded Chatbot Modal / Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] bg-white border border-[#E8DFD8] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="px-5 py-4 bg-[#FAF8F5] border-b border-[#E8DFD8] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#F7E7E6] border border-[#D4C5B9] text-[#9E616B] flex items-center justify-center font-serif text-base font-semibold">
                S
              </div>
              <div>
                <h4 className="font-serif text-base font-medium text-[#2D2424] leading-tight">
                  Sadika's AI Concierge
                </h4>
                <p className="text-[10px] text-[#6B5E59]">
                  Styling & Service Assistant · Powered by Gemini
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#FAF8F5]/50 to-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#F7E7E6] text-[#9E616B] flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#2D2424] text-white rounded-br-xs'
                      : 'bg-[#FAF8F5] text-[#2D2424] border border-[#E8DFD8] rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Recommendation action button */}
                  {msg.recommendedService && onSelectServiceAndBook && (
                    <div className="mt-2.5 pt-2 border-t border-[#E8DFD8]">
                      <button
                        onClick={() => {
                          onSelectServiceAndBook(msg.recommendedService!);
                          setIsOpen(false);
                        }}
                        className="w-full py-1.5 px-2.5 bg-[#9E616B] hover:bg-[#864F58] text-white rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Scissors className="w-3 h-3" />
                        <span>Book {msg.recommendedService}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.role === 'user' ? 'text-stone-300' : 'text-stone-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-[#6B5E59] pl-8">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#9E616B]" />
                <span className="italic">Sadika's Concierge is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-[#FAF8F5] border-t border-[#E8DFD8] overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p.text)}
                className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-[#F7E7E6] text-[#2D2424] hover:text-[#9E616B] border border-[#E8DFD8] rounded-full text-[10px] font-medium transition-colors cursor-pointer shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-[#E8DFD8] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about gowns, dates, lead times..."
              className="flex-1 px-3.5 py-2 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-[#2D2424] hover:bg-[#4A3E3D] disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
