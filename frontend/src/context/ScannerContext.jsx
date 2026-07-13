import { createContext, useContext, useState, useRef, useEffect } from 'react'
import api from '../lib/api'
import { fireAlertNotification, requestNotificationPermission } from '../lib/notifications'

const ScannerContext = createContext(null)

export function ScannerProvider({ children }) {
  const [status, setStatus] = useState('stopped')
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState({ scanned: 0, matched: 0, lastScan: null })
  const intervalRef = useRef(null)
  const configRef = useRef(null)

  useEffect(() => { requestNotificationPermission() }, [])

  const processResults = (data) => {
    if (data.alerts?.length) {
      data.alerts.forEach((a) => fireAlertNotification(a.symbol, a.signal, a.price))
      setAlerts((prev) => {
        const existingIds = new Set(prev.map((p) => `${p.symbol}-${p.time}`))
        const newAlerts = data.alerts.filter((a) => !existingIds.has(`${a.symbol}-${a.time}`))
        return [...newAlerts, ...prev].slice(0, 500)
      })
    }
    setStats(data?.stats || { scanned: 0, matched: 0, lastScan: null })
  }

  const run = async () => {
    try {
      const res = await api.post('/scanner/run', configRef.current)
      processResults(res.data)
    } catch (e) {
      console.error('Scanner error', e)
    }
  }

  const start = async (config) => {
    configRef.current = config
    setStatus('running')
    await run()
    intervalRef.current = setInterval(run, (config.interval || 60) * 1000)
  }

  const pause = () => {
    clearInterval(intervalRef.current)
    setStatus('paused')
  }

  const resume = (config) => {
    configRef.current = config
    setStatus('running')
    intervalRef.current = setInterval(run, (config.interval || 60) * 1000)
  }

  const stop = () => {
    clearInterval(intervalRef.current)
    setStatus('stopped')
    setAlerts([])
    setStats({ scanned: 0, matched: 0, lastScan: null })
  }

  return (
    <ScannerContext.Provider value={{ status, alerts, stats, start, pause, resume, stop }}>
      {children}
    </ScannerContext.Provider>
  )
}

export const useScanner = () => useContext(ScannerContext)
