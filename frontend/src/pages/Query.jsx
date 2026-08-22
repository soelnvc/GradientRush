import { useState } from "react";
import { Link } from "react-router-dom";
import { queryKnowledge } from "../api/client";

export default function Query() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await queryKnowledge(question);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getModalityIcon = (modality) => {
    switch (modality) {
      case 'speech': return '🎙️';
      case 'frame': return '🖼️';
      case 'image': return '🖼️';
      case 'pdf_text': return '📄';
      case 'ocr': return '🔤';
      default: return '📄';
    }
  };

  return (
    <div>
      <Link to="/" style={{ color: "#60a5fa" }}>← Back to Dashboard</Link>
      <h1 style={{ marginTop: 16 }}>🔍 Query Knowledge Base</h1>

      <form onSubmit={handleSearch} style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <input
          type="text"
          placeholder="Ask your knowledge base..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "#1a1a2e",
            border: "1px solid #333",
            borderRadius: 8,
            color: "#fff",
            fontSize: 16,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={!question.trim() || loading}
          style={{
            padding: "10px 24px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: question.trim() && !loading ? "pointer" : "not-allowed",
            opacity: question.trim() && !loading ? 1 : 0.5,
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div style={{ color: "#ef4444", marginTop: 24 }}>
          ⚠ {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 32 }}>
          <h2>Synthesis</h2>
          <div style={{ 
            background: "#1e1b4b", 
            padding: 24, 
            borderRadius: 8,
            lineHeight: 1.6,
            marginBottom: 32
          }}>
            {result.answer}
          </div>

          <h2>Evidence ({result.evidence?.length || 0})</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {result.evidence?.map((e, idx) => (
              <div key={e.id} style={{
                background: "#1a1a2e",
                padding: 16,
                borderRadius: 8,
                borderLeft: "4px solid #4f46e5",
                display: "flex",
                flexDirection: "column",
                gap: 8
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#818cf8" }}>
                    {getModalityIcon(e.modality)} Source {idx + 1} • {e.modality}
                  </span>
                  
                  <span style={{ fontSize: 12, color: "#888" }}>
                    {e.start_time !== null && (
                      <Link to={`/sources/${e.source_id}?t=${e.start_time}`} style={{ color: "#10b981", textDecoration: "none", marginRight: 8 }}>
                        ⏱️ Time: {e.start_time.toFixed(1)}s
                      </Link>
                    )}
                    {e.page_number !== null && (
                      <Link to={`/sources/${e.source_id}?page=${e.page_number}`} style={{ color: "#f59e0b", textDecoration: "none" }}>
                        📑 Page: {e.page_number}
                      </Link>
                    )}
                  </span>
                </div>
                
                {e.chain && e.chain !== "Direct retrieval" && (
                  <div style={{ fontSize: 12, color: "#94a3b8", background: "#0f172a", padding: "4px 8px", borderRadius: 4, alignSelf: "flex-start" }}>
                    🔗 {e.chain}
                  </div>
                )}

                <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 4 }}>
                  {e.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
