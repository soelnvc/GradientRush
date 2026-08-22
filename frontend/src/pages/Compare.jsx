import { useState } from "react";
import { Link } from "react-router-dom";
import { queryKnowledge } from "../api/client";

export default function Compare() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [textResult, setTextResult] = useState(null);
  const [multiResult, setMultiResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Run both queries concurrently
      const [textRes, multiRes] = await Promise.all([
        queryKnowledge(question, true),
        queryKnowledge(question, false)
      ]);
      
      setTextResult(textRes);
      setMultiResult(multiRes);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const ResultCard = ({ title, result, isMultimodal }) => {
    if (!result) return null;
    return (
      <div style={{ flex: 1, background: "#0f172a", borderRadius: 8, padding: 24, border: `2px solid ${isMultimodal ? '#3b82f6' : '#334155'}` }}>
        <h2 style={{ marginTop: 0, color: isMultimodal ? "#60a5fa" : "#94a3b8" }}>{title}</h2>
        <div style={{ background: "#1e293b", padding: 16, borderRadius: 8, lineHeight: 1.6, marginBottom: 24 }}>
          {result.answer}
        </div>
        
        <h3 style={{ fontSize: 16 }}>Evidence Retrieved ({result.evidence?.length || 0})</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {result.evidence?.map((e, idx) => (
            <div key={idx} style={{ background: "#1e293b", padding: 12, borderRadius: 6, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#94a3b8" }}>
                <span style={{ fontWeight: 600 }}>{e.modality}</span>
                <span>{e.chain}</span>
              </div>
              <div style={{ color: "#cbd5e1", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {e.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginTop: 16 }}>⚖️ Hackathon Evaluation: Text vs Multimodal</h1>
      <p style={{ color: "#94a3b8" }}>Compare a traditional text-only RAG (PDF/OCR) against the Multimodal RAG with relationship expansion.</p>

      <form onSubmit={handleSearch} style={{ marginTop: 24, display: "flex", gap: 12, marginBottom: 32 }}>
        <input
          type="text"
          placeholder="Ask a question that requires multiple modalities (e.g. 'What architecture is shown when replication is discussed?')"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ flex: 1, padding: "12px 16px", background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 16, outline: "none" }}
        />
        <button
          type="submit"
          disabled={!question.trim() || loading}
          style={{ padding: "10px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: question.trim() && !loading ? "pointer" : "not-allowed", opacity: question.trim() && !loading ? 1 : 0.5 }}
        >
          {loading ? "Evaluating..." : "Compare"}
        </button>
      </form>

      {error && <div style={{ color: "#ef4444", marginBottom: 24 }}>⚠ {error}</div>}

      <div style={{ display: "flex", gap: 24 }}>
        <ResultCard title="Baseline (Text-Only RAG)" result={textResult} isMultimodal={false} />
        <ResultCard title="GradientRush (Multimodal RAG)" result={multiResult} isMultimodal={true} />
      </div>
    </div>
  );
}
