import { useEffect, useRef, useCallback } from 'react'
import AudioEngine from '../engine/AudioEngine'
import { useStore } from '../store/useStore'

export function useAudioEngine() {
  const engineRef = useRef(AudioEngine.get())
  const isPlaying = useStore((s) => s.isPlaying)
  const setCurrentStep = useStore((s) => s.setCurrentStep)
  const setPlaying = useStore((s) => s.setPlaying)
  const exportProject = useStore((s) => s.exportProject)

  useEffect(() => {
    const engine = engineRef.current
    engine.onStep((step) => setCurrentStep(step))
  }, [setCurrentStep])

  const play = useCallback(async () => {
    const engine = engineRef.current
    await engine.init()
    const state = exportProject()
    engine.start(state)
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

  // Sync state changes to engine in real time
  const sync = useCallback(() => {
    if (!isPlaying) return
    const state = exportProject()
    engineRef.current.sync(state)
  }, [isPlaying, exportProject])

  const previewNote = useCallback(async (note: string) => {
    const engine = engineRef.current
    await engine.init()
    engine.previewNote(note)
  }, [])

  const exportWav = useCallback(async (bars = 2): Promise<Blob> => {
    const engine = engineRef.current
    await engine.init()
    const state = exportProject()
    return engine.exportWav(state, bars)
  }, [exportProject])

  return { play, pause, stop, sync, previewNote, exportWav }
}
