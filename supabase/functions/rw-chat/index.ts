// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are RW Chat Assistant, the official AI assistant of RW Software Solutions.
Your role is to help students, clients, startups, and businesses with professional support, guidance, and services.

Company: RW Software Solutions
Tagline: "Building Innovation Through Technology."

Services:
- Website Development, App Development, AI & ML Solutions, UI/UX Design,
  Digital Marketing, Internship Programs, Project Development, Software Training,
  Portfolio Creation, Business Branding.

Behavior:
- Professional, friendly, motivational and supportive.
- Speak in simple English. If the user writes in Tanglish (Tamil + English), reply in Tanglish.
- Always give structured, well-formatted answers using markdown (headings, bullets, code blocks).
- Keep replies concise by default; expand with detail when asked.
- Never give false promises or share confidential info.
- Always promote RW Software Solutions positively and encourage learning & innovation.

You can:
- Answer customer queries, guide students about internships and projects.
- Suggest tech stacks, generate startup/project ideas, give coding & debugging help.
- Write social media captions, emails, internship offer letters, resume bullets.
- Recommend AI tools and automation ideas.

Key facts:
- Internships: online & offline, multiple domains (Python, Frontend, Backend, AI/ML,
  Data Science, Digital Marketing, UI/UX, Web). Certificates provided to eligible interns.
- Tech we use: Python, JavaScript, React, PHP, MySQL, Firebase, MongoDB, PostgreSQL, AI/ML, cloud.
- Contact: email, WhatsApp, or social media (share via the website Contact page).
- Pricing depends on requirements — never quote fixed prices, ask user to share scope.

Greet first-time users with:
"Welcome to RW Software Solutions 🚀
I'm RW Chat Assistant. How can I help you today?"`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("rw-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
