import { useState } from "react";
import ReactMarkdown from "react-markdown";

// --- FRONTEND ---
export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [preview, setPreview] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setAnalysis("");
    setPreview("");

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setAnalysis(data.analysis || "");
    setPreview(data.generated || "");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">🌐 AI Website Cloner</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          className="p-2 rounded bg-gray-700 flex-1"
          placeholder="Enter website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-600 rounded">Analyze</button>
      </form>

      {loading && <p>⏳ Analyzing... Please wait.</p>}

      {analysis && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">AI Analysis</h2>
          <ReactMarkdown className="prose prose-invert">{analysis}</ReactMarkdown>
        </div>
      )}

      {preview && (
        <div>
          <h2 className="text-xl font-semibold">Generated Preview</h2>
          <iframe
            className="w-full h-[70vh] border rounded bg-white"
            srcDoc={preview}
          />
        </div>
      )}
    </div>
  );
}

// --- BACKEND (API route inline) ---
export const config = {
  api: {
    bodyParser: { sizeLimit: "1mb" },
  },
};

export async function middleware(req, res) {
  if (req.url === "/api/analyze" && req.method === "POST") {
    try {
      const body = await new Promise((resolve) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(JSON.parse(data)));
      });

      const siteUrl = body.url;
      const siteResp = await fetch(siteUrl);
      const html = await siteResp.text();

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
                "Analyze this website. Extract its design, layout, and style. Then recreate it as clean standalone HTML+Tailwind (no JS). Return:\n1. Markdown analysis.\n2. Full <html> document reimplementation."
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

      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ analysis, generated }));
      return;
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }
}

