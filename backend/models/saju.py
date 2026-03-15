from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Saju(SQLModel, table=True):
    __tablename__ = "saju"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    name: str = Field(max_length=255)
    relation: Optional[str] = Field(default=None, max_length=255)
    birthdate: str = Field(max_length=32)
    birth_time: Optional[str] = Field(default=None, max_length=32)
    calendar_type: str = Field(max_length=32)
    gender: str = Field(max_length=32)
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
