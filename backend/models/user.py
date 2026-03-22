from datetime import datetime
from typing import Optional

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("provider", "provider_id", name="uq_users_provider_provider_id"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    provider: str = Field(max_length=64)
    provider_id: str = Field(max_length=255)
    email: Optional[str] = Field(default=None, max_length=255)
    nickname: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    last_login: datetime = Field(default_factory=lambda: datetime.utcnow())
    seed_balance: int = Field(default=0)
    is_member: bool = Field(default=False)
    membership_started_at: Optional[datetime] = Field(default=None)
    membership_expires_at: Optional[datetime] = Field(default=None)
