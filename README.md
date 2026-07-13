# StockScanner

A hybrid NSE/BSE stock scanner app for Web and Android.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Broker API**: Upstox API
- **Mobile**: Capacitor (React → Android APK)

## Setup

### 1. Supabase
Run `supabase_schema.sql` in your Supabase SQL Editor to create the required tables.

### 2. Backend
```bash
cd backend
cp .env.example .env   # fill in your Supabase service role key
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env   # already has Supabase public keys
npm install
npm run dev
```

## Environment Variables

### backend/.env
```
SUPABASE_URL=https://xqnphexczolgckivujlq.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
PORT=5000
```

### frontend/.env
```
VITE_SUPABASE_URL=https://xqnphexczolgckivujlq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_BACKEND_URL=http://localhost:5000
```

## Usage
1. Open the app → Enter your Upstox API Key + Access Token
2. Go to **Strategies** → Create or pick a built-in template
3. Go to **Scanner** → Select market, timeframe, interval → Start
4. Live alerts appear on **Alerts** page in real time
