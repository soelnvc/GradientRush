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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ padding: "16px 24px", background: "#0f172a", borderBottom: "1px solid #1e293b" }}>
        <Link to="/sources" style={{ color: "#60a5fa", textDecoration: "none" }}>← Back to Sources</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>{source.filename}</h1>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ padding: "4px 12px", background: "#1e293b", borderRadius: 4, fontSize: 14 }}>
              {source.source_type}
            </span>
            <span style={{
              padding: "4px 12px",
              background: source.status === "completed" ? "#064e3b" : "#1e293b",
              borderRadius: 4,
              fontSize: 14,
              color: source.status === "completed" ? "#34d399" : "#94a3b8",
            }}>
              {source.status}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left pane: Viewer */}
        <div style={{ flex: 2, background: "#000", display: "flex", flexDirection: "column", borderRight: "1px solid #1e293b" }}>
          {source.status === "uploaded" ? (
            <div style={{ margin: "auto", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", marginBottom: 16 }}>File uploaded but not processed.</p>
              <button
                onClick={handleProcess}
                disabled={processing}
                style={{
                  padding: "10px 24px", background: "#2563eb", color: "#fff", border: "none",
                  borderRadius: 6, fontWeight: 600, cursor: processing ? "not-allowed" : "pointer",
                  opacity: processing ? 0.6 : 1,
                }}
              >
                {processing ? "Processing..." : "⚡ Extract Evidence"}
              </button>
              {error && <p style={{ color: "#ef4444", marginTop: 16 }}>{error}</p>}
            </div>
          ) : source.source_type === "video" || source.source_type === "audio" ? (
            <video 
              ref={videoRef}
              src={fileUrl} 
              controls 
              style={{ width: "100%", height: "100%", objectFit: "contain" }} 
            />
          ) : source.source_type === "pdf" ? (
            <object 
              data={`${fileUrl}${location.search.includes('page=') ? '#page=' + new URLSearchParams(location.search).get('page') : ''}`} 
              type="application/pdf" 
              style={{ width: "100%", height: "100%" }}
            >
              <p>PDF cannot be displayed. <a href={fileUrl}>Download it</a></p>
            </object>
          ) : source.source_type === "image" ? (
            <img src={fileUrl} alt={source.filename} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <div style={{ margin: "auto" }}>Preview not available for this file type.</div>
          )}
        </div>

        {/* Right pane: Evidence Timeline */}
        <div style={{ flex: 1, background: "#0f172a", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e293b", background: "#1e293b" }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Extracted Evidence ({evidence.length})</h2>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {evidence.length === 0 && source.status === "completed" && (
              <p style={{ color: "#64748b" }}>No evidence extracted.</p>
            )}
            {evidence.map((ev) => (
              <div 
                key={ev.id} 
                style={{
                  background: "#1e293b", padding: 16, borderRadius: 8,
                  borderLeft: `4px solid ${ev.modality === 'speech' ? '#3b82f6' : ev.modality === 'frame' ? '#8b5cf6' : '#10b981'}`,
                  cursor: (ev.start_time !== null && videoRef.current) ? "pointer" : "default",
                  transition: "background 0.2s"
                }}
                onClick={() => handleSeek(ev.start_time)}
                onMouseEnter={(e) => { if (ev.start_time !== null) e.currentTarget.style.background = "#334155" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#1e293b" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
                    {ev.modality}
                  </span>
                  <span style={{ fontSize: 12, color: "#38bdf8" }}>
                    {ev.start_time !== null && `⏱ ${ev.start_time.toFixed(1)}s`}
                    {ev.page_number !== null && `📑 Pg ${ev.page_number}`}
                  </span>
                </div>
                
                {ev.frame_path && (
                  <img src={`${API_BASE}/${ev.frame_path}`} alt="Frame" style={{ width: "100%", borderRadius: 4, marginBottom: 8 }} />
                )}
                
                <p style={{ fontSize: 14, color: "#e2e8f0", margin: 0, lineHeight: 1.5 }}>
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
