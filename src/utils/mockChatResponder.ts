import { ChatMessage } from "../components/Chat";

// Table-driven patterns for mock responses
const patterns: { re: RegExp; text: string }[] = [
  {
    re: /(paris|france)/i,
    text:
      "Paris is lovely year‑round, but late spring (May–June) offers mild weather and fewer crowds. Want flight price tips?",
  },
  {
    re: /(hawaii|maui|honolulu)/i,
    text:
      "For Hawaii, consider shoulder months (April, May, September) for better fares and calmer beaches. Need hotel ideas?",
  },
  {
    re: /deal|discount|promo/i,
    text:
      "We have seasonal fare drops mid‑week. Try flexible dates ±3 days to uncover 10–18% savings.",
  },
  {
    re: /hello|hi|hey/i,
    text:
      "Hello! Ask me about destinations, cheapest months to travel, or multi‑city planning.",
  },
];

export async function mockResponder(_history: ChatMessage[], userInput: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 900));
  const found = patterns.find((p) => p.re.test(userInput));
  return (
    found?.text ??
    "Got it. I can also help with best times to fly, visa notes, baggage, or inspiration—just ask."
  );
}
