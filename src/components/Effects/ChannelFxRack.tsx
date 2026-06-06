import { useStore } from '../../store/useStore'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useEffect } from 'react'
import { Knob } from '../ui/Knob'
import { ChannelFxConfig, FilterType } from '../../types'

const FILTER_TYPES: FilterType[] = ['lowpass', 'highpass', 'bandpass']
const FILTER_LABELS: Record<FilterType, string> = {
  lowpass: 'LOW',
  highpass: 'HI',
  bandpass: 'BAND',
}

export function ChannelFxRack() {
  const channels        = useStore((s) => s.channels)
  const setChannelFxParam = useStore((s) => s.setChannelFxParam)
  const { sync }        = useAudioEngine()

  // Sincronizar con AudioEngine cuando cambia cualquier FX de canal
  useEffect(() => { sync() }, [channels, sync])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-5 rounded-full bg-cyan-400" />
        <h3 className="text-xs font-mono font-bold tracking-widest text-white/60 uppercase">FX por Canal</h3>
        <span className="text-[9px] font-mono text-white/25">Distorsión · BitCrusher · Filtro</span>
      </div>

      <div className="space-y-3">
        {channels.map((ch) => (
          <ChannelFxStrip
            key={ch.id}
            channelId={ch.id}
            channelName={ch.name}
            channelColor={ch.color}
            fx={ch.fx}
            setParam={(key, val) => setChannelFxParam(ch.id, key, val)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Strip individual por canal ───────────────────────────────────────────────

interface StripProps {
  channelId:   string
  channelName: string
  channelColor: string
  fx:          ChannelFxConfig
  setParam:    <K extends keyof ChannelFxConfig>(key: K, val: ChannelFxConfig[K]) => void
}

function ChannelFxStrip({ channelName, channelColor, fx, setParam }: StripProps) {
  const hasAnyFx =
    fx.distortionAmount > 0.01 || fx.bitcrusherBits < 15 || fx.filterMix > 0.05

  return (
    <div className={`rounded-lg border transition-all ${
      hasAnyFx ? 'border-white/10 bg-surface-1/40' : 'border-transparent bg-surface-1/20'
    } p-3`}>
      {/* Header del canal */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: channelColor }} />
        <span className="text-[10px] font-mono font-bold tracking-widest" style={{ color: channelColor }}>
          {channelName}
        </span>
        {hasAnyFx && (
          <span className="text-[8px] font-mono text-cyan-400/70 bg-cyan-400/10 px-1.5 py-0.5 rounded">
            FX ACTIVO
          </span>
        )}
      </div>

      <div className="flex gap-6 flex-wrap">
        {/* ── Distorsión ─────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono text-white/30 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400/60" />
            Distorsión
          </label>
          <div className="flex items-center gap-3">
            <Knob
              label="DRIVE"
              value={fx.distortionAmount}
              min={0} max={1} step={0.01}
              onChange={(v) => setParam('distortionAmount', v)}
              color="#f97316"
            />
            <div className="text-[8px] font-mono text-white/30 space-y-0.5 pt-2">
              <div className={`px-1.5 py-0.5 rounded text-center transition-all ${
                fx.distortionAmount < 0.1 ? 'text-white/20' :
                fx.distortionAmount < 0.4 ? 'bg-orange-500/15 text-orange-300' :
                                             'bg-red-500/20 text-red-300'
              }`}>
                {fx.distortionAmount < 0.1 ? 'CLEAN' :
                 fx.distortionAmount < 0.4 ? 'WARM' :
                 fx.distortionAmount < 0.7 ? 'CRUNCH' : 'DESTROY'}
              </div>
            </div>
          </div>
        </div>

        <div className="w-px bg-surface-3 self-stretch" />

        {/* ── BitCrusher ─────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono text-white/30 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60" />
            BitCrusher
          </label>
          <div className="flex items-center gap-3">
            <Knob
              label="BITS"
              value={fx.bitcrusherBits}
              min={1} max={16} step={1}
              onChange={(v) => setParam('bitcrusherBits', Math.round(v))}
              color="#a855f7"
            />
            <div className="text-[8px] font-mono text-white/30 space-y-0.5 pt-2">
              <div className={`px-1.5 py-0.5 rounded text-center transition-all ${
                fx.bitcrusherBits >= 15 ? 'text-white/20' :
                fx.bitcrusherBits >= 8  ? 'bg-purple-500/15 text-purple-300' :
                                          'bg-purple-700/20 text-purple-200'
              }`}>
                {fx.bitcrusherBits >= 15 ? 'CLEAN' :
                 fx.bitcrusherBits >= 8  ? `${fx.bitcrusherBits}-bit` :
                                           `${fx.bitcrusherBits}-bit LO-FI`}
              </div>
            </div>
          </div>
        </div>

        <div className="w-px bg-surface-3 self-stretch" />

        {/* ── Filtro ─────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono text-white/30 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
            Filtro
          </label>
          <div className="flex gap-3 items-start">
            {/* Tipo de filtro */}
            <div className="flex flex-col gap-0.5 pt-2">
              {FILTER_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setParam('filterType', t)}
                  className={`px-1.5 py-0.5 text-[8px] font-mono rounded transition-all ${
                    fx.filterType === t
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'bg-surface-3 text-white/25 hover:text-white/50'
                  }`}
                >
                  {FILTER_LABELS[t]}
                </button>
              ))}
            </div>
            <Knob
              label="FREQ"
              value={fx.filterFreq}
              min={50} max={18000} step={50}
              onChange={(v) => setParam('filterFreq', v)}
              color="#3b82f6"
            />
            <Knob
              label="RES"
              value={fx.filterQ}
              min={0.1} max={20} step={0.1}
              onChange={(v) => setParam('filterQ', v)}
              color="#3b82f6"
            />
            <Knob
              label="MIX"
              value={fx.filterMix}
              min={0} max={1} step={0.01}
              onChange={(v) => setParam('filterMix', v)}
              color="#3b82f6"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
