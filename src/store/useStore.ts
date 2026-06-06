import { create } from 'zustand'
import {
  ProjectState, ChannelConfig, SynthConfig, EffectsConfig,
  Pattern, SongArrangement, ArrangementClip, AtmosphereConfig,
  TutorialState, ViewMode, defaultChannelFx, defaultAtmosphere,
} from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9)

const makeSteps = (n = 16) => Array(n).fill(false)

const makeDefaultChannels = (): ChannelConfig[] => [
  { id: 'kick',   name: 'KICK',   color: '#f59e0b', steps: makeSteps(), volume: 0.9,  muted: false, soloed: false, stepCount: 16, fx: { ...defaultChannelFx } },
  { id: 'snare',  name: 'SNARE',  color: '#10b981', steps: makeSteps(), volume: 0.8,  muted: false, soloed: false, stepCount: 16, fx: { ...defaultChannelFx } },
  { id: 'hihat',  name: 'HI-HAT', color: '#06b6d4', steps: makeSteps(), volume: 0.7,  muted: false, soloed: false, stepCount: 16, fx: { ...defaultChannelFx } },
  { id: 'clap',   name: 'CLAP',   color: '#f43f5e', steps: makeSteps(), volume: 0.75, muted: false, soloed: false, stepCount: 16, fx: { ...defaultChannelFx } },
  { id: 'tom',    name: 'TOM',    color: '#fb923c', steps: makeSteps(), volume: 0.75, muted: false, soloed: false, stepCount: 16, fx: { ...defaultChannelFx } },
  { id: 'melody', name: 'MELODY', color: '#8b5cf6', steps: makeSteps(), volume: 0.8,  muted: false, soloed: false, stepCount: 16, fx: { ...defaultChannelFx } },
]

const defaultSynth: SynthConfig = {
  waveType: 'sawtooth',
  attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3,
  octave: 4,
  notes: Array(32).fill(null),
}

const defaultEffects: EffectsConfig = {
  delayTime: 0.375, delayFeedback: 0.3, delayMix: 0.0,
  reverbDecay: 2.0, reverbMix: 0.15,
}

const makeDefaultArrangement = (): SongArrangement => ({ clips: [], totalBars: 32 })

// ─── Tipos del store ──────────────────────────────────────────────────────────

interface Store extends ProjectState {
  // playback
  isPlaying:   boolean
  currentStep: number
  viewMode:    ViewMode

  // patrones
  patterns:        Pattern[]
  activePatternId: string

  // arrangement
  arrangement: SongArrangement

  // tutorial
  tutorialState: TutorialState | null

  // ── Acciones de playback ──────────────────────────────────────────────────
  setPlaying:     (v: boolean) => void
  setCurrentStep: (s: number) => void
  setBpm:         (bpm: number) => void
  setMasterVolume:(v: number) => void
  setViewMode:    (m: ViewMode) => void

  // ── Acciones de canal ─────────────────────────────────────────────────────
  toggleStep:        (channelId: string, step: number) => void
  setChannelVolume:  (channelId: string, vol: number) => void
  toggleMute:        (channelId: string) => void
  toggleSolo:        (channelId: string) => void
  setStepCount:      (channelId: string, count: 16 | 32) => void
  setChannelFxParam: <K extends keyof import('../types').ChannelFxConfig>(
    channelId: string, key: K, value: import('../types').ChannelFxConfig[K]
  ) => void

  // ── Acciones de sintetizador ──────────────────────────────────────────────
  setSynthParam:  <K extends keyof SynthConfig>(key: K, value: SynthConfig[K]) => void
  setMelodyNote:  (step: number, note: string | null) => void

  // ── Acciones de efectos ───────────────────────────────────────────────────
  setEffectParam: <K extends keyof EffectsConfig>(key: K, value: EffectsConfig[K]) => void

  // ── Acciones de atmósfera ─────────────────────────────────────────────────
  setAtmosphereParam: <K extends keyof AtmosphereConfig>(key: K, value: AtmosphereConfig[K]) => void
  setAtmosphereFxParam: <K extends keyof import('../types').ChannelFxConfig>(
    key: K, value: import('../types').ChannelFxConfig[K]
  ) => void

  // ── Acciones de patrones ──────────────────────────────────────────────────
  saveCurrentAsPattern: (name: string) => string
  loadPattern:          (id: string) => void
  duplicatePattern:     (id: string) => string
  deletePattern:        (id: string) => void
  renamePattern:        (id: string, name: string) => void
  updateActivePattern:  () => void

  // ── Acciones de arrangement ───────────────────────────────────────────────
  addClip:        (patternId: string, startBar: number) => void
  removeClip:     (clipId: string) => void
  moveClip:       (clipId: string, startBar: number) => void
  duplicateSection:(startBar: number, lengthBars: number) => void
  setTotalBars:   (bars: number) => void

  // ── Tutorial ──────────────────────────────────────────────────────────────
  startTutorial:   (tutorialId: string) => void
  advanceTutorial: () => void
  stopTutorial:    () => void

  // ── Proyecto ──────────────────────────────────────────────────────────────
  loadProject:   (state: ProjectState) => void
  exportProject: () => ProjectState
  resetProject:  () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<Store>((set, get) => {
  const initialChannels = makeDefaultChannels()
  const initialPatternId = uid()

  return {
    // playback
    isPlaying:   false,
    currentStep: 0,
    viewMode:    'loop',

    // live state
    bpm:         120,
    channels:    initialChannels,
    synth:       { ...defaultSynth },
    effects:     { ...defaultEffects },
    masterVolume: 0.85,
    atmosphere:  { ...defaultAtmosphere },

    // patrones — el patrón inicial es el estado actual
    patterns: [{
      id:       initialPatternId,
      name:     'Patrón 1',
      color:    '#8b5cf6',
      bars:     2,
      channels: initialChannels.map(c => ({ ...c, steps: [...c.steps], fx: { ...c.fx } })),
      synth:    { ...defaultSynth, notes: Array(32).fill(null) },
    }],
    activePatternId: initialPatternId,

    // arrangement
    arrangement: makeDefaultArrangement(),

    // tutorial
    tutorialState: null,

    // ── Playback ─────────────────────────────────────────────────────────────
    setPlaying:     (v) => set({ isPlaying: v }),
    setCurrentStep: (s) => set({ currentStep: s }),
    setBpm:         (bpm) => set({ bpm }),
    setMasterVolume:(v) => set({ masterVolume: v }),
    setViewMode:    (m) => set({ viewMode: m }),

    // ── Canal ────────────────────────────────────────────────────────────────
    toggleStep: (channelId, step) =>
      set((s) => {
        const channels = s.channels.map((ch) =>
          ch.id === channelId
            ? { ...ch, steps: ch.steps.map((v, i) => (i === step ? !v : v)) }
            : ch
        )
        return { channels }
      }),

    setChannelVolume: (channelId, vol) =>
      set((s) => ({
        channels: s.channels.map((ch) => ch.id === channelId ? { ...ch, volume: vol } : ch),
      })),

    toggleMute: (channelId) =>
      set((s) => ({
        channels: s.channels.map((ch) => ch.id === channelId ? { ...ch, muted: !ch.muted } : ch),
      })),

    toggleSolo: (channelId) =>
      set((s) => {
        const already = s.channels.find((c) => c.id === channelId)?.soloed
        return {
          channels: s.channels.map((ch) => ({
            ...ch, soloed: ch.id === channelId ? !already : false,
          })),
        }
      }),

    setStepCount: (channelId, count) =>
      set((s) => ({
        channels: s.channels.map((ch) => {
          if (ch.id !== channelId) return ch
          const steps = Array(count).fill(false).map((_, i) => ch.steps[i] ?? false)
          return { ...ch, stepCount: count, steps }
        }),
      })),

    setChannelFxParam: (channelId, key, value) =>
      set((s) => ({
        channels: s.channels.map((ch) =>
          ch.id === channelId ? { ...ch, fx: { ...ch.fx, [key]: value } } : ch
        ),
      })),

    // ── Sintetizador ─────────────────────────────────────────────────────────
    setSynthParam: (key, value) =>
      set((s) => ({ synth: { ...s.synth, [key]: value } })),

    setMelodyNote: (step, note) =>
      set((s) => {
        const notes = [...s.synth.notes]
        notes[step] = note
        return { synth: { ...s.synth, notes } }
      }),

    // ── Efectos ───────────────────────────────────────────────────────────────
    setEffectParam: (key, value) =>
      set((s) => ({ effects: { ...s.effects, [key]: value } })),

    // ── Atmósfera ─────────────────────────────────────────────────────────────
    setAtmosphereParam: (key, value) =>
      set((s) => ({ atmosphere: { ...s.atmosphere, [key]: value } })),

    setAtmosphereFxParam: (key, value) =>
      set((s) => ({
        atmosphere: { ...s.atmosphere, fx: { ...s.atmosphere.fx, [key]: value } },
      })),

    // ── Patrones ──────────────────────────────────────────────────────────────
    saveCurrentAsPattern: (name) => {
      const s = get()
      const id = uid()
      const newPattern: Pattern = {
        id, name,
        color: ['#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#06b6d4', '#fb923c'][s.patterns.length % 6],
        bars: 2,
        channels: s.channels.map(c => ({ ...c, steps: [...c.steps], fx: { ...c.fx } })),
        synth: { ...s.synth, notes: [...s.synth.notes] },
      }
      set((st) => ({
        patterns: [...st.patterns, newPattern],
        activePatternId: id,
      }))
      return id
    },

    loadPattern: (id) => {
      const s = get()
      const p = s.patterns.find((p) => p.id === id)
      if (!p) return
      set({
        activePatternId: id,
        channels: p.channels.map(c => ({ ...c, steps: [...c.steps], fx: { ...c.fx } })),
        synth: { ...p.synth, notes: [...p.synth.notes] },
      })
    },

    duplicatePattern: (id) => {
      const s = get()
      const src = s.patterns.find((p) => p.id === id)
      if (!src) return id
      const newId = uid()
      const copy: Pattern = {
        ...src, id: newId,
        name: src.name + ' (copia)',
        channels: src.channels.map(c => ({ ...c, steps: [...c.steps], fx: { ...c.fx } })),
        synth: { ...src.synth, notes: [...src.synth.notes] },
      }
      set((st) => ({ patterns: [...st.patterns, copy] }))
      return newId
    },

    deletePattern: (id) =>
      set((s) => {
        const patterns = s.patterns.filter((p) => p.id !== id)
        if (patterns.length === 0) return {}
        const activePatternId = s.activePatternId === id ? patterns[0].id : s.activePatternId
        return { patterns, activePatternId }
      }),

    renamePattern: (id, name) =>
      set((s) => ({
        patterns: s.patterns.map((p) => p.id === id ? { ...p, name } : p),
      })),

    updateActivePattern: () =>
      set((s) => ({
        patterns: s.patterns.map((p) =>
          p.id === s.activePatternId
            ? {
                ...p,
                channels: s.channels.map(c => ({ ...c, steps: [...c.steps], fx: { ...c.fx } })),
                synth: { ...s.synth, notes: [...s.synth.notes] },
              }
            : p
        ),
      })),

    // ── Arrangement ───────────────────────────────────────────────────────────
    addClip: (patternId, startBar) => {
      const s = get()
      const pattern = s.patterns.find((p) => p.id === patternId)
      if (!pattern) return
      const clip: ArrangementClip = {
        id: uid(), patternId, startBar, lengthBars: pattern.bars,
      }
      set((st) => ({
        arrangement: { ...st.arrangement, clips: [...st.arrangement.clips, clip] },
      }))
    },

    removeClip: (clipId) =>
      set((s) => ({
        arrangement: {
          ...s.arrangement,
          clips: s.arrangement.clips.filter((c) => c.id !== clipId),
        },
      })),

    moveClip: (clipId, startBar) =>
      set((s) => ({
        arrangement: {
          ...s.arrangement,
          clips: s.arrangement.clips.map((c) => c.id === clipId ? { ...c, startBar } : c),
        },
      })),

    duplicateSection: (startBar, lengthBars) =>
      set((s) => {
        const toClone = s.arrangement.clips.filter(
          (c) => c.startBar >= startBar && c.startBar < startBar + lengthBars
        )
        const newClips = toClone.map((c) => ({
          ...c, id: uid(), startBar: c.startBar + lengthBars,
        }))
        return {
          arrangement: {
            ...s.arrangement,
            clips: [...s.arrangement.clips, ...newClips],
            totalBars: Math.max(s.arrangement.totalBars, startBar + lengthBars * 2),
          },
        }
      }),

    setTotalBars: (bars) =>
      set((s) => ({ arrangement: { ...s.arrangement, totalBars: bars } })),

    // ── Tutorial ──────────────────────────────────────────────────────────────
    startTutorial: (tutorialId) =>
      set({ tutorialState: { tutorialId, currentStepIndex: 0, completed: false } }),

    advanceTutorial: () =>
      set((s) => {
        if (!s.tutorialState) return {}
        return {
          tutorialState: {
            ...s.tutorialState,
            currentStepIndex: s.tutorialState.currentStepIndex + 1,
          },
        }
      }),

    stopTutorial: () => set({ tutorialState: null }),

    // ── Proyecto ──────────────────────────────────────────────────────────────
    loadProject: (proj) =>
      set({
        bpm:         proj.bpm,
        channels:    proj.channels,
        synth:       proj.synth,
        effects:     proj.effects,
        masterVolume: proj.masterVolume,
        atmosphere:  proj.atmosphere ?? { ...defaultAtmosphere },
      }),

    exportProject: () => {
      const s = get()
      return {
        bpm: s.bpm, channels: s.channels, synth: s.synth,
        effects: s.effects, masterVolume: s.masterVolume,
        atmosphere: s.atmosphere,
      }
    },

    resetProject: () => {
      const channels = makeDefaultChannels()
      const id = uid()
      set({
        isPlaying: false, currentStep: 0, bpm: 120,
        channels, synth: { ...defaultSynth, notes: Array(32).fill(null) },
        effects: { ...defaultEffects }, masterVolume: 0.85,
        atmosphere: { ...defaultAtmosphere },
        patterns: [{ id, name: 'Patrón 1', color: '#8b5cf6', bars: 2, channels, synth: { ...defaultSynth, notes: Array(32).fill(null) } }],
        activePatternId: id,
        arrangement: makeDefaultArrangement(),
        tutorialState: null,
      })
    },
  }
})
