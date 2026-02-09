import { useEffect, useRef, useState } from 'react'
import { useTravelLog } from '@/context/TravelLogContext'

export default function AuthButton() {
  const { user, signOut } = useTravelLog()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  if (!user) return null

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const userName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    (user.email as string | undefined) ||
    'Traveler'
  const avatarFallback = userName.charAt(0).toUpperCase()

  return (
    <div
      ref={menuRef}
      className="fixed z-30 animate-fade-in inline-flex"
      style={{
        top: 'max(1rem, calc(env(safe-area-inset-top) + 0.5rem))',
        right: 'max(1rem, calc(env(safe-area-inset-right) + 0.5rem))',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open account menu"
        className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full glass cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:bg-white/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/70"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${userName} profile`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="text-sm font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {avatarFallback}
          </span>
        )}

        <span className="absolute bottom-1.5 right-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-ocean)]/85 ring-1 ring-[var(--color-glass-border)]">
          <span className="inline-flex flex-col gap-px">
            <span className="h-[1px] w-2 rounded bg-[var(--color-accent)]" />
            <span className="h-[1px] w-2 rounded bg-[var(--color-accent)]" />
            <span className="h-[1px] w-2 rounded bg-[var(--color-accent)]" />
          </span>
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-full mt-2 w-max max-w-[calc(100vw-2rem)] rounded-2xl glass p-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false)
              signOut()
            }}
            className="block rounded-xl px-3 py-1.5 text-left text-sm whitespace-nowrap cursor-pointer transition-all duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/70"
            style={{
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
