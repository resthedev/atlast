import { useTravelLog } from '@/context/TravelLogContext'
import { TOTAL_COUNTRIES } from '@/lib/countries'
import RollingNumber from '@/components/RollingNumber'

export default function StatsOverlay() {
  const { visitedCount } = useTravelLog()
  const percentage = Math.round((visitedCount / TOTAL_COUNTRIES) * 100)

  return (
    <div
      className="fixed top-4 left-4 z-10 flex items-center gap-3 rounded-2xl glass animate-fade-in"
      style={{
        paddingTop: 'max(0.625rem, env(safe-area-inset-top))',
        paddingBottom: '0.625rem',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: '1rem',
      }}
    >
      {/* Visited count - display font */}
      <div className="flex items-baseline gap-1">
        <span
          className="text-3xl font-display"
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--color-text-primary)',
            textShadow: '0 0 30px var(--color-accent-glow)',
          }}
        >
          <RollingNumber value={visitedCount} />
        </span>
        <span className="text-sm text-[var(--color-text-secondary)]">
          / {TOTAL_COUNTRIES}
        </span>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-[var(--color-glass-border)]" />

      {/* Percentage */}
      <div className="text-sm text-[var(--color-text-secondary)]">
        {percentage}% explored
      </div>
    </div>
  )
}
