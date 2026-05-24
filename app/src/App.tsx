import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import BottomNav from './components/layout/BottomNav'
import { StorageProvider } from './context/StorageContext'
import { useStorage } from './hooks/useStorage'
import BetweenSetsScreen from './screens/BetweenSetsScreen'
import HistoryScreen from './screens/HistoryScreen'
import HomeScreen from './screens/HomeScreen'
import LiveScoringScreen from './screens/LiveScoringScreen'
import MatchDetailScreen from './screens/MatchDetailScreen'
import MatchSummaryScreen from './screens/MatchSummaryScreen'
import NewMatchScreen from './screens/NewMatchScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import PlayerStatsScreen from './screens/PlayerStatsScreen'
import RosterScreen from './screens/RosterScreen'
import type { Team } from './types'

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto min-h-screen max-w-screen-sm px-4 pb-24 pt-6">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}

function AppRoutes() {
  const storage = useStorage()
  const location = useLocation()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadTeam = async () => {
      setLoading(true)

      try {
        const nextTeam = await storage.getTeam()
        if (active) {
          setTeam(nextTeam)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadTeam()

    return () => {
      active = false
    }
  }, [location.pathname, storage])

  if (loading) {
    return <div className="min-h-screen bg-gray-900 p-4 text-white">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/onboarding" element={team ? <Navigate replace to="/" /> : <OnboardingScreen />} />

      {team ? (
        <>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/roster" element={<RosterScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="/players" element={<PlayerStatsScreen />} />
          </Route>
          <Route path="/match/new" element={<NewMatchScreen />} />
          <Route path="/match/:matchId/live" element={<LiveScoringScreen />} />
          <Route path="/match/:matchId/between-sets" element={<BetweenSetsScreen />} />
          <Route path="/history/:matchId" element={<MatchDetailScreen />} />
          <Route path="/history/:matchId/summary" element={<MatchSummaryScreen />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </>
      ) : (
        <Route path="*" element={<Navigate replace to="/onboarding" />} />
      )}
    </Routes>
  )
}

export default function App() {
  const routerBase = import.meta.env.BASE_URL.replace(/\/$/, '')

  return (
    <StorageProvider>
      <BrowserRouter basename={routerBase}>
        <AppRoutes />
      </BrowserRouter>
    </StorageProvider>
  )
}
