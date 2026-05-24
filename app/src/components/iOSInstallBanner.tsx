import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'vgs_ios_install_dismissed'

function isIosSafari(): boolean {
  const ua = navigator.userAgent
  const isIos = /iphone|ipad|ipod/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)
  return isIos && isSafari
}

function isStandalone(): boolean {
  return (navigator as Navigator & { standalone?: boolean }).standalone === true
}

export default function IOSInstallBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isIosSafari() && !isStandalone() && !localStorage.getItem(DISMISSED_KEY)) {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-start gap-3 bg-gray-800 p-4 pb-safe shadow-lg">
      <div className="flex-1 text-sm text-white">
        <p className="font-semibold">Install this app</p>
        <p className="mt-0.5 text-gray-300">
          Tap{' '}
          <span className="inline-block" aria-label="Share">
            ⎋
          </span>{' '}
          then <strong>Add to Home Screen</strong>
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="mt-0.5 text-gray-400 hover:text-white"
      >
        ✕
      </button>
    </div>
  )
}
