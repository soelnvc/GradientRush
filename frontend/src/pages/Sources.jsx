import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listSources } from "../api/client";

const TYPE_ICONS = {
  video: "🎥",
  audio: "🎙",
  pdf: "📄",
  image: "🖼",
};

export default function Sources() {
  const [sources, setSources] = useState([]);

  useEffect(() => {
    const fetchSources = () => listSources().then(setSources).catch(console.error);
    fetchSources();
    const interval = setInterval(fetchSources, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "600", color: "#f5f5f7", letterSpacing: "-0.03em" }}>
          Source Library
        </h1>
        <p style={{ color: "#86868b", fontSize: "16px" }}>
          Browse all ingested multimodal documents, transcripts, and visual assets.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {sources.length === 0 ? (
          <div style={{ padding: "48px 0", color: "#6e6e73", fontSize: "15px" }}>
            No sources uploaded yet.
          </div>
        ) : (
          sources.map((s) => (
            <Link
              key={s.id}
              to={`/sources/${s.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 22px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "14px",
                transition: "background 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#86868b",
                    textTransform: "uppercase",
                  }}
                >
                  {s.source_type.slice(0, 3)}
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#f5f5f7" }}>
                    {s.filename}
                  </div>
                  <div style={{ fontSize: "13px", color: "#86868b", marginTop: "2px" }}>
                    {s.source_type} • Added {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "500",
                  padding: "4px 10px",
                  borderRadius: "980px",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  background:
                    s.status === "completed"
                      ? "rgba(255, 255, 255, 0.1)"
                      : s.status === "failed"
                      ? "rgba(239, 68, 68, 0.15)"
                      : "rgba(255, 255, 255, 0.05)",
                  color:
                    s.status === "completed"
                      ? "#f5f5f7"
                      : s.status === "failed"
                      ? "#f87171"
                      : "#86868b",
                }}
              >
                {s.status}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
