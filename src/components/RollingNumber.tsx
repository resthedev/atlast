import { useEffect, useMemo, useRef, useState } from 'react'

type Direction = 1 | -1

interface RollingNumberProps {
  value: number
  className?: string
  durationMs?: number
  staggerMs?: number
}

interface DigitColumnProps {
  from: number
  to: number
  direction: Direction
  durationMs: number
  delayMs: number
}

function buildDigitSequence(from: number, to: number, direction: Direction): number[] {
  if (from === to) return [to]

  const steps =
    direction === 1 ? (to - from + 10) % 10 : (from - to + 10) % 10

  return Array.from({ length: steps + 1 }, (_, step) => (from + direction * step + 100) % 10)
}

function DigitColumn({ from, to, direction, durationMs, delayMs }: DigitColumnProps) {
  const sequence = useMemo(
    () => buildDigitSequence(from, to, direction),
    [from, to, direction]
  )
  const sequenceForRender = useMemo(
    () => (direction === 1 ? [...sequence].reverse() : sequence),
    [sequence, direction]
  )
  const startOffset = direction === 1 ? sequenceForRender.length - 1 : 0
  const endOffset = direction === 1 ? 0 : sequenceForRender.length - 1
  const [offset, setOffset] = useState(startOffset)

  useEffect(() => {
    setOffset(startOffset)

    let secondFrame: number | null = null
    const firstFrame = window.requestAnimationFrame(() => {
      // Ensure initial state is painted before transition begins.
      secondFrame = window.requestAnimationFrame(() => {
        setOffset(endOffset)
      })
    })

    return () => {
      window.cancelAnimationFrame(firstFrame)
      if (secondFrame != null) {
        window.cancelAnimationFrame(secondFrame)
      }
    }
  }, [startOffset, endOffset])

  const stepCount = Math.max(sequenceForRender.length - 1, 0)
  const transitionDuration = Math.min(durationMs + stepCount * 36, 640)

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[1em] overflow-hidden leading-none"
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      <span
        className="flex flex-col will-change-transform"
        style={{
          transform: `translateY(calc(-1em * ${offset}))`,
          transitionProperty: 'transform',
          transitionDuration: `${transitionDuration}ms`,
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          transitionDelay: `${delayMs}ms`,
        }}
      >
        {sequenceForRender.map((digit, index) => (
          <span key={`${digit}-${index}`} className="h-[1em] leading-none">
            {digit}
          </span>
        ))}
      </span>
    </span>
  )
}

export default function RollingNumber({
  value,
  className,
  durationMs = 380,
  staggerMs = 18,
}: RollingNumberProps) {
  const previousValueRef = useRef(value)
  const previousValue = previousValueRef.current
  const direction: Direction = value >= previousValue ? 1 : -1

  useEffect(() => {
    previousValueRef.current = value
  }, [value])

  const currentDigits = String(value).split('').map(Number)
  const previousDigits = String(previousValue).split('').map(Number)
  const previousLength = previousDigits.length
  const currentLength = currentDigits.length

  return (
    <span className={className} role="text" aria-label={`${value}`}>
      {currentDigits.map((digit, index) => {
        const positionFromRight = currentLength - 1 - index
        const previousIndex = previousLength - 1 - positionFromRight
        const previousDigit = previousIndex >= 0 ? previousDigits[previousIndex] : 0

        return (
          <DigitColumn
            key={`${index}-${digit}-${previousDigit}-${direction}`}
            from={previousDigit}
            to={digit}
            direction={direction}
            durationMs={durationMs}
            delayMs={positionFromRight * staggerMs}
          />
        )
      })}
    </span>
  )
}
