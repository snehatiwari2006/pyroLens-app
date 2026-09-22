"""Shared FastAPI auth dependencies used by both legacy and v1 routes."""
try:
    import jwt
except ImportError:
    jwt = None
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..config import get_settings

security = HTTPBearer(auto_error=False)


def require_role(*allowed_roles: str):
    async def dependency(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict:
        settings = get_settings()
        if settings.environment == "development" and credentials is None:
            return {"sub": "demo-analyst", "role": "analyst"}
        if settings.public_read_api and credentials is None and "viewer" in allowed_roles:
            return {"sub": "public-dashboard", "role": "viewer"}
        if credentials is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        if jwt is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="PyJWT is required for authenticated requests",
            )
        try:
            if settings.oidc_jwks_url:
                signing_key = jwt.PyJWKClient(settings.oidc_jwks_url).get_signing_key_from_jwt(credentials.credentials)
                claims = jwt.decode(
                    credentials.credentials,
                    signing_key.key,
                    algorithms=["RS256"],
                    audience=settings.oidc_audience,
                    issuer=settings.oidc_issuer,
                    options={"verify_aud": bool(settings.oidc_audience), "verify_iss": bool(settings.oidc_issuer)},
                )
            else:
                claims = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        except jwt.PyJWTError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
        roles = claims.get("roles", [claims.get("role")])
        if not any(role in allowed_roles for role in roles):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return claims

    return dependency
