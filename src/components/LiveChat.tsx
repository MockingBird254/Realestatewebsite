/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Sparkles, Building, 
  HelpCircle, Calendar, ShieldCheck, DollarSign
} from 'lucide-react';
import { ChatMessage } from '../types';

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: 'ai',
      text: "Habari! Welcome to **Unique Merchants Real Estate**. I am your premium digital property advisor powered by Gemini.\n\nI can help you:\n- Find beautiful maisonettes, plots, and offices\n- Schedule a Wednesday/Saturday viewing tour\n- Get mortgage calculations & rental yield insights\n\nHow can I help you realize your Kenyan property dream today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      const data = await response.json();
      
      setIsDemo(!!data.demo);
      
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: data.text || "I am currently adjusting my systems. How can I guide you?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: "I am experiencing some connectivity delays, but I am still here! Are you interested in purchasing land in Kenol, looking for rent in Murang'a, or inquiring about property management?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (q: string) => {
    handleSend(q);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Chat Dialog */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] bg-white rounded-2xl border border-gray-100 shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="bg-emerald-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gold-500 rounded-full flex items-center justify-center text-emerald-950 font-black relative border border-emerald-800">
                <span className="font-display text-[10px] tracking-tighter">
                  <span className="text-emerald-950">M</span>
                  <span className="text-burgundy-700 font-serif">U</span>
                </span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-emerald-900 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="font-display font-extrabold text-xs tracking-wide uppercase">Unique Merchants AI</h4>
                  <Sparkles className="w-3 h-3 text-gold-400 fill-gold-400" />
                </div>
                <p className="text-[10px] text-gray-300">Active Property Concierge</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-200" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3.5">
            {messages.map(m => {
              const isAi = m.sender === 'ai';
              return (
                <div 
                  key={m.id}
                  className={`flex flex-col max-w-[85%] ${isAi ? 'self-start' : 'self-end'}`}
                >
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${isAi ? 'bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm' : 'bg-emerald-900 text-white rounded-tr-sm shadow-sm'}`}>
                    {/* Handle basic markdown bullet rendering on clients */}
                    {m.text.split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('-') ? 'pl-4 -indent-4 my-1' : 'mb-1'}>
                        {line.startsWith('-') ? '• ' + line.substring(1).trim() : line}
                      </p>
                    ))}
                  </div>
                  <span className={`text-[9px] text-gray-400 mt-1 px-1 ${isAi ? 'text-left' : 'text-right'}`}>
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div className="self-start max-w-[80%] flex flex-col">
                <div className="p-3 bg-white border border-gray-100 text-gray-400 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1 text-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-900 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-900 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-900 rounded-full animate-bounce delay-300"></span>
                  <span className="ml-1 text-[10px] italic">Gemini is searching listings...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions menu */}
          <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            {[
              { text: "Plots in Kenol", icon: HelpCircle },
              { text: "Schedule Tour", icon: Calendar },
              { text: "Rental yield Murang'a", icon: DollarSign },
              { text: "Property management services", icon: ShieldCheck }
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q.text)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-900/5 hover:bg-emerald-900/10 text-[10px] font-semibold text-emerald-900 rounded-full border border-emerald-900/10 hover:border-emerald-900/30 transition-all cursor-pointer"
              >
                <q.icon className="w-2.5 h-2.5 text-gold-500" />
                {q.text}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center"
          >
            <input 
              type="text" 
              placeholder="Ask anything about properties or county..." 
              className="flex-1 bg-gray-50 text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-900 focus:bg-white text-gray-800"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button 
              type="submit"
              disabled={isTyping || !input.trim()}
              className="p-2.5 bg-emerald-900 hover:bg-emerald-950 disabled:bg-gray-100 text-white disabled:text-gray-400 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          
          {/* Footer warning info */}
          {isDemo && (
            <div className="bg-gold-500/10 text-gold-600 font-mono text-[8px] text-center py-1 border-t border-gold-500/10 uppercase tracking-widest">
              Live AI Demo Mode • Using Static Local Intelligence
            </div>
          )}
        </div>
      )}

      {/* Floating Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-900 hover:bg-emerald-950 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all group relative cursor-pointer border-2 border-gold-500/30"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gold-500" />
        ) : (
          <MessageSquare className="w-6 h-6 text-gold-400 group-hover:rotate-6 transition-transform" />
        )}
        <span className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-ping"></span>
        <span className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
      </button>

    </div>
  );
}
