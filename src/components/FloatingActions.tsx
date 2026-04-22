import { useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WHATSAPP = "917604974617";

export function FloatingActions() {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "Hi! I'm Wave, your RiseWave assistant. How can I help you today?" },
  ]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: "Thanks! Our team will get back shortly. For instant chat, tap the WhatsApp icon.",
        },
      ]);
    }, 700);
  };

  return (
    <>
      {/* Chatbot panel */}
      {chatOpen && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-elegant animate-fade-up">
          <div className="flex items-center justify-between bg-gradient-brand px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Wave AI Assistant</span>
            </div>
            <button onClick={() => setChatOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex h-72 flex-col gap-2 overflow-y-auto bg-background/40 p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-border bg-card p-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="border-0 focus-visible:ring-0"
            />
            <Button type="submit" size="icon" className="bg-gradient-brand text-white">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {/* Floating buttons */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
        <button
          onClick={() => setChatOpen((v) => !v)}
          aria-label="AI Chatbot"
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-white shadow-elegant transition-smooth hover:scale-110 hover:shadow-glow"
        >
          <Sparkles className="h-6 w-6 transition-smooth group-hover:rotate-12" />
        </button>
        <a
          href={`https://wa.me/${WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elegant transition-smooth hover:scale-110"
        >
          <MessageCircle className="h-7 w-7" />
          <span className="absolute right-16 hidden whitespace-nowrap rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background group-hover:block">
            Chat on WhatsApp
          </span>
        </a>
      </div>
    </>
  );
}
