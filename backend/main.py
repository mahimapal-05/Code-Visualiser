import os
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn

from backend.runner import execute_code
from backend.agents import compile_visual_trace, chat_with_explainer

app = FastAPI(title="Visual Code Playground API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    language: str

class ChatRequest(BaseModel):
    code: str
    language: str
    message: str
    history: List[Dict[str, str]]

@app.get("/api/health")
async def health_check():
    """
    Checks backend status and verifies if Groq API key is present in environment.
    """
    api_key = os.getenv("GROQ_API_KEY")
    return {
        "status": "healthy",
        "has_groq_key": bool(api_key),
        "message": "Connected successfully to Visualizer Backend" if api_key else "Connected in Offline Demo Mode"
    }

@app.post("/api/run-code")
async def run_code(payload: CodeRequest):
    """
    Executes Python or Java code in a local subprocess and returns stdout/stderr.
    """
    try:
        result = execute_code(payload.code, payload.language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code execution wrapper failed: {str(e)}")

@app.post("/api/visualize")
async def visualize_code(payload: CodeRequest):
    """
    Compiles code execution and returns step-by-step visual frames.
    """
    try:
        result = compile_visual_trace(payload.code, payload.language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Visualizer compilation agent failed: {str(e)}")

@app.post("/api/chat")
async def chat_explain(payload: ChatRequest):
    """
    Query the agentic coach about code execution or visuals using RAG.
    """
    try:
        result = chat_with_explainer(
            code=payload.code,
            language=payload.language,
            user_message=payload.message,
            chat_history=payload.history
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat agent failed: {str(e)}")

# Serve frontend build in production
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
frontend_dist = os.path.join(BASE_DIR, "dist")

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        if catchall.startswith("api/") or catchall.startswith("docs") or catchall.startswith("openapi.json"):
            return None
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Frontend assets not compiled.")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
