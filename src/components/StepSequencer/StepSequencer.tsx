import { useStore } from '../../store/useStore'
import { ChannelRow } from './ChannelRow'

export function StepSequencer() {
  const channels    = useStore((s) => s.channels)
  const currentStep = useStore((s) => s.currentStep)

  // Usa el mayor stepCount entre todos los canales para el header
  const maxSteps = Math.max(...channels.map((c) => c.stepCount), 16)

  return (
    <div className="p-4 space-y-1">
      {/* Header de números de paso */}
      <div className="flex items-center mb-2">
        <div className="w-[220px] shrink-0" />
        <div className="flex-1 flex overflow-x-auto">
          {Array.from({ length: maxSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 min-w-[18px] flex items-center justify-center text-[9px] font-mono transition-colors duration-100 ${
                currentStep === i
                  ? 'text-accent-glow font-bold'
                  : i % 4 === 0
                  ? 'text-white/30'
                  : 'text-white/10'
              }`}
            >
              {i % 4 === 0 ? i / 4 + 1 : '·'}
            </div>
          ))}
        </div>
        <div className="w-8 shrink-0" />
      </div>

      {channels.map((channel) => (
        <ChannelRow key={channel.id} channel={channel} currentStep={currentStep} />
      ))}
    </div>
  )
}
