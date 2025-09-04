import { useState } from "react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "../components/CodeBlock";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages })
    });

    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.reply }]);
  }

  function renderMessage(content, role) {
    return (
      <div
        className={`my-3 flex ${
          role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 max-w-2xl ${
            role === "user"
              ? "bg-blue-600 text-white"
              : "bg-gray-900 text-white border border-gray-700"
          }`}
        >
          <ReactMarkdown
            className="prose prose-invert max-w-none"
            components={{
              code({ inline, className, children }) {
                const match = /language-(\w+)/.exec(className || "");
                if (!inline && match?.[1] === "lua") {
                  return (
                    <CodeBlock
                      filename="Script.lua"
                      code={String(children).replace(/\n$/, "")}
                    />
                  );
                }
                return (
                  <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded">
                    {children}
                  </code>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col font-mono">
      {/* Header */}
      <header className="p-4 text-center border-b border-gray-800 bg-black/70 sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-wide">Box.Lua</h1>
        <p className="text-gray-400 text-sm">Your free Roblox Lua AI assistant</p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.map((m, i) => (
          <div key={i}>{renderMessage(m.content, m.role)}</div>
        ))}
      </div>

      {/* Prompt Bar */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-gray-800 bg-black flex items-center"
      >
        <input
          className="flex-1 bg-gray-900 text-white border border-gray-700 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for a Lua script..."
        />
        <button
          type="submit"
          className="ml-3 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-500 font-semibold"
        >
          Send
        </button>
      </form>
    </div>
  );
}
