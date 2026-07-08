"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  source?: "groq" | "gemini" | "fallback";
}

export default function AiAssistant() {
  // ✅ ENABLED - Quota will reset at midnight UTC
  const AI_ENABLED = true;
  
  if (!AI_ENABLED) return null;
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! ✨ Welcome to FJ Store. I'm your AI shopping assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<"groq" | "gemini" | "fallback" | null>(null);
  const [displayedCharCount, setDisplayedCharCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const isLight = theme === "light";

  // Typing animation for AI responses
  useEffect(() => {
    if (!isTyping || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant") return;

    if (displayedCharCount < lastMessage.content.length) {
      const timer = setTimeout(() => {
        setDisplayedCharCount(displayedCharCount + 1);
      }, 15); // 15ms between characters for smooth typing

      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [displayedCharCount, isTyping, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedCharCount]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setError(null);
    const userMessage: ChatMessage = { 
      role: "user", 
      content: input.trim(),
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setDisplayedCharCount(0);
    setIsTyping(false);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `API error: ${res.status}`);
      }

      setApiSource(data.source || "groq");
      const aiMessage: ChatMessage = {
        role: "assistant", 
        content: data.reply || "Sorry, I couldn't process that.",
        timestamp: new Date(),
        source: data.source,
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setDisplayedCharCount(0);
      setIsTyping(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Connection failed";
      console.error("[AI Assistant] Error:", errorMsg);
      setError(errorMsg);
      
      const errorMessage: ChatMessage = {
        role: "assistant", 
        content: `⚠️ I'm temporarily unavailable. Please check back shortly or contact support@fjstore.com for help.`,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setDisplayedCharCount(0);
      setIsTyping(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true 
    });
  };

  return (
    <>
      {/* Floating Button - Premium Glow Effect */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-accent-gold via-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-accent-gold/50 hover:shadow-3xl hover:shadow-accent-gold/70 hover:scale-110 transition-all duration-300 group relative"
        style={{ 
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 50
        }}
        aria-label="Open AI Shopping Assistant"
      >
        {/* Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-gold to-amber-600 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300" />
        
        {isOpen ? (
          <X size={22} className="text-black relative z-10" />
        ) : (
          <MessageCircle size={22} className="text-black relative z-10" />
        )}
      </button>

      {/* Chat Window - Glassmorphism Design */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] max-h-[600px] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col" style={{
          background: isLight ? "rgba(255, 255, 255, 0.92)" : "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: isLight ? "1px solid rgba(180, 140, 40, 0.2)" : "1px solid rgba(255, 215, 0, 0.15)",
          boxShadow: isLight
            ? "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)"
            : "0 8px 32px 0 rgba(212, 175, 55, 0.1), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)",
        }}>
          {/* Premium Header with Gradient */}
          <div className="relative bg-gradient-to-r from-accent-gold/30 via-yellow-500/10 to-transparent border-b border-accent-gold/20 px-6 py-4 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-accent-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-gold/40 to-yellow-600/20 flex items-center justify-center border border-accent-gold/30 shadow-lg shadow-accent-gold/20">
                  <Sparkles size={20} className="text-accent-gold animate-pulse" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-sm tracking-wide">FJ Assistant</h3>
                  <p className={`text-xs font-medium ${
                    error 
                      ? 'text-amber-300/60' 
                      : 'text-accent-gold/60'
                  }`}>
                    {error 
                      ? '⚠️ Maintenance Mode' 
                      : apiSource 
                        ? `✓ Running on ${apiSource === 'groq' ? '⚡ Groq' : apiSource === 'fallback' ? '🛟 Fallback' : '🔄 Gemini'}`
                        : 'AI-Powered Shopping Help'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-hover-bg flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-muted hover:text-foreground" />
              </button>
            </div>
          </div>

          {/* Error Banner - Sleek */}
          {error && (
            <div className="px-6 py-3 bg-gradient-to-r from-amber-500/10 to-red-500/10 border-b border-amber-500/20 flex gap-2 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-xs text-amber-100/80 font-medium">
                Groq temporarily unavailable • Using fallback ({apiSource || 'standby'})
              </p>
            </div>
          )}

          {/* Messages Container - Smooth Scrolling */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-[300px]">
            <style>{`
              .messages-container::-webkit-scrollbar {
                width: 6px;
              }
              .messages-container::-webkit-scrollbar-track {
                background: transparent;
              }
              .messages-container::-webkit-scrollbar-thumb {
                background: rgba(212, 175, 55, 0.3);
                border-radius: 3px;
              }
              .messages-container::-webkit-scrollbar-thumb:hover {
                background: rgba(212, 175, 55, 0.5);
              }
              
              @keyframes slideInUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              @keyframes typingBounce {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-8px); }
              }
              
              .message-animate {
                animation: slideInUp 0.3s ease-out forwards;
              }
              
              .typing-dots span {
                animation: typingBounce 1.4s infinite;
              }
              .typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
              }
              .typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
              }
            `}</style>
            
            <div className="messages-container">
              {messages.map((msg, i) => {
                const isLastMessage = i === messages.length - 1;
                const isTypingThisMessage = isLastMessage && isTyping && msg.role === "assistant";
                const displayedContent = isTypingThisMessage 
                  ? msg.content.slice(0, displayedCharCount)
                  : msg.content;
                
                return (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} message-animate`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex flex-col gap-1 max-w-[85%]">
                      <div
                        className={`px-5 py-3 rounded-2xl text-sm leading-relaxed font-medium transition-all duration-300 hover:scale-105 origin-bottom ${
                          msg.role === "user"
                            ? isLight
                              ? "bg-accent-gold/15 text-foreground rounded-br-md border border-accent-gold/30 shadow-card"
                              : "bg-gradient-to-br from-accent-gold/40 to-yellow-600/20 text-foreground dark:text-white rounded-br-md border border-accent-gold/30 shadow-lg shadow-accent-gold/20 hover:shadow-accent-gold/40"
                            : isLight
                              ? "bg-surface text-foreground rounded-bl-md border border-border shadow-card"
                              : "bg-black/5 dark:bg-white/5 text-foreground dark:text-white/90 rounded-bl-md border border-border shadow-lg shadow-black/20 hover:bg-white/8 hover:shadow-black/30"
                        }`}
                      >
                        {displayedContent}
                        {isTypingThisMessage && displayedCharCount < msg.content.length && (
                          <span className="inline-block w-1.5 h-5 ml-0.5 bg-accent-gold/80 rounded-sm animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs text-muted px-2">
                        {formatTime(msg.timestamp)} {msg.source === 'groq' ? '⚡' : msg.source === 'gemini' ? '🔄' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start message-animate">
                  <div className={`px-5 py-3 rounded-2xl rounded-bl-md flex gap-1.5 ${isLight ? "bg-surface border border-border shadow-card" : "bg-black/5 dark:bg-white/5 border border-border shadow-lg shadow-black/20"}`}>
                    <div className="typing-dots flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-accent-gold/60" />
                      <span className="w-2 h-2 rounded-full bg-accent-gold/60" />
                      <span className="w-2 h-2 rounded-full bg-accent-gold/60" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Premium Glass */}
          <div className="border-t border-border px-6 py-4" style={{ background: isLight ? 'rgba(255,255,255,0.5)' : 'rgba(15, 23, 42, 0.4)' }}>
            {error && (
              <p className="text-xs text-amber-200/70 mb-3 p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 font-medium">
                ℹ️ Chatbot is using fallback mode. Primary API will resume shortly.
              </p>
            )}
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2.5 group"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={error ? "AI recovering..." : "Ask me anything..."}
                className={`flex-1 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent-gold/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isLight ? "bg-surface/50 border border-border focus:bg-surface shadow-card" : "bg-black/5 dark:bg-white/5 border border-white/20 focus:bg-white/8 shadow-lg shadow-black/20"}`}
                disabled={isLoading}
                autoFocus={isOpen}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-gold/30 to-yellow-600/20 flex items-center justify-center text-accent-gold hover:from-accent-gold/50 hover:to-yellow-600/40 hover:shadow-lg hover:shadow-accent-gold/30 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed border border-accent-gold/30 hover:border-accent-gold/60 group/btn"
              >
                <Send size={18} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
