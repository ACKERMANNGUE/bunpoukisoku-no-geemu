const ANKI_URL = "http://localhost:8765";

async function ankiRequest<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(ANKI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, version: 6, params }),
  });
  if (!res.ok) throw new Error(`AnkiConnect HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`AnkiConnect: ${data.error}`);
  return data.result as T;
}

export async function ankiDeckNames(): Promise<string[]> {
  return ankiRequest<string[]>("deckNames");
}

export async function ankiGetSentences(deck: string, field: string): Promise<string[]> {
  const cardIds = await ankiRequest<number[]>("findCards", { query: `deck:"${deck}"` });
  if (!cardIds.length) return [];

  const cardsInfo = await ankiRequest<{ fields: Record<string, { value: string }> }[]>(
    "cardsInfo",
    { cards: cardIds },
  );

  const seen = new Set<string>();
  const sentences: string[] = [];
  for (const card of cardsInfo) {
    const raw = card?.fields?.[field]?.value ?? "";
    const text = raw.replaceAll(/<[^>]+>/g, "").trim();
    if (text && !seen.has(text)) {
      seen.add(text);
      sentences.push(text);
    }
  }
  return sentences;
}
