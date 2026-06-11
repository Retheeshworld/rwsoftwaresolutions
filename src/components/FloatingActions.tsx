import { useEffect, useRef, useState } from "react";
import { Send, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import rwLogo from "@/assets/rw-logo.jpg.asset.json";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP = "917604974617";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rw-chat`;

async function trackLeadEvent(eventType: "whatsapp_click" | "chat_open") {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from("lead_events").insert({
      event_type: eventType,
      source_url: typeof window !== "undefined" ? window.location.href : null,
      user_id: session?.user?.id ?? null,
      metadata: { user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null },
    });
  } catch {
    // Silently fail — tracking should never block the user
  }
}

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Welcome to **RW Software Solutions** 🚀\n\nI'm **RW Chat Assistant**. How can I help you today?\n\n- Ask about our services\n- Internships & projects\n- Coding & AI guidance\n- Business / startup support",
};

export function FloatingActions() {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    const history = [...messages.filter((m) => m !== GREETING || messages.length > 1), userMsg];
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Too many requests. Please wait a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Please contact admin.");
        else toast.error("Chat is temporarily unavailable.");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let done = false;
      let started = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantText += delta;
              if (!started) {
                started = true;
                setMessages((m) => [...m, { role: "assistant", content: assistantText }]);
              } else {
                setMessages((m) =>
                  m.map((msg, i) =>
                    i === m.length - 1 ? { ...msg, content: assistantText } : msg,
                  ),
                );
              }
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {chatOpen && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-elegant animate-fade-up">
          <div className="flex items-center justify-between bg-gradient-brand px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <img src={rwLogo.url} alt="RiseWave" className="h-7 w-7 rounded-full bg-white object-contain p-0.5 shadow-sm" />
              <div className="leading-tight">
                <div className="text-sm font-semibold">RW Chat Assistant</div>
                <div className="text-[10px] opacity-80">Building Innovation Through Technology</div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div ref={scrollRef} className="flex h-80 flex-col gap-2 overflow-y-auto bg-background/40 p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-headings:my-1 prose-pre:my-2 prose-pre:bg-background prose-pre:text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> RW Assistant is typing…
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 border-t border-border bg-card p-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about services, internships, projects…"
              className="border-0 focus-visible:ring-0"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" className="bg-gradient-brand text-white" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] right-3 z-50 flex flex-col items-center gap-3 sm:bottom-5 sm:right-5">
        <button
          onClick={() => setChatOpen((v) => !v)}
          aria-label="RW Chat Assistant"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-white p-1.5 shadow-elegant ring-2 ring-primary/30 transition-smooth hover:scale-110 hover:shadow-glow hover:ring-primary sm:h-16 sm:w-16"
        >
          <img src={rwLogo.url} alt="RW Assistant" className="h-full w-full rounded-full object-contain" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-primary" /></span>
        </button>
        <a
          href={`https://wa.me/${WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elegant transition-smooth hover:scale-110 sm:h-14 sm:w-14"
        >
          <svg className="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
      </div>
    </>
  );
}
