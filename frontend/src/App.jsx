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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#workspace-switcher-container")) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

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
      setDropdownOpen(false);
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
          {/* Left: GR Logo with 360-degree rotation on hover */}
          <NavLink
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)",
                color: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "13px",
                letterSpacing: "-0.04em",
                boxShadow: "0 2px 8px rgba(255, 255, 255, 0.15)",
                transition: "transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)",
                cursor: "pointer",
                userSelect: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "rotate(360deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "rotate(0deg)";
              }}
            >
              GR
            </div>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "-0.02em",
                color: "#f5f5f7",
              }}
            >
              GradientRush
            </span>
          </NavLink>

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

          {/* Right: Only 1 Single Premium Apple-Style Workspace Switcher Button */}
          <div id="workspace-switcher-container" style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#f5f5f7",
                padding: "6px 14px",
                borderRadius: "980px",
                fontSize: "12px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.09)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.22)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)",
                }}
              />
              <span style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentProject?.name || "Select Workspace"}
              </span>
              <span style={{ fontSize: "9px", opacity: 0.6, transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                ▼
              </span>
            </button>

            {/* Expanded Apple-Style Popover Menu */}
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "280px",
                  background: "rgba(18, 18, 20, 0.95)",
                  backdropFilter: "saturate(180%) blur(24px)",
                  WebkitBackdropFilter: "saturate(180%) blur(24px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "14px",
                  padding: "6px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {/* 1. TOP OPTION: + New Project */}
                <div
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowModal(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: "rgba(255, 255, 255, 0.05)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: "#ffffff",
                      color: "#000000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    +
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#f5f5f7" }}>
                      New Workspace
                    </div>
                    <div style={{ fontSize: "11px", color: "#86868b" }}>
                      Create isolated project space
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "4px 6px" }} />

                {/* Section Header */}
                <div style={{ padding: "4px 10px", fontSize: "10px", fontWeight: "600", color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Workspaces ({projects.length})
                </div>

                {/* List of Workspaces */}
                <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {projects.map((p) => {
                    const isSelected = p.id === currentProject?.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          switchProject(p.id);
                          setDropdownOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          background: isSelected ? "rgba(255, 255, 255, 0.08)" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "13px", fontWeight: isSelected ? "600" : "400", color: isSelected ? "#ffffff" : "#d1d1d6" }}>
                            {p.name}
                          </span>
                          <span style={{ fontSize: "11px", color: "#6e6e73" }}>
                            {p.sources_count || 0} sources
                          </span>
                        </div>
                        {isSelected && (
                          <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: "600" }}>
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
