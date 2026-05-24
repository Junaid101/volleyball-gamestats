import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ShareSummaryCard from '../components/summary/ShareSummaryCard'
import { useMatchSummary } from '../hooks/useMatchSummary'

export default function MatchSummaryScreen() {
  const { matchId = '' } = useParams()
  const { match, sets, performers, shareText, loading } = useMatchSummary(matchId)
  const [sharePending, setSharePending] = useState(false)

  const handleShare = async () => {
    if (!shareText) {
      return
    }

    setSharePending(true)

    try {
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({
            title: 'Volleyball GameStats',
            text: shareText,
          })
          return
        } catch {
          // Fall back to clipboard when native sharing is unavailable or fails.
        }
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText)
      }
    } finally {
      setSharePending(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-900 p-4 text-white">Loading summary...</div>
  }

  if (!match) {
    return <div className="min-h-screen bg-gray-900 p-4 text-white">Match summary unavailable.</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 py-10">
      <ShareSummaryCard match={match} onShare={handleShare} performers={performers} sets={sets} sharePending={sharePending} />
    </div>
  )
}
