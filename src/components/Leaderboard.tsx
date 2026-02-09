import { useState, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useTravelLog } from '@/context/TravelLogContext'
import { getCountryByAlpha3, getCountryPopularity, getFlagUrl } from '@/lib/countries'
import type { LeaderboardEntry } from '@/types'

const MAX_FLAGS = 5
const FLAG_SIZE = 22
const FLAG_OVERLAP = -6

function FlagChip({ alpha2, name, size, overlap, zIndex }: {
  alpha2: string
  name: string
  size: number
  overlap: number
  zIndex: number
}) {
  const [hovered, setHovered] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const [tipPos, setTipPos] = useState<{ top: number; left: number } | null>(null)

  const onEnter = useCallback(() => {
    if (imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect()
      setTipPos({
        top: rect.top,
        left: rect.left + rect.width / 2,
      })
    }
    setHovered(true)
  }, [])

  return (
    <span
      className="inline-block"
      style={{ marginLeft: overlap, position: 'relative', zIndex }}
      onMouseEnter={onEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        ref={imgRef}
        src={getFlagUrl(alpha2)}
        alt={name}
        className="rounded-full object-cover"
        style={{
          width: size,
          height: size,
          display: 'block',
          border: '1.5px solid var(--color-glass-bg)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          transition: 'transform 120ms cubic-bezier(0.22, 1, 0.36, 1)',
          transform: hovered ? 'scale(1.15)' : 'scale(1)',
        }}
      />
      {hovered && tipPos && createPortal(
        <span
          className="fixed glass rounded-md"
          style={{
            top: tipPos.top,
            left: tipPos.left,
            transform: 'translate(-50%, calc(-100% - 6px))',
            padding: '5px 10px',
            fontSize: 12,
            fontFamily: 'var(--font-ui)',
            color: 'var(--color-text-primary)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 60,
            animation: 'slide-up 180ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        >
          {name}
        </span>,
        document.body
      )}
    </span>
  )
}

const OVERFLOW_GAP = 20
const OVERFLOW_BRIDGE_SIDE_PADDING = 20
const OVERFLOW_TOOLTIP_HOVER_PAD_X = 12
const OVERFLOW_TOOLTIP_HOVER_PAD_Y = 10

function FlagStack({ countryCodes }: { countryCodes: string[] }) {
  const [showOverflow, setShowOverflow] = useState(false)
  const badgeRef = useRef<HTMLSpanElement>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; right: number } | null>(null)

  // Sort by real-world travel popularity, break ties alphabetically
  const sorted = useMemo(
    () =>
      [...countryCodes].sort((a, b) => getCountryPopularity(b) - getCountryPopularity(a) || a.localeCompare(b)),
    [countryCodes]
  )

  const visible = sorted.slice(0, MAX_FLAGS)
  const overflowCodes = sorted.slice(MAX_FLAGS)
  const overflow = overflowCodes.length

  const openTooltip = useCallback(() => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      setTooltipPos({
        top: rect.top,
        right: window.innerWidth - rect.right,
      })
    }
    setShowOverflow(true)
  }, [])

  const closeTooltip = useCallback(() => {
    setShowOverflow(false)
  }, [])

  return (
    <div className="flex items-center ml-auto shrink-0">
      {visible.map((alpha3, i) => {
        const meta = getCountryByAlpha3(alpha3)
        if (!meta) return null
        return (
          <FlagChip
            key={alpha3}
            alpha2={meta.alpha2}
            name={meta.name}
            size={FLAG_SIZE}
            overlap={i === 0 ? 0 : FLAG_OVERLAP}
            zIndex={MAX_FLAGS - i}
          />
        )
      })}
      {overflow > 0 && (
        <span
          ref={badgeRef}
          className="rounded-full flex items-center justify-center cursor-default"
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
          onClick={(e) => {
            e.stopPropagation()
            if (showOverflow) closeTooltip()
            else openTooltip()
          }}
          style={{
            width: FLAG_SIZE,
            height: FLAG_SIZE,
            marginLeft: FLAG_OVERLAP,
            position: 'relative',
            zIndex: 0,
            background: 'rgba(201, 169, 110, 0.18)',
            color: 'var(--color-accent)',
            border: '1.5px solid rgba(201, 169, 110, 0.12)',
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          +{overflow}
        </span>
      )}

      {/* Overflow tooltip — portaled to body to escape all overflow contexts */}
      {showOverflow && tooltipPos && overflowCodes.length > 0 &&
        createPortal(
          <div
            className="fixed"
            style={{
              top: tooltipPos.top,
              right: tooltipPos.right,
              transform: 'translateY(-100%)',
              zIndex: 50,
              pointerEvents: 'auto',
            }}
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
          >
            <div className="relative">
              {/* Invisible hover padding around tooltip on all edges */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: -OVERFLOW_TOOLTIP_HOVER_PAD_Y,
                  left: -OVERFLOW_TOOLTIP_HOVER_PAD_X,
                  right: -OVERFLOW_TOOLTIP_HOVER_PAD_X,
                  bottom: -OVERFLOW_TOOLTIP_HOVER_PAD_Y,
                }}
              />

              {/* Visible tooltip content */}
              <div
                className="glass rounded-xl"
                style={{
                  padding: '8px 10px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  maxWidth: 160,
                  animation: 'slide-up 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
                }}
              >
                {overflowCodes.map((alpha3) => {
                  const meta = getCountryByAlpha3(alpha3)
                  if (!meta) return null
                  return (
                    <FlagChip
                      key={alpha3}
                      alpha2={meta.alpha2}
                      name={meta.name}
                      size={24}
                      overlap={0}
                      zIndex={1}
                    />
                  )
                })}
              </div>

              {/* Invisible bridge connecting tooltip to +N badge */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: -OVERFLOW_BRIDGE_SIDE_PADDING,
                  right: -OVERFLOW_BRIDGE_SIDE_PADDING,
                  height: OVERFLOW_GAP,
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

function LeaderboardRow({
  entry,
  rank,
  isCurrentUser,
  animDelay,
}: {
  entry: LeaderboardEntry
  rank: number
  isCurrentUser: boolean
  animDelay: number
}) {
  const firstName = entry.display_name?.split(' ')[0] || 'Traveler'

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors duration-200"
      style={{
        background: isCurrentUser ? 'var(--color-accent-glow)' : 'transparent',
        borderLeft: isCurrentUser
          ? '2px solid var(--color-accent)'
          : '2px solid transparent',
        opacity: 0,
        animation: `fade-in 400ms cubic-bezier(0.22, 1, 0.36, 1) ${animDelay}ms forwards`,
      }}
    >
      {/* Rank */}
      <span
        className="font-display text-[15px] w-4 text-right shrink-0"
        style={{
          color: rank <= 3 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {rank}
      </span>

      {/* Avatar */}
      {entry.avatar_url ? (
        <img
          src={entry.avatar_url}
          alt=""
          className="rounded-full object-cover shrink-0"
          style={{
            width: 28,
            height: 28,
            border: isCurrentUser
              ? '1.5px solid var(--color-accent)'
              : '1.5px solid rgba(255,255,255,0.08)',
          }}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center shrink-0 text-xs font-medium"
          style={{
            width: 28,
            height: 28,
            background: 'var(--color-accent-glow)',
            color: 'var(--color-accent)',
            border: '1.5px solid rgba(201, 169, 110, 0.2)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {firstName[0]?.toUpperCase()}
        </div>
      )}

      {/* Name + Count */}
      <div className="flex flex-col min-w-0 gap-0">
        <span
          className="text-[15px] font-medium truncate leading-tight"
          style={{
            color: isCurrentUser
              ? 'var(--color-text-primary)'
              : 'var(--color-text-primary)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {firstName}
        </span>
        <span
          className="text-[13px] leading-tight"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {entry.country_count} {entry.country_count === 1 ? 'country' : 'countries'}
        </span>
      </div>

      {/* Flag Stack */}
      <FlagStack countryCodes={entry.country_codes} />
    </div>
  )
}

export default function Leaderboard() {
  const { user, leaderboardRefreshKey } = useTravelLog()
  const { entries, loading } = useLeaderboard(leaderboardRefreshKey)
  const [expanded, setExpanded] = useState(false)

  if (loading || entries.length === 0) return null

  // Mobile collapsed pill
  const collapsedPill = (
    <button
      onClick={() => setExpanded(true)}
      className="sm:hidden fixed bottom-4 left-4 z-10 glass rounded-2xl flex items-center gap-2 px-3 py-2 cursor-pointer active:scale-95 transition-transform duration-150 animate-fade-in"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {/* Small trophy / leaderboard icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        style={{ color: 'var(--color-accent)' }}
      >
        <path
          d="M4 2h8v5a4 4 0 0 1-8 0V2Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 4H2.5a1 1 0 0 0-1 1v.5a2.5 2.5 0 0 0 2.5 2.5M12 4h1.5a1 1 0 0 1 1 1v.5A2.5 2.5 0 0 1 12 8M6 14h4M8 11v3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Leader's avatar + count */}
      {entries[0] && (
        <>
          {entries[0].avatar_url ? (
            <img
              src={entries[0].avatar_url}
              alt=""
              className="rounded-full object-cover"
              style={{ width: 20, height: 20 }}
            />
          ) : (
            <div
              className="rounded-full flex items-center justify-center text-[11px]"
              style={{
                width: 20,
                height: 20,
                background: 'var(--color-accent-glow)',
                color: 'var(--color-accent)',
              }}
            >
              {entries[0].display_name?.[0]?.toUpperCase()}
            </div>
          )}
          <span
            className="font-display text-[15px]"
            style={{
              color: 'var(--color-accent)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {entries[0].country_count}
          </span>
        </>
      )}
    </button>
  )

  // Full leaderboard panel
  const panel = (
    <div
      className={[
        'fixed z-10 glass rounded-2xl animate-fade-in flex flex-col',
        // Desktop: bottom-left, narrow
        'sm:bottom-4 sm:left-4 sm:max-w-[300px]',
        // Mobile expanded: full width with margins
        'max-sm:bottom-4 max-sm:left-4 max-sm:right-4',
      ].join(' ')}
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
        paddingRight: '0.5rem',
        paddingTop: '0.5rem',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 pb-1.5"
        style={{ borderBottom: '1px solid var(--color-glass-border)' }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            style={{ color: 'var(--color-accent)', opacity: 0.7 }}
          >
            <path
              d="M4 2h8v5a4 4 0 0 1-8 0V2Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 4H2.5a1 1 0 0 0-1 1v.5a2.5 2.5 0 0 0 2.5 2.5M12 4h1.5a1 1 0 0 1 1 1v.5A2.5 2.5 0 0 1 12 8M6 14h4M8 11v3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="text-[11px] tracking-widest uppercase"
            style={{
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.1em',
            }}
          >
            Travelers
          </span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setExpanded(false)}
          className="sm:hidden flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform duration-150"
          style={{
            width: 24,
            height: 24,
            color: 'var(--color-text-secondary)',
            background: 'transparent',
            border: 'none',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 2l8 8M10 2l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Entries */}
      <div
        className="flex flex-col pt-1"
        style={{ maxHeight: 280, overflowY: 'auto' }}
      >
        {entries.map((entry, i) => (
          <LeaderboardRow
            key={entry.user_id}
            entry={entry}
            rank={i + 1}
            isCurrentUser={user?.id === entry.user_id}
            animDelay={80 + i * 60}
          />
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile: show pill when collapsed, panel when expanded */}
      {!expanded && collapsedPill}
      {expanded && <div className="sm:hidden">{panel}</div>}

      {/* Desktop: always show panel */}
      <div className="hidden sm:block">{panel}</div>
    </>
  )
}
