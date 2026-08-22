import React, { createContext, useContext, useState, useEffect } from "react";
import { listProjects, createProject, deleteProject } from "../api/client";

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await listProjects();
      setProjects(data);

      const savedProjectId = localStorage.getItem("gradientrush_active_project_id");
      if (savedProjectId === "all" || savedProjectId === null) {
        // All workspaces view
        setCurrentProject(null);
      } else {
        const matched = data.find((p) => p.id === savedProjectId);
        if (matched) {
          setCurrentProject(matched);
        } else if (data.length > 0) {
          setCurrentProject(null);
        }
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const switchProject = (projectId) => {
    if (!projectId || projectId === "all") {
      setCurrentProject(null);
      localStorage.setItem("gradientrush_active_project_id", "all");
      return;
    }
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      setCurrentProject(proj);
      localStorage.setItem("gradientrush_active_project_id", proj.id);
    }
  };

  const handleCreateProject = async (name, description) => {
    const created = await createProject({ name, description });
    await fetchProjects();
    switchProject(created.id);
    return created;
  };

  const handleDeleteProject = async (projectId) => {
    await deleteProject(projectId);
    await fetchProjects();
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        loading,
        switchProject,
        createProject: handleCreateProject,
        deleteProject: handleDeleteProject,
        refreshProjects: fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
