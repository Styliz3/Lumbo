export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { url } = req.body;

  try {
    // 1. Fetch website HTML
    const response = await fetch(url);
    const html = await response.text();

    // 2. Ask Groq API to analyze + rebuild
    const groqRes = await fetch(`${process.env.GROQ_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        reasoning_effort: "high",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that analyzes websites. Extract design & style from raw HTML. Then re-create a clean standalone HTML+Tailwind page. Output:\n1. Markdown analysis\n2. Full <html> reimplementation"
          },
          { role: "user", content: html.slice(0, 8000) }
        ],
      }),
    });

    const data = await groqRes.json();
    const content = data.choices?.[0]?.message?.content || "";

    let analysis = "No analysis";
    let generated = "<!DOCTYPE html><html><body>Error</body></html>";

    if (content.includes("<html")) {
      const parts = content.split("<html");
      analysis = parts[0].trim();
      generated = "<html" + parts[1];
    } else {
      analysis = content;
    }

    res.json({ analysis, generated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
