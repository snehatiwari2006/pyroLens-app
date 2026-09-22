from fastapi import APIRouter

from .endpoints import hotspots, impact, predict

api_router = APIRouter()
api_router.include_router(hotspots.router)
api_router.include_router(predict.router)
api_router.include_router(impact.router)
