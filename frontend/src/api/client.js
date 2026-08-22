const API_BASE = "";

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/sources/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function listSources() {
  const res = await fetch(`${API_BASE}/api/sources`);
  if (!res.ok) throw new Error("Failed to fetch sources");
  return res.json();
}

export async function getSource(id) {
  const res = await fetch(`${API_BASE}/api/sources/${id}`);
  if (!res.ok) throw new Error("Failed to fetch source");
  return res.json();
}

export async function processSource(id) {
  const res = await fetch(`${API_BASE}/api/sources/${id}/process`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Processing failed");
  }
  return res.json();
}

export async function queryKnowledge(question, textOnlyBaseline = false) {
  const res = await fetch(`${API_BASE}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, text_only_baseline: textOnlyBaseline }),
  });
  if (!res.ok) throw new Error("Query failed");
  return res.json();
}

export async function getSourceEvidence(id) {
  const res = await fetch(`${API_BASE}/api/sources/${id}/evidence`);
  if (!res.ok) throw new Error("Failed to fetch evidence");
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
