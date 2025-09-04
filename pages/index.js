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
    if (role === "assistant") {
      return (
        <ReactMarkdown
          className="prose prose-invert text-left max-w-2xl mx-auto"
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
              return <code className="bg-gray-800 p-1 rounded">{children}</code>;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      );
    }

    return <p className="text-gray-400 text-center">{content}</p>;
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col font-mono">
      <h1 className="text-3xl text-center mt-4 font-bold">Box.Lua</h1>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className="my-3">{renderMessage(m.content, m.role)}</div>
        ))}
      </div>

      {/* Prompt Bar */}
      <form onSubmit={sendMessage} className="p-4 flex justify-center">
        <input
          className="bg-black text-white border border-white rounded-full px-4 py-2 w-2/3 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for a Lua script..."
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 border border-white rounded-full bg-black text-white hover:bg-gray-800"
        >
          Send
        </button>
      </form>
    </div>
  );
}
