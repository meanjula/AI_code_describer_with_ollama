import { useState, useRef } from "react";
import Explanation from "./Explanation.jsx";

export default function App() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const explanationRef = useRef(null);

  const handleExplain = async () => {
    setLoading(true);
    setExplanation("");
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/explain-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      if (!res.ok) throw new Error("Server returned an error");

      // Get readable stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);
        let firstChunkSeen = false;

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.type === "token" && data.content) {
              setLoading(false);
              if (!firstChunkSeen) {
                firstChunkSeen = true;
                explanationRef.current?.scrollIntoView({ behavior: "smooth" });
              }
              // Update progressively
              setExplanation((prev) => prev + data.content);
            } else if (data.type === "done" && data.content) {
              explanationRef.current?.scrollIntoView({ behavior: "smooth" });
              explanationRef.current?.focus();
              // Final content (ensure complete)
              setExplanation(data.content);
            } else if (data.type === "error") {
              setError(data.message || "Unknown error");
            }
          } catch {
            console.warn("Skipping malformed line:", line);
          }
        }
      }
    } catch (err) {
      console.error("❌ Frontend error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const options = ["javascript", "python", "java", "c++", "typescript", "go"];
  console.log("Rendering with state:", explanation);
  return (
    <div className="min-w-[45vw] bg-gray-800 text-gray-100 flex flex-col items-center p-6 rounded-3xl shadow-2xl  ">
      <h1 className="text-3xl font-bold mb-6">🦙 Code Explainer</h1>
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-3xl space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-lg font-medium">Select Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md p-2"
          >
            {options.map((lang) => (
              <option key={lang} value={lang}>
                {lang.at(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here..."
          className="w-full h-48 bg-gray-900 border border-gray-700 rounded-md p-3 font-mono text-sm text-white"
        />
        <button
          onClick={handleExplain}
          disabled={loading || !code.trim()}
          className=" bg-blue-600 hover:bg-blue-700 transition text-white p-3 rounded-md font-semibold disabled:opacity-50"
        >
          {loading ? "Explaining..." : "Explain Code"}
        </button>
      </div>
      <>
        {error && (
          <div className="text-red-400 mt-4 text-sm">⚠️ Error: {error}</div>
        )}
        {loading && (
          <div className="text-yellow-400 mt-4 text-sm">⏳ Loading...</div>
        )}
        {explanation && (
          <Explanation
            explanation={explanation}
            explanationRef={explanationRef}
          />
        )}
      </>
    </div>
  );
}
