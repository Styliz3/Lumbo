import { useState } from "react";
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

  // Extract Lua code blocks with filenames
  function renderMessage(content, role) {
    if (role === "assistant") {
      const codeRegex = /--\s*File:\s*(.*?)\n```lua([\s\S]*?)```/g;
      const parts = [];
      let match, lastIndex = 0;

      while ((match = codeRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(<p key={lastIndex} className="my-2">{content.slice(lastIndex, match.index)}</p>);
        }
        parts.push(
          <CodeBlock key={match.index} filename={match[1].trim()} code={match[2].trim()} />
        );
        lastIndex = codeRegex.lastIndex;
      }

      if (lastIndex < content.length) {
        parts.push(<p key="end">{content.slice(lastIndex)}</p>);
      }

      return <div className="text-left">{parts}</div>;
    }

    return <div className="text-gray-400">{content}</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col font-mono">
      <h1 className="text-3xl text-center mt-4 font-bold">Box.Lua</h1>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className="text-center my-3">
            {renderMessage(m.content, m.role)}
          </div>
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
