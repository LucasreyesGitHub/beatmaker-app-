import { useCallback, useState } from 'react'
import { useStore } from '../../store/useStore'
import { useTutorial } from '../../context/TutorialContext'
import { ChannelConfig } from '../../types'

interface Props {
  channel:     ChannelConfig
  currentStep: number
}

export function ChannelRow({ channel, currentStep }: Props) {
  const toggleStep        = useStore((s) => s.toggleStep)
  const setChannelVolume  = useStore((s) => s.setChannelVolume)
  const toggleMute        = useStore((s) => s.toggleMute)
  const toggleSolo        = useStore((s) => s.toggleSolo)
  const setStepCount      = useStore((s) => s.setStepCount)
  const hasSolo           = useStore((s) => s.channels.some((c) => c.soloed))

  const { isHighlighted } = useTutorial()
  const [showFxHint, setShowFxHint] = useState(false)

  const isAudible = !channel.muted && (!hasSolo || channel.soloed)

  const handleToggle = useCallback(
    (i: number) => toggleStep(channel.id, i),
    [channel.id, toggleStep]
  )

  const hasFxActive =
    channel.fx.distortionAmount > 0.01 ||
    channel.fx.bitcrusherBits < 15 ||
    channel.fx.filterMix > 0.05

  return (
    <div className="flex items-center gap-2 group py-0.5">
      {/* ── Etiqueta del canal ──────────────────────────────────────────────── */}
      <div className="w-[220px] shrink-0 flex items-center gap-1.5">
        {/* Barra de color */}
        <div
          className="w-1 h-8 rounded-full shrink-0 transition-opacity"
          style={{ backgroundColor: channel.color, opacity: isAudible ? 1 : 0.2 }}
        />

        {/* Nombre */}
        <span
          className="text-[10px] font-mono font-semibold tracking-widest w-14 shrink-0 transition-colors"
          style={{ color: isAudible ? channel.color : '#ffffff30' }}
        >
          {channel.name}
        </span>

        {/* Volumen */}
        <input
          type="range" min={0} max={1} step={0.01} value={channel.volume}
          onChange={(e) => setChannelVolume(channel.id, Number(e.target.value))}
          className="w-14 h-1 cursor-pointer shrink-0"
          style={{ accentColor: channel.color }}
          title={`Volumen: ${Math.round(channel.volume * 100)}%`}
        />

        {/* Mute */}
        <button
          onClick={() => toggleMute(channel.id)}
          title="Mute"
          className={`w-5 h-5 text-[8px] font-mono font-bold rounded transition-all ${
            channel.muted
              ? 'bg-red-500/30 text-red-400 border border-red-500/50'
              : 'bg-surface-3 text-white/25 hover:text-white/50 border border-transparent'
          }`}
        >M</button>

        {/* Solo */}
        <button
          onClick={() => toggleSolo(channel.id)}
          title="Solo"
          className={`w-5 h-5 text-[8px] font-mono font-bold rounded transition-all ${
            channel.soloed
              ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
              : 'bg-surface-3 text-white/25 hover:text-white/50 border border-transparent'
          }`}
        >S</button>

        {/* 16 / 32 */}
        <button
          onClick={() => setStepCount(channel.id, channel.stepCount === 16 ? 32 : 16)}
          className="w-6 h-5 text-[8px] font-mono text-white/25 hover:text-white/50 bg-surface-3 rounded border border-transparent hover:border-surface-4 transition-all"
          title="Alternar 16/32 pasos"
        >{channel.stepCount}</button>

        {/* FX indicator */}
        <div
          className="relative"
          onMouseEnter={() => setShowFxHint(true)}
          onMouseLeave={() => setShowFxHint(false)}
        >
          <div className={`w-1.5 h-1.5 rounded-full transition-all ${
            hasFxActive ? 'bg-cyan-400 shadow-[0_0_4px_#22d3ee]' : 'bg-white/10'
          }`} />
          {showFxHint && hasFxActive && (
            <div className="absolute left-3 top-0 z-50 bg-surface-0 border border-surface-3 rounded px-2 py-1 text-[8px] font-mono text-cyan-300 whitespace-nowrap shadow-lg">
              {channel.fx.distortionAmount > 0.01 && <div>Dist: {Math.round(channel.fx.distortionAmount * 100)}%</div>}
              {channel.fx.bitcrusherBits < 15    && <div>Bits: {channel.fx.bitcrusherBits}</div>}
              {channel.fx.filterMix > 0.05       && <div>Filter: {Math.round(channel.fx.filterFreq)}Hz</div>}
            </div>
          )}
        </div>
      </div>

      {/* ── Steps ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex gap-0.5 overflow-x-auto">
        {channel.steps.slice(0, channel.stepCount).map((active, i) => {
          const isCurrent   = currentStep === i
          const isBeat      = i % 4 === 0
          const highlighted = isHighlighted(channel.id, i)

          return (
            <button
              key={i}
              onClick={() => handleToggle(i)}
              className={`
                flex-1 min-w-[18px] h-8 rounded transition-all duration-75 relative
                ${active ? (isCurrent ? 'scale-y-110' : 'opacity-90') : isBeat ? 'bg-surface-3 hover:bg-surface-4' : 'bg-surface-2 hover:bg-surface-3'}
                ${isCurrent && !active ? 'ring-1 ring-white/20' : ''}
                ${highlighted ? 'ring-2 ring-yellow-400 animate-pulse z-10' : ''}
              `}
              style={{
                backgroundColor: active ? channel.color : undefined,
                boxShadow: highlighted
                  ? '0 0 8px #facc15, 0 0 16px #facc1566'
                  : active && isCurrent
                  ? `0 0 12px ${channel.color}aa, 0 0 24px ${channel.color}44`
                  : active
                  ? `0 0 6px ${channel.color}55`
                  : undefined,
              }}
            >
              {isCurrent && (
                <div
                  className="absolute inset-x-0 top-0 h-0.5 rounded-full animate-pulse"
                  style={{ backgroundColor: active ? 'white' : channel.color + '80' }}
                />
              )}
              {highlighted && !active && (
                <div className="absolute inset-0 rounded bg-yellow-400/15" />
              )}
            </button>
          )
        })}
      </div>

      <div className="w-8 shrink-0" />
    </div>
  )
}
