import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { NOTE_NAMES, WaveType } from '../../types'
import { Knob } from '../ui/Knob'

const WAVE_TYPES: WaveType[] = ['sine', 'square', 'sawtooth', 'triangle']
const WAVE_LABELS: Record<WaveType, string> = {
  sine: '∿ SIN',
  square: '⊓ SQR',
  sawtooth: '⟋ SAW',
  triangle: '∧ TRI',
}

const PIANO_WHITE = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const BLACK_KEY: Record<string, string> = { C: 'C#', D: 'D#', F: 'F#', G: 'G#', A: 'A#' }

export function Synthesizer() {
  const synth      = useStore((s) => s.synth)
  const setSynthParam = useStore((s) => s.setSynthParam)
  const setMelodyNote = useStore((s) => s.setMelodyNote)
  const channels   = useStore((s) => s.channels)
  const currentStep = useStore((s) => s.currentStep)
  const { previewNote } = useAudioEngine()

  const melodyChannel = channels.find((c) => c.id === 'melody')
  const stepCount = melodyChannel?.stepCount ?? 16
  const octave = synth.octave

  // ── Selection state ─────────────────────────────────────────────────────────
  const [selectedStep, setSelectedStep]     = useState<number | null>(null)
  const [rangeAnchor, setRangeAnchor]       = useState<number | null>(null)
  const [rangeEnd, setRangeEnd]             = useState<number | null>(null)
  const [copyBuffer, setCopyBuffer]         = useState<(string | null)[]>([])

  const hasRange  = rangeAnchor !== null && rangeEnd !== null
  const rangeMin  = hasRange ? Math.min(rangeAnchor!, rangeEnd!) : null
  const rangeMax  = hasRange ? Math.max(rangeAnchor!, rangeEnd!) : null
  const inRange   = (i: number) => rangeMin !== null && rangeMax !== null && i >= rangeMin && i <= rangeMax

  // ── Step interaction ─────────────────────────────────────────────────────────
  const handleStepClick = (i: number, e: React.MouseEvent) => {
    if (e.shiftKey && selectedStep !== null) {
      setRangeAnchor(selectedStep)
      setRangeEnd(i)
    } else {
      setSelectedStep(i === selectedStep ? null : i)
      setRangeAnchor(null)
      setRangeEnd(null)
    }
  }

  const handleStepRightClick = (i: number, e: React.MouseEvent) => {
    e.preventDefault()
    setMelodyNote(i, null)
  }

  // ── Note assignment ──────────────────────────────────────────────────────────
  const assignNote = async (note: string) => {
    await previewNote(note)
    if (selectedStep === null) return
    setMelodyNote(selectedStep, note)
    // Auto-advance to next step
    setSelectedStep((selectedStep + 1) % stepCount)
  }

  // ── Copy / Paste ─────────────────────────────────────────────────────────────
  const handleCopy = () => {
    if (hasRange && rangeMin !== null && rangeMax !== null) {
      setCopyBuffer(synth.notes.slice(rangeMin, rangeMax + 1))
    } else if (selectedStep !== null) {
      setCopyBuffer([synth.notes[selectedStep] ?? null])
    }
  }

  const handlePaste = () => {
    if (!copyBuffer.length || selectedStep === null) return
    copyBuffer.forEach((note, offset) => {
      const idx = selectedStep + offset
      if (idx < stepCount) setMelodyNote(idx, note)
    })
  }

  const handleClearAll = () => {
    for (let i = 0; i < stepCount; i++) setMelodyNote(i, null)
  }

  const statusText = () => {
    if (hasRange && rangeMin !== null && rangeMax !== null)
      return `STEPS ${rangeMin + 1} – ${rangeMax + 1} SELECTED`
    if (selectedStep !== null)
      return `STEP ${selectedStep + 1} — CLICK A NOTE TO ASSIGN`
    return 'CLICK A STEP TO SELECT'
  }

  const buildNote = (name: string) => `${name}${octave}`

  return (
    <div className="p-4 space-y-5">

      {/* ── Section header ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-beat-melody" />
        <h3 className="text-xs font-mono font-bold tracking-widest text-white/60 uppercase">Synthesizer</h3>
      </div>

      {/* ── Synth controls ───────────────────────────────────────────────────── */}
      <div className="flex gap-6 flex-wrap">
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Waveform</label>
          <div className="flex gap-1">
            {WAVE_TYPES.map((w) => (
              <button
                key={w}
                onClick={() => setSynthParam('waveType', w)}
                className={`px-2 py-1 text-[10px] font-mono rounded transition-all ${
                  synth.waveType === w
                    ? 'bg-beat-melody text-white shadow-glow-sm'
                    : 'bg-surface-3 text-white/40 hover:text-white/70'
                }`}
              >
                {WAVE_LABELS[w]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Envelope (ADSR)</label>
          <div className="flex gap-4">
            <Knob label="ATK" value={synth.attack}  min={0.001} max={2} step={0.001} onChange={(v) => setSynthParam('attack', v)}  color="#8b5cf6" />
            <Knob label="DEC" value={synth.decay}   min={0.01}  max={2} step={0.01}  onChange={(v) => setSynthParam('decay', v)}   color="#8b5cf6" />
            <Knob label="SUS" value={synth.sustain} min={0}     max={1} step={0.01}  onChange={(v) => setSynthParam('sustain', v)} color="#8b5cf6" />
            <Knob label="REL" value={synth.release} min={0.01}  max={4} step={0.01}  onChange={(v) => setSynthParam('release', v)} color="#8b5cf6" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Octave</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSynthParam('octave', Math.max(2, octave - 1))}
              className="w-7 h-7 rounded bg-surface-3 text-white/60 hover:text-white hover:bg-surface-4 font-mono text-sm transition-all"
            >−</button>
            <span className="w-6 text-center font-mono text-white font-bold">{octave}</span>
            <button
              onClick={() => setSynthParam('octave', Math.min(7, octave + 1))}
              className="w-7 h-7 rounded bg-surface-3 text-white/60 hover:text-white hover:bg-surface-4 font-mono text-sm transition-all"
            >+</button>
          </div>
        </div>
      </div>

      {/* ── Piano Roll ───────────────────────────────────────────────────────── */}
      <div className="space-y-3 border border-white/5 rounded-lg p-3 bg-surface-1/30">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider">Piano Roll</span>
            <span className="text-[9px] font-mono text-white/25">{stepCount} steps</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Live status */}
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all ${
              selectedStep !== null || hasRange
                ? 'bg-violet-500/20 text-violet-300'
                : 'bg-surface-2 text-white/25'
            }`}>
              {statusText()}
            </span>

            <button
              onClick={handleCopy}
              disabled={selectedStep === null && !hasRange}
              title="Copy selected step(s)"
              className="px-2 py-0.5 text-[9px] font-mono rounded bg-surface-3 text-white/50 hover:bg-violet-500/25 hover:text-violet-200 transition-all disabled:opacity-25 disabled:pointer-events-none"
            >COPY</button>

            <button
              onClick={handlePaste}
              disabled={copyBuffer.length === 0 || selectedStep === null}
              title={`Paste ${copyBuffer.length} step(s) from clipboard`}
              className="px-2 py-0.5 text-[9px] font-mono rounded bg-surface-3 text-white/50 hover:bg-green-500/25 hover:text-green-300 transition-all disabled:opacity-25 disabled:pointer-events-none"
            >
              PASTE{copyBuffer.length > 1 ? ` ×${copyBuffer.length}` : ''}
            </button>

            <button
              onClick={() => { setSelectedStep(null); setRangeAnchor(null); setRangeEnd(null) }}
              disabled={selectedStep === null && !hasRange}
              title="Deselect"
              className="px-2 py-0.5 text-[9px] font-mono rounded bg-surface-3 text-white/50 hover:bg-white/10 hover:text-white/70 transition-all disabled:opacity-25 disabled:pointer-events-none"
            >DESEL</button>

            <button
              onClick={handleClearAll}
              title="Clear all notes"
              className="px-2 py-0.5 text-[9px] font-mono rounded bg-surface-3 text-red-400/40 hover:bg-red-500/20 hover:text-red-400 transition-all"
            >CLR ALL</button>
          </div>
        </div>

        {/* ── Step grid ──────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-0.5" style={{ minWidth: `${stepCount * 34}px` }}>
            {Array.from({ length: stepCount }, (_, i) => {
              const active     = melodyChannel?.steps[i] ?? false
              const note       = synth.notes[i] ?? null
              const isCurrent  = currentStep === i
              const isSelected = selectedStep === i
              const isInRange  = inRange(i)
              const beatMark   = i % 4 === 0

              return (
                <div key={i} className="flex flex-col items-center gap-0.5 flex-shrink-0 w-8">
                  {/* Beat number */}
                  <span className={`text-[7px] font-mono h-3 flex items-center ${
                    beatMark ? 'text-white/30' : 'text-transparent'
                  }`}>
                    {beatMark ? i + 1 : '·'}
                  </span>

                  {/* Cell */}
                  <button
                    onClick={(e) => handleStepClick(i, e)}
                    onContextMenu={(e) => handleStepRightClick(i, e)}
                    className={`w-full h-10 rounded text-center flex flex-col items-center justify-center transition-all select-none relative
                      ${isCurrent ? 'ring-1 ring-violet-400/80' : ''}
                      ${isSelected
                        ? 'ring-2 ring-violet-300 bg-violet-500/50 shadow-[0_0_6px_rgba(139,92,246,0.5)]'
                        : isInRange
                          ? 'ring-1 ring-violet-400/40 bg-violet-500/20'
                          : active
                            ? 'bg-beat-melody/25 hover:bg-beat-melody/40'
                            : 'bg-surface-2 hover:bg-surface-3'
                      }
                    `}
                  >
                    {note ? (
                      <>
                        <span className={`font-bold leading-none text-[9px] ${isSelected ? 'text-white' : 'text-violet-300'}`}>
                          {note.replace(/\d/, '')}
                        </span>
                        <span className="text-white/35 text-[7px] leading-none mt-0.5">
                          {note.match(/\d/)?.[0]}
                        </span>
                      </>
                    ) : active ? (
                      <span className="text-white/20 text-[10px]">●</span>
                    ) : (
                      <span className="text-white/8 text-[8px]">·</span>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Piano keyboard ─────────────────────────────────────────────────── */}
        <div className="relative h-16 flex rounded overflow-hidden">
          {PIANO_WHITE.map((n) => {
            const note = buildNote(n)
            const hasBlack = !!BLACK_KEY[n]
            return (
              <div key={n} className="relative flex-1">
                <button
                  onMouseDown={() => assignNote(note)}
                  className="absolute inset-0 bg-white/90 hover:bg-violet-100 active:bg-violet-300 border-r border-black/10 transition-colors z-0"
                  title={note}
                />
                <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] text-black/35 font-mono z-10 pointer-events-none">
                  {n}
                </span>
                {hasBlack && (
                  <button
                    onMouseDown={() => assignNote(buildNote(BLACK_KEY[n]))}
                    className="absolute top-0 right-0 w-[58%] h-[60%] bg-zinc-900 hover:bg-violet-900 active:bg-violet-700 rounded-b z-10 border border-white/10 transition-colors translate-x-1/2"
                    title={buildNote(BLACK_KEY[n])}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* ── Chromatic note buttons ─────────────────────────────────────────── */}
        <div>
          <div className="text-[9px] font-mono text-white/25 mb-1.5">
            Octave {octave} &amp; {octave + 1} — click to assign to selected step
          </div>
          <div className="flex flex-wrap gap-1">
            {NOTE_NAMES.flatMap((n) =>
              [octave, octave + 1].map((oct) => {
                const note    = `${n}${oct}`
                const isSharp = n.includes('#')
                return (
                  <button
                    key={note}
                    onClick={() => assignNote(note)}
                    className={`px-1.5 py-1 text-[9px] font-mono rounded transition-all
                      ${isSharp
                        ? 'bg-zinc-800 text-white/45 hover:bg-violet-900/50 hover:text-violet-200'
                        : 'bg-surface-3 text-white/60 hover:bg-beat-melody/30 hover:text-violet-200'
                      }
                    `}
                  >
                    {note}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Help row ───────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[8px] font-mono text-white/18 pt-1 border-t border-white/5">
          <span>Click step → select · then click note to assign</span>
          <span>Shift+click → range select</span>
          <span>Right-click step → clear note</span>
          <span>Auto-advances after each assignment</span>
        </div>
      </div>
    </div>
  )
}
