# SETUP GUIDE - Strategy Persistence Fix

## ✅ What This Fixes
- **Problem**: When you select a strategy in Scanner, it doesn't show or save
- **Solution**: Now strategies are saved to database and restored when you visit the page

---

## 📋 STEP-BY-STEP SETUP

### STEP 1: Create Database Table in Supabase

1. Go to your **Supabase Dashboard**
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire content from **`supabase_scanner_config.sql`** file
5. Click **Run** button (or press Ctrl+Enter)
6. Wait for success message ✓

**What this does**: Creates a table to store your scanner settings (strategy, market, timeframe, interval)

---

### STEP 2: Redeploy Backend

Your backend already has the new endpoints. Just redeploy:

**Option A - Using Railway (if you use Railway)**
1. Push to GitHub: Changes are already pushed to `fix/strategy-persistence` branch
2. Railway auto-deploys on push
3. Wait 2-3 minutes for deployment to complete

**Option B - Manual Deploy**
1. Go to your backend deployment service
2. Redeploy/restart the service

---

### STEP 3: Deploy Frontend to Vercel

Your frontend code is updated. Deploy it:

1. Go to **Vercel** (https://vercel.com)
2. Select your **StockScannerApp** project
3. Click **Deployments** tab
4. Find the deployment from branch **`fix/strategy-persistence`**
5. Click it and select **Promote to Production**
   OR
6. Merge the PR to main branch and Vercel auto-deploys

---

## 🧪 TEST IT

### Test 1: Save Strategy
1. Open your app: https://frontend-nine-mu-j13k6l6oc9.vercel.app/scanner
2. Click **Strategy** dropdown
3. Select any strategy from the list
4. You should see green text below: **"✓ Selected: [Strategy Name]"**
5. Refresh the page
6. Your strategy should still be selected ✅

### Test 2: Save Other Settings
1. Change **Market Category** → select "Bank Nifty"
2. Change **Timeframe** → click "5min"
3. Change **Scan Interval** → click "5 min"
4. Refresh page
5. All settings should be restored ✅

---

## 📁 Files Changed

Here's what we changed on GitHub:

```
✅ backend/routes/scanner.js
   - Added GET /scanner/config endpoint (loads saved config)
   - Added POST /scanner/config endpoint (saves config)

✅ frontend/src/pages/Scanner.jsx
   - Added auto-load of saved config on page open
   - Added auto-save when you change strategy/market/timeframe/interval
   - Shows "✓ Selected: [Name]" indicator when strategy is saved

✅ supabase_scanner_config.sql
   - SQL migration file (run this in Supabase)
```

---

## 🔧 If It's Not Working

**Issue 1: Strategies still not showing in dropdown**
- Check backend is running: Visit `http://localhost:5000/strategies` in browser
- If blank, check x-api-key header is being sent

**Issue 2: Config not saving**
- Open browser DevTools (F12)
- Go to **Console** tab
- Look for error messages
- Share the error in chat

**Issue 3: "Loading configuration..." stays forever**
- Backend might be down
- Vercel/Railway deployment might have failed
- Check deployment logs

---

## 📱 Key Changes Explained Simply

### **Before (Old Code)**
```javascript
// Only saved in browser memory - lost on refresh
const [config, setConfig] = useState({ strategy_id: '' })
```

### **After (New Code)**
```javascript
// Automatically loads from database on page open
useEffect(() => {
  const configRes = await api.get('/scanner/config')  // ← Loads from database
  setConfig(configRes.data)
}, [])

// Automatically saves to database when you change strategy
const handleStrategyChange = async (strategyId) => {
  await api.post('/scanner/config', { ...config, strategy_id: strategyId })  // ← Saves to database
}
```

---

## 🚀 DEPLOYMENT SUMMARY

| Component | Branch | Status | Deploy To |
|-----------|--------|--------|-----------|
| Backend | `fix/strategy-persistence` | Ready | Railway/Your Server |
| Frontend | `fix/strategy-persistence` | Ready | Vercel |
| Database | - | Need Setup | Supabase (manual SQL) |

---

## ❓ Need Help?

If anything doesn't work:
1. Check the deployment logs
2. Open browser console (F12 → Console)
3. Look for error messages
4. Share the error with me

Let me know when you've completed Step 1 (Supabase SQL) and I can help debug!
