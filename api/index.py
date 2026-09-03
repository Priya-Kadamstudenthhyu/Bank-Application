import sys
from pathlib import Path

# Make the Flask package importable when Vercel runs this function from /api.
backend_path = Path(__file__).resolve().parents[1] / "banking_app" / "backend"
sys.path.insert(0, str(backend_path))

from app import create_app

app = create_app()
