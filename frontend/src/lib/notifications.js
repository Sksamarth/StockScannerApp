import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

const isNative = Capacitor.isNativePlatform()

// ── Sound ──────────────────────────────────────────────────────────────────
export function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  } catch { /* silent */ }
}

// ── Vibration ──────────────────────────────────────────────────────────────
export async function vibrate() {
  try {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  } catch { /* silent */ }
}

// ── Permission ─────────────────────────────────────────────────────────────
export async function requestNotificationPermission() {
  try {
    if (isNative) {
      await LocalNotifications.requestPermissions().catch(() => {})
    } else if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default' &&
      typeof Notification.requestPermission === 'function'
    ) {
      await Notification.requestPermission().catch(() => {})
    }
  } catch (e) {
    console.error('Failed to request notification permission:', e)
  }
}

// ── Send Notification ──────────────────────────────────────────────────────
export async function sendNotification(title, body) {
  try {
    if (isNative) {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 100) },
        }],
      }).catch(() => {})
    } else if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(title, { body, icon: '/favicon.svg' })
    }
  } catch (e) {
    console.error('Failed to send notification:', e)
  }
}

// ── Fire All ───────────────────────────────────────────────────────────────
export async function fireAlertNotification(symbol, signal, price) {
  try {
    playAlertSound()
    await vibrate()
    await sendNotification(`${signal} Signal: ${symbol}`, `Price: ₹${price}`)
  } catch (e) {
    console.error('Failed to fire alert notification:', e)
  }
}
