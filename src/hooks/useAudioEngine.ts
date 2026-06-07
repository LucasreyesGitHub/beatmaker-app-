import { useEffect, useRef, useCallback } from 'react'
import AudioEngine from '../engine/AudioEngine'
import { useStore } from '../store/useStore'

export function useAudioEngine() {
  const engineRef    = useRef(AudioEngine.get())
  const isPlaying    = useStore((s) => s.isPlaying)
  const setCurrentStep = useStore((s) => s.setCurrentStep)
  const setPlaying   = useStore((s) => s.setPlaying)
  const exportProject = useStore((s) => s.exportProject)

  // Registrar callback de paso una sola vez
  useEffect(() => {
    engineRef.current.onStep((step) => setCurrentStep(step))
  }, [setCurrentStep])

  // ── Auto-sync en tiempo real ──────────────────────────────────────────────
  // Cada vez que cambia cualquier parte del estado mientras está sonando,
  // se actualiza el engine inmediatamente — sin pause/play.
  const channels   = useStore((s) => s.channels)
  const synth      = useStore((s) => s.synth)
  const effects    = useStore((s) => s.effects)
  const atmosphere = useStore((s) => s.atmosphere)
  const masterVolume = useStore((s) => s.masterVolume)
  const bpm        = useStore((s) => s.bpm)

  useEffect(() => {
    if (!isPlaying) return
    engineRef.current.sync(exportProject())
  }, [channels, synth, effects, atmosphere, masterVolume, bpm, isPlaying, exportProject])

  // ── Acciones ──────────────────────────────────────────────────────────────
  const play = useCallback(async () => {
    const engine = engineRef.current
    await engine.init()
    engine.start(exportProject())
    setPlaying(true)
  }, [exportProject, setPlaying])

  const pause = useCallback(() => {
    engineRef.current.pause()
    setPlaying(false)
  }, [setPlaying])

  const stop = useCallback(() => {
    engineRef.current.stop()
    setPlaying(false)
  }, [setPlaying])

  // Mantener sync manual para componentes que lo usan explícitamente (Effects, etc.)
  const sync = useCallback(() => {
    const state = exportProject()
    engineRef.current.sync(state)
  }, [exportProject])

  const previewNote = useCallback(async (note: string) => {
    const engine = engineRef.current
    await engine.init()
    engine.previewNote(note)
  }, [])

  const exportWav = useCallback(async (bars = 2): Promise<Blob> => {
    const engine = engineRef.current
    await engine.init()
    return engine.exportWav(exportProject(), bars)
  }, [exportProject])

  return { play, pause, stop, sync, previewNote, exportWav }
}
