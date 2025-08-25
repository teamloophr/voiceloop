import os
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from jose import JWTError, jwt as jose_jwt

class AuthService:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-here')
        self.algorithm = "HS256"
        self.access_token_expire_minutes = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', 30))
        self.refresh_token_expire_days = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRE_DAYS', 7))
    
    def create_access_token(self, data: Dict[str, Any]) -> str:
        """Create a new access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create a new refresh token"""
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
    
    def get_user_from_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Extract user information from token"""
        payload = self.verify_token(token)
        if payload:
            user_id = payload.get("sub")
            if user_id:
                return {
                    "user_id": user_id,
                    "email": payload.get("email"),
                    "permissions": payload.get("permissions", [])
                }
        return None
    
    def refresh_access_token(self, refresh_token: str) -> Optional[str]:
        """Refresh an access token using a refresh token"""
        try:
            payload = jwt.decode(refresh_token, self.secret_key, algorithms=[self.algorithm])
            user_id = payload.get("sub")
            if user_id:
                return self.create_access_token({"sub": user_id})
        except JWTError:
            return None
        return None
    
    def validate_permissions(self, user_permissions: list, required_permissions: list) -> bool:
        """Validate if user has required permissions"""
        if not required_permissions:
            return True
        
        if not user_permissions:
            return False
        
        return all(perm in user_permissions for perm in required_permissions)
    
    def create_tokens_pair(self, user_data: Dict[str, Any]) -> Dict[str, str]:
        """Create both access and refresh tokens"""
        access_token = self.create_access_token(user_data)
        refresh_token = self.create_refresh_token(user_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    def decode_token_header(self, auth_header: str) -> Optional[str]:
        """Extract token from Authorization header"""
        if not auth_header:
            return None
        
        try:
            scheme, token = auth_header.split()
            if scheme.lower() != "bearer":
                return None
            return token
        except ValueError:
            return None
    
    def authenticate_user(self, auth_header: str) -> Optional[Dict[str, Any]]:
        """Authenticate user from Authorization header"""
        token = self.decode_token_header(auth_header)
        if not token:
            return None
        
        return self.get_user_from_token(token)
