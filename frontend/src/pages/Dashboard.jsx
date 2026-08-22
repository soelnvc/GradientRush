import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { uploadFile, listSources } from "../api/client";
import { useProject } from "../context/ProjectContext";

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
  const { currentProject } = useProject();
  const [sources, setSources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const fetchSources = useCallback(async () => {
    try {
      const data = await listSources(currentProject?.id);
      setSources(data);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch sources", e);
      setError(e.message);
    }
  }, [currentProject?.id]);

  useEffect(() => {
    fetchSources();
    const interval = setInterval(fetchSources, 3000);
    return () => clearInterval(interval);
  }, [fetchSources]);

  const processUpload = async (files) => {
    if (!files || !files.length) return;
    setUploading(true);
    setError(null);

    try {
      for (const file of files) {
        await uploadFile(file, currentProject?.id);
      }
      await fetchSources();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = async (e) => {
    await processUpload(e.target.files);
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processUpload(e.dataTransfer.files);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
      {/* Hero Section with Left Content & Right Minimalist Drop Box */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "48px",
          flexWrap: "wrap",
        }}
      >
        {/* Left: Heading & Description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, minWidth: "320px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "3px 8px",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.06)",
                color: "#a1a1a6",
              }}
            >
              {currentProject ? currentProject.name : "All Workspaces"}
            </span>
            <span style={{ fontSize: "12px", color: "#6e6e73" }}>
              {sources.length} sources
            </span>
          </div>
          <h1
            style={{
              fontSize: "44px",
              fontWeight: "600",
              letterSpacing: "-0.035em",
              color: "#f5f5f7",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Knowledge Engine.
          </h1>
          <p
            style={{
              fontSize: "17px",
              fontWeight: "400",
              color: "#86868b",
              letterSpacing: "-0.015em",
              maxWidth: "520px",
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            {currentProject?.description || "Multimodal evidence retrieval with provenance-preserving graph expansion across video, audio, PDFs, and vision."}
          </p>
        </div>

        {/* Right: Minimalist Apple Drop Box */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            width: "300px",
            height: "120px",
            border: isDragging
              ? "1px dashed rgba(255, 255, 255, 0.5)"
              : "1px dashed rgba(255, 255, 255, 0.12)",
            borderRadius: "14px",
            background: isDragging
              ? "rgba(255, 255, 255, 0.06)"
              : "rgba(255, 255, 255, 0.015)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            userSelect: "none",
            opacity: uploading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.015)";
            }
          }}
        >
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            style={{ display: "none" }}
            disabled={uploading}
            accept=".mp4,.avi,.mkv,.mov,.webm,.mp3,.wav,.m4a,.flac,.pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp"
          />
          <span style={{ fontSize: "16px", color: "#86868b" }}>
            {uploading ? "⏳" : "↑"}
          </span>
          <div style={{ fontSize: "12px", fontWeight: "500", color: "#f5f5f7" }}>
            {uploading ? "Ingesting source..." : "Drop files here"}
          </div>
          <div style={{ fontSize: "11px", color: "#6e6e73" }}>
            or click to browse • MP4, PDF, PNG
          </div>
        </label>
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
