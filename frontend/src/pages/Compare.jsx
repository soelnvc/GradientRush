import { useState } from "react";
import { Link } from "react-router-dom";
import { queryKnowledge } from "../api/client";
import { useProject } from "../context/ProjectContext";

export default function Compare() {
  const { currentProject } = useProject();
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
      // Run both queries concurrently scoped to active project
      const [textRes, multiRes] = await Promise.all([
        queryKnowledge(question, true, currentProject?.id),
        queryKnowledge(question, false, currentProject?.id)
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
      <div
        style={{
          flex: 1,
          background: isMultimodal ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.02)",
          borderRadius: "16px",
          padding: "28px",
          border: isMultimodal
            ? "1px solid rgba(255, 255, 255, 0.18)"
            : "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#f5f5f7" }}>
            {title}
          </h2>
          {isMultimodal && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: "500",
                padding: "2px 8px",
                borderRadius: "980px",
                background: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
              }}
            >
              Multimodal Graph
            </span>
          )}
        </div>

        <div
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            padding: "18px 20px",
            borderRadius: "12px",
            fontSize: "15px",
            lineHeight: "1.65",
            color: "#e5e5ea",
          }}
        >
          {result.answer}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "12px", fontWeight: "600", color: "#86868b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Retrieved Evidence ({result.evidence?.length || 0})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.evidence?.map((e, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", color: "#86868b", fontSize: "11px" }}>
                  <span style={{ fontWeight: "600", textTransform: "uppercase" }}>{e.modality}</span>
                  <span>{e.chain}</span>
                </div>
                <div
                  style={{
                    color: "#c7c7cc",
                    lineHeight: "1.4",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {e.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "600", color: "#f5f5f7", letterSpacing: "-0.03em" }}>
          Benchmark Evaluation
        </h1>
        <p style={{ color: "#86868b", fontSize: "16px" }}>
          Side-by-side comparison proving Multimodal Graph RAG against a traditional Text-Only baseline.
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", width: "100%" }}>
        <input
          type="text"
          placeholder="Ask a question (e.g. 'What architecture is shown when replication is discussed?')"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{
            flex: 1,
            padding: "16px 20px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "14px",
            color: "#f5f5f7",
            fontSize: "16px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={!question.trim() || loading}
          style={{
            padding: "0 28px",
            background: "#ffffff",
            color: "#000000",
            border: "none",
            borderRadius: "980px",
            fontWeight: "500",
            fontSize: "14px",
            cursor: question.trim() && !loading ? "pointer" : "not-allowed",
            opacity: question.trim() && !loading ? 1 : 0.4,
          }}
        >
          {loading ? "Evaluating..." : "Compare"}
        </button>
      </form>

      {error && (
        <div style={{ padding: "14px 18px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", color: "#f87171", fontSize: "14px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "24px" }}>
        <ResultCard title="Baseline (Text-Only RAG)" result={textResult} isMultimodal={false} />
        <ResultCard title="GradientRush (Multimodal RAG)" result={multiResult} isMultimodal={true} />
      </div>
    </div>
  );
}
