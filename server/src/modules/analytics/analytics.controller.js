import { sendSuccess } from "../../utils/apiResponse.js";
import { buildDashboardOverview, buildProjectAnalytics, buildSprintAnalytics } from "./analytics.service.js";

export const getProjectAnalyticsController = async (req, res) =>
  sendSuccess(res, await buildProjectAnalytics(req.params.id));

export const getSprintAnalyticsController = async (req, res) =>
  sendSuccess(res, await buildSprintAnalytics(req.params.id));

export const getDashboardOverviewController = async (_req, res) =>
  sendSuccess(res, await buildDashboardOverview());
