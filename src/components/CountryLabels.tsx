import type { LabelData } from '@/types'

interface CountryLabelsProps {
  labels: LabelData[]
  zoomK: number
}

export default function CountryLabels({ labels, zoomK }: CountryLabelsProps) {
  const fontSize = Math.max(9, Math.min(14, 12 / Math.sqrt(zoomK)))

  return (
    <g className="pointer-events-none select-none">
      {labels.map((label) => (
        <text
          key={label.id}
          x={label.centroid[0]}
          y={label.centroid[1]}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize / zoomK} // Divide by zoomK because parent <g> is scaled
          fontFamily="var(--font-ui)"
          fontWeight={500}
          letterSpacing="0.04em"
          fill="var(--color-text-primary)"
          stroke="rgba(0, 0, 0, 0.6)"
          strokeWidth={2.5 / zoomK}
          paintOrder="stroke"
          opacity={label.visible ? 0.9 : 0}
          style={{
            transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'opacity',
            textTransform: 'uppercase',
          }}
        >
          {label.name}
        </text>
      ))}
    </g>
  )
}
