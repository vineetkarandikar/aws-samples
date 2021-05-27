from typing import List
from functools import wraps
import json
import models
import schemas
from database import SessionLocal, engine
from dependency import headers_dep
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse
import service
import logging

def get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def auth_check(roles):
    def decorator_auth(func):
        @wraps(func)
        def wrapper_auth(*args, **kwargs):
            Authorize = kwargs['Authorize']
            db = kwargs['db']
            Authorize.jwt_required()
            current_user = Authorize.get_jwt_subject()
            print(current_user)
            current_user = current_user.replace("\'", "\"")
            role = json.loads(current_user)
            print(role["id"])
            user_role = db.query(models.UserRole).filter(
                models.UserRole.user_id == role["id"]).first()
            print(user_role.role_name)
            role_names = user_role.role_name
            role_in_db = role_names.split(",")
            for role in role_in_db:
                if role in roles:
                    return func(*args, **kwargs)
            return JSONResponse(
                status_code=401,
                content={"detail": "Unauthorized"})
            
        return wrapper_auth
    return decorator_auth

  @service.auth_check(roles = ["user"])
@router.get("/detail/", response_model=schemas.User)
def user_details(Authorize: AuthJWT = Depends(),db: Session = Depends(service.get_db)):
    logger.info("user details fetching started!")
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    current_user = current_user.replace("\'", "\"")
    user_info = json.loads(current_user)
    user_id = user_info["id"]
    records = db.query(models.User).filter(models.User.user_id == user_id).first()
    return records
                 
