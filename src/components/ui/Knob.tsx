import { useRef, useCallback, useState } from 'react'

interface KnobProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  color?: string
}

export function Knob({ label, value, min, max, step = 0.01, onChange, color = '#7c3aed' }: KnobProps) {
  const dragRef = useRef<{ startY: number; startValue: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const normalized = (value - min) / (max - min)
  const angle = -135 + normalized * 270  // -135° to +135°

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dragRef.current = { startY: e.clientY, startValue: value }
      setIsDragging(true)

      const onMove = (ev: MouseEvent) => {
        if (!dragRef.current) return
        const dy = dragRef.current.startY - ev.clientY
        const range = max - min
        const delta = (dy / 100) * range
        const next = Math.min(max, Math.max(min, dragRef.current.startValue + delta))
        const snapped = step ? Math.round(next / step) * step : next
        onChange(parseFloat(snapped.toFixed(4)))
      }

      const onUp = () => {
        dragRef.current = null
        setIsDragging(false)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [value, min, max, step, onChange]
  )

  const displayValue = value < 0.01 ? value.toFixed(3) : value < 1 ? value.toFixed(2) : value.toFixed(1)

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      {/* SVG knob */}
      <div
        onMouseDown={onMouseDown}
        className={`relative w-10 h-10 cursor-ns-resize rounded-full transition-all ${isDragging ? 'scale-110' : 'hover:scale-105'}`}
        title={`${label}: ${displayValue}`}
      >
        <svg viewBox="0 0 40 40" className="w-full h-full">
          {/* Track */}
          <circle
            cx="20" cy="20" r="14"
            fill="none"
            stroke="#2a2a40"
            strokeWidth="3"
            strokeDasharray="63 100"
            strokeDashoffset="-18"
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx="20" cy="20" r="14"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${normalized * 63} 100`}
            strokeDashoffset="-18"
            strokeLinecap="round"
            className="transition-all duration-75"
            style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
          />
          {/* Body */}
          <circle cx="20" cy="20" r="11" fill="#1a1a27" stroke="#2a2a40" strokeWidth="1" />
          {/* Indicator line */}
          <line
            x1="20"
            y1="20"
            x2={20 + 7 * Math.sin((angle * Math.PI) / 180)}
            y2={20 - 7 * Math.cos((angle * Math.PI) / 180)}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">{label}</span>
      <span className="text-[9px] font-mono text-white/60">{displayValue}</span>
    </div>
  )
}
