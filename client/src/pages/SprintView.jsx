import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { analyticsApi, optimizationApi, PRIORITY_META, sprintApi, STATUS_META, taskApi } from "../api/axios.js";
import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";
import { formatDate, formatPercent, statusToLabel } from "../utils/formatters.js";

const columnOrder = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

function SprintView() {
  const { sprintId } = useParams();

  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    storyPoints: 3,
    risk: 0.2,
  });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "", visible: false });
  const alertTimeoutRef = useRef(null);
  const [draggedTask, setDraggedTask] = useState(null);

  const handleDragStart = (event, task) => {
    setDraggedTask(task);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (event, newStatus) => {
    event.preventDefault();
    if (!draggedTask || draggedTask.status === newStatus) {
      return;
    }

    const taskId = draggedTask.id;
    setDraggedTask(null);

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)),
    );

    try {
      await taskApi.updateTaskStatus(taskId, newStatus);
    } catch {
      setTasks(previousTasks);
      showAlert("Failed to update task status. Please try again.", "error");
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ message, type, visible: true });
    if (alertTimeoutRef.current) {
      window.clearTimeout(alertTimeoutRef.current);
    }
    alertTimeoutRef.current = window.setTimeout(() => {
      setAlert((prev) => ({ ...prev, visible: false }));
      alertTimeoutRef.current = null;
    }, 3000);
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
    if (alertTimeoutRef.current) {
      window.clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }
  };

  const loadSprint = useCallback(async () => {
    const [sprintData, sprintTasks, analyticsData, optimizationData] = await Promise.all([
      sprintApi.getSprintById(sprintId),
      taskApi.getSprintTasks(sprintId),
      analyticsApi.getSprintAnalytics(sprintId),
      optimizationApi.optimizeSprint(sprintId),
    ]);

    setSprint(sprintData);
    setTasks(sprintTasks);
    setAnalytics(analyticsData);
    setOptimization(optimizationData);
    if (sprintData?.id) {
      localStorage.setItem("beacon:lastSprintId", sprintData.id);
    }
    if (sprintData?.projectId) {
      localStorage.setItem("beacon:lastProjectId", sprintData.projectId);
    }
  }, [sprintId]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        await loadSprint();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [loadSprint]);

  const groupedTasks = useMemo(() => {
    return columnOrder.reduce((accumulator, status) => {
      return {
        ...accumulator,
        [status]: tasks.filter((task) => task.status === status),
      };
    }, {});
  }, [tasks]);

  const handleTaskFormChange = (event) => {
    const { name, value } = event.target;
    setTaskForm((previous) => ({
      ...previous,
      [name]: name === "storyPoints" || name === "risk" ? Number(value) : value,
    }));
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    if (!sprint) {
      return;
    }

    setSaving(true);
    try {
      await taskApi.createTask({
        ...taskForm,
        projectId: sprint.projectId,
        sprintId: sprint.id,
        status: "TODO",
        risk: {
          score: taskForm.risk,
          level: taskForm.risk >= 0.6 ? "HIGH" : taskForm.risk >= 0.3 ? "MEDIUM" : "LOW",
        },
      });
      setTaskForm({
        title: "",
        description: "",
        priority: "MEDIUM",
        storyPoints: 3,
        risk: 0.2,
      });
      setShowTaskForm(false);
      await loadSprint();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Card title="Loading sprint view" interactive={false}>
          <p className="text-muted">Analyzing sprint telemetry...</p>
        </Card>
      </div>
    );
  }

  if (!sprint || !analytics) {
    return (
      <div className="page">
        <Card title="Sprint unavailable" interactive={false}>
          <p className="form-error">The requested sprint data could not be loaded.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      {alert.visible ? (
        <div className={`project-alert project-alert-${alert.type}`} role="status">
          <span>{alert.message}</span>
          <button type="button" onClick={hideAlert} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      ) : null}
      <div className="page-header">
        <div>
          <p className="eyebrow">Sprint Execution</p>
          <h1 className="page-title">{sprint.name}</h1>
          <p className="page-subtitle">{sprint.goal}</p>
        </div>
        <div className="page-actions">
          <Button type="button" variant="primary" size="sm" onClick={() => setShowTaskForm((value) => !value)}>
            {showTaskForm ? "Close Task Form" : "Add Sprint Task"}
          </Button>
          <Button as={Link} to={`/projects/${sprint.projectId}`} variant="ghost" size="sm">
            Open Project
          </Button>
        </div>
      </div>

      {showTaskForm ? (
        <Card title="Add Task To Sprint" subtitle="New tasks instantly affect sprint health and velocity." interactive={false}>
          <form className="entity-form" onSubmit={handleCreateTask}>
            <label htmlFor="sprint-task-title">Title</label>
            <input
              id="sprint-task-title"
              className="filter-input"
              name="title"
              value={taskForm.title}
              onChange={handleTaskFormChange}
              required
            />

            <label htmlFor="sprint-task-description">Description</label>
            <input
              id="sprint-task-description"
              className="filter-input"
              name="description"
              value={taskForm.description}
              onChange={handleTaskFormChange}
            />

            <div className="form-grid">
              <div>
                <label htmlFor="sprint-task-priority">Priority</label>
                <select
                  id="sprint-task-priority"
                  className="filter-select"
                  name="priority"
                  value={taskForm.priority}
                  onChange={handleTaskFormChange}
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label htmlFor="sprint-task-points">Story Points</label>
                <input
                  id="sprint-task-points"
                  className="filter-input"
                  type="number"
                  min="0"
                  name="storyPoints"
                  value={taskForm.storyPoints}
                  onChange={handleTaskFormChange}
                />
              </div>
              <div>
                <label htmlFor="sprint-task-risk">Risk (0 to 1)</label>
                <input
                  id="sprint-task-risk"
                  className="filter-input"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  name="risk"
                  value={taskForm.risk}
                  onChange={handleTaskFormChange}
                />
              </div>
            </div>

            <div className="project-actions">
              <Button type="submit" variant="primary" size="sm" loading={saving}>
                Add Task
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <section className="kpi-grid">
        <Card className="kpi-card" interactive={false}>
          <p className="kpi-label">Status</p>
          <p className="kpi-value">
            <span className={`badge ${STATUS_META[sprint.status]?.className}`}>{sprint.status}</span>
          </p>
        </Card>
        <Card className="kpi-card" interactive={false}>
          <p className="kpi-label">Velocity</p>
          <p className="kpi-value">{analytics.velocity.toFixed(1)}</p>
        </Card>
        <Card className="kpi-card" interactive={false}>
          <p className="kpi-label">Health Score</p>
          <p className="kpi-value">{Math.round(analytics.healthScore)} / 100</p>
        </Card>
        <Card className="kpi-card" interactive={false}>
          <p className="kpi-label">Risk Score</p>
          <p className="kpi-value">{formatPercent(analytics.riskScore)}</p>
        </Card>
      </section>

      <section className="panel-grid">
        <Card title="Sprint Metrics" subtitle={`${formatDate(sprint.startDate)} - ${formatDate(sprint.endDate)}`}>
          <div className="progress-list">
            <div className="progress-item">
              <p>Completion Rate</p>
              <strong>{formatPercent(analytics.completionRate)}</strong>
              <div className="progress-track">
                <span className="progress-fill progress-fill-primary" style={{ width: formatPercent(analytics.completionRate) }} />
              </div>
            </div>
            <div className="progress-item">
              <p>Capacity Utilization</p>
              <strong>{formatPercent(analytics.capacityUtilization)}</strong>
              <div className="progress-track">
                <span className="progress-fill progress-fill-warm" style={{ width: formatPercent(analytics.capacityUtilization) }} />
              </div>
            </div>
            <div className="progress-item">
              <p>Committed / Completed</p>
              <strong>
                {analytics.committedStoryPoints} / {analytics.completedStoryPoints} points
              </strong>
            </div>
          </div>
        </Card>

        <Card title="Optimization Outcome" subtitle="Current sprint recommendation footprint">
          <div className="chip-row">
            <span className="chip">{optimization.recommendedTasks.length} recommended tasks</span>
            <span className="chip">{Math.round(optimization.predictedSuccessProbability)}% success probability</span>
            <span className="chip">{optimization.totalStoryPoints} total points</span>
          </div>
          <div className="task-stack">
            {optimization.recommendedTasks.map((task) => (
              <div key={task.id} className="task-stack-item">
                <div>
                  <p>{task.title}</p>
                  <span>{task.storyPoints} points</span>
                </div>
                <span className={`badge ${PRIORITY_META[task.priority]?.className}`}>{task.priority}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card title="Sprint Board" subtitle="Task flow across delivery states">
        <div className="kanban">
          {columnOrder.map((status) => (
            <section
              key={status}
              className={`kanban-column kanban-column-${status.toLowerCase()}`}
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, status)}
            >
              <header>
                <h4>{statusToLabel(status)}</h4>
                <span>{groupedTasks[status]?.length ?? 0}</span>
              </header>
              <div className="kanban-list">
                {groupedTasks[status]?.map((task) => (
                  <article
                    key={task.id}
                    className={`kanban-card kanban-card-${status.toLowerCase()}`}
                    draggable
                    onDragStart={(event) => handleDragStart(event, task)}
                  >
                    <p>{task.title}</p>
                    <span>{task.storyPoints} pts</span>
                    <div className="kanban-tags">
                      <span className={`badge ${PRIORITY_META[task.priority]?.className}`}>{task.priority}</span>
                      <span className="badge status-muted">Risk {(task.risk?.score ?? 0).toFixed(2)}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default SprintView;
