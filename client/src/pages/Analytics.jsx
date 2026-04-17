import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsApi, projectApi, sprintApi, STATUS_META } from "../api/axios.js";
import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";
import { formatDate, formatPercent } from "../utils/formatters.js";

const HEALTH_WARNING_THRESHOLD = 60;
const RISK_WARNING_THRESHOLD = 0.35;

const getToneClass = (value, warmThreshold, riskThreshold, inverse = false) => {
  if (inverse) {
    if (value <= riskThreshold) {
      return "analytics-tone-good";
    }
    if (value <= warmThreshold) {
      return "analytics-tone-warm";
    }
    return "analytics-tone-risk";
  }

  if (value >= riskThreshold) {
    return "analytics-tone-risk";
  }
  if (value >= warmThreshold) {
    return "analytics-tone-warm";
  }
  return "analytics-tone-good";
};

function Analytics() {
  const [overview, setOverview] = useState(null);
  const [projectAnalytics, setProjectAnalytics] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      try {
        const dashboard = await analyticsApi.getDashboardOverview();
        const projects = await projectApi.getProjects();
        const analyticsByProject = await Promise.all(
          projects.map(async (project) => ({
            project,
            analytics: await analyticsApi.getProjectAnalytics(project.id),
          })),
        );
        const sprintRows = await Promise.all(
          projects.flatMap((project) =>
            (project.activeSprintId ? [project.activeSprintId] : []).map(async (sprintId) => ({
              sprint: await sprintApi.getSprintById(sprintId),
              analytics: await analyticsApi.getSprintAnalytics(sprintId),
            })),
          ),
        );

        if (!active) {
          return;
        }

        setOverview(dashboard);
        setProjectAnalytics(analyticsByProject);
        setSprints(sprintRows.filter((row) => row.sprint && row.analytics));
      } catch {
        if (active) {
          setError("Analytics could not be loaded right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const overloadRows = useMemo(() => overview?.teamLoad ?? [], [overview]);
  const activeSprint = overview?.activeSprint ?? null;

  const rankedProjects = useMemo(() => {
    return projectAnalytics
      .map(({ project, analytics }) => {
        const completionRate = analytics.totalTasks > 0 ? analytics.completedTasks / analytics.totalTasks : 0;
        return {
          id: project.id,
          name: project.name,
          status: project.status,
          description: project.description ?? "",
          averageVelocity: Number(analytics.averageVelocity ?? 0),
          totalSprints: analytics.totalSprints ?? 0,
          blockedTasks: analytics.blockedTasks ?? 0,
          riskIndex: Number(analytics.riskIndex ?? 0),
          healthScore: Number(project.metrics?.healthScore ?? 0),
          completionRate,
        };
      })
      .sort((left, right) => {
        if (right.riskIndex !== left.riskIndex) {
          return right.riskIndex - left.riskIndex;
        }
        return left.healthScore - right.healthScore;
      });
  }, [projectAnalytics]);

  const sprintWatchlist = useMemo(() => {
    return [...sprints]
      .map(({ sprint, analytics }) => ({
        id: sprint.id,
        projectId: sprint.projectId,
        name: sprint.name,
        status: sprint.status,
        goal: sprint.goal ?? "",
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        velocity: Number(analytics.velocity ?? 0),
        healthScore: Number(analytics.healthScore ?? 0),
        completionRate: Number(analytics.completionRate ?? 0),
        capacityUtilization: Number(analytics.capacityUtilization ?? 0),
        riskScore: Number(analytics.riskScore ?? 0),
        committedStoryPoints: analytics.committedStoryPoints ?? 0,
      }))
      .sort((left, right) => {
        if (left.healthScore !== right.healthScore) {
          return left.healthScore - right.healthScore;
        }
        return right.riskScore - left.riskScore;
      });
  }, [sprints]);

  const workloadRows = useMemo(() => {
    return overloadRows
      .map((member) => {
        const utilization = member.capacityPerSprint > 0 ? member.assignedPoints / member.capacityPerSprint : 0;
        return {
          ...member,
          utilization,
          isOverloaded: utilization > 1,
        };
      })
      .sort((left, right) => right.utilization - left.utilization);
  }, [overloadRows]);

  const focusProject = rankedProjects[0] ?? null;
  const spotlightSprint =
    [...sprintWatchlist].sort((left, right) => right.healthScore - left.healthScore)[0] ?? null;
  const overloadedMembers = workloadRows.filter((member) => member.isOverloaded);
  const averageUtilization =
    workloadRows.reduce((sum, member) => sum + member.utilization, 0) / Math.max(workloadRows.length, 1);
  const blockedTasks = rankedProjects.reduce((sum, project) => sum + project.blockedTasks, 0);

  const actionQueue = useMemo(() => {
    const items = [];

    if (focusProject) {
      items.push({
        title:
          focusProject.riskIndex >= RISK_WARNING_THRESHOLD
            ? `Stabilize ${focusProject.name}`
            : `Protect momentum in ${focusProject.name}`,
        description:
          focusProject.riskIndex >= RISK_WARNING_THRESHOLD
            ? `Risk is at ${formatPercent(focusProject.riskIndex)} with ${focusProject.blockedTasks} blocked task(s). Review scope and blockers first.`
            : `Risk is controlled, so this project is a good candidate for focused throughput gains.`,
        to: `/projects/${focusProject.id}`,
        cta: "Open Project",
      });
    }

    if (sprintWatchlist[0]) {
      items.push({
        title:
          sprintWatchlist[0].healthScore < HEALTH_WARNING_THRESHOLD
            ? `Intervene in ${sprintWatchlist[0].name}`
            : `Monitor ${sprintWatchlist[0].name}`,
        description: `Health is ${Math.round(sprintWatchlist[0].healthScore)} / 100 with ${formatPercent(
          sprintWatchlist[0].completionRate,
        )} completion and ${formatPercent(sprintWatchlist[0].capacityUtilization)} utilization.`,
        to: `/sprints/${sprintWatchlist[0].id}`,
        cta: "View Sprint",
      });
    }

    if (overloadedMembers[0]) {
      items.push({
        title: `Rebalance ${overloadedMembers[0].name}`,
        description: `${overloadedMembers[0].assignedPoints} of ${overloadedMembers[0].capacityPerSprint} points are allocated this cycle. Consider moving work into backlog planning.`,
        to: "/backlog",
        cta: "Open Backlog",
      });
    }

    if (items.length === 0) {
      items.push({
        title: "Portfolio is currently balanced",
        description: "No immediate hotspots were detected. Use the analytics panels below to look for incremental optimization opportunities.",
        to: "/projects",
        cta: "Review Projects",
      });
    }

    return items.slice(0, 3);
  }, [focusProject, overloadedMembers, sprintWatchlist]);

  if (loading) {
    return (
      <div className="page">
        <Card title="Loading analytics" interactive={false}>
          <p className="text-muted">Preparing velocity, health, and workload insights...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Card title="Analytics unavailable" interactive={false}>
          <p className="form-error">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Analytics Engine</p>
          <h1 className="page-title">Delivery intelligence</h1>
          <p className="page-subtitle">
            Start with the portfolio pulse, then scan project risk, sprint health, and team capacity.
          </p>
        </div>
        <div className="page-actions">
          <Button as={Link} to="/projects" variant="secondary" size="sm">
            Open Projects
          </Button>
          <Button as={Link} to={activeSprint ? `/sprints/${activeSprint.id}` : "/backlog"} variant="ghost" size="sm">
            {activeSprint ? "Current Sprint" : "Open Backlog"}
          </Button>
        </div>
      </div>

      <section className="analytics-hero-grid">
        <Card className="analytics-hero-card" interactive={false}>
          <div className="analytics-hero-layout">
            <div className="analytics-hero-copy">
              <p className="eyebrow">Portfolio Pulse</p>
              <div className="analytics-spotlight-value">
                {Math.round(overview?.portfolioHealth ?? 0)}
                <span>/100</span>
              </div>
              <p className="analytics-spotlight-note">
                {focusProject
                  ? `${focusProject.name} is the current priority focus with ${formatPercent(
                      focusProject.riskIndex,
                    )} risk and ${focusProject.blockedTasks} blocked task(s).`
                  : "Portfolio health is available, but project-level hotspots have not been computed yet."}
              </p>
              <div className="chip-row">
                <span className="chip">Avg load {formatPercent(averageUtilization)}</span>
                <span className="chip">Blocked tasks {blockedTasks}</span>
                <span className="chip">Active sprints {overview?.activeSprints ?? 0}</span>
              </div>
            </div>

            <div className="analytics-hero-insights">
              <article className="analytics-signal-tile">
                <span className="analytics-signal-label">Focus project</span>
                <strong className="analytics-signal-value">{focusProject?.name ?? "No project data"}</strong>
                <p className="analytics-signal-meta">
                  {focusProject
                    ? `Risk ${formatPercent(focusProject.riskIndex)} | Health ${Math.round(focusProject.healthScore)} / 100`
                    : "Add project activity to generate a focus area."}
                </p>
              </article>

              <article className="analytics-signal-tile">
                <span className="analytics-signal-label">Best sprint signal</span>
                <strong className="analytics-signal-value">{spotlightSprint?.name ?? "No sprint data"}</strong>
                <p className="analytics-signal-meta">
                  {spotlightSprint
                    ? `Health ${Math.round(spotlightSprint.healthScore)} / 100 | Completion ${formatPercent(
                        spotlightSprint.completionRate,
                      )}`
                    : "No active sprint analytics available yet."}
                </p>
              </article>

              <article className="analytics-signal-tile">
                <span className="analytics-signal-label">Capacity pressure</span>
                <strong className="analytics-signal-value">
                  {overloadedMembers.length > 0 ? `${overloadedMembers.length} overloaded` : "Balanced team"}
                </strong>
                <p className="analytics-signal-meta">
                  {overloadedMembers.length > 0
                    ? `${overloadedMembers[0].name} is carrying the heaviest allocation at ${formatPercent(
                        overloadedMembers[0].utilization,
                      )}.`
                    : "No member is currently over their sprint capacity."}
                </p>
              </article>
            </div>
          </div>
        </Card>
      </section>

      <section className="kpi-grid">
        <Card className="analytics-kpi-card" interactive={false}>
          <div className="analytics-kpi-top">
            <p className="kpi-label">Portfolio Health</p>
            <p className="kpi-value">{Math.round(overview?.portfolioHealth ?? 0)} / 100</p>
          </div>
          <p className="analytics-kpi-note">Weighted by sprint health across the active portfolio.</p>
          <div className="progress-track">
            <span className="progress-fill progress-fill-good" style={{ width: `${Math.round(overview?.portfolioHealth ?? 0)}%` }} />
          </div>
        </Card>
        <Card className="analytics-kpi-card" interactive={false}>
          <div className="analytics-kpi-top">
            <p className="kpi-label">Average Velocity</p>
            <p className="kpi-value">{Number(overview?.averageVelocity ?? 0).toFixed(1)} pts/day</p>
          </div>
          <p className="analytics-kpi-note">Delivery tempo based on completed sprint analytics.</p>
          <div className="progress-track">
            <span
              className="progress-fill progress-fill-primary"
              style={{ width: `${Math.min(100, Number(overview?.averageVelocity ?? 0) * 18)}%` }}
            />
          </div>
        </Card>
        <Card className="analytics-kpi-card" interactive={false}>
          <div className="analytics-kpi-top">
            <p className="kpi-label">Active Sprints</p>
            <p className="kpi-value">{overview?.activeSprints ?? 0}</p>
          </div>
          <p className="analytics-kpi-note">
            {activeSprint ? `${activeSprint.name} is currently driving live sprint telemetry.` : "No sprint is active right now."}
          </p>
          <div className="progress-track">
            <span className="progress-fill progress-fill-warm" style={{ width: `${Math.min(100, (overview?.activeSprints ?? 0) * 22)}%` }} />
          </div>
        </Card>
        <Card className="analytics-kpi-card" interactive={false}>
          <div className="analytics-kpi-top">
            <p className="kpi-label">Risk Score</p>
            <p className="kpi-value">{formatPercent(overview?.riskScore ?? 0)}</p>
          </div>
          <p className="analytics-kpi-note">Blocked work ratio for the current sprint context.</p>
          <div className="progress-track">
            <span className="progress-fill progress-fill-risk" style={{ width: formatPercent(overview?.riskScore ?? 0) }} />
          </div>
        </Card>
      </section>

      <section className="analytics-section-header">
        <div>
          <p className="analytics-section-label">Portfolio View</p>
          <h2 className="analytics-section-title">Project and sprint performance</h2>
        </div>
        <p className="analytics-section-note">Use this section to compare delivery health before taking action.</p>
      </section>

      <section className="panel-grid analytics-panel-grid">
        <Card title="Project Radar" subtitle="Risk-first ranking of current initiatives">
          <div className="analytics-ranked-list">
            {rankedProjects.map((project) => (
              <article key={project.id} className="analytics-ranked-item">
                <div className="analytics-ranked-head">
                  <div>
                    <div className="split-line">
                      <strong>{project.name}</strong>
                      <span className={`badge ${STATUS_META[project.status]?.className ?? "status-muted"}`}>{project.status}</span>
                    </div>
                    <p className="analytics-supporting-copy">{project.description || "No project description provided yet."}</p>
                  </div>
                  <Button as={Link} to={`/projects/${project.id}`} variant="ghost" size="sm">
                    Open
                  </Button>
                </div>

                <div className="analytics-metric-strip">
                  <span className="analytics-metric-pill">Velocity {project.averageVelocity.toFixed(1)} pts/day</span>
                  <span className="analytics-metric-pill">Sprints {project.totalSprints}</span>
                  <span className="analytics-metric-pill">Blocked {project.blockedTasks}</span>
                </div>

                <div className="analytics-bar-group">
                  <div className="analytics-bar-row">
                    <span>Delivery completion</span>
                    <strong>{formatPercent(project.completionRate)}</strong>
                  </div>
                  <div className="progress-track">
                    <span className="progress-fill progress-fill-primary" style={{ width: formatPercent(project.completionRate) }} />
                  </div>

                  <div className="analytics-bar-row">
                    <span>Health score</span>
                    <strong className={getToneClass(project.healthScore, 60, 80)}>{Math.round(project.healthScore)} / 100</strong>
                  </div>
                  <div className="progress-track">
                    <span className="progress-fill progress-fill-good" style={{ width: `${Math.round(project.healthScore)}%` }} />
                  </div>

                  <div className="analytics-bar-row">
                    <span>Risk index</span>
                    <strong className={getToneClass(project.riskIndex, 0.2, 0.35)}>{formatPercent(project.riskIndex)}</strong>
                  </div>
                  <div className="progress-track">
                    <span className="progress-fill progress-fill-risk" style={{ width: formatPercent(project.riskIndex) }} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card title="Sprint Watchlist" subtitle="Current health, completion, and capacity pressure">
          {sprintWatchlist.length === 0 ? (
            <p className="text-muted">No active sprint analytics available yet.</p>
          ) : (
            <div className="analytics-ranked-list">
              {sprintWatchlist.map((sprint) => (
                <article key={sprint.id} className="analytics-ranked-item">
                  <div className="analytics-ranked-head">
                    <div>
                      <div className="split-line">
                        <strong>{sprint.name}</strong>
                        <span className={`badge ${STATUS_META[sprint.status]?.className ?? "status-muted"}`}>{sprint.status}</span>
                      </div>
                      <p className="analytics-supporting-copy">
                        {sprint.goal || "No sprint goal added yet."} {formatDate(sprint.startDate)} to {formatDate(sprint.endDate)}
                      </p>
                    </div>
                    <Button as={Link} to={`/sprints/${sprint.id}`} variant="ghost" size="sm">
                      View
                    </Button>
                  </div>

                  <div className="analytics-metric-strip">
                    <span className="analytics-metric-pill">Velocity {sprint.velocity.toFixed(1)} pts/day</span>
                    <span className="analytics-metric-pill">Committed {sprint.committedStoryPoints} pts</span>
                    <span className="analytics-metric-pill">Risk {formatPercent(sprint.riskScore)}</span>
                  </div>

                  <div className="analytics-bar-group">
                    <div className="analytics-bar-row">
                      <span>Health score</span>
                      <strong className={getToneClass(sprint.healthScore, 60, 80)}>{Math.round(sprint.healthScore)} / 100</strong>
                    </div>
                    <div className="progress-track">
                      <span className="progress-fill progress-fill-good" style={{ width: `${Math.round(sprint.healthScore)}%` }} />
                    </div>

                    <div className="analytics-bar-row">
                      <span>Completion</span>
                      <strong>{formatPercent(sprint.completionRate)}</strong>
                    </div>
                    <div className="progress-track">
                      <span className="progress-fill progress-fill-primary" style={{ width: formatPercent(sprint.completionRate) }} />
                    </div>

                    <div className="analytics-bar-row">
                      <span>Capacity utilization</span>
                      <strong className={getToneClass(sprint.capacityUtilization, 0.8, 1, true)}>
                        {formatPercent(sprint.capacityUtilization)}
                      </strong>
                    </div>
                    <div className="progress-track">
                      <span className="progress-fill progress-fill-warm" style={{ width: formatPercent(sprint.capacityUtilization) }} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="analytics-section-header">
        <div>
          <p className="analytics-section-label">Operational View</p>
          <h2 className="analytics-section-title">Next actions and team load</h2>
        </div>
        <p className="analytics-section-note">Read the recommended actions first, then inspect who is carrying the most load.</p>
      </section>

      <section className="panel-grid analytics-panel-grid">
        <Card title="Action Queue" subtitle="Recommended next moves based on current analytics" interactive={false}>
          <div className="analytics-action-list">
            {actionQueue.map((item) => (
              <article key={item.title} className="analytics-action-item">
                <div className="analytics-action-copy">
                  <strong className="analytics-action-title">{item.title}</strong>
                  <p className="analytics-supporting-copy">{item.description}</p>
                </div>
                <Button as={Link} to={item.to} variant="ghost" size="sm">
                  {item.cta}
                </Button>
              </article>
            ))}
          </div>
        </Card>

        <Card title="Capacity Pulse" subtitle="Assigned points vs per-sprint team capacity" interactive={false}>
          <div className="chip-row">
            <span className="chip">Overloaded {overloadedMembers.length}</span>
            <span className="chip">Balanced {Math.max(0, workloadRows.length - overloadedMembers.length)}</span>
            <span className="chip">Average load {formatPercent(averageUtilization)}</span>
          </div>

          <div className="analytics-workload-list">
            {workloadRows.map((member) => (
              <article key={member.userId} className="analytics-workload-row">
                <div className="analytics-workload-meta">
                  <div>
                    <p className="analytics-workload-label">{member.name}</p>
                    <span className="analytics-workload-detail">
                      {member.assignedPoints} / {member.capacityPerSprint} story points
                    </span>
                  </div>
                  <span className={`badge ${member.isOverloaded ? "status-blocked" : "status-completed"}`}>
                    {member.isOverloaded ? "Overloaded" : "Balanced"}
                  </span>
                </div>

                <div className="analytics-workload-track-row">
                  <strong className={member.isOverloaded ? "analytics-tone-risk" : "analytics-tone-good"}>
                    {formatPercent(member.utilization)}
                  </strong>
                  <div className="progress-track">
                    <span
                      className={member.isOverloaded ? "progress-fill progress-fill-risk" : "progress-fill progress-fill-good"}
                      style={{ width: `${Math.min(100, Math.round(member.utilization * 100))}%` }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

export default Analytics;
