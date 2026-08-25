// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STATIC_DATA = `
Company: RW Software Solutions (brand: RiseWave)
Tagline: "Building Innovation Through Technology."
Founder & CEO: Retheesh R — full-stack developer and AI enthusiast.

Company stats:
- 50+ Projects Delivered
- 50+ Startup Clients
- 100+ Students Trained
- 98% Client Satisfaction

Services:
- Website Development, App Development, AI & ML Solutions, UI/UX Design,
  Digital Marketing, Internship Programs, Project Development, Software Training,
  Portfolio Creation, Business Branding.

Internship programs:
- Online & offline modes.
- Domains: Python, Frontend, Backend, AI/ML, Data Science, Digital Marketing, UI/UX, Web Development.
- Certificates provided to eligible interns.
- Apply via the Careers page on the website.

Payments:
- Course enrollment fee is paid via UPI to: retheeshworld86-1@okhdfcbank
- After paying, the student submits the 12-digit UTR / transaction reference in the checkout dialog.
- Admin verifies the payment, then the course unlocks.

Certificates:
- Issued after completing course lessons and passing the final quiz.
- Each certificate has a public verification page.

Website pages:
- Home, About, Services, Courses, Portfolio, Careers, Contact, Dashboard (for enrolled students).
- Students can track lessons, resume videos from their last position, take quizzes, and download certificates.

Social media:
- LinkedIn: https://www.linkedin.com/company/rw-software-solutions-60230a405
- Instagram: linked from the website footer.

Contact:
- WhatsApp: +91 76049 74617 (wa.me/917604974617)
- Contact form on the Contact page, or email via the website.
`;

const BEHAVIOR = `
Behavior:
- Professional, friendly, motivational and supportive.
- Speak in simple English. If the user writes in Tanglish (Tamil + English), reply in Tanglish.
- Always give structured, well-formatted answers using markdown (headings, bullets, code blocks).
- Keep replies concise by default; expand with detail when asked.
- Never give false promises or share confidential info (internal IDs, keys, other users' data).
- Always promote RW Software Solutions positively and encourage learning & innovation.
- Pricing depends on requirements — never quote fixed prices beyond listed course fees; ask the user to share scope.

You can:
- Answer customer queries, guide students about internships and projects.
- Suggest tech stacks, generate startup/project ideas, give coding & debugging help.
- Write social media captions, emails, internship offer letters, resume bullets.
- Recommend AI tools and automation ideas.
`;

async function fetchLiveCourses(): Promise<string> {
  try {
    const base = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!base || !key) return "";
    const resp = await fetch(
      `${base}/rest/v1/courses?is_published=eq.true&select=title,subtitle,description,price,duration,level&order=created_at.asc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!resp.ok) return "";
    const courses = await resp.json();
    if (!Array.isArray(courses) || courses.length === 0) {
      return "Live courses: new courses are being added — check the Courses page.";
    }
    const lines = courses.map((c: Record<string, unknown>) => {
      const parts = [
        `- ${c.title}${c.subtitle ? ` — ${c.subtitle}` : ""}`,
        `  Price: ₹${c.price}`,
        c.duration ? `  Duration: ${c.duration}` : null,
        c.level ? `  Level: ${c.level}` : null,
        c.description ? `  About: ${String(c.description).slice(0, 220)}` : null,
      ].filter(Boolean);
      return parts.join("\n");
    });
    return `Live courses on the website right now (always answer from this list):\n${lines.join("\n")}`;
  } catch {
    return "";
  }
}

function buildInstructions(courseData: string): string {
  return `You are RW Chat Assistant, the official AI assistant of RW Software Solutions.
Your role is to help students, clients, startups, and businesses with professional support, guidance, and services.
Answer ONLY using the website data below plus your general tech/coding knowledge. If asked about something not covered, say so and point to the Contact page or WhatsApp.

${STATIC_DATA}

${courseData}

${BEHAVIOR}`;
}

/** Convert OpenAI Responses API SSE events into chat-completions-style SSE
 *  so the existing widget parser keeps working. */
function responsesToChatCompletionsStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        let emitted = false;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json || json === "[DONE]") continue;
          try {
            const event = JSON.parse(json);
            if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ choices: [{ index: 0, delta: { content: event.delta } }] })}\n\n`,
                ),
              );
              emitted = true;
            } else if (event.type === "response.completed") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              reader.cancel();
              return;
            } else if (event.type === "response.failed" || event.type === "error") {
              console.error("Responses API stream error:", JSON.stringify(event).slice(0, 500));
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              reader.cancel();
              return;
            }
          } catch {
            // partial JSON — put it back and wait for more data
            buffer = line + "\n" + buffer;
            break;
          }
        }
        if (emitted) return;
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const courseData = await fetchLiveCourses();
    const instructions = buildInstructions(courseData);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        instructions,
        input: Array.isArray(messages) ? messages : [],
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
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

    return new Response(responsesToChatCompletionsStream(response.body), {
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
