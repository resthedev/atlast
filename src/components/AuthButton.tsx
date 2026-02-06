import { useTravelLog } from '@/context/TravelLogContext'

export default function AuthButton() {
  const { user, signOut } = useTravelLog()

  if (!user) return null

  return (
    <button
      onClick={signOut}
      className="fixed top-4 right-4 z-10 flex items-center gap-2 rounded-2xl glass px-4 py-2.5 text-sm cursor-pointer transition-all duration-200 hover:bg-white/5 active:scale-95 animate-fade-in"
      style={{
        paddingTop: 'max(0.625rem, env(safe-area-inset-top))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
        color: 'var(--color-text-secondary)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {user.user_metadata?.avatar_url && (
        <img
          src={user.user_metadata.avatar_url}
          alt=""
          className="w-5 h-5 rounded-full"
        />
      )}
      <span>Sign out</span>
    </button>
  )
}
