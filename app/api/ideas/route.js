const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export async function POST(request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GROQ_API_KEY is not set in .env" }, { status: 500 });
  }

  const reader = request.body?.getReader();
  const decoder = new TextDecoder();
  let raw = "";
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        raw += decoder.decode();
        break;
      }

      raw += decoder.decode(value, { stream: true });
      if (raw.length > 10000) {
        await reader.cancel();
        return Response.json({ error: "Request too large" }, { status: 413 });
      }
    }
  }

  let data;
  if (raw.length > 10000) {
    return Response.json({ error: "Request too large" }, { status: 413 });
  }
  try {
    data = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const topic = String(data.topic || "").slice(0, 200).trim() || "anything";
  const category = String(data.category || "General").slice(0, 50);
  const parsedCount = Number.parseInt(data.count, 10) || 5;
  const count = Math.min(Math.max(parsedCount, 1), 10);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You are a creative idea generator. Reply ONLY with JSON: {"ideas":[{"title":string,"description":string}]}. Descriptions are 1-2 sentences.',
          },
          {
            role: "user",
            content: `Generate ${count} original ${category} ideas about: ${topic}`,
          },
        ],
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: result.error?.message || "Groq API error" },
        { status: response.status },
      );
    }

    const ideas = JSON.parse(result.choices[0].message.content).ideas;
    return Response.json({ ideas });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: `Failed to generate ideas: ${message}` },
      { status: 502 },
    );
  }
}
