import User from "./user.model.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { HttpError } from "../../utils/httpError.js";

const isPrivileged = (role) => role === "ADMIN" || role === "MANAGER";

const sanitize = (user) => {
  const payload = user.toObject ? user.toObject() : { ...user };
  delete payload.passwordHash;
  payload.id = String(payload._id ?? payload.id);
  return payload;
};

export const listUsersController = async (req, res) => {
  if (!isPrivileged(req.user?.role)) {
    throw new HttpError(403, "You do not have permission to list all users.");
  }

  const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });
  sendSuccess(res, users.map(sanitize));
};

export const getUserController = async (req, res) => {
  if (!isPrivileged(req.user?.role) && req.user?.id !== req.params.id) {
    throw new HttpError(403, "You do not have permission to view this user.");
  }

  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    throw new HttpError(404, "User not found.");
  }
  sendSuccess(res, sanitize(user));
};

export const updateUserController = async (req, res) => {
  const privileged = isPrivileged(req.user?.role);
  if (!privileged && req.user?.id !== req.params.id) {
    throw new HttpError(403, "You do not have permission to update this user.");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new HttpError(404, "User not found.");
  }
  user.name = req.body.name ?? user.name;
  user.capacityPerSprint =
    req.body.capacityPerSprint !== undefined ? Number(req.body.capacityPerSprint) : user.capacityPerSprint;
  if (privileged) {
    user.role = req.body.role ?? user.role;
    user.status = req.body.status ?? user.status;
  }
  await user.save();
  sendSuccess(res, sanitize(user), "User updated successfully.");
};

export const deleteUserController = async (req, res) => {
  if (!isPrivileged(req.user?.role)) {
    throw new HttpError(403, "You do not have permission to delete users.");
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new HttpError(404, "User not found.");
  }
  sendSuccess(res, { deletedUserId: req.params.id }, "User deleted successfully.");
};
