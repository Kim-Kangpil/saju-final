from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Payment(SQLModel, table=True):
    __tablename__ = "payments"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(max_length=64)
    payment_id: str = Field(max_length=255)
    order_id: str = Field(max_length=255, unique=True)
    status: str = Field(max_length=64)
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
