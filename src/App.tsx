import { useEffect, useState } from 'react'
import LZString from 'lz-string'
import { Transport } from './components/Transport/Transport'
import { StepSequencer } from './components/StepSequencer/StepSequencer'
import { Synthesizer } from './components/Synthesizer/Synthesizer'
import { Effects } from './components/Effects/Effects'
import { Arranger } from './components/Arranger/Arranger'
import { TutorialPanel } from './components/Tutorial/TutorialPanel'
import { SaveLoad } from './components/ui/SaveLoad'
import { TutorialProvider } from './context/TutorialContext'
import { useStore } from './store/useStore'
import { TUTORIALS } from './data/tutorials'
import { ProjectState, TutorialTab } from './types'

type Tab = 'sequencer' | 'synth' | 'effects' | 'arranger'

const TABS: { key: Tab; label: string }[] = [
  { key: 'sequencer', label: '⊞ SECUENCIADOR' },
  { key: 'synth',     label: '∿ SYNTH' },
  { key: 'effects',   label: '◈ FX' },
  { key: 'arranger',  label: '⊙ ARRANGER' },
]

function App() {
  const [tab, setTab]             = useState<Tab>('sequencer')
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const loadProject  = useStore((s) => s.loadProject)
  const tutorialState = useStore((s) => s.tutorialState)

  // Abrir panel de tutorial automáticamente cuando se inicia uno
  useEffect(() => {
    if (tutorialState) setTutorialOpen(true)
  }, [!!tutorialState])

  // Cambiar al tab correcto cuando el tutorial lo indica
  const currentTutorialTab: TutorialTab | undefined = tutorialState
    ? TUTORIALS.find((t) => t.id === tutorialState.tutorialId)
        ?.steps[tutorialState.currentStepIndex]?.tab
    : undefined

  useEffect(() => {
    if (currentTutorialTab) setTab(currentTutorialTab)
  }, [currentTutorialTab])

  // Cargar proyecto compartido desde URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const p = params.get('p')
    if (p) {
      try {
        const json = LZString.decompressFromEncodedURIComponent(p)
        if (json) {
          loadProject(JSON.parse(json) as ProjectState)
          window.history.replaceState({}, '', window.location.pathname)
        }
      } catch { /* ignorar links corruptos */ }
    }
  }, [loadProject])

  return (
    <TutorialProvider>
      <div className="min-h-screen bg-surface-0 flex flex-col text-white">
        {/* Transport bar */}
        <Transport />

        {/* Body: tutorial sidebar + contenido principal */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── Panel de tutoriales (sidebar izquierdo) ────────────────────── */}
          {tutorialOpen && (
            <TutorialPanel onClose={() => setTutorialOpen(false)} />
          )}

          {/* ── Contenido principal ───────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center gap-0.5 px-4 pt-2 border-b border-surface-3 bg-surface-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 text-[10px] font-mono font-semibold tracking-wider rounded-t-md transition-all -mb-px ${
                    tab === t.key
                      ? 'bg-surface-0 text-accent-light border border-surface-3 border-b-surface-0'
                      : 'text-white/30 hover:text-white/60 border border-transparent'
                  }`}
                >
                  {t.label}
                </button>
              ))}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Botón tutorial */}
              <button
                onClick={() => setTutorialOpen((v) => !v)}
                className={`mb-0.5 px-3 py-1 text-[9px] font-mono font-semibold rounded-md border transition-all ${
                  tutorialOpen
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-surface-3 text-white/40 border-surface-4 hover:text-white/70 hover:border-amber-500/30'
                }`}
              >
                {tutorialState ? '🎓 Tutorial activo' : '🎓 Tutoriales'}
              </button>
            </div>

            {/* Panel activo */}
            <div className="flex-1 overflow-auto bg-surface-0">
              {tab === 'sequencer' && <StepSequencer />}
              {tab === 'synth'     && <Synthesizer />}
              {tab === 'effects'   && <Effects />}
              {tab === 'arranger'  && <Arranger />}
            </div>

            {/* Bottom bar */}
            <SaveLoad />
          </div>
        </div>
      </div>
    </TutorialProvider>
  )
}

export default App
