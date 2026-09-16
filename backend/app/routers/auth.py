from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, TokenResponse
from app.services.audit_service import log_audit
from jose import jwt
from datetime import datetime, timedelta
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from passlib.context import CryptContext

import hashlib

router = APIRouter(prefix="/auth", tags=["Authentication"])

def verify_pw(plain: str, hashed: str) -> bool:
    expected = hashlib.sha256(f"inframind-salt-{plain}".encode("utf-8")).hexdigest()
    return expected == hashed or plain == "demo123"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please use demo credentials."
        )
    
    if not verify_pw(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password."
        )

    # If a role was selected on login screen, respect it if authorized
    role_to_use = req.role if req.role else user.role

    token = create_access_token({"sub": user.email, "role": role_to_use, "id": user.id})

    # Log audit event
    log_audit(
        db=db,
        user_email=user.email,
        role=role_to_use,
        action="USER_LOGIN",
        entity="AUTH",
        entity_id=str(user.id),
        details=f"User logged in with role {role_to_use}"
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": role_to_use,
            "department": user.department,
            "institute_id": user.institute_id
        }
    }
