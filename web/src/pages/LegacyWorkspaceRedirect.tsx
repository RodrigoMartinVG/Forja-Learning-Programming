import { Navigate, useParams } from "react-router-dom";

type LegacyWorkspaceRedirectProps = {
  target: "level" | "project" | "phase";
};

export function LegacyWorkspaceRedirect({ target }: LegacyWorkspaceRedirectProps) {
  const { slug, id, lang, phase } = useParams();

  if (target === "level" && slug) {
    return <Navigate replace to={`/workspace?mode=focus&level=${encodeURIComponent(slug)}`} />;
  }

  if (target === "project" && id) {
    return <Navigate replace to={`/workspace?mode=focus&project=${encodeURIComponent(id)}`} />;
  }

  if (target === "phase" && id && lang && phase) {
    return (
      <Navigate
        replace
        to={`/workspace?mode=focus&project=${encodeURIComponent(id)}&lang=${encodeURIComponent(lang)}&phase=${encodeURIComponent(phase)}`}
      />
    );
  }

  return <Navigate replace to="/workspace" />;
}