const API_BASE = "";

export async function listProjects() {
  const res = await fetch(`${API_BASE}/api/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function createProject(data) {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create project");
  }
  return res.json();
}

export async function deleteProject(id) {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete project");
  return true;
}

export async function uploadFile(file, projectId = null) {
  const formData = new FormData();
  formData.append("file", file);
  if (projectId) {
    formData.append("project_id", projectId);
  }
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

export async function listSources(projectId = null) {
  const url = projectId
    ? `${API_BASE}/api/sources?project_id=${projectId}`
    : `${API_BASE}/api/sources`;
  const res = await fetch(url);
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

export async function queryKnowledge(question, textOnlyBaseline = false, projectId = null) {
  const payload = {
    question,
    text_only_baseline: textOnlyBaseline,
  };
  if (projectId) {
    payload.project_id = projectId;
  }
  const res = await fetch(`${API_BASE}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
