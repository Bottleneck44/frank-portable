from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import features, predict, health

app = FastAPI(title="FinSight ML API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(features.router)
app.include_router(predict.router)
app.include_router(health.router)
