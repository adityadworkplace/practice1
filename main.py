import re
from fastapi import FastAPI, HTTPException, Depends, Request, Form
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from typing import List, Annotated, Optional
import models
from db import SessionLocal, engine
from sqlalchemy.orm import Session
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
models.Base.metadata.create_all(bind=engine)

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
]

app.add_middleware(
    CORSMiddleware, 
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
temp = Jinja2Templates(directory=BASE_DIR/"templates")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@app.post('/items/')
async def create_items(request : Request, db : db_dependency, tag = Form(...), price = Form(...), description : Optional[str] = Form(None)):
    if ( not tag ) or ( not price ) :
        raise HTTPException(status_code=400, detail="Tag and Price are required fields.")
    if not re.fullmatch(r'[a-zA-Z0-9_-]+', tag):
        raise HTTPException(status_code=400, detail="Tag contains invalid characters.")
    if ( price < '0' ):
        raise HTTPException(status_code=400, detail="Price must be a positive value.")
    if ( len(tag) > 50 ):
        raise HTTPException(status_code=400, detail="Tag length must not exceed 50 characters.")
    if description and ( len(description) < 3 or len(description) > 200 ):
        raise HTTPException(status_code=400, detail="Description must be 3–200 characters.")
    db_item = models.Item(tag = tag, price = price, description = description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    db.commit()

@app.post('/attribute/{item_id}')
async def create_attributes(item_id : int, db : db_dependency, name = Form(...), description = Form(...)):
    if ( not name ) :
        raise HTTPException(status_code=400, detail="Name is required.")
    if ( len(name) > 50 ):
        raise HTTPException(status_code=400, detail="Name length must not exceed 50 characters.")
    if len(description) < 3 or len(description) > 200 :
        raise HTTPException(status_code=400, detail="Description length must be between 3 and 200 characters.")
    db_item = models.Attributes(name = name, item_id = item_id, description = description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get('/get_items')
async def read_items(db : db_dependency):
    result = db.query(models.Item).all()
    return result

@app.get('/get_items/{item_id}')
async def read_items(item_id: int, db : db_dependency):
    result = db.query(models.Item).filter(models.Item.id == item_id).first()
    return result

@app.get('/get_attributes/{item_id}')
async def attr(item_id: int, db : db_dependency):
    result = db.query(models.Attributes).filter(models.Attributes.item_id == item_id).all()
    return result

@app.delete('/items/{item_id}/delete')
async def delete_item(item_id: int, db : db_dependency):
    db.query(models.Attributes).filter(models.Attributes.item_id == item_id).delete()
    db.query(models.Item).filter(models.Item.id == item_id).delete()
    db.commit()

@app.put('/items/{item_id}/update')
async def update_item(item_id: int, db : db_dependency, tag: str = Form(...), price: float = Form(...), description : Optional[str] = Form(None)):
    if not re.fullmatch(r'[a-zA-Z0-9_-]+', tag):
        raise HTTPException(status_code=400, detail="Tag contains invalid characters.")
    if ( price < 0 ):
        raise HTTPException(status_code=400, detail="Price must be a positive value.")
    if ( len(tag) > 50 ):
        raise HTTPException(status_code=400, detail="Tag length must not exceed 50 characters.")
    if description and ( len(description) < 3 or len(description) > 200 ):
        raise HTTPException(status_code=400, detail="Description length must be between 3 and 200 characters.")
    result = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Item not found.")
    result.tag = tag
    result.price = price
    result.description = description
    db.commit()
    db.refresh(result)

@app.get('/searchitems/')
async def searchitems( db : db_dependency, q: Optional[str] = None):
    if q:
        result = db.query(models.Item).filter((models.Item.tag.contains(q)) | (models.Item.description.contains(q))).all()
    else:
        result = db.query(models.Item).all()
    return result

@app.get('/get_sorteditems')
async def get_sorteditems(db : db_dependency):
    result = db.query(models.Item).order_by(models.Item.tag.asc()).all()
    return result