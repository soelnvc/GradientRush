import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { ProjectProvider, useProject } from "./context/ProjectContext";
import Dashboard from "./pages/Dashboard";
import Sources from "./pages/Sources";
import SourceDetail from "./pages/SourceDetail";
import Query from "./pages/Query";
import Compare from "./pages/Compare";

function Nav() {
  const location = useLocation();
  const { projects, currentProject, switchProject, createProject } = useProject();
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Don't show nav in SourceDetail to maximize immersion
  if (location.pathname.startsWith("/sources/") && location.pathname !== "/sources") return null;

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#ffffff" : "#86868b",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: isActive ? "500" : "400",
    letterSpacing: "0.02em",
    transition: "color 0.2s ease, opacity 0.2s ease",
    opacity: isActive ? 1 : 0.8,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim() || creating) return;
    try {
      setCreating(true);
      await createProject(newProjectName.trim(), newProjectDesc.trim());
      setNewProjectName("");
      setNewProjectDesc("");
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          background: "rgba(0, 0, 0, 0.75)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "48px",
            padding: "0 32px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {/* Left: Project Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#6e6e73", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Workspace
            </span>
            <select
              value={currentProject?.id || ""}
              onChange={(e) => switchProject(e.target.value)}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                color: "#f5f5f7",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "12px",
                fontWeight: "500",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} style={{ background: "#111", color: "#fff" }}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Center: Main Navigation */}
          <nav
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "40px",
            }}
          >
            <NavLink to="/" end style={linkStyle}>Overview</NavLink>
            <NavLink to="/sources" end style={linkStyle}>Library</NavLink>
            <NavLink to="/query" style={linkStyle}>Search</NavLink>
            <NavLink to="/compare" style={linkStyle}>Benchmark</NavLink>
          </nav>

          {/* Right: + New Workspace Button */}
          <div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#f5f5f7",
                padding: "4px 12px",
                borderRadius: "980px",
                fontSize: "11px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              }}
            >
              + New Workspace
            </button>
          </div>
        </div>
      </header>

      {/* New Project Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#111113",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "18px",
              padding: "32px",
              maxWidth: "440px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#f5f5f7", marginTop: 0, marginBottom: "8px" }}>
              Create New Workspace
            </h2>
            <p style={{ fontSize: "13px", color: "#86868b", marginBottom: "24px", lineHeight: "1.4" }}>
              Projects provide isolated contexts for specific domains, preventing irrelevant document interference.
            </p>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#86868b", marginBottom: "6px", textTransform: "uppercase" }}>
                  Workspace Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Consensus Research"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#f5f5f7",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#86868b", marginBottom: "6px", textTransform: "uppercase" }}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Videos and whitepapers on Paxos and Raft"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#f5f5f7",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#86868b",
                    padding: "8px 16px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim() || creating}
                  style={{
                    background: "#ffffff",
                    color: "#000000",
                    border: "none",
                    borderRadius: "980px",
                    padding: "8px 20px",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: newProjectName.trim() && !creating ? "pointer" : "not-allowed",
                    opacity: newProjectName.trim() && !creating ? 1 : 0.5,
                  }}
                >
                  {creating ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#000000" }}>
          <Nav />
          <main
            style={{
              flex: 1,
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "48px 32px 80px 32px",
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/sources/:id" element={<SourceDetail />} />
              <Route path="/query" element={<Query />} />
              <Route path="/compare" element={<Compare />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ProjectProvider>
  );
}
