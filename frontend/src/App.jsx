import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sources from "./pages/Sources";
import SourceDetail from "./pages/SourceDetail";
import Query from "./pages/Query";

function Nav() {
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
      <NavLink to="/" end style={linkStyle}>
        Dashboard
      </NavLink>
      <NavLink to="/sources" style={linkStyle}>
        Sources
      </NavLink>
      <NavLink to="/query" style={linkStyle}>
        Query
      </NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          maxWidth: 960,
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}
