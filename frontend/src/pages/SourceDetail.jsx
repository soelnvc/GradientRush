import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { getSource, processSource, getSourceEvidence } from "../api/client";

const API_BASE = "";

export default function SourceDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [source, setSource] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const fetchSourceData = async () => {
    try {
      const data = await getSource(id);
      setSource(data);
      if (data.evidence_count > 0) {
        const evData = await getSourceEvidence(id);
        setEvidence(evData);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchSourceData();
  }, [id]);

  useEffect(() => {
    // Handle URL parameters for seeking (?t=12.5 or ?page=2)
    const params = new URLSearchParams(location.search);
    const time = params.get("t");
    
    if (time && videoRef.current) {
      // Small delay to ensure video is loaded
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = parseFloat(time);
          videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
        }
      }, 500);
    }
  }, [location.search, source]);

  const handleProcess = async () => {
    setProcessing(true);
    setError(null);
    try {
      await processSource(id);
      await fetchSourceData();
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSeek = (time) => {
    if (videoRef.current && time !== null) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  if (!source) return <p style={{ padding: 24 }}>Loading...</p>;

  const fileUrl = `${API_BASE}/${source.file_path}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#000000" }}>
      {/* Top Header */}
      <div
        style={{
          padding: "16px 28px",
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            to="/sources"
            style={{
              color: "#86868b",
              fontSize: "13px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← Library
          </Link>
          <span style={{ color: "#3a3a3c" }}>/</span>
          <h1 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#f5f5f7" }}>
            {source.filename}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "980px",
              background: "rgba(255, 255, 255, 0.06)",
              color: "#86868b",
            }}
          >
            {source.source_type}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "980px",
              background:
                source.status === "completed"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(255, 255, 255, 0.05)",
              color: source.status === "completed" ? "#f5f5f7" : "#86868b",
            }}
          >
            {source.status}
          </span>
        </div>
      </div>

      {/* Main Split Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left pane: Media / Document Viewer */}
        <div
          style={{
            flex: 2,
            background: "#000000",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {source.status === "uploaded" ? (
            <div style={{ margin: "auto", textAlign: "center", maxWidth: "360px" }}>
              <p style={{ color: "#86868b", fontSize: "15px", marginBottom: "20px" }}>
                Source uploaded but evidence extraction not yet initiated.
              </p>
              <button
                onClick={handleProcess}
                disabled={processing}
                style={{
                  padding: "10px 24px",
                  background: "#ffffff",
                  color: "#000000",
                  border: "none",
                  borderRadius: "980px",
                  fontWeight: "500",
                  fontSize: "14px",
                  cursor: processing ? "not-allowed" : "pointer",
                  opacity: processing ? 0.6 : 1,
                }}
              >
                {processing ? "Extracting..." : "Process Source"}
              </button>
              {error && <p style={{ color: "#f87171", fontSize: "13px", marginTop: "16px" }}>{error}</p>}
            </div>
          ) : source.source_type === "video" || source.source_type === "audio" ? (
            <video
              ref={videoRef}
              src={fileUrl}
              controls
              style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000000" }}
            />
          ) : source.source_type === "pdf" ? (
            <object
              data={`${fileUrl}${location.search.includes('page=') ? '#page=' + new URLSearchParams(location.search).get('page') : ''}`}
              type="application/pdf"
              style={{ width: "100%", height: "100%", border: "none" }}
            >
              <p style={{ padding: "32px", color: "#86868b" }}>
                PDF preview unavailable. <a href={fileUrl} download>Download</a>
              </p>
            </object>
          ) : source.source_type === "image" ? (
            <img src={fileUrl} alt={source.filename} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <div style={{ margin: "auto", color: "#6e6e73" }}>Preview unavailable</div>
          )}
        </div>

        {/* Right pane: Evidence Timeline */}
        <div
          style={{
            flex: 1,
            background: "#08080a",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#86868b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Timeline Evidence
            </h2>
            <span style={{ fontSize: "12px", color: "#6e6e73" }}>
              {evidence.length} items
            </span>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {evidence.length === 0 && source.status === "completed" && (
              <p style={{ color: "#6e6e73", fontSize: "14px", padding: "12px 0" }}>No evidence extracted.</p>
            )}
            {evidence.map((ev) => (
              <div
                key={ev.id}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  padding: "16px",
                  borderRadius: "12px",
                  cursor: (ev.start_time !== null && videoRef.current) ? "pointer" : "default",
                  transition: "background 0.15s ease, border-color 0.15s ease",
                }}
                onClick={() => handleSeek(ev.start_time)}
                onMouseEnter={(e) => {
                  if (ev.start_time !== null) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "600", color: "#86868b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    {ev.modality}
                  </span>
                  <span style={{ fontSize: "11px", color: "#f5f5f7", opacity: 0.8 }}>
                    {ev.start_time !== null && `⏱ ${ev.start_time.toFixed(1)}s`}
                    {ev.page_number !== null && `Page ${ev.page_number}`}
                  </span>
                </div>

                {ev.frame_path && (
                  <img
                    src={`${API_BASE}/${ev.frame_path}`}
                    alt="Frame"
                    style={{ width: "100%", borderRadius: "6px", marginBottom: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                  />
                )}

                <p style={{ fontSize: "13px", color: "#d1d1d6", margin: 0, lineHeight: "1.5" }}>
                  {ev.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
