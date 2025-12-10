# Sentiment Curator Backend

FastAPI backend for Sentiment Curator project.

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Setup environment variables
cp ../.env.example .env
# Edit .env and add your API keys
```

## Run

```bash
# Development server with hot reload
uvicorn app.main:app --reload

# Or use the start script from project root
cd ..
.\start_dev.ps1
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/
```
