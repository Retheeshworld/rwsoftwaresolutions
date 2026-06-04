import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import rwLogo from "@/assets/rw-logo.jpg.asset.json";

const WHATSAPP = "917604974617";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rw-chat`;

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
              <Sparkles className="h-4 w-4" />
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

      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
        <button
          onClick={() => setChatOpen((v) => !v)}
          aria-label="RW Chat Assistant"
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
        </a>
      </div>
    </>
  );
}
