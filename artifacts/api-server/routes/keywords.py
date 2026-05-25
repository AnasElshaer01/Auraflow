from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Keyword, KeywordCreate

router = APIRouter()


@router.get("/keywords", response_model=list[Keyword])
def list_keywords(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM keywords ORDER BY created_at ASC")).fetchall()
    return [dict(r._mapping) for r in rows]


@router.post("/keywords", response_model=Keyword, status_code=201)
def create_keyword(payload: KeywordCreate, db: Session = Depends(get_db)):
    if payload.type not in ("brand", "competitor", "keyword"):
        raise HTTPException(status_code=400, detail="type must be brand, competitor, or keyword")
    row = db.execute(
        text("INSERT INTO keywords (text, type) VALUES (:text, :type) RETURNING *"),
        {"text": payload.text, "type": payload.type},
    ).fetchone()
    db.commit()
    return dict(row._mapping)


@router.delete("/keywords/{id}", status_code=204)
def delete_keyword(id: int, db: Session = Depends(get_db)):
    result = db.execute(text("DELETE FROM keywords WHERE id = :id RETURNING id"), {"id": id})
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Keyword not found")
