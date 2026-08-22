"""Projects (Workspaces) API router."""

import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.connection import get_session
from backend.app.database.models import Project, Source, Evidence
from backend.app.auth.verifier import get_current_user_optional, AuthenticatedUser

router = APIRouter(prefix="/api/projects", tags=["projects"])


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    created_at: datetime
    sources_count: int = 0
    evidence_count: int = 0

    class Config:
        from_attributes = True


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    session: AsyncSession = Depends(get_session),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
):
    """List all projects/workspaces for current user with source and evidence counts."""
    stmt = select(Project)
    if current_user:
        stmt = stmt.where((Project.user_id == current_user.user_id) | (Project.user_id.is_(None)))
    stmt = stmt.order_by(Project.created_at.desc())

    result = await session.execute(stmt)
    projects = result.scalars().all()

    project_list = []
    for p in projects:
        # Count sources
        src_res = await session.execute(
            select(func.count(Source.id)).where(Source.project_id == p.id)
        )
        sources_count = src_res.scalar() or 0

        # Count evidence
        ev_res = await session.execute(
            select(func.count(Evidence.id))
            .join(Source, Evidence.source_id == Source.id)
            .where(Source.project_id == p.id)
        )
        evidence_count = ev_res.scalar() or 0

        project_list.append(
            ProjectResponse(
                id=p.id,
                name=p.name,
                description=p.description,
                created_at=p.created_at,
                sources_count=sources_count,
                evidence_count=evidence_count,
            )
        )

    return project_list


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    session: AsyncSession = Depends(get_session),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
):
    """Create a new project workspace scoped to current user."""
    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Project name cannot be empty")

    new_project = Project(
        name=data.name.strip(),
        description=data.description.strip() if data.description else None,
        user_id=current_user.user_id if current_user else None,
    )
    session.add(new_project)
    await session.commit()
    await session.refresh(new_project)

    return ProjectResponse(
        id=new_project.id,
        name=new_project.name,
        description=new_project.description,
        created_at=new_project.created_at,
        sources_count=0,
        evidence_count=0,
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get project details."""
    result = await session.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    src_res = await session.execute(
        select(func.count(Source.id)).where(Source.project_id == project.id)
    )
    sources_count = src_res.scalar() or 0

    ev_res = await session.execute(
        select(func.count(Evidence.id))
        .join(Source, Evidence.source_id == Source.id)
        .where(Source.project_id == project.id)
    )
    evidence_count = ev_res.scalar() or 0

    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        sources_count=sources_count,
        evidence_count=evidence_count,
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    """Delete a project and cascade-delete all its sources & evidence."""
    result = await session.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    await session.delete(project)
    await session.commit()
