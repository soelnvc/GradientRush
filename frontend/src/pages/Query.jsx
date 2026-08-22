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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "600", color: "#f5f5f7", letterSpacing: "-0.03em" }}>
          Query Engine
        </h1>
        <p style={{ color: "#86868b", fontSize: "16px" }}>
          Search across speech, documents, diagrams, and video frames with strict evidence grounding.
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", width: "100%" }}>
        <input
          type="text"
          placeholder="Ask a question across your media library..."
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
            transition: "border-color 0.2s ease, background 0.2s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
            e.target.style.background = "rgba(255, 255, 255, 0.06)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.target.style.background = "rgba(255, 255, 255, 0.04)";
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
          {loading ? "Synthesizing..." : "Search"}
        </button>
      </form>

      {error && (
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
            color: "#f87171",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
          {/* Synthesized Answer */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h2 style={{ fontSize: "13px", fontWeight: "600", color: "#86868b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Synthesized Answer
            </h2>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "24px 28px",
                borderRadius: "16px",
                fontSize: "16px",
                lineHeight: "1.7",
                color: "#f5f5f7",
              }}
            >
              {result.answer}
            </div>
          </div>

          {/* Evidence List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h2 style={{ fontSize: "13px", fontWeight: "600", color: "#86868b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Grounding Evidence ({result.evidence?.length || 0})
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {result.evidence?.map((e, idx) => (
                <div
                  key={e.id || idx}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    padding: "20px",
                    borderRadius: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          background: "rgba(255, 255, 255, 0.08)",
                          color: "#f5f5f7",
                        }}
                      >
                        {e.modality}
                      </span>
                      {e.chain && e.chain !== "Direct retrieval" && (
                        <span style={{ fontSize: "12px", color: "#86868b" }}>
                          ↳ {e.chain}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
                      {e.start_time !== null && (
                        <Link
                          to={`/sources/${e.source_id}?t=${e.start_time}`}
                          style={{
                            color: "#f5f5f7",
                            padding: "2px 8px",
                            borderRadius: "980px",
                            background: "rgba(255, 255, 255, 0.06)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            fontSize: "12px",
                          }}
                        >
                          ⏱ {e.start_time.toFixed(1)}s
                        </Link>
                      )}
                      {e.page_number !== null && (
                        <Link
                          to={`/sources/${e.source_id}?page=${e.page_number}`}
                          style={{
                            color: "#f5f5f7",
                            padding: "2px 8px",
                            borderRadius: "980px",
                            background: "rgba(255, 255, 255, 0.06)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            fontSize: "12px",
                          }}
                        >
                          Page {e.page_number}
                        </Link>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: "15px", color: "#d1d1d6", margin: 0, lineHeight: "1.6" }}>
                    {e.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
