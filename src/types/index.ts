// ─── Primitivos ──────────────────────────────────────────────────────────────

export type WaveType = 'sine' | 'square' | 'sawtooth' | 'triangle'
export type FilterType = 'lowpass' | 'highpass' | 'bandpass'
export type AtmosphereType = 'silence' | 'vinyl' | 'rain' | 'pad-dark' | 'pad-space'
export type ViewMode = 'loop' | 'song'

// ─── Audio: por canal ─────────────────────────────────────────────────────────

export interface ChannelFxConfig {
  distortionAmount: number   // 0–1  (0 = bypass)
  bitcrusherBits:   number   // 4–16 (16 = bypass / full quality)
  filterFreq:       number   // 20–20000 Hz
  filterType:       FilterType
  filterQ:          number   // 0.1–20 resonancia
  filterMix:        number   // 0–1 dry/wet del filtro
}

export const defaultChannelFx: ChannelFxConfig = {
  distortionAmount: 0,
  bitcrusherBits:   16,
  filterFreq:       18000,
  filterType:       'lowpass',
  filterQ:          1,
  filterMix:        0,
}

export interface ChannelConfig {
  id:        string
  name:      string
  color:     string
  steps:     boolean[]
  volume:    number     // 0–1
  muted:     boolean
  soloed:    boolean
  stepCount: 16 | 32
  fx:        ChannelFxConfig
}

export interface SynthConfig {
  waveType: WaveType
  attack:   number
  decay:    number
  sustain:  number
  release:  number
  octave:   number
  notes:    (string | null)[]
}

export interface EffectsConfig {
  delayTime:     number
  delayFeedback: number
  delayMix:      number
  reverbDecay:   number
  reverbMix:     number
}

// ─── Atmósfera ────────────────────────────────────────────────────────────────

export interface AtmosphereConfig {
  enabled: boolean
  type:    AtmosphereType
  volume:  number
  fx:      ChannelFxConfig
}

export const defaultAtmosphere: AtmosphereConfig = {
  enabled: false,
  type:    'pad-dark',
  volume:  0.4,
  fx:      { ...defaultChannelFx, filterFreq: 4000, filterMix: 0.6 },
}

// ─── Patrones ─────────────────────────────────────────────────────────────────

export interface Pattern {
  id:       string
  name:     string
  color:    string
  bars:     1 | 2 | 4
  channels: ChannelConfig[]
  synth:    SynthConfig
}

// ─── Arrangement ──────────────────────────────────────────────────────────────

export interface ArrangementClip {
  id:        string
  patternId: string
  startBar:  number
  lengthBars: number
}

export interface SongArrangement {
  clips:     ArrangementClip[]
  totalBars: number
}

// ─── Tutorial ─────────────────────────────────────────────────────────────────

export type TutorialTab = 'sequencer' | 'synth' | 'effects' | 'arranger'

export interface HighlightTarget {
  type: 'step'
  channelId: string
  stepIndex: number
  pulse?: boolean
}

export type CompletionTrigger =
  | { kind: 'auto' }
  | { kind: 'step-toggled';  channelId: string; stepIndex: number }
  | { kind: 'note-assigned'; stepIndex: number }
  | { kind: 'param-reached'; param: keyof EffectsConfig | keyof SynthConfig; threshold: number }
  | { kind: 'atmosphere-enabled' }

export interface TutorialStep {
  id:                 string
  title:              string
  body:               string
  tab?:               TutorialTab
  highlights:         HighlightTarget[]
  autoApply?:         { bpm?: number; atmosphere?: Partial<AtmosphereConfig> }
  completionTrigger:  CompletionTrigger
}

export interface Tutorial {
  id:          string
  name:        string
  description: string
  genre:       string
  difficulty:  'Principiante' | 'Intermedio' | 'Avanzado'
  steps:       TutorialStep[]
}

export interface TutorialState {
  tutorialId:       string
  currentStepIndex: number
  completed:        boolean
}

// ─── Estado del proyecto (compatible con versiones anteriores) ────────────────

export interface ProjectState {
  bpm:         number
  channels:    ChannelConfig[]
  synth:       SynthConfig
  effects:     EffectsConfig
  masterVolume: number
  atmosphere:  AtmosphereConfig
}

// ─── Constantes ───────────────────────────────────────────────────────────────

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const CHANNEL_COLORS: Record<string, string> = {
  kick:    '#f59e0b',
  snare:   '#10b981',
  hihat:   '#06b6d4',
  clap:    '#f43f5e',
  tom:     '#fb923c',
  melody:  '#8b5cf6',
}

export const ATMOSPHERE_LABELS: Record<AtmosphereType, string> = {
  silence:   'Silencio',
  vinyl:     'Vinilo',
  rain:      'Lluvia',
  'pad-dark':  'Pad Oscuro',
  'pad-space': 'Pad Espacial',
}
