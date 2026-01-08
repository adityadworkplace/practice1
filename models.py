from sqlalchemy import Boolean, Integer, Column, ForeignKey, String
from db import Base

class Item(Base):
    __tablename__ = 'items'

    id = Column(Integer, primary_key=True, index=True)
    tag = Column(String, index=True)
    price = Column(Integer, index=True)
    description = Column(String, index=True)

class Attributes(Base):
    __tablename__ = 'Attributes'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, index=True)
    item_id = Column(Integer,ForeignKey("items.id"))