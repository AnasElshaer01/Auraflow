from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from database import get_db
from models import Alert

router = APIRouter()


@router.get("/alerts", response_model=list[Alert])
def list_alerts(
    unread_only: Optional[bool] = Query(None, alias="unreadOnly"),
    limit: int = Query(20),
    db: Session = Depends(get_db),
):
    params: dict = {"limit": limit}
    where = ""
    if unread_only:
        where = "WHERE is_read = FALSE"

    rows = db.execute(
        text(f"SELECT * FROM alerts {where} ORDER BY created_at DESC LIMIT :limit"),
        params,
    ).fetchall()
    return [dict(r._mapping) for r in rows]


@router.patch("/alerts/{id}/read", response_model=Alert)
def mark_alert_read(id: int, db: Session = Depends(get_db)):
    row = db.execute(
        text("UPDATE alerts SET is_read = TRUE WHERE id = :id RETURNING *"),
        {"id": id},
    ).fetchone()
    db.commit()
    if not row:
        raise HTTPException(status_code=404, detail="Alert not found")
    return dict(row._mapping)


@router.patch("/alerts/read-all")
def mark_all_alerts_read(db: Session = Depends(get_db)):
    db.execute(text("UPDATE alerts SET is_read = TRUE WHERE is_read = FALSE"))
    db.commit()
    return {"ok": True}
