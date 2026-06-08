import { useEffect, useRef, useCallback } from 'react'
import * as Tone from 'tone'
import AudioEngine from '../engine/AudioEngine'
import { useStore } from '../store/useStore'

export function useAudioEngine() {
  const engineRef    = useRef(AudioEngine.get())
  const isPlaying    = useStore((s) => s.isPlaying)
  const setCurrentStep = useStore((s) => s.setCurrentStep)
  const setPlaying   = useStore((s) => s.setPlaying)
  const exportProject = useStore((s) => s.exportProject)
  const viewMode     = useStore((s) => s.viewMode)
  const arrangement  = useStore((s) => s.arrangement)
  const patterns     = useStore((s) => s.patterns)

  // Registrar callback de paso una sola vez
  useEffect(() => {
    engineRef.current.onStep((step) => setCurrentStep(step))
  }, [setCurrentStep])

  // ── Auto-sync en tiempo real ──────────────────────────────────────────────
  // Solo sincronizamos parámetros que el engine audio necesita en tiempo real:
  // volúmenes/mute/solo/fx de canales, synth params, effects master, atmosphere, bpm, masterVolume.
  // Los step toggles NO necesitan sync porque el engine lee el snapshot al iniciar.
  const channelParams = useStore((s) =>
    s.channels.map((c) => ({
      id: c.id, volume: c.volume, muted: c.muted, soloed: c.soloed, fx: c.fx,
    }))
  )
  const synth        = useStore((s) => s.synth)
  const effects      = useStore((s) => s.effects)
  const atmosphere   = useStore((s) => s.atmosphere)
  const masterVolume = useStore((s) => s.masterVolume)
  const bpm          = useStore((s) => s.bpm)

  useEffect(() => {
    if (!isPlaying) return
    engineRef.current.sync(exportProject())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelParams, synth, effects, atmosphere, masterVolume, bpm, isPlaying])

  // ── Actualizar canción en tiempo real al cambiar el arrangement ───────────
  // Reconstruye el Tone.Part sin detener el Transport cuando se agregan/
  // eliminan clips o cambian los patrones mientras está sonando en modo song.
  useEffect(() => {
    if (!isPlaying || viewMode !== 'song') return
    engineRef.current.updateSongPart(exportProject(), arrangement, patterns)
  }, [arrangement, patterns, isPlaying, viewMode, exportProject])

  // ── Acciones ──────────────────────────────────────────────────────────────
  const play = useCallback(async () => {
    // Desbloquea el AudioContext en iOS/Android en cada play (puede suspenderse al volver de background)
    await Tone.start()
    const engine = engineRef.current
    await engine.init()
    const state = exportProject()
    if (viewMode === 'song') {
      engine.startSong(state, arrangement, patterns)
    } else {
      engine.start(state)
    }
    setPlaying(true)
  }, [exportProject, setPlaying, viewMode, arrangement, patterns])

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
