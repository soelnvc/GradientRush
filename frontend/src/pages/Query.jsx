import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { queryKnowledge } from "../api/client";
import { useProject } from "../context/ProjectContext";

export default function Query() {
  const { currentProject } = useProject();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const textareaRef = useRef(null);

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
    setResult(null);

    try {
      const data = await queryKnowledge(question, false, currentProject?.id);
      setResult(data);
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

  const getConfidenceBadge = (tier) => {
    const styles = {
      "Full": { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "rgba(16, 185, 129, 0.3)" },
      "Very High": { bg: "rgba(16, 185, 129, 0.12)", color: "#34d399", border: "rgba(16, 185, 129, 0.25)" },
      "High": { bg: "rgba(6, 182, 212, 0.12)", color: "#22d3ee", border: "rgba(6, 182, 212, 0.25)" },
      "Moderate": { bg: "rgba(245, 158, 11, 0.12)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.25)" },
      "Low": { bg: "rgba(249, 115, 22, 0.12)", color: "#fb923c", border: "rgba(249, 115, 22, 0.25)" },
      "Very Low": { bg: "rgba(239, 68, 68, 0.12)", color: "#f87171", border: "rgba(239, 68, 68, 0.25)" },
      "Zero": { bg: "rgba(113, 113, 122, 0.12)", color: "#a1a1aa", border: "rgba(113, 113, 122, 0.25)" },
    };
    const s = styles[tier] || styles["Moderate"];
    return (
      <span
        style={{
          fontSize: "10px",
          fontWeight: "600",
          letterSpacing: "0.02em",
          padding: "2px 7px",
          borderRadius: "4px",
          background: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
          textTransform: "uppercase",
        }}
      >
        {tier || "Moderate"}
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#86868b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Workspace Context:
          </span>
          <span style={{ fontSize: "12px", color: "#ffffff", fontWeight: "500" }}>
            {currentProject?.name || "All Workspaces (Global)"}
          </span>
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: "600", color: "#f5f5f7", letterSpacing: "-0.03em" }}>
          Query Engine
        </h1>
        <p style={{ color: "#86868b", fontSize: "16px" }}>
          Search across speech, documents, diagrams, and video frames with provenance graphs.
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "flex-start", gap: "12px", width: "100%" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask a question across your media library (e.g. 'How does asynchronous replication handle leader failure?')..."
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
                whiteSpace: "pre-wrap",
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
              {result.evidence?.map((e, idx) => {
                const cardKey = e.id || `evidence-${idx}`;
                const isExpanded = !!expandedCards[cardKey];

                return (
                  <div
                    key={cardKey}
                    onClick={() => toggleExpand(cardKey)}
                    style={{
                      background: isExpanded ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.02)",
                      border: isExpanded ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(255, 255, 255, 0.06)",
                      padding: "20px",
                      borderRadius: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isExpanded ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.06)";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
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
                        {getConfidenceBadge(e.confidence_tier)}
                        {e.chain && e.chain !== "Direct retrieval" && (
                          <span style={{ fontSize: "12px", color: "#86868b" }}>
                            ↳ {e.chain}
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                        {e.start_time !== undefined && e.start_time !== null && (
                          <Link
                            to={`/sources/${e.source_id}?t=${e.start_time}`}
                            onClick={(ev) => ev.stopPropagation()}
                            style={{
                              color: "#f5f5f7",
                              padding: "3px 10px",
                              borderRadius: "980px",
                              background: "rgba(255, 255, 255, 0.06)",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                              fontSize: "12px",
                              textDecoration: "none",
                            }}
                          >
                            ⏱ {e.start_time.toFixed(1)}s
                          </Link>
                        )}
                        {e.page_number !== undefined && e.page_number !== null && (
                          <Link
                            to={`/sources/${e.source_id}?page=${e.page_number}`}
                            onClick={(ev) => ev.stopPropagation()}
                            style={{
                              color: "#f5f5f7",
                              padding: "3px 10px",
                              borderRadius: "980px",
                              background: "rgba(255, 255, 255, 0.06)",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                              fontSize: "12px",
                              textDecoration: "none",
                            }}
                          >
                            Page {e.page_number}
                          </Link>
                        )}
                        <span style={{ fontSize: "11px", color: isExpanded ? "#ffffff" : "#71717a" }}>
                          {isExpanded ? "Collapse ▲" : "Expand ▼"}
                        </span>
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: "15px",
                        color: isExpanded ? "#f5f5f7" : "#d1d1d6",
                        margin: 0,
                        lineHeight: "1.6",
                        whiteSpace: isExpanded ? "pre-wrap" : "normal",
                        display: isExpanded ? "block" : "-webkit-box",
                        WebkitLineClamp: isExpanded ? "unset" : 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {e.content}
                    </p>

                    {isExpanded && e.frame_path && (
                      <div style={{ marginTop: "8px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                        <img
                          src={`/api/media/${e.frame_path.replace(/^data\//, "")}`}
                          alt="Evidence Frame"
                          style={{ width: "100%", maxHeight: "360px", objectFit: "contain", background: "#000000" }}
                          onError={(ev) => { ev.target.style.display = "none"; }}
                        />
                      </div>
                    )}

                    {isExpanded && e.distance !== undefined && (
                      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#86868b", paddingTop: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <span>Cosine Distance: {e.distance}</span>
                        <span>Similarity: {e.similarity !== undefined ? e.similarity : (1.0 - e.distance).toFixed(4)}</span>
                        <span>Confidence: {e.confidence_tier || "Moderate"}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
