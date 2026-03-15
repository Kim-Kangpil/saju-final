from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Inquiry(SQLModel, table=True):
    __tablename__ = "inquiries"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    email: str = Field(max_length=255)
    subject: str = Field(max_length=255)
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
