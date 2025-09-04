import { useState } from "react";

export default function CodeBlock({ filename, code }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-900 rounded-xl mb-4 overflow-hidden border border-white">
      <div className="flex justify-between items-center px-3 py-2 bg-gray-800 text-sm text-white">
        <span>{filename || "Script.lua"}</span>
        <button
          onClick={copyCode}
          className="text-xs border border-white px-2 py-1 rounded-md hover:bg-gray-700"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-sm">
        <code className="text-green-400">{code}</code>
      </pre>
    </div>
  );
}
