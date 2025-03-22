from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from .api.web3_routes.routes import router as web3_router
from .api.chatagent_routes.routes import router as chatagent_router
# from .api.chatagent_routes.routes import router as chatagent_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent manager at startup
app.include_router(web3_router, prefix="/blend", tags=["web3"])
app.include_router(chatagent_router, prefix="/aigent", tags=["aigent"])