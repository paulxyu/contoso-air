import { DefaultAzureCredential } from "@azure/identity";
import { OpenAI, AzureOpenAI } from "openai";

// Minimal subset of options we pass to AzureOpenAI (SDK type is more expansive; we keep a narrow shape)
interface AzureOpenAIClientOptions {
  endpoint: string;
  deployment: string;
  apiVersion?: string;
  apiKey?: string;
  azureADTokenProvider?: () => Promise<string>;
}

// Chat message shape
type InMessage = { role: "system" | "user" | "assistant"; content: string };
interface ChatBody { messages?: InMessage[]; model?: string; temperature?: number; provider?: string }
type Provider = "azure" | "openai" | "ollama" | "mock";

const SSE_HEADERS = { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } as const;
const json = <T>(o: T, status = 200) => new Response(JSON.stringify(o), { status });
const errorJson = (message: string, status = 400) => json({ ok: false, error: message }, status);

const DEBUG = process.env.LOG_CHAT === "1" || process.env.LOG_CHAT === "true";
const log = (...args: unknown[]) => { if (DEBUG) console.log("[chat]", ...args); };

const sanitizeMessages = (list: InMessage[]) =>
  list
    .filter(m => m.content?.trim())
    .map(m => ({ role: m.role, content: m.content.trim() }));

// --- Provider Detection -----------------------------------------------------
function hasAzureConfig(): boolean {
  return Boolean(process.env.AZURE_OPENAI_ENDPOINT) &&
    Boolean(process.env.AZURE_OPENAI_DEPLOYMENT) &&
    Boolean(process.env.AZURE_OPENAI_API_VERSION) &&
    Boolean(process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_OPENAI_CLIENTID || process.env.AZURE_MANAGED_IDENTITY_CLIENT_ID);
}

function hasOpenAIConfig(): boolean { return !!process.env.OPENAI_API_KEY; }

function detectProvider(explicit?: string): Provider {
  const req = explicit?.toLowerCase().trim() as Provider | undefined;
  if (req && ["azure", "openai", "ollama", "mock"].includes(req)) return req;
  if (hasAzureConfig()) return "azure";
  if (hasOpenAIConfig()) return "openai";
  return "mock";
}

function sseStream(producer: (emit: (token: string) => void) => Promise<void>): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const emit = (t: string) => controller.enqueue(enc.encode(`data: ${t}\n\n`));
      try {
        await producer(emit);
        emit("[DONE]");
      } catch (e) {
        emit(`[ERROR] ${e instanceof Error ? e.message : e}`);
      } finally {
        controller.close();
      }
    }
  });
}

async function openAIChatStream(client: OpenAI | AzureOpenAI, opts: { model: string; messages: InMessage[]; temperature: number }) {
  const iterator = (await client.chat.completions.create({ ...opts, stream: true })) as AsyncIterable<{ choices: Array<{ delta?: { content?: string } }> }>;
  return sseStream(async emit => {
    for await (const part of iterator) {
      const token = part.choices[0]?.delta?.content;
      if (token) emit(token);
    }
  });
}

async function handleOllama(body: ChatBody, messages: InMessage[]) {
  const base = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = body.model?.trim() || process.env.OLLAMA_MODEL || process.env.OPENAI_MODEL || "gpt-oss:20b";
  const url = base.replace(/\/$/, "") + "/api/chat";
  const upstream = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, messages, stream: true }) });
  if (!upstream.ok || !upstream.body) return errorJson(`ollama upstream ${upstream.status}`, 500);
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
          if (full) {
            let delta = full;
            if (full.startsWith(lastFull)) delta = full.slice(lastFull.length);
            lastFull = full;
            if (delta) emit(delta);
          }
          if (obj.done) return;
        } catch { /* ignore JSON parse errors */ }
      }
    }
  });
  return new Response(stream, { headers: SSE_HEADERS });
}

async function handleAzure(body: ChatBody, messages: InMessage[]) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim();
  const deployment = body.model?.trim() || process.env.AZURE_OPENAI_DEPLOYMENT?.trim();
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim();
  // Authentication selection logic:
  // 1. Prefer workload / managed identity when AZURE_OPENAI_CLIENTID (new) or legacy AZURE_MANAGED_IDENTITY_CLIENT_ID is set.
  //    Uses AAD token for scope from AZURE_OPENAI_SCOPE (or default cognitive services scope if absent).
  // 2. Otherwise fall back to API key: AZURE_OPENAI_API_KEY (or OPENAI_API_KEY as a last resort).
  const managedIdentityClientId = process.env.AZURE_OPENAI_CLIENTID?.trim() || process.env.AZURE_MANAGED_IDENTITY_CLIENT_ID?.trim();
  const useManagedIdentity = !!managedIdentityClientId;
  const scope = process.env.AZURE_OPENAI_SCOPE?.trim() || "https://cognitiveservices.azure.com/.default";
  const azureKey = (!useManagedIdentity && (process.env.AZURE_OPENAI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim())) || undefined;

  if (!endpoint || !deployment || !apiVersion) {
    return errorJson("Azure config missing (need AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT, AZURE_OPENAI_API_VERSION)", 500);
  }
  if (!useManagedIdentity && !azureKey) {
    return errorJson("Azure auth missing (set AZURE_OPENAI_CLIENTID + optional AZURE_OPENAI_SCOPE for managed identity OR provide AZURE_OPENAI_API_KEY)", 500);
  }

  let client: AzureOpenAI;
  if (useManagedIdentity) {
    try {
      const credential = new DefaultAzureCredential({ managedIdentityClientId });
      const opts: AzureOpenAIClientOptions = {
        endpoint,
        deployment,
        apiVersion,
        // azureADTokenProvider will be called per request by SDK; we can fetch a fresh token
        azureADTokenProvider: async () => {
          const token = await credential.getToken(scope);
          if (!token?.token) throw new Error("Failed to acquire AAD token for Cognitive Services scope");
          return token.token;
        }
      };
      client = new AzureOpenAI(opts as unknown as AzureOpenAIClientOptions);
    } catch (e) {
      return errorJson(`Managed identity auth failed: ${e instanceof Error ? e.message : e}`, 500);
    }
  } else {
    const opts: AzureOpenAIClientOptions = {
      endpoint,
      deployment,
      apiKey: azureKey!,
      apiVersion
    };
    client = new AzureOpenAI(opts as unknown as AzureOpenAIClientOptions);
  }
  try {
    const temperature = typeof body.temperature === "number" ? body.temperature : 1;
    const stream = await openAIChatStream(client, { model: deployment, messages, temperature });
    return new Response(stream, { headers: SSE_HEADERS });
  } catch (e) {
    return errorJson(e instanceof Error ? e.message : "azure init failed", 500);
  }
}

async function handleOpenAI(body: ChatBody, messages: InMessage[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return errorJson("OPENAI_API_KEY missing", 500);
  const model = body.model?.trim() || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const temperature = typeof body.temperature === "number" ? body.temperature : 0.3;
  const client = new OpenAI({ apiKey });
  const stream = await openAIChatStream(client, { model, messages, temperature });
  return new Response(stream, { headers: SSE_HEADERS });
}

// Lightweight mock streaming handler (used when no provider creds or provider=='mock')
function handleMock(messages: InMessage[]) {
  const lastUser = [...messages].reverse().find(m => m.role === "user")?.content || "Hello";
  const baseReply = `Mock reply (no live model). You said: ${lastUser.slice(0, 240)}`;
  const stream = sseStream(async emit => {
    for (const ch of baseReply) {
      emit(ch);
      await new Promise(r => setTimeout(r, 6));
    }
  });
  return new Response(stream, { headers: SSE_HEADERS });
}

export async function POST(req: Request) {
  let body: ChatBody;
  try { body = await req.json(); } catch { return errorJson("Invalid JSON", 400); }
  if (!Array.isArray(body.messages) || body.messages.length === 0) return errorJson("messages required", 400);
  if (body.messages.length > 64) return errorJson("too many messages (max 64)", 400);
  const messages = sanitizeMessages(body.messages);
  if (!messages.length) return errorJson("no non-empty messages", 400);

  const provider = detectProvider(body.provider);
  log("provider=", provider);

  try {
    switch (provider) {
      case "azure": return handleAzure(body, messages);
      case "openai": return handleOpenAI(body, messages);
      case "ollama": return handleOllama(body, messages);
      case "mock": return handleMock(messages);
      default: return errorJson(`Unknown provider '${provider}'`, 400);
    }
  } catch (e) {
    return errorJson(e instanceof Error ? e.message : "handler failed", 500);
  }
}
