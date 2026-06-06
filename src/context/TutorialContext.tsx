import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { useStore } from '../store/useStore'
import { TUTORIALS } from '../data/tutorials'
import { HighlightTarget, CompletionTrigger, TutorialStep } from '../types'

// ─── Tipos del contexto ───────────────────────────────────────────────────────

interface TutorialCtx {
  currentStep:    TutorialStep | null
  highlights:     HighlightTarget[]
  isHighlighted:  (channelId: string, stepIndex: number) => boolean
  canAdvance:     boolean     // true cuando el trigger es 'auto'
  advance:        () => void
  stop:           () => void
  stepNumber:     number
  totalSteps:     number
  tutorialName:   string
}

const TutorialContext = createContext<TutorialCtx>({
  currentStep:   null,
  highlights:    [],
  isHighlighted: () => false,
  canAdvance:    false,
  advance:       () => {},
  stop:          () => {},
  stepNumber:    0,
  totalSteps:    0,
  tutorialName:  '',
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TutorialProvider({ children }: { children: ReactNode }) {
  const tutorialState   = useStore((s) => s.tutorialState)
  const channels        = useStore((s) => s.channels)
  const synth           = useStore((s) => s.synth)
  const effects         = useStore((s) => s.effects)
  const atmosphere      = useStore((s) => s.atmosphere)
  const advanceTutorial = useStore((s) => s.advanceTutorial)
  const stopTutorial    = useStore((s) => s.stopTutorial)
  const setBpm          = useStore((s) => s.setBpm)
  const setAtmosphereParam = useStore((s) => s.setAtmosphereParam)

  // ── Derivar tutorial / step activos ──────────────────────────────────────
  const tutorial = tutorialState
    ? TUTORIALS.find((t) => t.id === tutorialState.tutorialId) ?? null
    : null

  const stepIndex  = tutorialState?.currentStepIndex ?? 0
  const currentStep: TutorialStep | null = tutorial?.steps[stepIndex] ?? null
  const highlights  = currentStep?.highlights ?? []

  // ── Auto-aplicar estado cuando cambia el step ─────────────────────────────
  const prevStepId = useRef<string | null>(null)
  useEffect(() => {
    if (!currentStep || currentStep.id === prevStepId.current) return
    prevStepId.current = currentStep.id

    if (currentStep.autoApply?.bpm !== undefined) {
      setBpm(currentStep.autoApply.bpm)
    }
    if (currentStep.autoApply?.atmosphere) {
      const atm = currentStep.autoApply.atmosphere
      if (atm.enabled !== undefined) setAtmosphereParam('enabled', atm.enabled)
      if (atm.type    !== undefined) setAtmosphereParam('type',    atm.type)
    }
  }, [currentStep, setBpm, setAtmosphereParam])

  // ── Detectar completion triggers automáticos ──────────────────────────────
  const prevChannelsRef = useRef(channels)
  const prevSynthRef    = useRef(synth)
  const prevEffectsRef  = useRef(effects)
  const prevAtmRef      = useRef(atmosphere)

  useEffect(() => {
    if (!currentStep) return
    const trigger: CompletionTrigger = currentStep.completionTrigger

    switch (trigger.kind) {
      case 'step-toggled': {
        const prev  = prevChannelsRef.current.find((c) => c.id === trigger.channelId)
        const curr  = channels.find((c) => c.id === trigger.channelId)
        const wasOff = !prev?.steps[trigger.stepIndex]
        const isOn   = !!curr?.steps[trigger.stepIndex]
        if (wasOff && isOn) advanceTutorial()
        break
      }
      case 'note-assigned': {
        const wasNull = prevSynthRef.current.notes[trigger.stepIndex] === null
        const isSet   = synth.notes[trigger.stepIndex] !== null
        if (wasNull && isSet) advanceTutorial()
        break
      }
      case 'param-reached': {
        const param = trigger.param
        const val = (effects as unknown as Record<string, unknown>)[param] ??
                    (synth    as unknown as Record<string, unknown>)[param]
        if (typeof val === 'number' && val >= trigger.threshold) advanceTutorial()
        break
      }
      case 'atmosphere-enabled': {
        if (!prevAtmRef.current.enabled && atmosphere.enabled) advanceTutorial()
        break
      }
    }

    prevChannelsRef.current = channels
    prevSynthRef.current    = synth
    prevEffectsRef.current  = effects
    prevAtmRef.current      = atmosphere
  }, [channels, synth, effects, atmosphere, currentStep, advanceTutorial])

  // ── Avanzar al paso siguiente si el tutorial está completado ─────────────
  useEffect(() => {
    if (!tutorial || !tutorialState) return
    if (tutorialState.currentStepIndex >= tutorial.steps.length) {
      stopTutorial()
    }
  }, [tutorialState, tutorial, stopTutorial])

  const isHighlighted = (channelId: string, stepIndex: number) =>
    highlights.some((h) => h.channelId === channelId && h.stepIndex === stepIndex)

  const canAdvance = currentStep?.completionTrigger.kind === 'auto'

  const value: TutorialCtx = {
    currentStep,
    highlights,
    isHighlighted,
    canAdvance,
    advance:     advanceTutorial,
    stop:        stopTutorial,
    stepNumber:  stepIndex + 1,
    totalSteps:  tutorial?.steps.length ?? 0,
    tutorialName: tutorial?.name ?? '',
  }

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  )
}

export const useTutorial = () => useContext(TutorialContext)
