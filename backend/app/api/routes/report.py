from fastapi import APIRouter, HTTPException
from sqlmodel import select
from ...models.models import Report
from ...models.schemas.report import (
    ReportCreate,
    ReportUpdate,
    ReportPublic,
    ReportsPublic,
)
from app.api.deps import SessionDep

report_router = APIRouter()


@report_router.get("/", response_model=ReportsPublic)
def list_reports(session: SessionDep) -> ReportsPublic:
    """
    Get all reports.
    """
    reports = session.exec(select(Report)).all()
    return ReportsPublic(
        data=[ReportPublic.model_validate(report) for report in reports]
    )


@report_router.get("/{report_id}", response_model=ReportPublic)
def get_report(report_id: int, session: SessionDep) -> ReportPublic:
    """
    Get a specific report by ID.
    """
    report = session.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@report_router.post("/", response_model=ReportPublic)
def create_report(report_in: ReportCreate, session: SessionDep) -> ReportPublic:
    """
    Create a new report.
    """
    report = Report.model_validate(report_in)
    session.add(report)
    session.commit()
    session.refresh(report)
    return report


@report_router.patch("/{report_id}", response_model=ReportPublic)
def update_report(
    report_id: int,
    report_in: ReportUpdate,
    session: SessionDep,
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
def delete_report(report_id: int, session: SessionDep) -> dict:
    """
    Delete a report by ID.
    """
    report = session.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    session.delete(report)
    session.commit()
    return {"message": f"Report {report_id} deleted successfully"}
