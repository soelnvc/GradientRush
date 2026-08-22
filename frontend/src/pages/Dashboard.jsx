import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { uploadFile, listSources } from "../api/client";

const TYPE_ICONS = {
  video: "🎥",
  audio: "🎙",
  pdf: "📄",
  image: "🖼",
};

const STATUS_COLORS = {
  uploaded: "#888",
  processing: "#f59e0b",
  completed: "#22c55e",
  failed: "#ef4444",
};

export default function Dashboard() {
  const [sources, setSources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSources = useCallback(async () => {
    try {
      const data = await listSources();
      setSources(data);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch sources", e);
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    fetchSources();
    const interval = setInterval(fetchSources, 3000);
    return () => clearInterval(interval);
  }, [fetchSources]);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of files) {
        await uploadFile(file);
      }
      await fetchSources();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <h1>📡 Knowledge Engine</h1>
      <p style={{ color: "#888", marginTop: -8 }}>
        Multimodal Evidence Retrieval System
      </p>

      {/* Upload */}
      <div
        style={{
          border: "2px dashed #444",
          borderRadius: 8,
          padding: 24,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <label
          style={{
            cursor: "pointer",
            padding: "10px 24px",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          {uploading ? "Uploading..." : "+ Upload Sources"}
          <input
            type="file"
            multiple
            onChange={handleUpload}
            style={{ display: "none" }}
            disabled={uploading}
            accept=".mp4,.avi,.mkv,.mov,.webm,.mp3,.wav,.m4a,.flac,.pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp"
          />
        </label>
        <p style={{ color: "#666", fontSize: 14, marginTop: 12 }}>
          Video, Audio, PDF, or Image
        </p>
      </div>

      {error && (
        <div style={{ color: "#ef4444", marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}

      {/* Sources list */}
      <h2>Sources ({sources.length})</h2>
      {sources.length === 0 ? (
        <p style={{ color: "#666" }}>No sources uploaded yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                <div style={{ fontSize: 12, color: "#888" }}>
                  {s.source_type}
                </div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: STATUS_COLORS[s.status],
                  textTransform: "uppercase",
                }}
              >
                {s.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
