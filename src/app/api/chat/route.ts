import OpenAI from "openai";

// Chat message shape
type InMessage = { role: "system" | "user" | "assistant"; content: string };
interface ChatBody { messages?: InMessage[]; model?: string; temperature?: number; provider?: string }

const SSE_HEADERS = { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } as const;
const json = <T>(o: T, status = 200) => new Response(JSON.stringify(o), { status });

const sanitizeMessages = (list: InMessage[]) => list.filter(m => m.content?.trim()).map(m => ({ role: m.role, content: m.content.trim() }));

function sseStream(producer: (emit: (token: string) => void) => Promise<void>): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const emit = (t: string) => controller.enqueue(enc.encode(`data: ${t}\n\n`));
      try { await producer(emit); emit("[DONE]"); } catch (e) { emit(`[ERROR] ${e instanceof Error ? e.message : e}`); } finally { controller.close(); }
    }
  });
}

async function openAIChatStream(client: OpenAI, opts: { model: string; messages: InMessage[]; temperature: number }) {
  const iterator = (await client.chat.completions.create({ ...opts, stream: true })) as AsyncIterable<{ choices: Array<{ delta?: { content?: string } }> }>;
  return sseStream(async emit => { for await (const part of iterator) { const token = part.choices[0]?.delta?.content; if (token) emit(token); } });
}

async function handleOllama(body: ChatBody, messages: InMessage[]) {
  const base = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = body.model?.trim() || process.env.OLLAMA_MODEL || process.env.OPENAI_MODEL || "gpt-oss:20b";
  const url = base.replace(/\/$/, "") + "/api/chat";
  const upstream = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, messages, stream: true }) });
  if (!upstream.ok || !upstream.body) return json({ ok: false, error: `ollama upstream ${upstream.status}` }, 500);
  const reader = upstream.body.getReader();
  const td = new TextDecoder();
  let buffer = "", lastFull = "";
  const stream = sseStream(async emit => {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      buffer += td.decode(value, { stream: true });
      const lines = buffer.split(/\n+/); buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          const full: string | undefined = obj.message?.content;
          if (full) { let delta = full; if (full.startsWith(lastFull)) delta = full.slice(lastFull.length); lastFull = full; if (delta) emit(delta); }
          if (obj.done) return;
        } catch { /* ignore */ }
      }
    }
  });
  return new Response(stream, { headers: SSE_HEADERS });
}

async function handleAzure(body: ChatBody, messages: InMessage[]) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim();
  const deployment = body.model?.trim() || process.env.AZURE_OPENAI_DEPLOYMENT?.trim();
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim();
  const azureKey = process.env.AZURE_OPENAI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!endpoint || !deployment || !apiVersion || !azureKey) return json({ ok: false, error: "Azure config missing (need AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT, AZURE_OPENAI_API_VERSION, AZURE_OPENAI_API_KEY)" }, 500);
  const client = new OpenAI({ apiKey: azureKey, baseURL: endpoint.replace(/\/$/, "") + "/openai/deployments/" + deployment, defaultQuery: { "api-version": apiVersion }, defaultHeaders: { "api-key": azureKey } });
  try {
    const stream = await openAIChatStream(client, { model: deployment, messages, temperature: typeof body.temperature === "number" ? body.temperature : 1 });
    return new Response(stream, { headers: SSE_HEADERS });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "azure init failed" }, 500);
  }
}

async function handleOpenAI(body: ChatBody, messages: InMessage[]) {
  const apiKey = process.env.OPENAI_API_KEY; if (!apiKey) return json({ ok: false, error: "OPENAI_API_KEY missing" }, 500);
  const model = body.model?.trim() || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const temperature = typeof body.temperature === "number" ? body.temperature : 0.3;
  const client = new OpenAI({ apiKey });
  const stream = await openAIChatStream(client, { model, messages, temperature });
  return new Response(stream, { headers: SSE_HEADERS });
}

export async function POST(req: Request) {
  let body: ChatBody; try { body = await req.json(); } catch { return json({ ok: false, error: "Invalid JSON" }, 400); }
  if (!Array.isArray(body.messages) || body.messages.length === 0) return json({ ok: false, error: "messages required" }, 400);
  const messages = sanitizeMessages(body.messages); if (!messages.length) return json({ ok: false, error: "no non-empty messages" }, 400);
  const provider = (body.provider || process.env.NEXT_PUBLIC_CHAT_PROVIDER || "openai").toLowerCase();
  switch (provider) {
    case "ollama": return handleOllama(body, messages);
    case "azure": return handleAzure(body, messages);
    default: return handleOpenAI(body, messages);
  }
}
