"""Firebase Google Auth token verification dependency."""

import os
import logging
from typing import Optional
from fastapi import Header, HTTPException, status
from google.oauth2 import id_token
from google.auth.transport import requests

logger = logging.getLogger(__name__)

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "gradientrush-b3f38")
_http_request = requests.Request()

class AuthenticatedUser:
    def __init__(self, user_id: str, email: Optional[str] = None, name: Optional[str] = None):
        self.user_id = user_id
        self.email = email
        self.name = name

async def get_current_user_optional(
    authorization: Optional[str] = Header(None)
) -> Optional[AuthenticatedUser]:
    """Extract and verify Firebase token if present. Returns None if unauthenticated."""
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split("Bearer ")[1].strip()
    try:
        claims = id_token.verify_firebase_token(
            token, _http_request, audience=FIREBASE_PROJECT_ID
        )
        user_id = claims.get("user_id") or claims.get("sub")
        if user_id:
            return AuthenticatedUser(
                user_id=user_id,
                email=claims.get("email"),
                name=claims.get("name")
            )
    except Exception as e:
        logger.warning(f"Firebase token verification failed: {e}")
    
    return None
