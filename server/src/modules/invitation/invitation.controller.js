import { sendSuccess } from "../../utils/apiResponse.js";
import { HttpError } from "../../utils/httpError.js";
import { getUserInvitations, respondToInvitation } from "./invitation.service.js";

const isPrivileged = (role) => role === "ADMIN" || role === "MANAGER";

export const getUserInvitationsController = async (req, res) => {
  if (!isPrivileged(req.user?.role) && req.user?.id !== req.params.id) {
    throw new HttpError(403, "You can only view your own invitations.");
  }

  sendSuccess(res, await getUserInvitations(req.params.id));
};

export const respondToInvitationController = async (req, res) =>
  sendSuccess(
    res,
    await respondToInvitation(req.params.id, req.user.id, req.body.action),
    "Invitation updated successfully.",
  );
