import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home({ initialAnalysis, initialPreview, initialUrl }) {
  const [url, setUrl] = useState(initialUrl || "");
  const [analysis, setAnalysis] = useState(initialAnalysis || "");
  const [preview, setPreview] = useState(initialPreview || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // Reload page with ?url=... (SSR will re-run)
    window.location.href = `/?url=${encodeURIComponent(url)}`;
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
        <button className="px-4 py-2 bg-blue-600 rounded" disabled={loading}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </form>

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

// --- SERVER SIDE CODE (acts like API) ---
export async function getServerSideProps(context) {
  const url = context.query.url || null;
  if (!url) return { props: {} };

  try {
    // Fetch target website HTML
    const resp = await fetch(url);
    const html = await resp.text();

    // Ask Groq API for analysis + reimplementation
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
              "Analyze this site HTML. Summarize design in Markdown. Then output a clean standalone HTML+Tailwind page that looks similar (no JS copied). Output:\n1. Analysis in Markdown\n2. Full <html> reimplementation."
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

    return {
      props: { initialUrl: url, initialAnalysis: analysis, initialPreview: generated },
    };
  } catch (err) {
    return {
      props: { initialUrl: url, initialAnalysis: "⚠️ Error: " + err.message },
    };
  }
}
