import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sources from "./pages/Sources";
import SourceDetail from "./pages/SourceDetail";
import Query from "./pages/Query";
import Compare from "./pages/Compare";

function Nav() {
  const location = useLocation();
  // Don't show nav in SourceDetail to maximize screen space
  if (location.pathname.startsWith('/sources/') && location.pathname !== '/sources') return null;

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#60a5fa" : "#888",
    textDecoration: "none",
    fontWeight: isActive ? 600 : 400,
  });

  return (
    <nav
      style={{
        display: "flex",
        gap: 24,
        padding: "16px 0",
        borderBottom: "1px solid #222",
        marginBottom: 24,
      }}
    >
      <NavLink to="/" end style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/sources" end style={linkStyle}>Sources</NavLink>
      <NavLink to="/query" style={linkStyle}>Query</NavLink>
      <NavLink to="/compare" style={linkStyle}>Evaluate Baseline</NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: "0 24px",
          minHeight: "100vh",
        }}
      >
        <Nav />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/sources/:id" element={<SourceDetail />} />
          <Route path="/query" element={<Query />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
