import { NavLink } from "react-router-dom";

const getQuickLinks = () => ({
  projectId: localStorage.getItem("beacon:lastProjectId") ?? "p-001",
  sprintId: localStorage.getItem("beacon:lastSprintId") ?? "s-001",
});

function Sidebar() {
  const quickLinks = getQuickLinks();

  const navItems = [
    { to: "/", label: "Dashboard", icon: "D" },
    { to: "/projects", label: "Projects", icon: "P" },
    { to: `/projects/${quickLinks.projectId}/backlog`, label: "Backlog", icon: "B" },
    { to: `/sprints/${quickLinks.sprintId}`, label: "Sprint View", icon: "S" },
  ];

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
          <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-item">
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Optimization Engine</p>
        <strong>Realtime Insight Mode</strong>
      </div>
    </aside>
  );
}

export default Sidebar;
