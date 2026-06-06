import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useEffect } from 'react'
import { Knob } from '../ui/Knob'
import { ChannelFxRack } from './ChannelFxRack'
import { AtmospherePanel } from './AtmospherePanel'

type FxTab = 'master' | 'channels' | 'atmosphere'

export function Effects() {
  const [fxTab, setFxTab] = useState<FxTab>('master')
  const effects      = useStore((s) => s.effects)
  const atmosphere   = useStore((s) => s.atmosphere)
  const setEffectParam = useStore((s) => s.setEffectParam)
  const { sync }     = useAudioEngine()

  useEffect(() => { sync() }, [effects, sync])

  const tabs: { key: FxTab; label: string; dot?: string }[] = [
    { key: 'master',     label: '◈ MASTER BUS' },
    { key: 'channels',   label: '≋ POR CANAL' },
    { key: 'atmosphere', label: '✦ ATMÓSFERA', dot: atmosphere.enabled ? 'violet' : undefined },
  ]

  return (
    <div>
      {/* Sub-tabs de FX */}
      <div className="flex items-center gap-0.5 px-4 pt-3 border-b border-surface-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFxTab(t.key)}
            className={`px-3 py-1.5 text-[10px] font-mono font-semibold rounded-t transition-all relative ${
              fxTab === t.key
                ? 'bg-surface-2 text-white/80 border-t border-x border-surface-3'
                : 'text-white/30 hover:text-white/55'
            }`}
          >
            {t.label}
            {t.dot && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_4px_#a78bfa]" />
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {fxTab === 'master' && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-cyan-400" />
            <h3 className="text-xs font-mono font-bold tracking-widest text-white/60 uppercase">Master Bus</h3>
          </div>

          <div className="flex gap-8 flex-wrap">
            {/* Delay */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest">Delay</span>
                <span className="text-[8px] font-mono text-white/25">
                  {(effects.delayMix * 100).toFixed(0)}% wet
                </span>
              </div>
              <div className="flex gap-4">
                <Knob label="TIME"  value={effects.delayTime}     min={0.05} max={1}   step={0.001} onChange={(v) => setEffectParam('delayTime', v)}     color="#06b6d4" />
                <Knob label="FDBK"  value={effects.delayFeedback} min={0}    max={0.9} step={0.01}  onChange={(v) => setEffectParam('delayFeedback', v)} color="#06b6d4" />
                <Knob label="MIX"   value={effects.delayMix}      min={0}    max={1}   step={0.01}  onChange={(v) => setEffectParam('delayMix', v)}      color="#06b6d4" />
              </div>
            </div>

            <div className="w-px bg-surface-3 self-stretch" />

            {/* Reverb */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-violet-400/80 uppercase tracking-widest">Reverb</span>
                <span className="text-[8px] font-mono text-white/25">
                  {(effects.reverbMix * 100).toFixed(0)}% wet · {effects.reverbDecay.toFixed(1)}s decay
                </span>
              </div>
              <div className="flex gap-4">
                <Knob label="DECAY" value={effects.reverbDecay} min={0.1} max={12}  step={0.1}  onChange={(v) => setEffectParam('reverbDecay', v)} color="#8b5cf6" />
                <Knob label="MIX"   value={effects.reverbMix}   min={0}   max={1}   step={0.01} onChange={(v) => setEffectParam('reverbMix', v)}   color="#8b5cf6" />
              </div>
            </div>

            <div className="w-px bg-surface-3 self-stretch" />

            {/* Preset de FX rápidos */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Presets FX</span>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Seco',      delay: [0.375,0.3,0],    reverb: [2,0.05]  },
                  { label: 'Club',      delay: [0.375,0.25,0.1], reverb: [1.5,0.2] },
                  { label: 'Espacial',  delay: [0.375,0.3,0.2],  reverb: [6,0.4]   },
                  { label: 'Tainy',     delay: [0.375,0.25,0.15],reverb: [8,0.45]  },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setEffectParam('delayTime',     p.delay[0])
                      setEffectParam('delayFeedback', p.delay[1])
                      setEffectParam('delayMix',      p.delay[2])
                      setEffectParam('reverbDecay',   p.reverb[0])
                      setEffectParam('reverbMix',     p.reverb[1])
                    }}
                    className="px-2 py-1 text-[9px] font-mono rounded bg-surface-3 text-white/40 hover:bg-surface-4 hover:text-white/70 transition-all text-left"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {fxTab === 'channels' && <ChannelFxRack />}
      {fxTab === 'atmosphere' && <AtmospherePanel />}
    </div>
  )
}
