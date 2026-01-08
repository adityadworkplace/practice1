from fastapi import FastAPI, HTTPException, Depends, Request, Form
from fastapi.responses import RedirectResponse
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
    "http://127.0.0.1:5500",  # your frontend origin
    "http://localhost:5500"
]

app.add_middleware(
    CORSMiddleware, 
    allow_origins=origins,  # or ["*"] for all origins (less secure)
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
async def create_items(request : Request, db : db_dependency, tag = Form(...), price = Form(...), description = Form(...)):
    db_item = models.Item(tag = tag, price = price, description = description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    db.commit()

@app.post('/attribute/{item_id}')
async def create_attributes(request : Request, item_id : int, db : db_dependency, name = Form(...), description = Form(...)):
    db_item = models.Attributes(name = name, item_id = item_id, description = description)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    db.commit()

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
async def update_item(item_id: int, db : db_dependency, tag = Form(...), price = Form(...), description = Form(...)):
    result = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not result:
        raise HTTPException(status_code=404,detail='Item not found')
    result.tag = tag
    result.price = price
    result.description = description
    db.commit()
    db.refresh(result)