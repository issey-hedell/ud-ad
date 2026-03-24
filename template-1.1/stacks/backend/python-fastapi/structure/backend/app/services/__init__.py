"""ビジネスロジック層

使用例:
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import UserCreate

class UserService:
    def get_by_id(self, db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, data: UserCreate) -> User:
        user = User(**data.model_dump())
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

user_service = UserService()
"""
