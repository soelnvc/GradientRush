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
    <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
      {/* Hero Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h1
          style={{
            fontSize: "44px",
            fontWeight: "600",
            letterSpacing: "-0.035em",
            color: "#f5f5f7",
            lineHeight: 1.1,
          }}
        >
          Knowledge Engine.
        </h1>
        <p
          style={{
            fontSize: "20px",
            fontWeight: "400",
            color: "#86868b",
            letterSpacing: "-0.015em",
            maxWidth: "640px",
            lineHeight: 1.4,
          }}
        >
          Multimodal evidence retrieval with provenance-preserving graph expansion across video, audio, PDFs, and vision.
        </p>

        {/* Upload Action */}
        <div style={{ marginTop: "16px" }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: uploading ? "not-allowed" : "pointer",
              padding: "10px 22px",
              background: "#ffffff",
              color: "#000000",
              borderRadius: "980px",
              fontSize: "14px",
              fontWeight: "500",
              letterSpacing: "-0.01em",
              boxShadow: "0 4px 14px rgba(255, 255, 255, 0.12)",
              transition: "transform 0.15s ease, opacity 0.15s ease",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? "Ingesting..." : "Upload Sources"}
            <input
              type="file"
              multiple
              onChange={handleUpload}
              style={{ display: "none" }}
              disabled={uploading}
              accept=".mp4,.avi,.mkv,.mov,.webm,.mp3,.wav,.m4a,.flac,.pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp"
            />
          </label>
          <span style={{ marginLeft: "16px", fontSize: "13px", color: "#6e6e73" }}>
            MP4, WAV, PDF, PNG supported
          </span>
        </div>
      </div>

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

      {/* Sources Grid / List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#f5f5f7", letterSpacing: "-0.02em" }}>
            Ingested Sources
          </h2>
          <span style={{ fontSize: "13px", color: "#86868b" }}>
            {sources.length} document{sources.length === 1 ? "" : "s"}
          </span>
        </div>

        {sources.length === 0 ? (
          <div
            style={{
              padding: "48px 0",
              color: "#6e6e73",
              fontSize: "15px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            No documents uploaded yet. Upload a PDF, video, or audio file to begin.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sources.map((s) => (
              <Link
                key={s.id}
                to={`/sources/${s.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "14px",
                  transition: "background 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
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
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "rgba(255, 255, 255, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#86868b",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.source_type.slice(0, 3)}
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "500", color: "#f5f5f7" }}>
                      {s.filename}
                    </div>
                    <div style={{ fontSize: "12px", color: "#86868b", marginTop: "2px" }}>
                      {s.source_type} • {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "500",
                      padding: "4px 10px",
                      borderRadius: "980px",
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
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
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    {s.status}
                  </span>
                  <span style={{ color: "#6e6e73", fontSize: "16px" }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
