import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { ALL_PRESETS, instantiatePreset } from '../../data/presets'
import { Pattern } from '../../types'

const BAR_WIDTH = 40   // px por bar en el timeline
const BARS_PER_GROUP = 4

// ─── Componente principal ─────────────────────────────────────────────────────

export function Arranger() {
  const patterns          = useStore((s) => s.patterns)
  const activePatternId   = useStore((s) => s.activePatternId)
  const arrangement       = useStore((s) => s.arrangement)
  const viewMode          = useStore((s) => s.viewMode)
  const currentStep       = useStore((s) => s.currentStep)

  const loadPattern          = useStore((s) => s.loadPattern)
  const duplicatePattern     = useStore((s) => s.duplicatePattern)
  const deletePattern        = useStore((s) => s.deletePattern)
  const renamePattern        = useStore((s) => s.renamePattern)
  const saveCurrentAsPattern = useStore((s) => s.saveCurrentAsPattern)
  const updateActivePattern  = useStore((s) => s.updateActivePattern)

  const addClip        = useStore((s) => s.addClip)
  const removeClip     = useStore((s) => s.removeClip)
  const duplicateSection = useStore((s) => s.duplicateSection)
  const setTotalBars   = useStore((s) => s.setTotalBars)
  const setViewMode    = useStore((s) => s.setViewMode)

  // Para cargar presets en la biblioteca
  const saveCurrentAsP = useStore((s) => s.saveCurrentAsPattern)
  const loadProj       = useStore((s) => s.loadProject)
  const exportProject  = useStore((s) => s.exportProject)

  const { play, stop } = useAudioEngine()

  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameVal,  setRenameVal]  = useState('')
  const [newPatName, setNewPatName] = useState('')
  const [selectedSection, setSelectedSection] = useState<{ start: number; len: number } | null>(null)

  // ── Guardar cambios actuales en el patrón activo ────────────────────────
  const handleSaveCurrent = () => {
    updateActivePattern()
  }

  // ── Cargar un preset ────────────────────────────────────────────────────
  const handleLoadPreset = (presetIdx: number) => {
    const preset = ALL_PRESETS[presetIdx]
    const instance = instantiatePreset(preset)
    // Agregar a patterns sin cambiar el activo
    useStore.setState((s) => ({ patterns: [...s.patterns, instance] }))
  }

  // ── Guardar como nuevo patrón ────────────────────────────────────────────
  const handleSaveAs = () => {
    const name = newPatName.trim() || `Patrón ${patterns.length + 1}`
    saveCurrentAsPattern(name)
    setNewPatName('')
  }

  // ── Renombrar ────────────────────────────────────────────────────────────
  const commitRename = () => {
    if (renamingId && renameVal.trim()) renamePattern(renamingId, renameVal.trim())
    setRenamingId(null)
  }

  // ── Calcular bar del cursor de canción ──────────────────────────────────
  const currentBar = Math.floor(currentStep / 16)

  return (
    <div className="flex h-full min-h-0">

      {/* ── Sidebar: Biblioteca de patrones ────────────────────────────────── */}
      <div className="w-64 shrink-0 border-r border-surface-3 flex flex-col bg-surface-1/30">
        <div className="px-3 py-2 border-b border-surface-3 flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-violet-400" />
          <span className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-wider">
            Biblioteca de Patrones
          </span>
        </div>

        {/* Guardar como nuevo patrón */}
        <div className="p-2 border-b border-surface-3 space-y-1.5">
          <div className="text-[8px] font-mono text-white/25 px-0.5 mb-1">
            Los cambios en el secuenciador se guardan automáticamente en el patrón activo.
          </div>
          <div className="flex gap-1">
            <input
              value={newPatName}
              onChange={(e) => setNewPatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveAs()}
              placeholder="Guardar como nuevo patrón..."
              className="flex-1 text-[9px] font-mono bg-surface-2 border border-surface-3 rounded px-2 py-1 text-white/60 placeholder-white/20 focus:outline-none focus:border-violet-500/50"
            />
            <button
              onClick={handleSaveAs}
              title="Crear nuevo patrón con el estado actual"
              className="px-2 py-1 text-[9px] font-mono rounded bg-surface-3 text-white/50 hover:bg-violet-500/20 hover:text-violet-300 transition-all"
            >+</button>
          </div>
        </div>

        {/* Lista de patrones */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {patterns.map((p) => (
            <PatternCard
              key={p.id}
              pattern={p}
              isActive={p.id === activePatternId}
              isRenaming={renamingId === p.id}
              renameVal={renameVal}
              onLoad={() => loadPattern(p.id)}
              onDuplicate={() => duplicatePattern(p.id)}
              onDelete={() => {
                if (patterns.length > 1) deletePattern(p.id)
              }}
              onStartRename={() => { setRenamingId(p.id); setRenameVal(p.name) }}
              onRenameChange={setRenameVal}
              onRenameCommit={commitRename}
              onAddToTimeline={() => {
                const nextBar = arrangement.clips.reduce(
                  (max, c) => Math.max(max, c.startBar + c.lengthBars), 0
                )
                addClip(p.id, nextBar)
              }}
            />
          ))}
        </div>

        {/* Presets */}
        <div className="border-t border-surface-3 p-2 space-y-1">
          <span className="text-[8px] font-mono text-white/25 uppercase tracking-wider px-1">
            Cargar Preset
          </span>
          {ALL_PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleLoadPreset(i)}
              className="w-full text-left px-2 py-1 text-[9px] font-mono rounded bg-surface-2 text-white/40 hover:bg-surface-3 hover:text-white/70 transition-all truncate"
            >
              ▶ {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main: Timeline ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar del timeline */}
        <div className="px-3 py-2 border-b border-surface-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {(['loop', 'song'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded transition-all ${
                  viewMode === m
                    ? 'bg-violet-500/30 text-violet-300 border border-violet-500/50'
                    : 'bg-surface-3 text-white/30 hover:text-white/60'
                }`}
              >
                {m === 'loop' ? '⟳ LOOP' : '▶ CANCIÓN'}
              </button>
            ))}
          </div>

          <div className="w-px bg-surface-3 self-stretch" />

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-white/30">Bars:</span>
            {[16, 32, 48, 64].map((b) => (
              <button
                key={b}
                onClick={() => setTotalBars(b)}
                className={`px-1.5 py-0.5 text-[8px] font-mono rounded transition-all ${
                  arrangement.totalBars === b
                    ? 'bg-surface-4 text-white/70'
                    : 'bg-surface-2 text-white/30 hover:text-white/55'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="w-px bg-surface-3 self-stretch" />

          {/* Duplicar sección */}
          <button
            onClick={() => {
              if (selectedSection) {
                duplicateSection(selectedSection.start, selectedSection.len)
              } else {
                // Duplicar todo el arrangement
                const totalLen = arrangement.clips.reduce(
                  (max, c) => Math.max(max, c.startBar + c.lengthBars), 0
                )
                if (totalLen > 0) duplicateSection(0, totalLen)
              }
            }}
            className="px-2.5 py-1 text-[9px] font-mono rounded bg-surface-3 text-white/40 hover:bg-green-500/20 hover:text-green-300 transition-all"
            title="Duplicar todo el arrangement al final"
          >
            ⊞ Duplicar Sección
          </button>

          <button
            onClick={() => useStore.setState((s) => ({
              arrangement: { ...s.arrangement, clips: [] }
            }))}
            className="px-2.5 py-1 text-[9px] font-mono rounded bg-surface-3 text-white/30 hover:bg-red-500/15 hover:text-red-400 transition-all"
          >
            ✕ Limpiar
          </button>

          {/* Tip de uso */}
          <span className="text-[8px] font-mono text-white/20 ml-auto">
            Click en bar para añadir patrón activo · Click en clip para eliminarlo
          </span>
        </div>

        {/* Timeline grid */}
        <div className="flex-1 overflow-auto p-3">
          <Timeline
            arrangement={arrangement}
            patterns={patterns}
            activePatternId={activePatternId}
            currentBar={currentBar}
            onBarClick={(bar) => {
              // Verificar si hay un clip en ese bar — si sí, eliminarlo; si no, añadir
              const existing = arrangement.clips.find(
                (c) => bar >= c.startBar && bar < c.startBar + c.lengthBars
              )
              if (existing) {
                removeClip(existing.id)
              } else {
                addClip(activePatternId, bar)
              }
            }}
          />
        </div>

        {/* Instrucciones */}
        <div className="border-t border-surface-3 px-3 py-2 flex flex-wrap gap-4 text-[8px] font-mono text-white/20">
          <span>En modo LOOP solo suena el patrón activo en bucle</span>
          <span>En modo CANCIÓN se reproduce el timeline completo</span>
          <span>Selecciona un patrón de la biblioteca y haz click en las barras del timeline</span>
        </div>
      </div>
    </div>
  )
}

// ─── Card de patrón ───────────────────────────────────────────────────────────

interface PatternCardProps {
  pattern:           Pattern
  isActive:          boolean
  isRenaming:        boolean
  renameVal:         string
  onLoad:            () => void
  onDuplicate:       () => void
  onDelete:          () => void
  onStartRename:     () => void
  onRenameChange:    (v: string) => void
  onRenameCommit:    () => void
  onAddToTimeline:   () => void
}

function PatternCard({
  pattern, isActive, isRenaming, renameVal,
  onLoad, onDuplicate, onDelete, onStartRename,
  onRenameChange, onRenameCommit, onAddToTimeline,
}: PatternCardProps) {
  // Mini preview de los steps del kick
  const kickChannel = pattern.channels.find((c) => c.id === 'kick')
  const melodyChannel = pattern.channels.find((c) => c.id === 'melody')

  return (
    <div className={`rounded-lg border p-2 transition-all ${
      isActive
        ? 'border-violet-500/50 bg-violet-500/10'
        : 'border-surface-3 bg-surface-2/50 hover:border-surface-4'
    }`}>
      {/* Header del card */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pattern.color }} />
        {isRenaming ? (
          <input
            autoFocus
            value={renameVal}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onRenameCommit}
            onKeyDown={(e) => e.key === 'Enter' && onRenameCommit()}
            className="flex-1 text-[9px] font-mono bg-surface-0 border border-violet-500/50 rounded px-1 py-0.5 text-white focus:outline-none"
          />
        ) : (
          <span
            className={`flex-1 text-[10px] font-mono font-semibold truncate cursor-pointer ${
              isActive ? 'text-violet-200' : 'text-white/60'
            }`}
            onDoubleClick={onStartRename}
            title="Doble clic para renombrar"
          >
            {pattern.name}
          </span>
        )}
        {isActive && (
          <span className="text-[7px] font-mono text-violet-400/70 bg-violet-500/15 px-1 rounded">
            ACTIVO
          </span>
        )}
      </div>

      {/* Mini piano roll preview */}
      <div className="flex gap-0.5 mb-2 h-3">
        {Array.from({ length: 16 }, (_, i) => {
          const kickOn = kickChannel?.steps[i] ?? false
          const melOn  = melodyChannel?.steps[i] ?? false
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all ${
                kickOn ? 'bg-amber-400/80' : melOn ? 'bg-violet-400/70' : 'bg-surface-3'
              }`}
            />
          )
        })}
      </div>

      {/* Acciones */}
      <div className="flex gap-1">
        <button
          onClick={onLoad}
          className={`flex-1 py-1 text-[8px] font-mono rounded transition-all ${
            isActive
              ? 'bg-violet-500/20 text-violet-300 cursor-default'
              : 'bg-surface-3 text-white/40 hover:bg-violet-500/20 hover:text-violet-300'
          }`}
        >
          {isActive ? '✓ EDITANDO' : 'EDITAR'}
        </button>
        <button
          onClick={onAddToTimeline}
          title="Añadir al final del timeline"
          className="px-1.5 py-1 text-[8px] font-mono rounded bg-surface-3 text-white/30 hover:bg-green-500/20 hover:text-green-300 transition-all"
        >+TL</button>
        <button
          onClick={onDuplicate}
          title="Duplicar patrón"
          className="px-1.5 py-1 text-[8px] font-mono rounded bg-surface-3 text-white/30 hover:bg-blue-500/15 hover:text-blue-300 transition-all"
        >⊞</button>
        <button
          onClick={onDelete}
          title="Eliminar patrón"
          className="px-1.5 py-1 text-[8px] font-mono rounded bg-surface-3 text-white/20 hover:bg-red-500/15 hover:text-red-400 transition-all"
        >✕</button>
      </div>
    </div>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

interface TimelineProps {
  arrangement:     import('../../types').SongArrangement
  patterns:        Pattern[]
  activePatternId: string
  currentBar:      number
  onBarClick:      (bar: number) => void
}

function Timeline({ arrangement, patterns, activePatternId, currentBar, onBarClick }: TimelineProps) {
  const totalBars = arrangement.totalBars

  // Construir mapa bar → clip
  const barToClip = new Map<number, import('../../types').ArrangementClip>()
  for (const clip of arrangement.clips) {
    for (let b = clip.startBar; b < clip.startBar + clip.lengthBars; b++) {
      barToClip.set(b, clip)
    }
  }

  // Calcular duración aproximada en segundos (asume bpm 90 por defecto)
  const bpm = useStore.getState().bpm
  const totalSeconds = (totalBars * 16 * 60) / (bpm * 4)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)

  return (
    <div>
      {/* Info */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[9px] font-mono text-white/30">
          {totalBars} barras ≈ {minutes}:{String(seconds).padStart(2, '0')} min a {bpm} BPM
        </span>
        <span className="text-[9px] font-mono text-white/20">
          {arrangement.clips.length} clips en el timeline
        </span>
      </div>

      {/* Grid de barras */}
      <div className="overflow-x-auto">
        <div
          className="flex relative"
          style={{ minWidth: `${totalBars * BAR_WIDTH}px` }}
        >
          {/* Indicadores de grupo (cada 4 barras = 1 beat principal) */}
          <div className="absolute top-0 left-0 right-0 flex pointer-events-none">
            {Array.from({ length: totalBars }, (_, i) => (
              <div
                key={i}
                className={`flex-shrink-0 flex flex-col items-start border-l pt-0.5 pl-0.5 ${
                  i % BARS_PER_GROUP === 0
                    ? 'border-white/20'
                    : 'border-white/5'
                }`}
                style={{ width: BAR_WIDTH }}
              >
                {i % BARS_PER_GROUP === 0 && (
                  <span className="text-[7px] font-mono text-white/25">{i + 1}</span>
                )}
              </div>
            ))}
          </div>

          {/* Celdas del timeline */}
          <div className="flex mt-5">
            {Array.from({ length: totalBars }, (_, bar) => {
              const clip = barToClip.get(bar)
              const isClipStart = clip && clip.startBar === bar
              const pattern = clip ? patterns.find((p) => p.id === clip.patternId) : null
              const isCurrent = currentBar === bar
              const isActivePattern = pattern?.id === activePatternId

              return (
                <div
                  key={bar}
                  onClick={() => onBarClick(bar)}
                  className={`flex-shrink-0 h-12 border-l cursor-pointer transition-all relative group ${
                    clip
                      ? 'border-transparent'
                      : isCurrent
                      ? 'border-violet-500/30 bg-violet-500/5'
                      : bar % BARS_PER_GROUP === 0
                      ? 'border-white/10 hover:bg-surface-3'
                      : 'border-white/5 hover:bg-surface-2'
                  }`}
                  style={{
                    width: BAR_WIDTH,
                    backgroundColor: clip && pattern
                      ? pattern.color + (isClipStart ? '30' : '20')
                      : undefined,
                    borderLeftColor: clip && pattern && isClipStart ? pattern.color + '60' : undefined,
                    borderLeftWidth: clip && isClipStart ? 2 : undefined,
                  }}
                  title={
                    clip && pattern
                      ? `${pattern.name} — Click para eliminar`
                      : `Bar ${bar + 1} — Click para añadir "${patterns.find(p => p.id === activePatternId)?.name}"`
                  }
                >
                  {/* Nombre del patrón al inicio del clip */}
                  {isClipStart && pattern && (
                    <div
                      className="absolute top-0.5 left-1 text-[7px] font-mono font-bold truncate pointer-events-none"
                      style={{
                        color: pattern.color,
                        maxWidth: `${(clip.lengthBars * BAR_WIDTH) - 8}px`,
                      }}
                    >
                      {pattern.name}
                    </div>
                  )}

                  {/* Mini step preview dentro del clip */}
                  {clip && pattern && (
                    <div className="absolute bottom-1 left-1 right-1 flex gap-px">
                      {pattern.channels.find((c) => c.id === 'kick')?.steps.slice(0, 16).map((on, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm"
                          style={{
                            height: 3,
                            backgroundColor: on ? pattern.color : pattern.color + '20',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Cursor de posición actual */}
                  {isCurrent && (
                    <div className="absolute inset-0 border-l-2 border-violet-400 pointer-events-none" />
                  )}

                  {/* Overlay al hover en celda vacía */}
                  {!clip && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span
                        className="text-[7px] font-mono text-white/30"
                        style={{ color: patterns.find(p => p.id === activePatternId)?.color + '80' }}
                      >+</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
