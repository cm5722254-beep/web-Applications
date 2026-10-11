'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Sparkles, Check } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('SC-ANIME PWA Service Worker Registered'))
        .catch((err) => console.log('Service Worker Registration failed:', err))
    }

    // Check if standalone (already installed)
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      if (isStandalone) {
        setIsInstalled(true)
        return
      }

      // Check if user previously dismissed today
      const dismissedTime = localStorage.getItem('sc_anime_pwa_dismissed')
      if (dismissedTime && Date.now() - parseInt(dismissedTime) < 86400000) {
        setIsDismissed(true)
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Listen for custom trigger from any button in the app
    const handleTriggerPrompt = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        deferredPrompt.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            setIsInstalled(true)
          }
          setDeferredPrompt(null)
          setIsInstallable(false)
        })
      } else {
        alert('សូមចុចសញ្ញា Share ឬ ម៉ឺនុយ browser ហើយជ្រើសរើស "Add to Home Screen" ដើម្បីដំឡើង App!')
      }
    }
    window.addEventListener('trigger_pwa_install', handleTriggerPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('trigger_pwa_install', handleTriggerPrompt)
    }
  }, [deferredPrompt])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('សូមចុច "Add to Home Screen" នៅលើ Browser របស់អ្នកដើម្បីដំឡើង App!')
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('sc_anime_pwa_dismissed', Date.now().toString())
  }

  if (isInstalled || isDismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slide-up">
      <div className="bg-brand-surface/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.7)] ring-1 ring-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden ring-2 ring-amber-400/80 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            <img src="/logo.png" alt="SC-ANIME App" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-white text-xs sm:text-sm tracking-tight">SC-ANIME KH</h4>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 rounded font-bold">APP</span>
            </div>
            <p className="text-[11px] text-brand-muted font-sans mt-0.5 line-clamp-1">
              ដំឡើង App លើទូរស័ព្ទ / កុំព្យូទ័រ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all font-sans hover:scale-105 active:scale-95"
          >
            <Download size={14} />
            <span>ដំឡើង</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-brand-muted hover:text-white rounded-lg transition-colors"
            title="បិទ"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
