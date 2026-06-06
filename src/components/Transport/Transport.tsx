import { useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { useAudioEngine } from '../../hooks/useAudioEngine'

export function Transport() {
  const isPlaying     = useStore((s) => s.isPlaying)
  const bpm           = useStore((s) => s.bpm)
  const masterVolume  = useStore((s) => s.masterVolume)
  const viewMode      = useStore((s) => s.viewMode)
  const setBpm        = useStore((s) => s.setBpm)
  const setMasterVolume = useStore((s) => s.setMasterVolume)
  const setViewMode   = useStore((s) => s.setViewMode)
  const resetProject  = useStore((s) => s.resetProject)
  const tutorialState = useStore((s) => s.tutorialState)
  const { play, pause, stop, sync } = useAudioEngine()

  useEffect(() => { sync() }, [bpm, masterVolume, sync])

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-1 border-b border-surface-3 flex-wrap">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shadow-glow shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M9 3L18 12L9 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="10" width="4" height="4" rx="1" fill="white"/>
          </svg>
        </div>
        <div>
          <div className="font-bold text-[11px] tracking-widest text-white/90 font-mono leading-none">BEATMAKER</div>
          <div className="text-[7px] font-mono text-white/25 tracking-wider">REGGAETÓN DAW</div>
        </div>
      </div>

      <div className="w-px h-8 bg-surface-3" />

      {/* Botones de transport */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={isPlaying ? pause : play}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] font-semibold transition-all duration-150 ${
            isPlaying
              ? 'bg-accent/20 text-accent-light border border-accent/40 shadow-glow-sm'
              : 'bg-accent text-white shadow-glow hover:bg-accent-light active:scale-95'
          }`}
        >
          {isPlaying ? <><PauseIcon /> PAUSE</> : <><PlayIcon /> PLAY</>}
        </button>

        <button
          onClick={stop}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-semibold bg-surface-3 text-white/60 hover:bg-surface-4 hover:text-white transition-all active:scale-95"
        >
          <StopIcon /> STOP
        </button>
      </div>

      {/* Modo Loop / Canción */}
      <div className="flex items-center gap-0.5 bg-surface-2 rounded-lg p-0.5">
        {(['loop', 'song'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            className={`px-2 py-1 text-[9px] font-mono rounded transition-all ${
              viewMode === m
                ? 'bg-accent text-white shadow-sm'
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            {m === 'loop' ? '⟳ LOOP' : '▶ SONG'}
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-surface-3" />

      {/* BPM */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider shrink-0">BPM</label>
        <input
          type="range" min={60} max={180} value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="flex-1 h-1 accent-violet-500 cursor-pointer"
        />
        <input
          type="number" min={60} max={180} value={bpm}
          onChange={(e) => setBpm(Math.max(60, Math.min(180, Number(e.target.value))))}
          className="w-11 bg-surface-3 text-white text-center text-[11px] font-mono font-bold rounded-md px-1 py-0.5 border border-surface-4 focus:outline-none focus:border-accent"
        />
      </div>

      <div className="w-px h-8 bg-surface-3" />

      {/* Master volume */}
      <div className="flex items-center gap-2 min-w-[130px]">
        <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider shrink-0">VOL</label>
        <input
          type="range" min={0} max={1} step={0.01} value={masterVolume}
          onChange={(e) => setMasterVolume(Number(e.target.value))}
          className="flex-1 h-1 accent-violet-500 cursor-pointer"
        />
        <span className="text-[10px] font-mono text-white/50 w-7 text-right shrink-0">
          {Math.round(masterVolume * 100)}
        </span>
      </div>

      <div className="flex-1" />

      {/* Tutorial indicator */}
      {tutorialState && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[9px] font-mono text-amber-300">Tutorial activo</span>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={() => { if (confirm('¿Resetear el proyecto? Se perderán los cambios no guardados.')) resetProject() }}
        className="text-[9px] font-mono text-white/25 hover:text-red-400 transition-colors px-2 py-1 rounded"
      >
        RESET
      </button>
    </div>
  )
}

const PlayIcon  = () => <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M4 2l10 6-10 6V2z"/></svg>
const PauseIcon = () => <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>
const StopIcon  = () => <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><rect x="3" y="3" width="10" height="10" rx="1"/></svg>
