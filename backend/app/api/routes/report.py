from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Literal
from sqlmodel import select
from sqlalchemy.orm import selectinload
from ...models.models import Report, Alert, User, Zone
from ...models.schemas.report import (
    ReportCreate,
    ReportUpdate,
    ReportPublic,
    ReportsPublic,
)
from app.api.deps import (
    SessionDep,
    validate_fk_exists,
    require_session_user,
    require_controller,
)


report_router = APIRouter()


@report_router.get("/", response_model=ReportsPublic)
def list_reports(
    session: SessionDep,
    offset: int = 0,
    limit: int = 30,
    alert_id: Optional[int] = None,
    user_id: Optional[int] = None,
    report_factory_zone: Optional[int] = None,
    sort_by: Optional[str] = "report_reported_at",
    order: Literal["asc", "desc"] = "desc",
    _: User = Depends(require_session_user),
) -> ReportsPublic:
    """
    Get all reports.
    """
    query = select(Report).options(
        selectinload(Report.user),
        selectinload(Report.alert),
    )

    if alert_id is not None:
        query = query.where(Report.alert_id == alert_id)
    if user_id is not None:
        query = query.where(Report.user_id == user_id)
    if report_factory_zone is not None:
        query = query.where(Report.report_factory_zone == report_factory_zone)

    if hasattr(Report, sort_by):
        column = getattr(Report, sort_by)
        query = query.order_by(column.asc() if order == "asc" else column.desc())

    reports = session.exec(query.offset(offset).limit(limit)).all()
    return ReportsPublic(
        data=[ReportPublic.model_validate(report) for report in reports]
    )


@report_router.get("/{report_id}", response_model=ReportPublic)
def get_report(
    report_id: int,
    session: SessionDep,
    _: User = Depends(require_session_user),
) -> ReportPublic:
    """
    Get a specific report by ID.
    """
    query = (
        select(Report)
        .where(Report.report_id == report_id)
        .options(selectinload(Report.user), selectinload(Report.alert))
    )
    report = session.exec(query).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@report_router.post("/", response_model=ReportPublic)
def create_report(
    report_in: ReportCreate,
    session: SessionDep,
    user: User = Depends(require_session_user),
) -> ReportPublic:
    """
    Create a new report.
    """
    validate_fk_exists(session, Alert, report_in.alert_id, "alert_id")
    validate_fk_exists(
        session, Zone, report_in.report_factory_zone, "report_factory_zone"
    )

    report = Report.model_validate(report_in)
    report.user_id = user.user_id
    session.add(report)
    session.commit()
    session.refresh(report)
    return report


@report_router.patch("/{report_id}", response_model=ReportPublic)
def update_report(
    report_id: int,
    report_in: ReportUpdate,
    session: SessionDep,
    _: User = Depends(require_controller),
) -> ReportPublic:
    """
    Update a report's information.
    """
    report = session.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    update_dict = report_in.model_dump(exclude_unset=True)
    report.sqlmodel_update(update_dict)

    session.add(report)
    session.commit()
    session.refresh(report)
    return report


@report_router.delete("/{report_id}")
def delete_report(
    report_id: int,
    session: SessionDep,
    _: User = Depends(require_controller),
) -> dict:
    """
    Delete a report by ID.
    """
    report = session.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    session.delete(report)
    session.commit()
    return {"message": f"Report {report_id} deleted successfully"}
