import { Pattern, defaultChannelFx } from '../types'

const uid = () => Math.random().toString(36).slice(2, 9)

const ch = (id: string, name: string, color: string, steps: number[], total = 16): import('../types').ChannelConfig => ({
  id, name, color,
  steps: Array(total).fill(false).map((_, i) => steps.includes(i)),
  volume: id === 'kick' ? 0.9 : id === 'melody' ? 0.8 : 0.75,
  muted: false, soloed: false, stepCount: total as 16 | 32,
  fx: { ...defaultChannelFx },
})

// ─── PRESET 1: Dembow Clásico ──────────────────────────────────────────────────
// Kick: 1, 3 (tiempos fuertes) + rimshot en el "and" del 2
// El dembow clásico tiene un snare en posición sincopada (paso 3/9)
export const PRESET_DEMBOW_CLASICO: Omit<Pattern, 'id'> = {
  name: 'Dembow Clásico',
  color: '#f59e0b',
  bars: 2,
  channels: [
    ch('kick',   'KICK',   '#f59e0b', [0, 8]),
    ch('snare',  'SNARE',  '#10b981', [3, 4, 9, 12]),   // el "dembow" = snare en 3 y 9
    ch('hihat',  'HI-HAT', '#06b6d4', [0, 2, 4, 6, 8, 10, 12, 14]),
    ch('clap',   'CLAP',   '#f43f5e', [4, 12]),
    ch('tom',    'TOM',    '#fb923c', []),
    ch('melody', 'MELODY', '#8b5cf6', [0, 4, 8, 12]),
  ],
  synth: {
    waveType: 'sawtooth',
    attack: 0.002, decay: 0.3, sustain: 0.1, release: 0.2,
    octave: 2,
    notes: ['A2', null, null, null, 'A2', null, null, null, 'A2', null, null, null, 'E2', null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  },
}

// ─── PRESET 2: Reggaetón Alternativo / Synthwave ───────────────────────────────
// Kick más espaciado, hihat más sincopado, melodía de sintetizador tipo 80s
export const PRESET_REGGAETON_ALT: Omit<Pattern, 'id'> = {
  name: 'Reggaetón Alt / Synthwave',
  color: '#8b5cf6',
  bars: 2,
  channels: [
    ch('kick',   'KICK',   '#f59e0b', [0, 6, 10]),
    ch('snare',  'SNARE',  '#10b981', [4, 12]),
    ch('hihat',  'HI-HAT', '#06b6d4', [0, 3, 6, 9, 12, 14]),   // hi-hat sincopado
    ch('clap',   'CLAP',   '#f43f5e', [4, 8, 12]),
    ch('tom',    'TOM',    '#fb923c', [2, 10]),
    ch('melody', 'MELODY', '#8b5cf6', [0, 2, 5, 8, 10, 13]),
  ],
  synth: {
    waveType: 'square',
    attack: 0.01, decay: 0.4, sustain: 0.3, release: 0.5,
    octave: 3,
    notes: ['C3', 'C3', null, null, null, 'G2', null, null, 'C3', null, 'C3', null, null, 'F2', null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  },
}

// ─── PRESET 3: Trap-tón ────────────────────────────────────────────────────────
// 808-style, hi-hat en tripletes, kick potente, bajo sub profundo
export const PRESET_TRAPTON: Omit<Pattern, 'id'> = {
  name: 'Trap-tón (Hybrid)',
  color: '#f43f5e',
  bars: 2,
  channels: [
    ch('kick',   'KICK',   '#f59e0b', [0, 3, 8, 11]),
    ch('snare',  'SNARE',  '#10b981', [4, 12]),
    ch('hihat',  'HI-HAT', '#06b6d4', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]),  // 16th hi-hat trap
    ch('clap',   'CLAP',   '#f43f5e', [4, 12]),
    ch('tom',    'TOM',    '#fb923c', [6, 14]),
    ch('melody', 'MELODY', '#8b5cf6', [0, 8]),
  ],
  synth: {
    waveType: 'sine',     // sine = más sub
    attack: 0.001, decay: 0.5, sustain: 0.05, release: 0.3,
    octave: 1,
    notes: ['A1', null, null, null, null, null, null, null, 'E1', null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  },
}

// ─── PRESET 4: Moombahton ─────────────────────────────────────────────────────
// 108 BPM, half-time feel, más lento y pesado
export const PRESET_MOOMBAHTON: Omit<Pattern, 'id'> = {
  name: 'Moombahton Dark',
  color: '#06b6d4',
  bars: 2,
  channels: [
    ch('kick',   'KICK',   '#f59e0b', [0, 12]),
    ch('snare',  'SNARE',  '#10b981', [8]),
    ch('hihat',  'HI-HAT', '#06b6d4', [0, 4, 6, 8, 12, 14]),
    ch('clap',   'CLAP',   '#f43f5e', [4, 12]),
    ch('tom',    'TOM',    '#fb923c', [10, 14]),
    ch('melody', 'MELODY', '#8b5cf6', [0, 6, 8]),
  ],
  synth: {
    waveType: 'sawtooth',
    attack: 0.005, decay: 0.4, sustain: 0.2, release: 0.4,
    octave: 2,
    notes: ['D2', null, null, null, null, null, 'A1', null, 'D2', null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  },
}

export const ALL_PRESETS = [
  PRESET_DEMBOW_CLASICO,
  PRESET_REGGAETON_ALT,
  PRESET_TRAPTON,
  PRESET_MOOMBAHTON,
]

export function instantiatePreset(preset: Omit<Pattern, 'id'>): Pattern {
  return { ...preset, id: uid() }
}
