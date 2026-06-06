import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useTutorial } from '../../context/TutorialContext'
import { TUTORIALS } from '../../data/tutorials'
import { Tutorial } from '../../types'

const DIFFICULTY_COLOR: Record<string, string> = {
  Principiante: 'text-green-400  bg-green-400/10',
  Intermedio:   'text-yellow-400 bg-yellow-400/10',
  Avanzado:     'text-red-400    bg-red-400/10',
}

// ─── Panel principal ─────────────────────────────────────────────────────────

export function TutorialPanel({ onClose }: { onClose: () => void }) {
  const tutorialState  = useStore((s) => s.tutorialState)
  const startTutorial  = useStore((s) => s.startTutorial)

  const [view, setView] = useState<'list' | 'active'>('list')

  // Cuando hay tutorial activo, mostrar vista activa automáticamente
  if (tutorialState && view === 'list') setView('active')
  if (!tutorialState && view === 'active') setView('list')

  return (
    <div className="flex flex-col h-full bg-surface-1 border-r border-surface-3 w-72 shrink-0">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-surface-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-amber-400" />
          <div>
            <div className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-wider">
              The Tainy Method
            </div>
            <div className="text-[8px] font-mono text-white/30">Tutoriales interactivos</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded bg-surface-3 text-white/30 hover:text-white/60 text-xs font-mono transition-all"
        >✕</button>
      </div>

      {view === 'list' && (
        <TutorialList
          onSelect={(id) => { startTutorial(id); setView('active') }}
        />
      )}
      {view === 'active' && (
        <TutorialActive onBackToList={() => setView('list')} />
      )}
    </div>
  )
}

// ─── Lista de tutoriales ──────────────────────────────────────────────────────

function TutorialList({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      <p className="text-[9px] font-mono text-white/25 px-1 pt-1">
        Elige un tutorial. La app iluminará los controles que debes usar.
      </p>

      {TUTORIALS.map((t) => (
        <TutorialCard key={t.id} tutorial={t} onStart={() => onSelect(t.id)} />
      ))}

      {/* Sección de presets rápidos */}
      <div className="pt-2 border-t border-surface-3">
        <div className="text-[8px] font-mono text-white/25 uppercase tracking-wider px-1 mb-1.5">
          Ritmos de referencia
        </div>
        <div className="space-y-1">
          {[
            { name: 'Dembow Clásico',      desc: '90 BPM · Kick/Snare tradicional' },
            { name: 'Reggaetón Alt',        desc: '92 BPM · Synth melódico' },
            { name: 'Trap-tón',            desc: '88 BPM · 808 sub-bass' },
            { name: 'Moombahton Dark',      desc: '110 BPM · Half-time' },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-2 px-2 py-1.5 rounded bg-surface-2 border border-transparent hover:border-surface-3 transition-all">
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-mono text-white/55 truncate">{p.name}</div>
                <div className="text-[7px] font-mono text-white/25">{p.desc}</div>
              </div>
              <span className="text-[7px] font-mono text-white/25">→ Arranger</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TutorialCard({ tutorial, onStart }: { tutorial: Tutorial; onStart: () => void }) {
  return (
    <div className="rounded-lg border border-surface-3 bg-surface-2/50 p-3 hover:border-amber-500/30 transition-all group">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono font-bold text-white/70 group-hover:text-white/90 transition-colors">
            {tutorial.name}
          </div>
          <div className="text-[8px] font-mono text-white/30 mt-0.5">{tutorial.genre}</div>
        </div>
        <span className={`text-[7px] font-mono px-1.5 py-0.5 rounded shrink-0 ${DIFFICULTY_COLOR[tutorial.difficulty]}`}>
          {tutorial.difficulty}
        </span>
      </div>
      <p className="text-[8px] font-mono text-white/35 leading-relaxed mb-2 line-clamp-2">
        {tutorial.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-mono text-white/25">
          {tutorial.steps.length} pasos interactivos
        </span>
        <button
          onClick={onStart}
          className="px-2.5 py-1 text-[9px] font-mono font-bold rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
        >
          Comenzar →
        </button>
      </div>
    </div>
  )
}

// ─── Vista de tutorial activo ─────────────────────────────────────────────────

function TutorialActive({ onBackToList }: { onBackToList: () => void }) {
  const { currentStep, canAdvance, advance, stop,
          stepNumber, totalSteps, tutorialName } = useTutorial()
  const tutorialState = useStore((s) => s.tutorialState)
  const tutorial = TUTORIALS.find((t) => t.id === tutorialState?.tutorialId)

  if (!currentStep || !tutorial) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
        <div className="text-2xl">🎉</div>
        <div className="text-[11px] font-mono font-bold text-white/70 text-center">
          ¡Tutorial Completado!
        </div>
        <p className="text-[9px] font-mono text-white/40 text-center">
          Ahora tienes las bases para producir reggaetón moderno.
        </p>
        <button
          onClick={() => { stop(); onBackToList() }}
          className="px-3 py-1.5 text-[9px] font-mono rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
        >
          Ver todos los tutoriales
        </button>
      </div>
    )
  }

  const progress = (stepNumber - 1) / totalSteps

  return (
    <div className="flex-1 flex flex-col">
      {/* Header del tutorial activo */}
      <div className="px-3 py-2 border-b border-surface-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-mono text-amber-400/80 font-bold">{tutorialName}</span>
          <button
            onClick={() => { stop(); onBackToList() }}
            className="text-[8px] font-mono text-white/25 hover:text-white/50 transition-all"
          >
            Salir ✕
          </button>
        </div>
        {/* Barra de progreso */}
        <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[7px] font-mono text-white/25">Paso {stepNumber} de {totalSteps}</span>
          <span className="text-[7px] font-mono text-white/25">{Math.round(progress * 100)}%</span>
        </div>
      </div>

      {/* Pasos del tutorial como acordeón */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {tutorial.steps.map((step, idx) => {
          const isActive   = idx === stepNumber - 1
          const isCompleted = idx < stepNumber - 1
          return (
            <div
              key={step.id}
              className={`rounded-lg border transition-all ${
                isActive
                  ? 'border-amber-500/40 bg-amber-500/8'
                  : isCompleted
                  ? 'border-green-500/20 bg-green-500/5 opacity-60'
                  : 'border-surface-3 opacity-30'
              }`}
            >
              <div className="flex items-start gap-2 p-2.5">
                {/* Número / check */}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[8px] font-bold ${
                  isCompleted
                    ? 'bg-green-500/20 text-green-400'
                    : isActive
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-surface-3 text-white/20'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-mono font-bold mb-0.5 ${
                    isActive ? 'text-amber-300' : isCompleted ? 'text-green-300/60' : 'text-white/25'
                  }`}>
                    {step.title}
                  </div>

                  {isActive && (
                    <p className="text-[9px] font-mono text-white/55 leading-relaxed">
                      {step.body}
                    </p>
                  )}

                  {/* Highlights activos */}
                  {isActive && step.highlights.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                      <span className="text-[8px] font-mono text-yellow-400/70">
                        {step.highlights.length === 1
                          ? 'Busca el botón resaltado en amarillo'
                          : `${step.highlights.length} botones resaltados en el secuenciador`}
                      </span>
                    </div>
                  )}

                  {/* Indicador de cómo completar */}
                  {isActive && (
                    <div className="mt-2">
                      {step.completionTrigger.kind === 'auto' ? (
                        <button
                          onClick={advance}
                          className="px-3 py-1.5 text-[9px] font-mono font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all w-full"
                        >
                          Entendido — Siguiente paso →
                        </button>
                      ) : (
                        <div className="text-[8px] font-mono text-white/30 italic flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60 animate-pulse" />
                          {step.completionTrigger.kind === 'step-toggled'  && 'Haz clic en el paso resaltado'}
                          {step.completionTrigger.kind === 'note-assigned' && 'Selecciona el paso y asigna la nota'}
                          {step.completionTrigger.kind === 'param-reached' && 'Ajusta el parámetro indicado'}
                          {step.completionTrigger.kind === 'atmosphere-enabled' && 'Activa la Atmósfera en el tab FX'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-surface-3">
        <button
          onClick={() => { stop(); onBackToList() }}
          className="w-full py-1.5 text-[8px] font-mono text-white/25 hover:text-white/50 transition-all"
        >
          Abandonar tutorial
        </button>
      </div>
    </div>
  )
}
