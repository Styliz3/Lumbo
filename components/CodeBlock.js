import { useState } from "react";

export default function CodeBlock({ filename, code }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl mb-4 overflow-hidden border border-gray-700 shadow-lg">
      {/* Filename Bar */}
      <div className="flex justify-between items-center px-3 py-2 bg-gray-800 text-sm text-gray-300 font-mono">
        <span>{filename || "Script.lua"}</span>
        <button
          onClick={copyCode}
          className="text-xs border border-gray-600 px-2 py-1 rounded-md hover:bg-gray-700"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <pre className="p-4 bg-black overflow-x-auto text-sm leading-relaxed">
        <code className="text-green-400">{code}</code>
      </pre>
    </div>
  );
}
