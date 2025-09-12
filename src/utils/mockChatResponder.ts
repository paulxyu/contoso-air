import { ChatMessage } from "../components/Chat";

export async function mockResponder(_history: ChatMessage[], userInput: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 900));
  return (
    "Sorry, I can't handle that request at the moment—check back soon."
  );
}
