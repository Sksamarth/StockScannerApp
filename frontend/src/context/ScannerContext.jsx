import { createContext, useContext, useState, useRef } from 'react'
import api from '../lib/api'

const ScannerContext = createContext(null)

export function ScannerProvider({ children }) {
  const [status, setStatus] = useState('stopped') // running | paused | stopped
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState({ scanned: 0, matched: 0, lastScan: null })
  const intervalRef = useRef(null)

  const start = async (config) => {
    setStatus('running')
    const run = async () => {
      try {
        const res = await api.post('/scanner/run', config)
        setAlerts((prev) => [...res.data.alerts, ...prev].slice(0, 500))
        setStats(res.data.stats)
      } catch (e) {
        console.error('Scanner error', e)
      }
    }
    await run()
    intervalRef.current = setInterval(run, (config.interval || 60) * 1000)
  }

  const pause = () => {
    clearInterval(intervalRef.current)
    setStatus('paused')
  }

  const resume = (config) => {
    setStatus('running')
    intervalRef.current = setInterval(async () => {
      const res = await api.post('/scanner/run', config)
      setAlerts((prev) => [...res.data.alerts, ...prev].slice(0, 500))
      setStats(res.data.stats)
    }, (config.interval || 60) * 1000)
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
