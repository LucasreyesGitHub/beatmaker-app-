import { Pattern, defaultChannelFx, ChannelFxConfig } from '../types'

const uid = () => Math.random().toString(36).slice(2, 9)

const fx = (overrides: Partial<ChannelFxConfig> = {}): ChannelFxConfig => ({
  ...defaultChannelFx, ...overrides,
})

const ch = (
  id: string, name: string, color: string,
  steps: number[], total: 16 | 32 = 16,
  channelFx: ChannelFxConfig = fx()
): import('../types').ChannelConfig => ({
  id, name, color,
  steps: Array(total).fill(false).map((_, i) => steps.includes(i)),
  volume: id === 'kick' ? 0.95 : id === 'snare' ? 0.85 : id === 'melody' ? 0.85 : 0.75,
  muted: false, soloed: false, stepCount: total,
  fx: channelFx,
})

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 1: Dembow Clásico (Daddy Yankee / Don Omar era — 92 BPM)
// Patrón auténtico del dembow original caribeño
// Kick: 1, 9 + ghost en 4 / Snare en posición sincopada 4, 10
// ─────────────────────────────────────────────────────────────────────────────
export const PRESET_DEMBOW_CLASICO: Omit<Pattern, 'id'> = {
  name: 'Dembow Clásico',
  color: '#f59e0b',
  bars: 2,
  channels: [
    ch('kick',  'KICK',   '#f59e0b', [0, 8]),
    ch('snare', 'SNARE',  '#10b981', [3, 4, 9, 12]),   // el sincopado es el 3 y 9
    ch('hihat', 'HI-HAT', '#06b6d4', [0, 2, 4, 6, 8, 10, 12, 14]),
    ch('clap',  'CLAP',   '#f43f5e', [4, 12]),
    ch('tom',   'TOM',    '#fb923c', []),
    ch('melody','MELODY', '#8b5cf6', [0, 3, 8, 11],    16,
      fx({ filterFreq: 800, filterMix: 0.3 })),         // filtro para el bajo oscuro
  ],
  synth: {
    waveType: 'sawtooth',
    attack: 0.002, decay: 0.35, sustain: 0.05, release: 0.2,
    octave: 2,
    notes: [
      'A2', null, null, 'A2', null, null, null, null,
      'A2', null, null, 'E2', null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 2: Tainy Signature (estilo "Callaíta", "La Canción" — 90 BPM)
// Más espacio, kick con ghost notes, hi-hat syncopado, melody menor oscura
// ─────────────────────────────────────────────────────────────────────────────
export const PRESET_TAINY: Omit<Pattern, 'id'> = {
  name: 'Tainy — Firma Oscura',
  color: '#8b5cf6',
  bars: 2,
  channels: [
    ch('kick',  'KICK',   '#f59e0b', [0, 3, 8, 11]),   // el "trip" característico de Tainy
    ch('snare', 'SNARE',  '#10b981', [4, 12]),
    ch('hihat', 'HI-HAT', '#06b6d4', [0, 2, 4, 5, 8, 10, 12, 13]), // hi-hat con ghost notes
    ch('clap',  'CLAP',   '#f43f5e', [4, 12],          16,
      fx()),
    ch('tom',   'TOM',    '#fb923c', [6, 14]),
    ch('melody','MELODY', '#8b5cf6', [0, 4, 6, 8, 12, 14], 16,
      fx({ filterFreq: 1200, filterMix: 0.4, filterQ: 2 })),
  ],
  synth: {
    waveType: 'sawtooth',
    attack: 0.003, decay: 0.4, sustain: 0.1, release: 0.4,
    octave: 2,
    notes: [
      'A2', null, null, null, 'G2', null, 'F2', null,
      'A2', null, null, null, 'E2', null, 'D2', null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 3: Perreo Intenso (Jhay Cortez / Mora estilo — 95 BPM)
// Kick más activo, hi-hat rápido, energía alta, el que suena en clubs
// ─────────────────────────────────────────────────────────────────────────────
export const PRESET_PERREO: Omit<Pattern, 'id'> = {
  name: 'Perreo Intenso',
  color: '#f43f5e',
  bars: 2,
  channels: [
    ch('kick',  'KICK',   '#f59e0b', [0, 2, 8, 10, 14]),
    ch('snare', 'SNARE',  '#10b981', [4, 9, 12]),       // snare en 3 posiciones
    ch('hihat', 'HI-HAT', '#06b6d4', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]), // 16th hat
    ch('clap',  'CLAP',   '#f43f5e', [4, 12],          16,
      fx({ distortionAmount: 0.15 })),
    ch('tom',   'TOM',    '#fb923c', [3, 7, 11, 15]),   // tom roll
    ch('melody','MELODY', '#8b5cf6', [0, 4, 8, 12]),
  ],
  synth: {
    waveType: 'square',
    attack: 0.001, decay: 0.2, sustain: 0.2, release: 0.3,
    octave: 2,
    notes: [
      'D2', null, null, null, 'D2', null, null, null,
      'C2', null, null, null, 'A1', null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 4: Trap-tón 808 (Bad Bunny "El Apagón" era — 88 BPM)
// Half-time feel, 808 sub-bass largo, hi-hat trap, mucho espacio
// ─────────────────────────────────────────────────────────────────────────────
export const PRESET_TRAPTON: Omit<Pattern, 'id'> = {
  name: 'Trap-tón 808',
  color: '#06b6d4',
  bars: 2,
  channels: [
    ch('kick',  'KICK',   '#f59e0b', [0, 10]),          // half-time: solo 2 kicks
    ch('snare', 'SNARE',  '#10b981', [8]),               // snare en el 3 (el 2 del compás)
    ch('hihat', 'HI-HAT', '#06b6d4', [0,2,4,6,8,10,12,14, 3,7,11,15]), // trap hat
    ch('clap',  'CLAP',   '#f43f5e', [8]),
    ch('tom',   'TOM',    '#fb923c', [5, 13]),
    ch('melody','MELODY', '#8b5cf6', [0, 8],            16,
      fx({ filterFreq: 600, filterMix: 0.5, filterQ: 1.5 })),
  ],
  synth: {
    waveType: 'sine',    // sine = sub puro, el 808 real
    attack: 0.002, decay: 0.7, sustain: 0.05, release: 0.5,
    octave: 1,
    notes: [
      'A1', null, null, null, null, null, null, null,
      'E1', null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 5: Reggaetón Romántico (Ozuna / Romeo Santos cruce — 92 BPM)
// Más melodioso, menos agresivo, hi-hat suave, melodía mayor
// ─────────────────────────────────────────────────────────────────────────────
export const PRESET_ROMANTICO: Omit<Pattern, 'id'> = {
  name: 'Romántico Moderno',
  color: '#fb923c',
  bars: 2,
  channels: [
    ch('kick',  'KICK',   '#f59e0b', [0, 8]),
    ch('snare', 'SNARE',  '#10b981', [4, 12]),
    ch('hihat', 'HI-HAT', '#06b6d4', [0, 4, 6, 8, 12, 14]), // hi-hat espaciado
    ch('clap',  'CLAP',   '#f43f5e', [4, 12]),
    ch('tom',   'TOM',    '#fb923c', []),
    ch('melody','MELODY', '#8b5cf6', [0, 2, 4, 8, 10, 12]),
  ],
  synth: {
    waveType: 'sine',
    attack: 0.01, decay: 0.5, sustain: 0.3, release: 0.8,
    octave: 3,
    notes: [
      'C3', null, 'E3', 'G3', null, null, null, null,
      'A2', null, 'C3', null, 'E3', null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 6: Moombahton Dark (Diplo / reggaetón lento oscuro — 108 BPM)
// Half-time pesado, kick syncopado, atmósfera densa
// ─────────────────────────────────────────────────────────────────────────────
export const PRESET_MOOMBAHTON: Omit<Pattern, 'id'> = {
  name: 'Moombahton Oscuro',
  color: '#10b981',
  bars: 2,
  channels: [
    ch('kick',  'KICK',   '#f59e0b', [0, 6, 12]),
    ch('snare', 'SNARE',  '#10b981', [8]),
    ch('hihat', 'HI-HAT', '#06b6d4', [0, 4, 8, 10, 12]),
    ch('clap',  'CLAP',   '#f43f5e', [4, 12],          16,
      fx({ distortionAmount: 0.2, bitcrusherBits: 10 })),
    ch('tom',   'TOM',    '#fb923c', [10, 14]),
    ch('melody','MELODY', '#8b5cf6', [0, 6, 8],        16,
      fx({ filterFreq: 900, filterMix: 0.5 })),
  ],
  synth: {
    waveType: 'sawtooth',
    attack: 0.005, decay: 0.5, sustain: 0.15, release: 0.5,
    octave: 2,
    notes: [
      'D2', null, null, null, null, null, 'A1', null,
      'D2', null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
    ],
  },
}

export const ALL_PRESETS = [
  PRESET_DEMBOW_CLASICO,
  PRESET_TAINY,
  PRESET_PERREO,
  PRESET_TRAPTON,
  PRESET_ROMANTICO,
  PRESET_MOOMBAHTON,
]

export function instantiatePreset(preset: Omit<Pattern, 'id'>): Pattern {
  return { ...preset, id: uid() }
}
