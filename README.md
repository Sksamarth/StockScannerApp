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

### 3. Frontend (Web)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 4. Android APK Build
Requirements: Android Studio + JDK 17+

```bash
cd frontend
npm run android        # builds React + syncs to Android project
npm run cap:open       # opens Android Studio → Build → Generate APK
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

## Pages
1. Login — Enter Upstox API Key + Access Token (dynamic, no hardcoding)
2. Dashboard — Stats, market status, quick scanner controls
3. Scanner — Full config: market, timeframe, interval, strategy
4. Live Alerts — Real-time BUY/SELL signal cards with filters
5. Alert History — Full history table with clear option
6. Strategy Manager — Monaco code editor + 11 built-in templates
7. Settings — Update credentials, theme, notifications

## Usage
1. Open the app → Enter your Upstox API Key + Access Token
2. Go to **Strategies** → Create or pick a built-in template
3. Go to **Scanner** → Select market, timeframe, interval → Start
4. Live alerts appear on **Alerts** page in real time
5. Notifications fire automatically (sound + vibration + push)
