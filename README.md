# FinSight — Stock Analysis Platform

Full-stack AI-powered stock analysis: 30+ forensic rules + 4 ML models (XGBoost, Random Forest, LightGBM, LSTM) for NIFTY 50 stocks.

## Requirements

- **Node.js** 18+ — https://nodejs.org
- **Python** 3.11 — https://python.org (must be 3.11, not 3.12+)

## Quick Start

### Windows
```
start.bat
```

### Mac / Linux
```
chmod +x start.sh && ./start.sh
```

### Manual (step by step)

**Terminal 1 — ML API:**
```bash
cd apps/api
python3.11 -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Web App:**
```bash
cd apps/web
npm install
npm run dev
```

Then open http://localhost:3000

## Project Structure

```
finsight/
├── apps/
│   ├── web/          # Next.js 16 frontend
│   │   ├── app/      # App Router pages
│   │   ├── components/
│   │   └── lib/engine/   # Rules engine + fusion
│   └── api/          # FastAPI ML backend
│       ├── routers/
│       ├── services/ # Feature engineering + inference
│       ├── models/   # Pre-trained model files (Git LFS)
│       └── requirements.txt
├── start.bat         # Windows one-click start
├── start.sh          # Mac/Linux one-click start
└── README.md
```

## Notes

- The ML backend is optional — fundamental analysis works without it
- Models are stored via Git LFS; run `git lfs pull` after cloning if models are missing
- Supported tickers: 49 NIFTY 50 stocks (HDFCBANK, RELIANCE, TCS, INFY, etc.)
