import { useTravelLog } from '@/context/TravelLogContext'

export default function SignInScreen() {
  const { signInWithGoogle } = useTravelLog()

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#080c18]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle radial gradient */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(201,169,110,0.15) 0%, rgba(201,169,110,0.05) 40%, transparent 70%)',
          }}
        />

        {/* Compass rose SVG - decorative */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.04]"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
        >
          {/* Outer circle */}
          <circle cx="50" cy="50" r="45" className="text-[#c9a96e]" />
          <circle cx="50" cy="50" r="40" className="text-[#c9a96e]" />
          {/* Cardinal directions */}
          <path d="M50 5 L50 20" className="text-[#c9a96e]" />
          <path d="M50 80 L50 95" className="text-[#c9a96e]" />
          <path d="M5 50 L20 50" className="text-[#c9a96e]" />
          <path d="M80 50 L95 50" className="text-[#c9a96e]" />
          {/* Diagonal lines */}
          <path d="M18 18 L28 28" className="text-[#c9a96e]" />
          <path d="M72 72 L82 82" className="text-[#c9a96e]" />
          <path d="M82 18 L72 28" className="text-[#c9a96e]" />
          <path d="M18 82 L28 72" className="text-[#c9a96e]" />
          {/* Inner star */}
          <path d="M50 25 L55 45 L75 50 L55 55 L50 75 L45 55 L25 50 L45 45 Z" className="text-[#c9a96e]" />
        </svg>

        {/* Horizontal latitude lines */}
        {[20, 35, 50, 65, 80].map((top) => (
          <div
            key={top}
            className="absolute left-0 right-0 h-px opacity-[0.03]"
            style={{
              top: `${top}%`,
              background: 'linear-gradient(90deg, transparent 0%, #c9a96e 30%, #c9a96e 70%, transparent 100%)',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{
          animation: 'signInFadeUp 1000ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        }}
      >
        {/* Title */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl tracking-tight"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            color: '#e8e4df',
            textShadow: '0 0 60px rgba(201, 169, 110, 0.2)',
          }}
        >
          Atlast
        </h1>

        {/* Decorative line */}
        <div
          className="mt-6 mb-4 w-16 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, #c9a96e, transparent)',
          }}
        />

        {/* Tagline */}
        <p
          className="text-base sm:text-lg tracking-wide max-w-xs"
          style={{
            fontFamily: "'Satoshi', system-ui, sans-serif",
            color: 'rgba(232, 228, 223, 0.5)',
            fontWeight: 400,
          }}
        >
          Chart your journey across the world
        </p>

        {/* Sign in button */}
        <button
          onClick={signInWithGoogle}
          className="mt-12 group relative flex items-center gap-3 px-8 py-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'rgba(10, 14, 26, 0.65)',
            backdropFilter: 'blur(40px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.2)',
            border: '1px solid rgba(201, 169, 110, 0.15)',
            boxShadow:
              '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
          }}
        >
          {/* Google icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#e8e4df"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#e8e4df"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#e8e4df"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#e8e4df"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>

          <span
            className="text-base tracking-wide"
            style={{
              fontFamily: "'Satoshi', system-ui, sans-serif",
              color: '#e8e4df',
              fontWeight: 500,
            }}
          >
            Sign in with Google
          </span>

          {/* Hover glow effect */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, rgba(201, 169, 110, 0.1) 0%, transparent 70%)',
            }}
          />
        </button>

        {/* Footer note */}
        <p
          className="mt-8 text-xs"
          style={{
            fontFamily: "'Satoshi', system-ui, sans-serif",
            color: 'rgba(232, 228, 223, 0.3)',
          }}
        >
          Your adventures, beautifully mapped
        </p>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes signInFadeUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
