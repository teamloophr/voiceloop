import os
import jwt
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from jose import JWTError, jwt as jose_jwt

class AuthService:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'voiceloop-secret-key-2024')
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        self.refresh_token_expire_days = 7
    
    def create_access_token(self, data: Dict[str, Any]) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create a JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            return None
    
    def get_current_user(self, token: str) -> Optional[Dict[str, Any]]:
        """Get current user from token"""
        payload = self.verify_token(token)
        if payload is None:
            return None
        
        user_id = payload.get("sub")
        if user_id is None:
            return None
        
        return {
            "user_id": user_id,
            "email": payload.get("email"),
            "permissions": payload.get("permissions", [])
        }
    
    def generate_user_tokens(self, user_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate both access and refresh tokens for a user"""
        access_token = self.create_access_token(
            data={"sub": user_data["user_id"], "email": user_data.get("email")}
        )
        refresh_token = self.create_refresh_token(
            data={"sub": user_data["user_id"], "email": user_data.get("email")}
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    def refresh_access_token(self, refresh_token: str) -> Optional[Dict[str, str]]:
        """Refresh an access token using a refresh token"""
        try:
            payload = jwt.decode(refresh_token, self.secret_key, algorithms=[self.algorithm])
            user_id = payload.get("sub")
            
            if user_id is None:
                return None
            
            # Create new access token
            access_token = self.create_access_token(
                data={"sub": user_id, "email": payload.get("email")}
            )
            
            return {
                "access_token": access_token,
                "token_type": "bearer"
            }
            
        except JWTError:
            return None
    
    def validate_user_permissions(self, user: Dict[str, Any], required_permissions: list) -> bool:
        """Validate if user has required permissions"""
        if not user or "permissions" not in user:
            return False
        
        user_permissions = user["permissions"]
        return all(perm in user_permissions for perm in required_permissions)
    
    def create_anonymous_user(self) -> Dict[str, Any]:
        """Create an anonymous user for demo/testing purposes"""
        user_id = str(uuid.uuid4())
        return {
            "user_id": user_id,
            "email": f"anonymous_{user_id[:8]}@voiceloop.local",
            "permissions": ["read", "upload"],
            "is_anonymous": True
        }
