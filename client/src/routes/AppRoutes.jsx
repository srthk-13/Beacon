import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import AppLayout from "../components/layout/AppLayout.jsx";
import Backlog from "../pages/Backlog.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Invitations from "../pages/Invitations.jsx";
import Login from "../pages/Login.jsx";
import ProjectDetails from "../pages/ProjectDetails.jsx";
import Projects from "../pages/Projects.jsx";
import Signup from "../pages/Signup.jsx";
import SprintView from "../pages/SprintView.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/projects/:projectId/backlog" element={<Backlog />} />
          <Route path="/sprints/:sprintId" element={<SprintView />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
