import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { queryKnowledge } from "../api/client";
import { useProject } from "../context/ProjectContext";

export default function Compare() {
  const { currentProject } = useProject();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const textareaRef = useRef(null);

  const [textResult, setTextResult] = useState(null);
  const [multiResult, setMultiResult] = useState(null);

  // Auto-resize textarea height to fit content
  const handleInputChange = (e) => {
    setQuestion(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 260)}px`;
    }
  };

  const toggleExpand = (cardKey) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Run both queries concurrently scoped to active project
      const [textRes, multiRes] = await Promise.all([
        queryKnowledge(question, true, currentProject?.id),
        queryKnowledge(question, false, currentProject?.id),
      ]);

      setTextResult(textRes);
      setMultiResult(multiRes);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch(e);
    }
  };

  const ResultCard = ({ title, result, isMultimodal, prefix }) => {
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
            whiteSpace: "pre-wrap",
          }}
        >
          {result.answer}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "12px", fontWeight: "600", color: "#86868b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Retrieved Evidence ({result.evidence?.length || 0})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.evidence?.map((e, idx) => {
              const cardKey = `${prefix}-${e.id || idx}`;
              const isExpanded = !!expandedCards[cardKey];

              return (
                <div
                  key={cardKey}
                  onClick={() => toggleExpand(cardKey)}
                  style={{
                    background: isExpanded ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                    border: isExpanded ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(255, 255, 255, 0.04)",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isExpanded ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.04)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#86868b", fontSize: "11px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: "700", textTransform: "uppercase", color: "#f5f5f7", background: "rgba(255, 255, 255, 0.08)", padding: "2px 6px", borderRadius: "4px" }}>
                        {e.modality}
                      </span>
                      {e.chain && (
                        <span style={{ fontSize: "11px", color: "#a1a1aa" }}>
                          {e.chain}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {e.start_time !== undefined && e.start_time !== null && (
                        <span style={{ background: "rgba(255, 255, 255, 0.06)", padding: "1px 6px", borderRadius: "4px", color: "#d4d4d8" }}>
                          ⏱ {e.start_time.toFixed(1)}s
                        </span>
                      )}
                      {e.page_number !== undefined && e.page_number !== null && (
                        <span style={{ background: "rgba(255, 255, 255, 0.06)", padding: "1px 6px", borderRadius: "4px", color: "#d4d4d8" }}>
                          Page {e.page_number}
                        </span>
                      )}
                      <span style={{ fontSize: "10px", color: isExpanded ? "#ffffff" : "#71717a" }}>
                        {isExpanded ? "Collapse ▲" : "Expand ▼"}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      color: isExpanded ? "#f5f5f7" : "#c7c7cc",
                      lineHeight: "1.5",
                      whiteSpace: isExpanded ? "pre-wrap" : "normal",
                      display: isExpanded ? "block" : "-webkit-box",
                      WebkitLineClamp: isExpanded ? "unset" : 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {e.content}
                  </div>

                  {isExpanded && e.frame_path && (
                    <div style={{ marginTop: "6px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                      <img
                        src={`/api/media/${e.frame_path.replace(/^data\//, "")}`}
                        alt="Evidence Frame"
                        style={{ width: "100%", maxHeight: "280px", objectFit: "contain", background: "#000000" }}
                        onError={(ev) => { ev.target.style.display = "none"; }}
                      />
                    </div>
                  )}

                  {isExpanded && e.distance !== undefined && (
                    <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "#71717a", paddingTop: "4px", borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <span>Cosine Distance: {e.distance}</span>
                      {e.confidence && <span>Confidence: {(e.confidence * 100).toFixed(0)}%</span>}
                    </div>
                  )}
                </div>
              );
            })}
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

      <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "flex-end", gap: "12px", width: "100%" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask a question (e.g. 'When the video discusses the problems caused by losing a leader or follower, what does the accompanying visual material show at those moments, and how does that visual evidence relate to the database architecture described in the PDF?')"
            value={question}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              minHeight: "56px",
              maxHeight: "260px",
              padding: "16px 20px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              color: "#f5f5f7",
              fontSize: "15px",
              lineHeight: "1.5",
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
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
        </div>
        <button
          type="submit"
          disabled={!question.trim() || loading}
          style={{
            height: "56px",
            padding: "0 28px",
            background: "#ffffff",
            color: "#000000",
            border: "none",
            borderRadius: "14px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: question.trim() && !loading ? "pointer" : "not-allowed",
            opacity: question.trim() && !loading ? 1 : 0.4,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
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
        <ResultCard title="Baseline (Text-Only RAG)" result={textResult} isMultimodal={false} prefix="text" />
        <ResultCard title="GradientRush (Multimodal RAG)" result={multiResult} isMultimodal={true} prefix="multi" />
      </div>
    </div>
  );
}
