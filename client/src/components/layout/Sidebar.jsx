import { Link, useLocation } from "react-router-dom";

const getQuickLinks = () => ({
  sprintId: localStorage.getItem("beacon:lastSprintId") ?? "s-001",
});

function Sidebar() {
  const quickLinks = getQuickLinks();
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Dashboard", icon: "D" },
    { to: "/projects", label: "Projects", icon: "P" },
    { to: "/backlog", label: "Backlog", icon: "B" },
    { to: `/sprints/${quickLinks.sprintId}`, label: "Sprint View", icon: "S" },
  ];

  const isItemActive = (item) => {
    const path = location.pathname;
    if (item.to === "/") {
      return path === "/";
    }
    if (item.to === "/projects") {
      return (path === "/projects" || /^\/projects\/[^/]+$/.test(path)) && !path.endsWith("/backlog");
    }
    if (item.to === "/backlog") {
      return path === "/backlog" || path.endsWith("/backlog");
    }
    if (item.to.startsWith("/sprints/")) {
      return path.startsWith("/sprints/");
    }
    return path === item.to;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-orb" />
        <div>
          <h1>Beacon</h1>
          <p>Agile Intelligence Hub</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-item ${isItemActive(item) ? "active-manual" : ""}`}
            aria-current={isItemActive(item) ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom-slot">
        <div className="sidebar-footer">
          <p>Optimization Engine</p>
          <strong>Realtime Insight Mode</strong>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
