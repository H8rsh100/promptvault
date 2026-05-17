from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/prompts", tags=["prompts"])

@router.get("", response_model=List[schemas.PromptOut])
def get_all_prompts(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    return db.query(models.Prompt).order_by(models.Prompt.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/my", response_model=List[schemas.PromptOut])
def get_my_prompts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Prompt).filter(models.Prompt.user_id == current_user.id).order_by(models.Prompt.created_at.desc()).all()

@router.get("/search", response_model=List[schemas.PromptOut])
def search_prompts(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    search = f"%{q}%"
    return db.query(models.Prompt).filter(
        models.Prompt.title.ilike(search) |
        models.Prompt.content.ilike(search) |
        models.Prompt.tags.ilike(search)
    ).all()

@router.get("/{prompt_id}", response_model=schemas.PromptOut)
def get_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(models.Prompt).filter(models.Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt

@router.post("", response_model=schemas.PromptOut)
def create_prompt(
    prompt: schemas.PromptCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_prompt = models.Prompt(
        title=prompt.title,
        content=prompt.content,
        tags=prompt.tags,
        user_id=current_user.id
    )
    db.add(new_prompt)
    db.commit()
    db.refresh(new_prompt)
    return new_prompt

@router.put("/{prompt_id}", response_model=schemas.PromptOut)
def update_prompt(
    prompt_id: int,
    prompt_data: schemas.PromptUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    prompt = db.query(models.Prompt).filter(models.Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if prompt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this prompt")

    if prompt_data.title is not None: prompt.title = prompt_data.title
    if prompt_data.content is not None: prompt.content = prompt_data.content
    if prompt_data.tags is not None: prompt.tags = prompt_data.tags
    prompt.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(prompt)
    return prompt

@router.delete("/{prompt_id}")
def delete_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    prompt = db.query(models.Prompt).filter(models.Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    if prompt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this prompt")

    db.delete(prompt)
    db.commit()
    return {"message": "Prompt deleted successfully"}