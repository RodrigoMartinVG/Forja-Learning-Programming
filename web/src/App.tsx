import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LegacyWorkspaceRedirect } from "./pages/LegacyWorkspaceRedirect";
import { LandingPage } from "./pages/LandingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { WorkspacePage } from "./pages/WorkspacePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/paths" element={<Navigate replace to="/workspace" />} />
        <Route path="/levels/:slug" element={<LegacyWorkspaceRedirect target="level" />} />
        <Route path="/projects/:id" element={<LegacyWorkspaceRedirect target="project" />} />
        <Route path="/projects/:id/:lang/:phase" element={<LegacyWorkspaceRedirect target="phase" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}