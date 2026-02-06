import { useAuth } from '@/hooks/useAuth'
import { TravelLogProvider } from '@/context/TravelLogContext'
import WorldMap from '@/components/WorldMap'
import StatsOverlay from '@/components/StatsOverlay'
import AuthButton from '@/components/AuthButton'
import Toast from '@/components/Toast'
import SignInScreen from '@/components/SignInScreen'

function AppContent() {
  const { user, loading } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-ocean)]">
        <div className="text-[var(--color-text-secondary)] text-sm font-ui animate-fade-in">
          Loading...
        </div>
      </div>
    )
  }

  // Show sign-in screen if not authenticated
  if (!user) {
    return <SignInScreen />
  }

  // Main app
  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--color-ocean)]">
      <WorldMap />
      <StatsOverlay />
      <AuthButton />
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <TravelLogProvider>
      <AppContent />
    </TravelLogProvider>
  )
}
