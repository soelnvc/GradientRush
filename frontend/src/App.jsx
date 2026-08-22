import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sources from "./pages/Sources";
import SourceDetail from "./pages/SourceDetail";
import Query from "./pages/Query";
import Compare from "./pages/Compare";

function Nav() {
  const location = useLocation();
  // Don't show nav in SourceDetail to maximize immersion
  if (location.pathname.startsWith('/sources/') && location.pathname !== '/sources') return null;

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#ffffff" : "#86868b",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: isActive ? "500" : "400",
    letterSpacing: "0.02em",
    transition: "color 0.2s ease, opacity 0.2s ease",
    opacity: isActive ? 1 : 0.8,
  });

  return (
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
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "48px",
          height: "48px",
          padding: "0 24px",
        }}
      >
        <NavLink to="/" end style={linkStyle}>Overview</NavLink>
        <NavLink to="/sources" end style={linkStyle}>Library</NavLink>
        <NavLink to="/query" style={linkStyle}>Search</NavLink>
        <NavLink to="/compare" style={linkStyle}>Benchmark</NavLink>
      </nav>
    </header>
  );
}

export default function App() {
  return (
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
  );
}
