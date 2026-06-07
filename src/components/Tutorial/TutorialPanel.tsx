import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useTutorial } from '../../context/TutorialContext'
import { TUTORIALS } from '../../data/tutorials'
import { Tutorial } from '../../types'

// ─── Panel principal ──────────────────────────────────────────────────────────

export function TutorialPanel({ onClose }: { onClose: () => void }) {
  const tutorialState = useStore((s) => s.tutorialState)
  const startTutorial = useStore((s) => s.startTutorial)
  const [view, setView] = useState<'list' | 'active'>('list')

  if (tutorialState && view === 'list') setView('active')
  if (!tutorialState && view === 'active') setView('list')

  return (
    <div className="flex flex-col bg-surface-1 border-r border-surface-3 w-80 shrink-0 h-full">

      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-3 flex items-center justify-between bg-amber-500/8">
        <div>
          <div className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider">
            🎓 Guía paso a paso
          </div>
          <div className="text-[9px] font-mono text-white/35 mt-0.5">
            Te explicamos todo desde cero
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-surface-3 text-white/40 hover:text-white/80 text-sm font-mono transition-all"
        >✕</button>
      </div>

      {view === 'list'   && <TutorialList onSelect={(id) => { startTutorial(id); setView('active') }} />}
      {view === 'active' && <TutorialActive onBackToList={() => setView('list')} />}
    </div>
  )
}

// ─── Lista de tutoriales ──────────────────────────────────────────────────────

const DIFFICULTY_STYLE: Record<string, string> = {
  Principiante: 'bg-green-500/15 text-green-400',
  Intermedio:   'bg-yellow-500/15 text-yellow-400',
  Avanzado:     'bg-red-500/15 text-red-400',
}

const TUTORIAL_ICONS = ['🧭', '🥁', '🎹', '🎚️']

function TutorialList({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      <p className="text-[10px] font-mono text-white/40 px-1 pt-1 pb-2 leading-relaxed">
        Elige un tutorial. La app te va a guiar con instrucciones simples y va a resaltar los botones que tienes que apretar.
      </p>

      {TUTORIALS.map((t, i) => (
        <TutorialCard
          key={t.id}
          tutorial={t}
          icon={TUTORIAL_ICONS[i] ?? '🎵'}
          onStart={() => onSelect(t.id)}
        />
      ))}
    </div>
  )
}

function TutorialCard({ tutorial, icon, onStart }: { tutorial: Tutorial; icon: string; onStart: () => void }) {
  return (
    <div className="rounded-xl border border-surface-3 bg-surface-2/60 p-3 hover:border-amber-500/40 transition-all group cursor-pointer" onClick={onStart}>
      <div className="flex items-start gap-3">
        <div className="text-2xl shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold text-white/80 group-hover:text-white transition-colors">
              {tutorial.name}
            </span>
            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${DIFFICULTY_STYLE[tutorial.difficulty]}`}>
              {tutorial.difficulty}
            </span>
          </div>
          <p className="text-[9px] font-mono text-white/40 leading-relaxed mb-2">
            {tutorial.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono text-white/25">
              {tutorial.steps.length} pasos cortos
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onStart() }}
              className="px-3 py-1 text-[9px] font-mono font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
            >
              Empezar →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Vista activa del tutorial ────────────────────────────────────────────────

function TutorialActive({ onBackToList }: { onBackToList: () => void }) {
  const { currentStep, canAdvance, advance, stop,
          stepNumber, totalSteps, tutorialName } = useTutorial()
  const tutorialState = useStore((s) => s.tutorialState)
  const tutorial = TUTORIALS.find((t) => t.id === tutorialState?.tutorialId)

  // Tutorial completado
  if (!currentStep || !tutorial) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-5xl">🎉</div>
        <div className="text-[14px] font-mono font-bold text-white/80">
          ¡Lo lograste!
        </div>
        <p className="text-[10px] font-mono text-white/45 leading-relaxed">
          Completaste el tutorial. Sigue explorando los otros para aprender más.
        </p>
        <button
          onClick={() => { stop(); onBackToList() }}
          className="px-4 py-2 text-[10px] font-mono font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
        >
          Ver todos los tutoriales
        </button>
      </div>
    )
  }

  const progress = (stepNumber - 1) / totalSteps

  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* Barra de progreso */}
      <div className="px-4 py-3 border-b border-surface-3 bg-surface-2/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-mono text-amber-400/80 font-bold truncate">{tutorialName}</span>
          <button
            onClick={() => { stop(); onBackToList() }}
            className="text-[8px] font-mono text-white/25 hover:text-white/60 transition-all shrink-0 ml-2"
          >
            Salir ✕
          </button>
        </div>
        <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-700"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] font-mono text-white/30">Paso {stepNumber} de {totalSteps}</span>
          <span className="text-[8px] font-mono text-white/30">{Math.round(progress * 100)}% completado</span>
        </div>
      </div>

      {/* Historial de pasos completados + paso activo */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tutorial.steps.map((step, idx) => {
          const isActive    = idx === stepNumber - 1
          const isCompleted = idx < stepNumber - 1
          const isFuture    = idx > stepNumber - 1

          if (isFuture) return null  // no mostrar pasos futuros

          return (
            <div
              key={step.id}
              className={`rounded-xl border p-3 transition-all ${
                isActive
                  ? 'border-amber-500/50 bg-amber-500/8 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                  : 'border-green-500/20 bg-green-500/5 opacity-55'
              }`}
            >
              {/* Indicador completado / activo */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isCompleted ? 'bg-green-500/25 text-green-400' : 'bg-amber-500/25 text-amber-400'
                }`}>
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <span className={`text-[11px] font-mono font-bold ${
                  isActive ? 'text-amber-300' : 'text-green-300/60'
                }`}>
                  {step.title}
                </span>
              </div>

              {/* Instrucción — solo en paso activo */}
              {isActive && (
                <>
                  {/* Texto de la instrucción — con saltos de línea */}
                  <div className="text-[10px] font-mono text-white/65 leading-relaxed mb-3 whitespace-pre-line">
                    {step.body}
                  </div>

                  {/* Si hay highlights, mostrar aviso visual claro */}
                  {step.highlights.length > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/25 rounded-lg px-3 py-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse shrink-0" />
                      <span className="text-[9px] font-mono text-yellow-300">
                        Busca el botón que parpadea en amarillo en el secuenciador
                      </span>
                    </div>
                  )}

                  {/* Botón de acción */}
                  {canAdvance ? (
                    <button
                      onClick={advance}
                      className="w-full py-2.5 text-[11px] font-mono font-bold rounded-xl bg-amber-500/25 text-amber-300 border border-amber-500/40 hover:bg-amber-500/35 transition-all"
                    >
                      Entendido — Siguiente →
                    </button>
                  ) : (
                    <div className="w-full py-2.5 text-[10px] font-mono text-white/35 border border-white/10 rounded-xl text-center bg-surface-2/50">
                      ⬆ Haz lo que dice arriba para continuar
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
