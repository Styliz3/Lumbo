import { useState } from "react";
import ReactMarkdown from "react-markdown";

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
