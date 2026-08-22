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
    <div>
      <h1>📁 Source Library</h1>
      <Link to="/" style={{ color: "#60a5fa" }}>← Back to Dashboard</Link>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
        {sources.map((s) => (
          <Link
            key={s.id}
            to={`/sources/${s.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: "#1a1a2e",
              borderRadius: 8,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span style={{ fontSize: 24 }}>
              {TYPE_ICONS[s.source_type] || "📎"}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{s.filename}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{s.source_type} · {s.status}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
