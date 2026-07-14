import { createContext, useContext, useState, useRef, useEffect } from 'react'
import api from '../lib/api'
import { fireAlertNotification, requestNotificationPermission } from '../lib/notifications'
import toast from 'react-hot-toast'

const ScannerContext = createContext(null)

export function ScannerProvider({ children }) {
  const [status, setStatus] = useState('stopped')
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState({ scanned: 0, matched: 0, lastScan: null })
  const [progress, setProgress] = useState({ processed: 0, total: 0, currentStock: null, isScanning: false })
  const intervalRef = useRef(null)
  const progressTimerRef = useRef(null)
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
      try {
        const { data } = await api.post('/scanner/start', configRef.current)
        await new Promise((resolve, reject) => {
          let polling = false
          const poll = async () => {
            if (polling) return
            polling = true
            try {
              const response = await api.get(`/scanner/progress/${data.job_id}`)
              const scan = response.data
              setProgress({ ...scan.progress, isScanning: scan.status === 'running' })
              if (scan.status === 'complete') {
                clearInterval(progressTimerRef.current)
                processResults(scan.result)
                resolve()
              } else if (scan.status === 'error') {
                clearInterval(progressTimerRef.current)
                reject(new Error(scan.error || 'Scan failed'))
              }
            } catch (error) {
              clearInterval(progressTimerRef.current)
              reject(error)
            } finally {
              polling = false
            }
          }
          poll()
          progressTimerRef.current = setInterval(poll, 500)
        })
      } catch (error) {
        // The deployed backend may still be on the pre-progress API. Keep the
        // scanner usable until its Railway service is updated.
        if (error.response?.status !== 404) throw error
        setProgress({ processed: 0, total: 0, currentStock: 'Scanning stocks...', isScanning: true })
        const response = await api.post('/scanner/run', configRef.current)
        processResults(response.data)
        setProgress({ processed: 0, total: 0, currentStock: null, isScanning: false })
      }
      return true
    } catch (e) {
      console.error('Scanner error', e)
      setProgress((current) => ({ ...current, isScanning: false }))
      setStatus('stopped')
      toast.error(e.response?.data?.error || 'Unable to start the scanner')
      return false
    }
  }

  const start = async (config) => {
    configRef.current = config
    setStatus('running')
    const completed = await run()
    if (completed) intervalRef.current = setInterval(run, (config.interval || 60) * 1000)
  }

  const pause = () => {
    clearInterval(intervalRef.current)
    clearInterval(progressTimerRef.current)
    setStatus('paused')
  }

  const resume = async (config) => {
    configRef.current = config
    setStatus('running')
    const completed = await run()
    if (completed) intervalRef.current = setInterval(run, (config.interval || 60) * 1000)
  }

  const stop = () => {
    clearInterval(intervalRef.current)
    clearInterval(progressTimerRef.current)
    setStatus('stopped')
    setAlerts([])
    setStats({ scanned: 0, matched: 0, lastScan: null })
    setProgress({ processed: 0, total: 0, currentStock: null, isScanning: false })
  }

  return (
    <ScannerContext.Provider value={{ status, alerts, stats, progress, start, pause, resume, stop }}>
      {children}
    </ScannerContext.Provider>
  )
}

export const useScanner = () => useContext(ScannerContext)
