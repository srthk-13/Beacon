import axios from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:5050/api";
const REQUEST_TIMEOUT_MS = 6000;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("beacon:auth_token");
  if (token && !token.startsWith("demo-token:")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => JSON.parse(JSON.stringify(value));
const unwrapResponse = (response) => response?.data?.data ?? response?.data ?? null;
const toClientId = (item) => (item ? { ...item, id: item.id ?? item._id } : item);
const toClientCollection = (items) => (Array.isArray(items) ? items.map(toClientId) : []);

const DEMO_USERS = [
  {
    id: "u-001",
    uniqueCode: "BCN-0001",
    name: "Sarthak Tiwari",
    email: "manager@beacon.dev",
    password: "beacon-demo",
    role: "MANAGER",
    capacityPerSprint: 28,
    avatarHue: 189,
  },
  {
    id: "u-002",
    uniqueCode: "BCN-0002",
    name: "Vatsal Agarwal",
    email: "vatsal@beacon.dev",
    password: "beacon-demo",
    role: "DEVELOPER",
    capacityPerSprint: 24,
    avatarHue: 18,
  },
  {
    id: "u-003",
    uniqueCode: "BCN-0003",
    name: "Sparsh Agarwal",
    email: "sparsh@beacon.dev",
    password: "beacon-demo",
    role: "DEVELOPER",
    capacityPerSprint: 22,
    avatarHue: 36,
  },
  {
    id: "u-004",
    uniqueCode: "BCN-0004",
    name: "Rudra Gupta",
    email: "rudra@beacon.dev",
    password: "beacon-demo",
    role: "DEVELOPER",
    capacityPerSprint: 20,
    avatarHue: 212,
  },
  {
    id: "u-005",
    uniqueCode: "BCN-0005",
    name: "Yatender Kumar",
    email: "yatender@beacon.dev",
    password: "beacon-demo",
    role: "QA",
    capacityPerSprint: 18,
    avatarHue: 148,
  },
];

const DEMO_PROJECTS = [
  {
    id: "p-001",
    name: "Beacon Core Intelligence",
    description:
      "Sprint optimization and predictive analytics engine for cross-functional agile teams.",
    status: "ACTIVE",
    startDate: "2026-02-10",
    endDate: "2026-06-30",
    teamMemberIds: ["u-001", "u-002", "u-003", "u-004", "u-005"],
  },
  {
    id: "p-002",
    name: "Sprint Pulse Mobile",
    description: "Companion mobile dashboard for executive-level sprint tracking and alerts.",
    status: "PLANNED",
    startDate: "2026-04-01",
    endDate: "2026-08-20",
    teamMemberIds: ["u-001", "u-002", "u-005"],
  },
  {
    id: "p-003",
    name: "Team Observability Studio",
    description: "Historical trend analysis and anomaly detection for delivery risk forecasting.",
    status: "COMPLETED",
    startDate: "2025-09-15",
    endDate: "2026-01-20",
    teamMemberIds: ["u-003", "u-004", "u-005"],
  },
];

const DEMO_SPRINTS = [
  {
    id: "s-001",
    projectId: "p-001",
    name: "Sprint 12 - Predictive Accuracy",
    goal: "Increase success probability model precision and reduce blocker propagation.",
    status: "ACTIVE",
    startDate: "2026-03-19",
    endDate: "2026-04-02",
    committedStoryPoints: 56,
  },
  {
    id: "s-002",
    projectId: "p-001",
    name: "Sprint 11 - Workload Balance",
    goal: "Tighten workload balancing heuristics and improve team utilization signals.",
    status: "COMPLETED",
    startDate: "2026-03-05",
    endDate: "2026-03-18",
    committedStoryPoints: 52,
  },
  {
    id: "s-003",
    projectId: "p-002",
    name: "Sprint 01 - Mobile Foundations",
    goal: "Establish mobile shell, API sync strategy, and authentication flow.",
    status: "PLANNED",
    startDate: "2026-04-03",
    endDate: "2026-04-16",
    committedStoryPoints: 38,
  },
  {
    id: "s-004",
    projectId: "p-003",
    name: "Sprint 09 - Trend Forecasting",
    goal: "Finalize velocity trend visualization and risk anomaly detection.",
    status: "COMPLETED",
    startDate: "2026-01-05",
    endDate: "2026-01-18",
    committedStoryPoints: 44,
  },
];

const DEMO_TASKS = [
  {
    id: "t-001",
    projectId: "p-001",
    sprintId: "s-001",
    title: "Calibrate probability model weights",
    description: "Tune weighted features for risk, urgency, and completion confidence.",
    assignedTo: "u-002",
    priority: "HIGH",
    storyPoints: 8,
    status: "IN_PROGRESS",
    risk: { score: 0.32, level: "MEDIUM" },
    businessValue: 9,
    riskFactor: 7,
    urgency: 8,
  },
  {
    id: "t-002",
    projectId: "p-001",
    sprintId: "s-001",
    title: "Build sprint health API contract",
    description: "Expose normalized health score response for dashboard rendering.",
    assignedTo: "u-003",
    priority: "HIGH",
    storyPoints: 5,
    status: "DONE",
    risk: { score: 0.11, level: "LOW" },
    businessValue: 8,
    riskFactor: 4,
    urgency: 7,
  },
  {
    id: "t-003",
    projectId: "p-001",
    sprintId: "s-001",
    title: "Refactor overload detector thresholds",
    description: "Support dynamic per-role thresholds for sprint overload warnings.",
    assignedTo: "u-004",
    priority: "MEDIUM",
    storyPoints: 5,
    status: "TODO",
    risk: { score: 0.28, level: "MEDIUM" },
    businessValue: 7,
    riskFactor: 6,
    urgency: 6,
  },
  {
    id: "t-004",
    projectId: "p-001",
    sprintId: "s-001",
    title: "Stabilize optimization endpoint validation",
    description: "Guard against malformed capacity payloads from project settings.",
    assignedTo: "u-005",
    priority: "HIGH",
    storyPoints: 8,
    status: "BLOCKED",
    risk: { score: 0.74, level: "HIGH" },
    businessValue: 8,
    riskFactor: 9,
    urgency: 8,
  },
  {
    id: "t-005",
    projectId: "p-001",
    sprintId: "s-001",
    title: "Create optimization confidence sparkline",
    description: "Visualize confidence over time for manager decision support.",
    assignedTo: "u-003",
    priority: "MEDIUM",
    storyPoints: 3,
    status: "DONE",
    risk: { score: 0.18, level: "LOW" },
    businessValue: 6,
    riskFactor: 3,
    urgency: 5,
  },
  {
    id: "t-006",
    projectId: "p-001",
    sprintId: "s-001",
    title: "Backfill sprint analytics test dataset",
    description: "Generate historical fixtures for model confidence testing.",
    assignedTo: "u-002",
    priority: "LOW",
    storyPoints: 3,
    status: "TODO",
    risk: { score: 0.15, level: "LOW" },
    businessValue: 5,
    riskFactor: 2,
    urgency: 4,
  },
  {
    id: "t-007",
    projectId: "p-001",
    sprintId: "s-002",
    title: "Implement capacity utilization pipeline",
    description: "Aggregate assigned points against team capacity per sprint.",
    assignedTo: "u-004",
    priority: "HIGH",
    storyPoints: 8,
    status: "DONE",
    risk: { score: 0.21, level: "LOW" },
    businessValue: 9,
    riskFactor: 5,
    urgency: 7,
  },
  {
    id: "t-008",
    projectId: "p-001",
    sprintId: "s-002",
    title: "Define dashboard card motion system",
    description: "Introduce subtle 3D feedback for key insight cards.",
    assignedTo: "u-002",
    priority: "MEDIUM",
    storyPoints: 5,
    status: "DONE",
    risk: { score: 0.1, level: "LOW" },
    businessValue: 7,
    riskFactor: 3,
    urgency: 5,
  },
  {
    id: "t-009",
    projectId: "p-001",
    sprintId: null,
    title: "Design risk hotspot heatmap",
    description: "Surface high-volatility stories before sprint commitment.",
    assignedTo: "u-005",
    priority: "HIGH",
    storyPoints: 8,
    status: "TODO",
    risk: { score: 0.58, level: "HIGH" },
    businessValue: 9,
    riskFactor: 8,
    urgency: 7,
  },
  {
    id: "t-010",
    projectId: "p-001",
    sprintId: null,
    title: "Map sprint goals to optimization suggestions",
    description: "Link recommendation cards with stated sprint objective.",
    assignedTo: "u-003",
    priority: "MEDIUM",
    storyPoints: 5,
    status: "TODO",
    risk: { score: 0.24, level: "MEDIUM" },
    businessValue: 7,
    riskFactor: 5,
    urgency: 6,
  },
  {
    id: "t-011",
    projectId: "p-001",
    sprintId: null,
    title: "Improve blocked task explanation copy",
    description: "Give managers clearer recommended actions for blocker states.",
    assignedTo: "u-001",
    priority: "LOW",
    storyPoints: 2,
    status: "TODO",
    risk: { score: 0.09, level: "LOW" },
    businessValue: 4,
    riskFactor: 2,
    urgency: 3,
  },
  {
    id: "t-012",
    projectId: "p-002",
    sprintId: "s-003",
    title: "Implement secure token refresh on mobile",
    description: "Persist auth sessions with refresh token safeguards.",
    assignedTo: "u-002",
    priority: "HIGH",
    storyPoints: 8,
    status: "TODO",
    risk: { score: 0.34, level: "MEDIUM" },
    businessValue: 9,
    riskFactor: 7,
    urgency: 8,
  },
  {
    id: "t-013",
    projectId: "p-003",
    sprintId: "s-004",
    title: "Finalize anomaly alert thresholds",
    description: "Reduce false positive risk spikes in project trend analytics.",
    assignedTo: "u-004",
    priority: "MEDIUM",
    storyPoints: 5,
    status: "DONE",
    risk: { score: 0.12, level: "LOW" },
    businessValue: 7,
    riskFactor: 4,
    urgency: 4,
  },
];

const DEMO_STORAGE_KEY = "beacon:demo_db_v2";
const DEMO_INVITES = [];

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

const buildDemoToken = (userId) => `demo-token:${userId}:${Date.now()}`;
const getUserIdFromDemoToken = (token) => {
  const value = String(token ?? "");
  if (!value.startsWith("demo-token:")) {
    return null;
  }
  return value.split(":")[1] ?? null;
};

const createUniqueUserCode = (users) => {
  const existing = new Set(users.map((user) => user.uniqueCode));
  let next = users.length + 1;
  while (existing.has(`BCN-${String(next).padStart(4, "0")}`)) {
    next += 1;
  }
  return `BCN-${String(next).padStart(4, "0")}`;
};

const normalizeUser = (user, index) => {
  const fallbackCode = `BCN-${String(index + 1).padStart(4, "0")}`;
  return {
    id: user.id ?? `u-${String(index + 1).padStart(3, "0")}`,
    uniqueCode: user.uniqueCode ?? fallbackCode,
    name: user.name ?? `Beacon User ${index + 1}`,
    email: user.email ?? `user${index + 1}@beacon.dev`,
    password: user.password ?? "beacon-demo",
    role: user.role ?? "DEVELOPER",
    capacityPerSprint: Number(user.capacityPerSprint ?? 20),
    avatarHue: Number(user.avatarHue ?? (index * 57) % 360),
  };
};

const normalizeInvite = (invite, index) => ({
  id: invite.id ?? `inv-${String(index + 1).padStart(3, "0")}`,
  projectId: invite.projectId,
  inviteeUserId: invite.inviteeUserId,
  inviteeUniqueCode: invite.inviteeUniqueCode,
  invitedByUserId: invite.invitedByUserId,
  role: invite.role ?? "DEVELOPER",
  status: invite.status ?? "PENDING",
  createdAt: invite.createdAt ?? new Date().toISOString(),
  respondedAt: invite.respondedAt ?? null,
});

const normalizeDemoDb = (db) => ({
  users: (db?.users ?? clone(DEMO_USERS)).map(normalizeUser),
  projects: db?.projects ?? clone(DEMO_PROJECTS),
  sprints: db?.sprints ?? clone(DEMO_SPRINTS),
  tasks: db?.tasks ?? clone(DEMO_TASKS),
  invites: (db?.invites ?? clone(DEMO_INVITES)).map(normalizeInvite),
});

const createInitialDemoDb = () => ({
  users: clone(DEMO_USERS),
  projects: clone(DEMO_PROJECTS),
  sprints: clone(DEMO_SPRINTS),
  tasks: clone(DEMO_TASKS),
  invites: clone(DEMO_INVITES),
});

let demoDbCache = null;

const loadDemoDb = () => {
  if (demoDbCache) {
    return demoDbCache;
  }

  try {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      demoDbCache = normalizeDemoDb(parsed);
      return demoDbCache;
    }
  } catch {
    demoDbCache = normalizeDemoDb(createInitialDemoDb());
    return demoDbCache;
  }

  demoDbCache = normalizeDemoDb(createInitialDemoDb());
  return demoDbCache;
};

const persistDemoDb = () => {
  if (!demoDbCache) {
    return;
  }
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoDbCache));
  } catch {
    // ignore storage write errors in restrictive environments
  }
};

const mutateDemoDb = (mutator) => {
  const db = loadDemoDb();
  mutator(db);
  persistDemoDb();
  return db;
};

const nextEntityId = (prefix, entities) => {
  const maxNumeric = entities.reduce((maxValue, entity) => {
    const value = Number.parseInt(String(entity.id ?? entity._id ?? "").replace(/^\D+/, ""), 10);
    return Number.isNaN(value) ? maxValue : Math.max(maxValue, value);
  }, 0);
  return `${prefix}-${String(maxNumeric + 1).padStart(3, "0")}`;
};

const DEMO_USER = DEMO_USERS[0];

export const PRIORITY_META = {
  HIGH: { label: "High", className: "priority-high" },
  MEDIUM: { label: "Medium", className: "priority-medium" },
  LOW: { label: "Low", className: "priority-low" },
};

export const STATUS_META = {
  TODO: { label: "To Do", className: "status-todo" },
  IN_PROGRESS: { label: "In Progress", className: "status-in-progress" },
  DONE: { label: "Done", className: "status-done" },
  BLOCKED: { label: "Blocked", className: "status-blocked" },
  ACTIVE: { label: "Active", className: "status-active" },
  PLANNED: { label: "Planned", className: "status-planned" },
  COMPLETED: { label: "Completed", className: "status-completed" },
};

const getUserById = (id) => loadDemoDb().users.find((user) => user.id === id);
const getSafeUserById = (id) => sanitizeUser(getUserById(id));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const withFallback = async (requestFn, fallbackFn) => {
  try {
    return await requestFn();
  } catch {
    return fallbackFn();
  }
};

const projectCapacity = (projectId) => {
  const project = loadDemoDb().projects.find((item) => item.id === projectId);
  if (!project) {
    return 0;
  }
  return project.teamMemberIds.reduce((total, memberId) => {
    const member = getUserById(memberId);
    return total + (member?.capacityPerSprint ?? 0);
  }, 0);
};

const sprintTasks = (sprintId) => loadDemoDb().tasks.filter((task) => task.sprintId === sprintId);
const projectTasks = (projectId) => loadDemoDb().tasks.filter((task) => task.projectId === projectId);

const getSprintCompletion = (sprintId) => {
  const tasks = sprintTasks(sprintId);
  const committedStoryPoints =
    loadDemoDb().sprints.find((sprint) => sprint.id === sprintId)?.committedStoryPoints ??
    tasks.reduce((sum, task) => sum + task.storyPoints, 0);
  const completedStoryPoints = tasks
    .filter((task) => task.status === "DONE")
    .reduce((sum, task) => sum + task.storyPoints, 0);
  return {
    committedStoryPoints,
    completedStoryPoints,
  };
};

const buildSprintAnalytics = (sprintId) => {
  const sprint = loadDemoDb().sprints.find((item) => item.id === sprintId);
  if (!sprint) {
    return null;
  }

  const tasks = sprintTasks(sprintId);
  const { committedStoryPoints, completedStoryPoints } = getSprintCompletion(sprintId);
  const blockedTasks = tasks.filter((task) => task.status === "BLOCKED").length;
  const totalTasks = tasks.length || 1;
  const totalCapacity = projectCapacity(sprint.projectId) || 1;
  const totalAssignedPoints = tasks.reduce((sum, task) => sum + task.storyPoints, 0);
  const completionRatio = committedStoryPoints > 0 ? completedStoryPoints / committedStoryPoints : 0;
  const capacityUtilization = clamp(totalAssignedPoints / totalCapacity, 0, 1.2);
  const riskScore = blockedTasks / totalTasks;
  const riskInverse = 1 - riskScore;

  const healthScore = clamp(
    ((completionRatio * 0.5 + capacityUtilization * 0.3 + riskInverse * 0.2) * 100),
    0,
    100,
  );

  const durationDays = Math.max(
    1,
    Math.round((new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) / 86400000),
  );
  const velocity = completedStoryPoints / durationDays;

  const pointsByUser = tasks.reduce((accumulator, task) => {
    const current = accumulator[task.assignedTo] ?? 0;
    return { ...accumulator, [task.assignedTo]: current + task.storyPoints };
  }, {});

  const overloadedUsers = Object.entries(pointsByUser)
    .filter(([userId, assignedPoints]) => {
      const user = getUserById(userId);
      return assignedPoints > (user?.capacityPerSprint ?? Infinity);
    })
    .map(([userId]) => userId);

  return {
    sprintId,
    velocity,
    healthScore,
    riskScore,
    completionRate: clamp(completionRatio, 0, 1),
    committedStoryPoints,
    completedStoryPoints,
    capacityUtilization: clamp(capacityUtilization, 0, 1),
    overloadedUsers,
    generatedAt: new Date().toISOString(),
  };
};

const buildProjectAnalytics = (projectId) => {
  const tasks = projectTasks(projectId);
  const sprints = loadDemoDb().sprints.filter((sprint) => sprint.projectId === projectId);
  const completedSprints = sprints.filter((sprint) => sprint.status === "COMPLETED");

  const averageVelocity =
    completedSprints.length > 0
      ? completedSprints.reduce((sum, sprint) => sum + (buildSprintAnalytics(sprint.id)?.velocity ?? 0), 0) /
        completedSprints.length
      : 0;

  const blockedTasks = tasks.filter((task) => task.status === "BLOCKED").length;
  const riskIndex = tasks.length > 0 ? blockedTasks / tasks.length : 0;
  const teamMembers = loadDemoDb().projects.find((project) => project.id === projectId)?.teamMemberIds ?? [];

  const teamPerformance = teamMembers.map((memberId) => {
    const memberTasks = tasks.filter((task) => task.assignedTo === memberId);
    return {
      userId: memberId,
      assignedTasks: memberTasks.length,
      completedStoryPoints: memberTasks
        .filter((task) => task.status === "DONE")
        .reduce((sum, task) => sum + task.storyPoints, 0),
    };
  });

  return {
    projectId,
    averageVelocity,
    totalSprints: sprints.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === "DONE").length,
    blockedTasks,
    pendingTasks: tasks.filter((task) => task.status !== "DONE").length,
    riskIndex,
    teamPerformance,
    createdAt: new Date().toISOString(),
  };
};

const buildProjectSnapshot = (project) => {
  const analytics = buildProjectAnalytics(project.id);
  const activeSprint = loadDemoDb().sprints.find(
    (sprint) => sprint.projectId === project.id && sprint.status === "ACTIVE",
  );
  const activeHealth = activeSprint ? buildSprintAnalytics(activeSprint.id)?.healthScore ?? 0 : 0;

  return {
    ...project,
    metrics: {
      totalTasks: analytics.totalTasks,
      completedTasks: analytics.completedTasks,
      blockedTasks: analytics.blockedTasks,
      avgVelocity: analytics.averageVelocity,
      riskIndex: analytics.riskIndex,
      healthScore: activeHealth,
    },
    activeSprintId: activeSprint?.id ?? null,
    teamMembers: project.teamMemberIds.map((memberId) => getSafeUserById(memberId)).filter(Boolean),
  };
};

const buildOptimization = (sprintId) => {
  const sprint = loadDemoDb().sprints.find((item) => item.id === sprintId);
  if (!sprint) {
    return {
      recommendedTasks: [],
      totalStoryPoints: 0,
      capacityUtilization: 0,
      predictedSuccessProbability: 0,
      feasibilityScore: 0,
    };
  }

  const capacity = projectCapacity(sprint.projectId);
  const candidates = projectTasks(sprint.projectId)
    .filter((task) => !task.sprintId || task.sprintId === sprintId)
    .map((task) => {
      const priorityScore =
        task.businessValue * 0.4 + task.riskFactor * 0.2 + task.urgency * 0.2 - task.storyPoints * 0.2;
      return { ...task, priorityScore };
    })
    .sort((left, right) => right.priorityScore - left.priorityScore);

  const selected = [];
  let points = 0;
  for (const task of candidates) {
    if (points + task.storyPoints <= capacity) {
      selected.push(task);
      points += task.storyPoints;
    }
  }

  const capacityUtilization = capacity > 0 ? points / capacity : 0;
  const feasibilityScore = points > 0 ? capacity / points : 0;
  const blockedRatio = selected.length
    ? selected.filter((task) => task.status === "BLOCKED").length / selected.length
    : 0;
  const predictedSuccessProbability = clamp((1 - blockedRatio) * 100 - (capacityUtilization > 1 ? 12 : 0), 0, 99);

  return {
    recommendedTasks: selected.slice(0, 5),
    totalStoryPoints: points,
    capacityUtilization: clamp(capacityUtilization, 0, 1),
    predictedSuccessProbability,
    feasibilityScore,
  };
};

export const authApi = {
  async login(credentials) {
    return withFallback(
      async () => {
        const response = await api.post("/auth/login", credentials);
        const payload = unwrapResponse(response);
        return {
          token: payload?.token ?? payload?.accessToken ?? "",
          user: toClientId(payload?.user) ?? sanitizeUser(DEMO_USER),
          isDemo: false,
        };
      },
      async () => {
        await delay();
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }
        const inputEmail = credentials.email.trim().toLowerCase();
        const user = loadDemoDb().users.find((item) => item.email.toLowerCase() === inputEmail);
        if (!user || user.password !== credentials.password) {
          throw new Error("Invalid credentials.");
        }
        return {
          token: buildDemoToken(user.id),
          user: sanitizeUser(user),
          isDemo: true,
        };
      },
    );
  },

  async register(details) {
    return withFallback(
      async () => {
        const response = await api.post("/auth/register", details);
        const payload = unwrapResponse(response);
        return {
          token: payload?.token ?? payload?.accessToken ?? "",
          user: toClientId(payload?.user) ?? DEMO_USER,
          isDemo: false,
        };
      },
      async () => {
        await delay();
        if (!details?.name || !details?.email || !details?.password) {
          throw new Error("Name, email, and password are required.");
        }
        const email = details.email.trim().toLowerCase();
        const existing = loadDemoDb().users.some((user) => user.email.toLowerCase() === email);
        if (existing) {
          throw new Error("An account with this email already exists.");
        }

        let demoUser = null;
        mutateDemoDb((draft) => {
          const id = nextEntityId("u", draft.users);
          demoUser = {
            id,
            uniqueCode: createUniqueUserCode(draft.users),
            name: details.name.trim(),
            email,
            password: details.password,
            role: details.role ?? "DEVELOPER",
            capacityPerSprint: Number(details.capacityPerSprint ?? 18),
            avatarHue: Math.floor(Math.random() * 360),
          };
          draft.users.unshift(demoUser);
        });

        return {
          token: buildDemoToken(demoUser.id),
          user: sanitizeUser(demoUser),
          isDemo: true,
        };
      },
    );
  },

  async getMe(token) {
    if (!token) {
      return null;
    }
    return withFallback(
      async () => {
        const response = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = unwrapResponse(response);
        return toClientId(payload?.user ?? payload ?? DEMO_USER);
      },
      async () => {
        await delay(140);
        const userId = getUserIdFromDemoToken(token);
        if (!userId) {
          return sanitizeUser(DEMO_USER);
        }
        const user = loadDemoDb().users.find((item) => item.id === userId);
        return sanitizeUser(user ?? DEMO_USER);
      },
    );
  },
};

export const projectApi = {
  async getProjects() {
    return withFallback(
      async () => {
        const response = await api.get("/projects");
        return toClientCollection(unwrapResponse(response));
      },
      async () => {
        await delay();
        return loadDemoDb().projects.map((project) => buildProjectSnapshot(project));
      },
    );
  },

  async getProjectById(projectId) {
    return withFallback(
      async () => {
        const response = await api.get(`/projects/${projectId}`);
        const payload = toClientId(unwrapResponse(response));
        if (!payload) {
          return null;
        }
        return {
          ...payload,
          teamMembers: toClientCollection(payload.teamMembers),
          sprints: toClientCollection(payload.sprints),
        };
      },
      async () => {
        await delay();
        const project = loadDemoDb().projects.find((item) => item.id === projectId);
        if (!project) {
          return null;
        }
        const snapshot = buildProjectSnapshot(project);
        const sprints = loadDemoDb().sprints.filter((sprint) => sprint.projectId === projectId);
        return {
          ...snapshot,
          sprints,
        };
      },
    );
  },

  async createProject(payload) {
    return withFallback(
      async () => {
        const response = await api.post("/projects", payload);
        return toClientId(unwrapResponse(response));
      },
      async () => {
        await delay();
        const db = mutateDemoDb((draft) => {
          const projectId = nextEntityId("p", draft.projects);
          draft.projects.unshift({
            id: projectId,
            name: payload.name,
            description: payload.description ?? "",
            status: payload.status ?? "PLANNED",
            startDate: payload.startDate ?? new Date().toISOString().slice(0, 10),
            endDate: payload.endDate ?? null,
            teamMemberIds: payload.teamMemberIds?.length ? payload.teamMemberIds : [DEMO_USER.id],
          });
        });

        return buildProjectSnapshot(db.projects[0]);
      },
    );
  },

  async updateProject(projectId, updates) {
    return withFallback(
      async () => {
        const response = await api.patch(`/projects/${projectId}`, updates);
        return toClientId(unwrapResponse(response));
      },
      async () => {
        await delay();
        mutateDemoDb((draft) => {
          draft.projects = draft.projects.map((project) => {
            if (project.id !== projectId) {
              return project;
            }
            return {
              ...project,
              ...updates,
              teamMemberIds: updates.teamMemberIds ?? project.teamMemberIds,
            };
          });
        });

        const project = loadDemoDb().projects.find((item) => item.id === projectId);
        return project ? buildProjectSnapshot(project) : null;
      },
    );
  },

  async deleteProject(projectId) {
    return withFallback(
      async () => {
        const response = await api.delete(`/projects/${projectId}`);
        return unwrapResponse(response);
      },
      async () => {
        await delay();
        mutateDemoDb((draft) => {
          draft.projects = draft.projects.filter((project) => project.id !== projectId);
          const sprintIds = draft.sprints.filter((sprint) => sprint.projectId === projectId).map((sprint) => sprint.id);
          draft.sprints = draft.sprints.filter((sprint) => sprint.projectId !== projectId);
          draft.tasks = draft.tasks.filter((task) => task.projectId !== projectId && !sprintIds.includes(task.sprintId));
        });
        return { success: true };
      },
    );
  },

  async inviteMemberByUniqueCode(projectId, payload) {
    return withFallback(
      async () => {
        const response = await api.post(`/projects/${projectId}/members/invite`, payload);
        return toClientId(unwrapResponse(response));
      },
      async () => {
        await delay();
        const normalizedCode = String(payload.inviteeUniqueCode ?? "").trim().toUpperCase();
        if (!normalizedCode) {
          throw new Error("Unique user ID is required.");
        }

        let createdInvite = null;
        mutateDemoDb((draft) => {
          const project = draft.projects.find((item) => item.id === projectId);
          if (!project) {
            throw new Error("Project not found.");
          }

          const invitee = draft.users.find((user) => user.uniqueCode.toUpperCase() === normalizedCode);
          if (!invitee) {
            throw new Error("No user found for the provided unique ID.");
          }

          if (project.teamMemberIds.includes(invitee.id)) {
            throw new Error("This user is already a team member.");
          }

          const pendingExists = draft.invites.some(
            (invite) =>
              invite.projectId === projectId && invite.inviteeUserId === invitee.id && invite.status === "PENDING",
          );
          if (pendingExists) {
            throw new Error("A pending invitation already exists for this user.");
          }

          const inviteId = nextEntityId("inv", draft.invites);
          createdInvite = {
            id: inviteId,
            projectId,
            inviteeUserId: invitee.id,
            inviteeUniqueCode: invitee.uniqueCode,
            invitedByUserId: payload.invitedByUserId ?? DEMO_USER.id,
            role: payload.role ?? invitee.role ?? "DEVELOPER",
            status: "PENDING",
            createdAt: new Date().toISOString(),
            respondedAt: null,
          };
          draft.invites.unshift(createdInvite);
        });

        return createdInvite;
      },
    );
  },

  async getProjectInvitations(projectId) {
    return withFallback(
      async () => {
        const response = await api.get(`/projects/${projectId}/invitations`);
        return toClientCollection(unwrapResponse(response));
      },
      async () => {
        await delay();
        const db = loadDemoDb();
        return db.invites
          .filter((invite) => invite.projectId === projectId)
          .map((invite) => ({
            ...invite,
            invitee: getSafeUserById(invite.inviteeUserId),
            inviter: getSafeUserById(invite.invitedByUserId),
          }))
          .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
      },
    );
  },
};

export const sprintApi = {
  async getSprintsByProject(projectId) {
    return withFallback(
      async () => {
        const response = await api.get("/sprints", { params: { projectId } });
        return toClientCollection(unwrapResponse(response));
      },
      async () => {
        await delay();
        return loadDemoDb().sprints.filter((sprint) => sprint.projectId === projectId).map((sprint) => ({
          ...sprint,
          analytics: buildSprintAnalytics(sprint.id),
        }));
      },
    );
  },

  async getSprintById(sprintId) {
    return withFallback(
      async () => {
        const response = await api.get(`/sprints/${sprintId}`);
        return toClientId(unwrapResponse(response));
      },
      async () => {
        await delay();
        const sprint = loadDemoDb().sprints.find((item) => item.id === sprintId);
        if (!sprint) {
          return null;
        }
        return {
          ...sprint,
          analytics: buildSprintAnalytics(sprint.id),
        };
      },
    );
  },

  async createSprint(payload) {
    return withFallback(
      async () => {
        const response = await api.post("/sprints", payload);
        return toClientId(unwrapResponse(response));
      },
      async () => {
        await delay();
        let createdSprintId = "";

        mutateDemoDb((draft) => {
          createdSprintId = nextEntityId("s", draft.sprints);
          draft.sprints.unshift({
            id: createdSprintId,
            projectId: payload.projectId,
            name: payload.name,
            goal: payload.goal ?? "",
            startDate: payload.startDate,
            endDate: payload.endDate,
            status: payload.status ?? "PLANNED",
            committedStoryPoints: Number(payload.committedStoryPoints ?? 0),
          });
        });

        const sprint = loadDemoDb().sprints.find((item) => item.id === createdSprintId);
        return sprint ? { ...sprint, analytics: buildSprintAnalytics(createdSprintId) } : null;
      },
    );
  },

  async updateSprint(sprintId, updates) {
    return withFallback(
      async () => {
        const response = await api.patch(`/sprints/${sprintId}`, updates);
        return toClientId(unwrapResponse(response));
      },
      async () => {
        await delay();
        mutateDemoDb((draft) => {
          draft.sprints = draft.sprints.map((sprint) =>
            sprint.id === sprintId
              ? {
                  ...sprint,
                  ...updates,
                  committedStoryPoints:
                    updates.committedStoryPoints !== undefined
                      ? Number(updates.committedStoryPoints)
                      : sprint.committedStoryPoints,
                }
              : sprint,
          );
        });
        const sprint = loadDemoDb().sprints.find((item) => item.id === sprintId);
        return sprint ? { ...sprint, analytics: buildSprintAnalytics(sprintId) } : null;
      },
    );
  },

  async updateSprintStatus(sprintId, status) {
    return withFallback(
      async () => {
        const endpoint = status === "ACTIVE" ? "start" : status === "COMPLETED" ? "complete" : "";
        if (endpoint) {
          const response = await api.patch(`/sprints/${sprintId}/${endpoint}`);
          return toClientId(unwrapResponse(response));
        }
        const response = await api.patch(`/sprints/${sprintId}`, { status });
        return toClientId(unwrapResponse(response));
      },
      async () => {
        await delay();
        mutateDemoDb((draft) => {
          draft.sprints = draft.sprints.map((sprint) => (sprint.id === sprintId ? { ...sprint, status } : sprint));
        });
        const sprint = loadDemoDb().sprints.find((item) => item.id === sprintId);
        return sprint ? { ...sprint, analytics: buildSprintAnalytics(sprintId) } : null;
      },
    );
  },
};

export const taskApi = {
  async getTasksByProject(projectId) {
    return withFallback(
      async () => {
        const response = await api.get("/tasks", { params: { projectId } });
        return toClientCollection(unwrapResponse(response));
      },
      async () => {
        await delay();
        return clone(projectTasks(projectId));
      },
    );
  },

  async getBacklogByProject(projectId) {
    return withFallback(
      async () => {
        const response = await api.get("/tasks", { params: { projectId, sprintId: "backlog" } });
        return toClientCollection(unwrapResponse(response));
      },
      async () => {
        await delay();
        return clone(projectTasks(projectId).filter((task) => !task.sprintId));
      },
    );
  },

  async getSprintTasks(sprintId) {
    return withFallback(
      async () => {
        const response = await api.get("/tasks", { params: { sprintId } });
        return toClientCollection(unwrapResponse(response));
      },
      async () => {
        await delay();
        return clone(sprintTasks(sprintId));
      },
    );
  },

  async createTask(payload) {
    return withFallback(
      async () => {
        const response = await api.post("/tasks", payload);
        return toClientId(unwrapResponse(response));
      },
      async () => {
        await delay();
        let createdTaskId = "";
        mutateDemoDb((draft) => {
          createdTaskId = nextEntityId("t", draft.tasks);
          draft.tasks.unshift({
            id: createdTaskId,
            projectId: payload.projectId,
            sprintId: payload.sprintId ?? null,
            title: payload.title,
            description: payload.description ?? "",
            assignedTo: payload.assignedTo ?? DEMO_USER.id,
            priority: payload.priority ?? "MEDIUM",
            storyPoints: Number(payload.storyPoints ?? 0),
            status: payload.status ?? (payload.sprintId ? "TODO" : "TODO"),
            risk: {
              score: Number(payload?.risk?.score ?? payload?.risk ?? 0.2),
              level: payload?.risk?.level ?? "LOW",
            },
            businessValue: Number(payload.businessValue ?? 6),
            riskFactor: Number(payload.riskFactor ?? 5),
            urgency: Number(payload.urgency ?? 5),
          });
        });
        return loadDemoDb().tasks.find((task) => task.id === createdTaskId) ?? null;
      },
    );
  },

  async updateTask(taskId, updates) {
    return withFallback(
      async () => {
        const response = await api.patch(`/tasks/${taskId}`, updates);
        return toClientId(unwrapResponse(response));
      },
      async () => {
        await delay();
        mutateDemoDb((draft) => {
          draft.tasks = draft.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  ...updates,
                  storyPoints:
                    updates.storyPoints !== undefined ? Number(updates.storyPoints) : task.storyPoints,
                  risk:
                    updates.risk !== undefined
                      ? typeof updates.risk === "number"
                        ? { ...task.risk, score: updates.risk }
                        : { ...task.risk, ...updates.risk }
                      : task.risk,
                }
              : task,
          );
        });
        return loadDemoDb().tasks.find((task) => task.id === taskId) ?? null;
      },
    );
  },

  async updateTaskStatus(taskId, status) {
    return withFallback(
      async () => {
        const response = await api.patch(`/tasks/${taskId}/status`, { status });
        return toClientId(unwrapResponse(response));
      },
      async () => taskApi.updateTask(taskId, { status }),
    );
  },

  async deleteTask(taskId) {
    return withFallback(
      async () => {
        const response = await api.delete(`/tasks/${taskId}`);
        return unwrapResponse(response);
      },
      async () => {
        await delay();
        mutateDemoDb((draft) => {
          draft.tasks = draft.tasks.filter((task) => task.id !== taskId);
        });
        return { success: true };
      },
    );
  },
};

export const analyticsApi = {
  async getProjectAnalytics(projectId) {
    return withFallback(
      async () => {
        const response = await api.get(`/projects/${projectId}/analytics`);
        return unwrapResponse(response);
      },
      async () => {
        await delay();
        return buildProjectAnalytics(projectId);
      },
    );
  },

  async getSprintAnalytics(sprintId) {
    return withFallback(
      async () => {
        const response = await api.get(`/sprints/${sprintId}/analytics`);
        return unwrapResponse(response);
      },
      async () => {
        await delay();
        return buildSprintAnalytics(sprintId);
      },
    );
  },

  async getDashboardOverview() {
    return withFallback(
      async () => {
        const response = await api.get("/analytics/dashboard");
        return unwrapResponse(response);
      },
      async () => {
        await delay();
        const db = loadDemoDb();
        const projects = db.projects.map((project) => buildProjectSnapshot(project));
        const activeSprint = db.sprints.find((sprint) => sprint.status === "ACTIVE") ?? db.sprints[0];
        const activeSprintAnalytics = activeSprint ? buildSprintAnalytics(activeSprint.id) : null;
        const optimization = activeSprint ? buildOptimization(activeSprint.id) : buildOptimization("");

        const teamLoad =
          activeSprint &&
          db.projects
            .find((project) => project.id === activeSprint.projectId)
            ?.teamMemberIds.map((memberId) => {
              const member = getUserById(memberId);
              const memberSprintPoints = sprintTasks(activeSprint.id)
                .filter((task) => task.assignedTo === memberId)
                .reduce((sum, task) => sum + task.storyPoints, 0);
              return {
                userId: memberId,
                name: member?.name ?? "Unknown",
                assignedPoints: memberSprintPoints,
                capacityPerSprint: member?.capacityPerSprint ?? 0,
              };
            });

        return {
          averageVelocity:
            projects.reduce((sum, project) => sum + (project.metrics.avgVelocity ?? 0), 0) /
            Math.max(1, projects.length),
          activeSprints: db.sprints.filter((sprint) => sprint.status === "ACTIVE").length,
          portfolioHealth:
            projects.reduce((sum, project) => sum + (project.metrics.healthScore ?? 0), 0) /
            Math.max(1, projects.length),
          overloadedPeople: activeSprintAnalytics?.overloadedUsers?.length ?? 0,
          riskScore: activeSprintAnalytics?.riskScore ?? 0,
          activeSprint: {
            ...(activeSprint ?? {}),
            projectName: activeSprint
              ? db.projects.find((project) => project.id === activeSprint.projectId)?.name ?? "Unknown Project"
              : "No Active Sprint",
            ...(activeSprintAnalytics ?? {}),
          },
          optimization,
          teamLoad: teamLoad ?? [],
          projects,
        };
      },
    );
  },
};

export const optimizationApi = {
  async optimizeSprint(sprintId) {
    return withFallback(
      async () => {
        const response = await api.post(`/sprints/${sprintId}/optimize`);
        const payload = unwrapResponse(response);
        return {
          ...payload,
          recommendedTasks: toClientCollection(payload?.recommendedTasks),
        };
      },
      async () => {
        await delay();
        return buildOptimization(sprintId);
      },
    );
  },
};

export const invitationApi = {
  async getMyInvitations(userId) {
    return withFallback(
      async () => {
        const response = await api.get(`/users/${userId}/invitations`);
        return toClientCollection(unwrapResponse(response));
      },
      async () => {
        await delay();
        const db = loadDemoDb();
        return db.invites
          .filter((invite) => invite.inviteeUserId === userId)
          .map((invite) => ({
            ...invite,
            project: db.projects.find((project) => project.id === invite.projectId) ?? null,
            inviter: getSafeUserById(invite.invitedByUserId),
          }))
          .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
      },
    );
  },

  async respondToInvitation(invitationId, userId, action) {
    return withFallback(
      async () => {
        const response = await api.patch(`/invitations/${invitationId}`, { action });
        return toClientId(unwrapResponse(response));
      },
      async () => {
        await delay();
        const nextStatus = action === "accept" ? "ACCEPTED" : "DECLINED";
        let updatedInvite = null;

        mutateDemoDb((draft) => {
          const invite = draft.invites.find((item) => item.id === invitationId);
          if (!invite) {
            throw new Error("Invitation not found.");
          }
          if (invite.inviteeUserId !== userId) {
            throw new Error("You cannot respond to this invitation.");
          }
          if (invite.status !== "PENDING") {
            updatedInvite = invite;
            return;
          }

          invite.status = nextStatus;
          invite.respondedAt = new Date().toISOString();

          if (nextStatus === "ACCEPTED") {
            const project = draft.projects.find((item) => item.id === invite.projectId);
            if (project && !project.teamMemberIds.includes(userId)) {
              project.teamMemberIds.push(userId);
            }
          }
          updatedInvite = { ...invite };
        });

        return updatedInvite;
      },
    );
  },
};

export const userApi = {
  async getProjectUsers(projectId) {
    await delay();
    const project = loadDemoDb().projects.find((item) => item.id === projectId);
    if (!project) {
      return [];
    }
    return project.teamMemberIds.map((memberId) => getSafeUserById(memberId)).filter(Boolean);
  },
};

export const referenceData = {
  users: loadDemoDb().users.map((user) => sanitizeUser(user)),
  projects: loadDemoDb().projects,
  sprints: loadDemoDb().sprints,
  invites: loadDemoDb().invites,
};
