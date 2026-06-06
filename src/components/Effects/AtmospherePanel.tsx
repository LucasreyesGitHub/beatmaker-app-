import { useStore } from '../../store/useStore'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { useEffect } from 'react'
import { Knob } from '../ui/Knob'
import { AtmosphereType, FilterType, ATMOSPHERE_LABELS } from '../../types'

const ATM_TYPES: AtmosphereType[] = ['silence', 'vinyl', 'rain', 'pad-dark', 'pad-space']

const ATM_DESCRIPTIONS: Record<AtmosphereType, string> = {
  silence:    'Sin textura de fondo',
  vinyl:      'Ruido de vinilo analógico con LFO',
  rain:       'Lluvia suave filtrada',
  'pad-dark': 'Pad de cuerda Am7 con reverb largo (estilo Tainy)',
  'pad-space':'Pad etéreo Bm9 con reverb 12s (lo más cinematográfico)',
}

const ATM_ICONS: Record<AtmosphereType, string> = {
  silence:    '—',
  vinyl:      '⊙',
  rain:       '~',
  'pad-dark': '◈',
  'pad-space':'✦',
}

export function AtmospherePanel() {
  const atmosphere      = useStore((s) => s.atmosphere)
  const setAtmParam     = useStore((s) => s.setAtmosphereParam)
  const setAtmFxParam   = useStore((s) => s.setAtmosphereFxParam)
  const { sync }        = useAudioEngine()

  useEffect(() => { sync() }, [atmosphere, sync])

  const fx = atmosphere.fx

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-5 rounded-full transition-all ${
            atmosphere.enabled ? 'bg-violet-400 shadow-[0_0_6px_#a78bfa]' : 'bg-white/20'
          }`} />
          <h3 className="text-xs font-mono font-bold tracking-widest text-white/60 uppercase">
            Atmósfera
          </h3>
          <span className="text-[9px] font-mono text-white/25">Texturas de fondo sintetizadas</span>
        </div>

        {/* Toggle principal */}
        <button
          onClick={() => setAtmParam('enabled', !atmosphere.enabled)}
          className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-full transition-all ${
            atmosphere.enabled
              ? 'bg-violet-500/30 text-violet-300 border border-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.3)]'
              : 'bg-surface-3 text-white/40 border border-surface-4 hover:text-white/60'
          }`}
        >
          {atmosphere.enabled ? '◉ ACTIVA' : '○ INACTIVA'}
        </button>
      </div>

      {/* Selector de tipo */}
      <div className="space-y-2">
        <label className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Tipo de textura</label>
        <div className="grid grid-cols-5 gap-1.5">
          {ATM_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => {
                setAtmParam('type', t)
                if (t !== 'silence' && !atmosphere.enabled) setAtmParam('enabled', true)
                if (t === 'silence') setAtmParam('enabled', false)
              }}
              title={ATM_DESCRIPTIONS[t]}
              className={`py-2 px-1 rounded-lg text-center transition-all flex flex-col items-center gap-1 ${
                atmosphere.type === t && atmosphere.enabled
                  ? 'bg-violet-500/25 border border-violet-500/50 text-violet-300'
                  : 'bg-surface-2 border border-transparent text-white/35 hover:text-white/60 hover:bg-surface-3'
              }`}
            >
              <span className="text-base leading-none">{ATM_ICONS[t]}</span>
              <span className="text-[8px] font-mono">{ATMOSPHERE_LABELS[t]}</span>
            </button>
          ))}
        </div>
        {/* Descripción del tipo activo */}
        <p className="text-[9px] font-mono text-white/25 italic">
          {ATM_DESCRIPTIONS[atmosphere.type]}
        </p>
      </div>

      {/* Controles principales */}
      <div className={`space-y-4 transition-opacity ${atmosphere.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="flex gap-6 flex-wrap items-start">
          {/* Volumen */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Volumen</label>
            <Knob
              label="VOL"
              value={atmosphere.volume}
              min={0} max={1} step={0.01}
              onChange={(v) => setAtmParam('volume', v)}
              color="#8b5cf6"
            />
          </div>

          <div className="w-px bg-surface-3 self-stretch" />

          {/* FX del pad — Filtro (el más importante para "underwater") */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-white/30 uppercase tracking-wider flex items-center gap-1">
              <span className="text-[8px]">Filtro (efecto underwater)</span>
            </label>
            <div className="flex gap-1 mb-2">
              {(['lowpass', 'highpass', 'bandpass'] as FilterType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setAtmFxParam('filterType', t)}
                  className={`px-1.5 py-0.5 text-[8px] font-mono rounded transition-all ${
                    fx.filterType === t
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'bg-surface-3 text-white/25 hover:text-white/50'
                  }`}
                >
                  {{ lowpass: 'LOW', highpass: 'HI', bandpass: 'BAND' }[t]}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Knob label="FREQ" value={fx.filterFreq} min={100} max={12000} step={50}
                onChange={(v) => setAtmFxParam('filterFreq', v)} color="#3b82f6" />
              <Knob label="RES"  value={fx.filterQ}    min={0.1} max={12}    step={0.1}
                onChange={(v) => setAtmFxParam('filterQ', v)} color="#3b82f6" />
            </div>
          </div>

          <div className="w-px bg-surface-3 self-stretch" />

          {/* BitCrusher en la atmósfera */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Lo-Fi (Bit)</label>
            <Knob
              label="BITS"
              value={fx.bitcrusherBits}
              min={1} max={16} step={1}
              onChange={(v) => setAtmFxParam('bitcrusherBits', Math.round(v))}
              color="#a855f7"
            />
          </div>
        </div>

        {/* Tip */}
        <div className="text-[8px] font-mono text-white/20 border-t border-white/5 pt-3">
          <span className="text-violet-400/60">Tip Tainy: </span>
          Usa Pad Espacial + Filtro LOWPASS en 2000-3000 Hz + Reverb alto en FX Master para el efecto cinematográfico característico.
        </div>
      </div>
    </div>
  )
}
