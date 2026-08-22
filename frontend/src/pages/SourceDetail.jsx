import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getSource, processSource } from "../api/client";

export default function SourceDetail() {
  const { id } = useParams();
  const [source, setSource] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSource = async () => {
    try {
      const data = await getSource(id);
      setSource(data);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchSource();
  }, [id]);

  const handleProcess = async () => {
    setProcessing(true);
    setError(null);
    try {
      await processSource(id);
      await fetchSource();
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!source) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/" style={{ color: "#60a5fa" }}>← Back to Dashboard</Link>
      <h1 style={{ marginTop: 16 }}>
        {source.filename}
      </h1>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <span style={{
          padding: "4px 12px",
          background: "#1a1a2e",
          borderRadius: 4,
          fontSize: 14,
        }}>
          {source.source_type}
        </span>
        <span style={{
          padding: "4px 12px",
          background: source.status === "completed" ? "#064e3b" : "#1a1a2e",
          borderRadius: 4,
          fontSize: 14,
          color: source.status === "completed" ? "#22c55e" :
                 source.status === "failed" ? "#ef4444" : "#888",
        }}>
          {source.status}
        </span>
        {source.evidence_count > 0 && (
          <span style={{
            padding: "4px 12px",
            background: "#1e1b4b",
            borderRadius: 4,
            fontSize: 14,
          }}>
            {source.evidence_count} evidence objects
          </span>
        )}
      </div>

      {source.status === "uploaded" && (
        <button
          onClick={handleProcess}
          disabled={processing}
          style={{
            padding: "10px 24px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: processing ? "not-allowed" : "pointer",
            opacity: processing ? 0.6 : 1,
          }}
        >
          {processing ? "Processing..." : "⚡ Process Source"}
        </button>
      )}

      {error && (
        <div style={{ color: "#ef4444", marginTop: 16 }}>
          ⚠ {error}
        </div>
      )}

      {source.error_message && (
        <div style={{ color: "#ef4444", marginTop: 16 }}>
          Error: {source.error_message}
        </div>
      )}
    </div>
  );
}
