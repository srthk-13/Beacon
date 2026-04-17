import Project from "./project.model.js";
import Sprint from "../sprint/sprint.model.js";
import Task from "../task/task.model.js";
import User from "../user/user.model.js";
import Invitation from "../invitation/invitation.model.js";
import { HttpError } from "../../utils/httpError.js";
import { buildProjectSnapshot, serializeId } from "../analytics/analytics.service.js";

const dedupeIds = (ids = []) => {
  const seen = new Set();
  return ids.reduce((accumulator, id) => {
    if (!id) {
      return accumulator;
    }
    const key = serializeId(id);
    if (seen.has(key)) {
      return accumulator;
    }
    seen.add(key);
    accumulator.push(id);
    return accumulator;
  }, []);
};

export const getProjects = async () => {
  const projects = await Project.find({}).sort({ createdAt: -1 }).lean();
  return Promise.all(projects.map((project) => buildProjectSnapshot(project)));
};

export const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId).lean();
  if (!project) {
    throw new HttpError(404, "Project not found.");
  }

  const snapshot = await buildProjectSnapshot(project);
  const sprints = await Sprint.find({ projectId }).sort({ createdAt: -1 }).lean();
  return {
    ...snapshot,
    sprints: sprints.map((sprint) => ({
      ...sprint,
      id: serializeId(sprint._id),
      projectId: serializeId(sprint.projectId),
    })),
  };
};

export const createProject = async (payload, userId) => {
  const teamMemberIds = dedupeIds(payload.teamMemberIds?.length ? [...payload.teamMemberIds, userId] : [userId]);
  const project = await Project.create({
    name: payload.name,
    description: payload.description ?? "",
    status: payload.status ?? "PLANNED",
    startDate: payload.startDate ?? null,
    endDate: payload.endDate ?? null,
    createdBy: userId,
    teamMemberIds,
  });

  await User.updateMany({ _id: { $in: project.teamMemberIds } }, { $addToSet: { projects: project._id } });
  return getProjectById(project._id);
};

export const updateProject = async (projectId, updates) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new HttpError(404, "Project not found.");
  }

  const previousMemberIds = project.teamMemberIds.map((memberId) => serializeId(memberId));

  project.name = updates.name ?? project.name;
  project.description = updates.description ?? project.description;
  project.status = updates.status ?? project.status;
  project.startDate = updates.startDate ?? project.startDate;
  project.endDate = updates.endDate ?? project.endDate;
  if (Array.isArray(updates.teamMemberIds)) {
    const nextTeamMemberIds = dedupeIds(updates.teamMemberIds);
    project.teamMemberIds = nextTeamMemberIds.length > 0 ? nextTeamMemberIds : [project.createdBy];
  }

  await project.save();
  const nextMemberIds = project.teamMemberIds.map((memberId) => serializeId(memberId));
  const removedMemberIds = previousMemberIds.filter((memberId) => !nextMemberIds.includes(memberId));
  const addedMemberIds = nextMemberIds.filter((memberId) => !previousMemberIds.includes(memberId));

  await Promise.all([
    removedMemberIds.length > 0
      ? User.updateMany({ _id: { $in: removedMemberIds } }, { $pull: { projects: project._id } })
      : Promise.resolve(),
    addedMemberIds.length > 0
      ? User.updateMany({ _id: { $in: addedMemberIds } }, { $addToSet: { projects: project._id } })
      : Promise.resolve(),
  ]);

  return getProjectById(projectId);
};

export const deleteProject = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new HttpError(404, "Project not found.");
  }

  const sprintIds = (await Sprint.find({ projectId }, { _id: 1 }).lean()).map((item) => item._id);
  await Task.deleteMany({ projectId });
  await Sprint.deleteMany({ projectId });
  await Invitation.deleteMany({ projectId });
  await User.updateMany({ projects: project._id }, { $pull: { projects: project._id } });
  await Project.findByIdAndDelete(projectId);

  return {
    deletedProjectId: projectId,
    deletedSprintCount: sprintIds.length,
  };
};

export const inviteMemberByUniqueCode = async (projectId, invitedByUserId, payload) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new HttpError(404, "Project not found.");
  }

  const invitee = await User.findOne({ uniqueCode: String(payload.inviteeUniqueCode).trim().toUpperCase() });
  if (!invitee) {
    throw new HttpError(404, "No user found for the provided unique ID.");
  }

  if (project.teamMemberIds.some((memberId) => serializeId(memberId) === serializeId(invitee._id))) {
    throw new HttpError(409, "This user is already a team member.");
  }

  const pending = await Invitation.findOne({
    projectId,
    inviteeUserId: invitee._id,
    status: "PENDING",
  });
  if (pending) {
    throw new HttpError(409, "A pending invitation already exists for this user.");
  }

  return Invitation.create({
    projectId,
    inviteeUserId: invitee._id,
    inviteeUniqueCode: invitee.uniqueCode,
    invitedByUserId,
    role: payload.role ?? "DEVELOPER",
  });
};

export const getProjectInvitations = async (projectId) => {
  const invitations = await Invitation.find({ projectId })
    .populate("inviteeUserId", "-passwordHash")
    .populate("invitedByUserId", "-passwordHash")
    .sort({ createdAt: -1 });

  return invitations.map((invite) => ({
    ...invite.toObject(),
    id: serializeId(invite._id),
    projectId: serializeId(invite.projectId),
    inviteeUserId: serializeId(invite.inviteeUserId._id),
    invitedByUserId: serializeId(invite.invitedByUserId._id),
    invitee: { ...invite.inviteeUserId.toObject(), id: serializeId(invite.inviteeUserId._id) },
    inviter: { ...invite.invitedByUserId.toObject(), id: serializeId(invite.invitedByUserId._id) },
  }));
};
