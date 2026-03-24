import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { optimizationApi, PRIORITY_META, projectApi, taskApi } from "../api/axios.js";
import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";

const sortByOptions = [
  { value: "priority", label: "Priority" },
  { value: "storyPoints", label: "Story points" },
  { value: "risk", label: "Risk score" },
];

function Backlog() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [optimization, setOptimization] = useState(null);
  const [sortBy, setSortBy] = useState("priority");
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    storyPoints: 3,
    risk: 0.2,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadBacklog = useCallback(async () => {
    const [projectData, taskData] = await Promise.all([
      projectApi.getProjectById(projectId),
      taskApi.getBacklogByProject(projectId),
    ]);

    if (!projectData) {
      return;
    }

    const activeSprint = projectData.sprints?.find((sprint) => sprint.status === "ACTIVE");
    const optimizationData = activeSprint ? await optimizationApi.optimizeSprint(activeSprint.id) : null;

    setProject(projectData);
    setTasks(taskData);
    setOptimization(optimizationData);
    localStorage.setItem("beacon:lastProjectId", projectData.id);
    if (activeSprint?.id) {
      localStorage.setItem("beacon:lastSprintId", activeSprint.id);
    }
  }, [projectId]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        await loadBacklog();
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
  }, [loadBacklog]);

  const sortedTasks = useMemo(() => {
    const next = [...tasks];

    if (sortBy === "priority") {
      next.sort((left, right) => {
        const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (order[right.priority] ?? 0) - (order[left.priority] ?? 0);
      });
      return next;
    }

    if (sortBy === "storyPoints") {
      next.sort((left, right) => right.storyPoints - left.storyPoints);
      return next;
    }

    next.sort((left, right) => (right.risk?.score ?? 0) - (left.risk?.score ?? 0));
    return next;
  }, [sortBy, tasks]);

  const openCreateTaskForm = () => {
    setShowTaskForm(true);
    setEditingTaskId(null);
    setTaskForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      storyPoints: 3,
      risk: 0.2,
    });
    setError("");
  };

  const openEditTaskForm = (task) => {
    setShowTaskForm(true);
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority ?? "MEDIUM",
      storyPoints: task.storyPoints ?? 0,
      risk: task.risk?.score ?? 0.2,
    });
    setError("");
  };

  const handleTaskFormChange = (event) => {
    const { name, value } = event.target;
    setTaskForm((previous) => ({
      ...previous,
      [name]: name === "storyPoints" || name === "risk" ? Number(value) : value,
    }));
  };

  const handleSubmitTask = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...taskForm,
        projectId,
        risk: {
          score: taskForm.risk,
          level: taskForm.risk >= 0.6 ? "HIGH" : taskForm.risk >= 0.3 ? "MEDIUM" : "LOW",
        },
      };

      if (editingTaskId) {
        await taskApi.updateTask(editingTaskId, payload);
      } else {
        await taskApi.createTask(payload);
      }
      await loadBacklog();
      setShowTaskForm(false);
      setEditingTaskId(null);
    } catch {
      setError("Task update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendToSprint = async (taskId, sprintId) => {
    await taskApi.updateTask(taskId, { sprintId, status: "TODO" });
    await loadBacklog();
  };

  const handleDeleteTask = async (taskId) => {
    const shouldDelete = window.confirm("Delete this backlog task?");
    if (!shouldDelete) {
      return;
    }
    await taskApi.deleteTask(taskId);
    await loadBacklog();
  };

  if (loading) {
    return (
      <div className="page">
        <Card title="Loading backlog" interactive={false}>
          <p className="text-muted">Preparing optimization candidates...</p>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page">
        <Card title="Backlog unavailable" interactive={false}>
          <p className="form-error">The project backlog could not be loaded.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Backlog Prioritization</p>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-subtitle">Score and sequence stories for smarter sprint commitments.</p>
        </div>
        <div className="page-actions">
          <Button type="button" variant="primary" size="sm" onClick={openCreateTaskForm}>
            Add Backlog Task
          </Button>
          <Button as={Link} to={`/projects/${project.id}`} variant="ghost" size="sm">
            Project Details
          </Button>
        </div>
      </div>

      {showTaskForm ? (
        <Card title={editingTaskId ? "Edit Backlog Task" : "Create Backlog Task"} interactive={false}>
          <form className="entity-form" onSubmit={handleSubmitTask}>
            <label htmlFor="backlog-title">Title</label>
            <input
              id="backlog-title"
              className="filter-input"
              name="title"
              value={taskForm.title}
              onChange={handleTaskFormChange}
              required
            />

            <label htmlFor="backlog-description">Description</label>
            <input
              id="backlog-description"
              className="filter-input"
              name="description"
              value={taskForm.description}
              onChange={handleTaskFormChange}
            />

            <div className="form-grid">
              <div>
                <label htmlFor="backlog-priority">Priority</label>
                <select
                  id="backlog-priority"
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
                <label htmlFor="backlog-storyPoints">Story Points</label>
                <input
                  id="backlog-storyPoints"
                  className="filter-input"
                  type="number"
                  min="0"
                  name="storyPoints"
                  value={taskForm.storyPoints}
                  onChange={handleTaskFormChange}
                />
              </div>
              <div>
                <label htmlFor="backlog-risk">Risk (0 to 1)</label>
                <input
                  id="backlog-risk"
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
                {editingTaskId ? "Save Task" : "Create Task"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTaskForm(false);
                  setEditingTaskId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {optimization ? (
        <Card title="AI Optimization Summary" subtitle="Recommended tasks for next sprint boundary">
          <div className="chip-row">
            <span className="chip">Predicted success {Math.round(optimization.predictedSuccessProbability)}%</span>
            <span className="chip">Capacity utilization {Math.round(optimization.capacityUtilization * 100)}%</span>
            <span className="chip">Total points {optimization.totalStoryPoints}</span>
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
      ) : null}

      <Card
        title="Backlog Stories"
        subtitle={`${sortedTasks.length} pending tasks`}
        actions={
          <select className="filter-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {sortByOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>
        }
      >
        <div className="backlog-list">
          {sortedTasks.map((task) => (
            <article key={task.id} className="backlog-row">
              <div>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
              </div>
              <div className="backlog-row-meta">
                <span>{task.storyPoints} pts</span>
                <span>Risk {(task.risk?.score ?? 0).toFixed(2)}</span>
                <span className={`badge ${PRIORITY_META[task.priority]?.className}`}>{task.priority}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => openEditTaskForm(task)}>
                  Edit
                </Button>
                {project.sprints?.length ? (
                  <select
                    className="filter-select"
                    defaultValue=""
                    onChange={(event) => {
                      if (event.target.value) {
                        handleSendToSprint(task.id, event.target.value);
                      }
                    }}
                  >
                    <option value="" disabled>
                      Move to sprint
                    </option>
                    {project.sprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </option>
                    ))}
                  </select>
                ) : null}
                <Button type="button" variant="danger" size="sm" onClick={() => handleDeleteTask(task.id)}>
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Card>

      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

export default Backlog;
