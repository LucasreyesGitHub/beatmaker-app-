/**
 * AudioEngine — Tone.js DAW engine.
 * Soporta: FX por canal (distorsión, bitcrusher, filtro),
 *          canal de atmósfera sintetizado, modo canción con arrangement.
 */
import * as Tone from 'tone'
import { ProjectState, WaveType, ChannelFxConfig, AtmosphereConfig, SongArrangement, Pattern } from '../types'

type StepCallback = (step: number) => void

// ─── Nodo de FX por canal ─────────────────────────────────────────────────────

interface ChannelFxChain {
  distortion: Tone.Distortion
  bitcrusher: Tone.BitCrusher
  filter:     Tone.Filter
  filterGain: Tone.CrossFade   // dry/wet del filtro
}

class AudioEngine {
  private static _instance: AudioEngine | null = null
  static get(): AudioEngine {
    if (!AudioEngine._instance) AudioEngine._instance = new AudioEngine()
    return AudioEngine._instance
  }

  // ── Sintetizadores ────────────────────────────────────────────────────────
  private kickSynth!:   Tone.MembraneSynth
  private snareSynth!:  Tone.NoiseSynth
  private hihatSynth!:  Tone.MetalSynth
  private clapNoise!:   Tone.NoiseSynth
  private tomSynth!:    Tone.MembraneSynth
  private melodySynth!: Tone.PolySynth

  // ── FX master bus ─────────────────────────────────────────────────────────
  private delay!:      Tone.FeedbackDelay
  private reverb!:     Tone.Reverb
  private masterGain!: Tone.Gain

  // ── FX por canal ──────────────────────────────────────────────────────────
  private channelGains:  Map<string, Tone.Gain>          = new Map()
  private channelFxMap:  Map<string, ChannelFxChain>     = new Map()

  // ── Atmósfera ─────────────────────────────────────────────────────────────
  private atmosphereGain!: Tone.Gain
  private atmosphereFilter!: Tone.Filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private atmosphereNodes: any[] = []
  private atmosphereActive = false

  // ── Secuenciador ──────────────────────────────────────────────────────────
  private sequence:     Tone.Sequence | null = null
  private songPart:     Tone.Part    | null = null
  private currentStep = 0
  private stepCallback: StepCallback | null = null
  private snapshot:     ProjectState | null = null
  private _initialized  = false

  // ─────────────────────────────────────────────────────────────────────────
  async init(): Promise<void> {
    if (this._initialized) return
    await Tone.start()

    // Master bus
    this.masterGain = new Tone.Gain(0.85).toDestination()
    this.reverb = new Tone.Reverb({ decay: 2, wet: 0.15 })
    await this.reverb.generate()
    this.reverb.connect(this.masterGain)
    this.delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.3, wet: 0 })
    this.delay.connect(this.reverb)

    // Atmósfera bus (reverb largo dedicado)
    this.atmosphereGain   = new Tone.Gain(0).toDestination()
    this.atmosphereFilter = new Tone.Filter(4000, 'lowpass')
    this.atmosphereFilter.connect(this.atmosphereGain)

    // Construir canales con su cadena de FX
    const channelDefs = [
      { id: 'kick',   bus: this.masterGain },
      { id: 'snare',  bus: this.masterGain },
      { id: 'hihat',  bus: this.masterGain },
      { id: 'clap',   bus: this.masterGain },
      { id: 'tom',    bus: this.masterGain },
      { id: 'melody', bus: this.delay },      // melody → delay → reverb
    ]

    for (const { id, bus } of channelDefs) {
      const gain       = new Tone.Gain(0.8)
      const distortion = new Tone.Distortion(0)
      const bitcrusher = new Tone.BitCrusher(16)
      const filter     = new Tone.Filter(18000, 'lowpass')
      const cfade      = new Tone.CrossFade(0)  // 0 = dry

      // Cadena: gain → distortion → bitcrusher → filter(wet) → crossfade(b) → bus
      //                                         → crossfade(a) ---↑  (dry pass-through)
      gain.chain(distortion, bitcrusher, filter, cfade.b)
      gain.connect(cfade.a)
      cfade.connect(bus)

      if (id === 'melody') {
        // Melody también va a reverb directo
        cfade.connect(this.reverb)
      }

      this.channelGains.set(id, gain)
      this.channelFxMap.set(id, { distortion, bitcrusher, filter, filterGain: cfade })
    }

    // Sintetizadores
    this.kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.08, octaves: 6,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.2 },
    }).connect(this.channelGains.get('kick')!)

    this.snareSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.1 },
    }).connect(this.channelGains.get('snare')!)

    this.hihatSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
      harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
    }).connect(this.channelGains.get('hihat')!)

    this.clapNoise = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 },
    }).connect(this.channelGains.get('clap')!)

    this.tomSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05, octaves: 4,
      envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.15 },
    }).connect(this.channelGains.get('tom')!)

    this.melodySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 },
    }).connect(this.channelGains.get('melody')!)

    this._initialized = true
  }

  // ─── Callbacks ────────────────────────────────────────────────────────────
  onStep(cb: StepCallback) { this.stepCallback = cb }

  // ─── Sync de estado ───────────────────────────────────────────────────────
  sync(state: ProjectState) {
    this.snapshot = state
    this.masterGain?.set({ gain: state.masterVolume })
    Tone.getTransport().bpm.value = state.bpm

    // Volúmenes por canal
    const hasSolo = state.channels.some((c) => c.soloed)
    state.channels.forEach((ch) => {
      const g = this.channelGains.get(ch.id)
      if (!g) return
      const audible = !ch.muted && (!hasSolo || ch.soloed)
      g.gain.rampTo(audible ? ch.volume : 0, 0.02)

      // FX por canal
      this.syncChannelFx(ch.id, ch.fx)
    })

    // Parámetros del sintetizador
    const s = state.synth
    this.melodySynth?.set({
      oscillator: { type: s.waveType as OscillatorType },
      envelope:   { attack: s.attack, decay: s.decay, sustain: s.sustain, release: s.release },
    })

    // FX master
    const fx = state.effects
    this.delay?.set({ delayTime: fx.delayTime, feedback: fx.delayFeedback, wet: fx.delayMix })
    this.reverb?.set({ decay: fx.reverbDecay, wet: fx.reverbMix })

    // Atmósfera
    this.syncAtmosphere(state.atmosphere)
  }

  private syncChannelFx(channelId: string, cfg: ChannelFxConfig) {
    const chain = this.channelFxMap.get(channelId)
    if (!chain) return

    // Distorsión (0 = bypass efectivo con drive muy bajo)
    chain.distortion.set({ distortion: cfg.distortionAmount * 0.9, wet: cfg.distortionAmount > 0.01 ? 1 : 0 })

    // BitCrusher — 16 bits = clean, 4 bits = lo-fi
    // Tone.BitCrusher acepta 'bits', clampear entre 1-16
    const bits = Math.max(1, Math.min(16, Math.round(cfg.bitcrusherBits)))
    chain.bitcrusher.set({ bits })

    // Filtro
    chain.filter.set({ frequency: cfg.filterFreq, type: cfg.filterType, Q: cfg.filterQ })
    chain.filterGain.fade.rampTo(cfg.filterMix, 0.05)
  }

  // ─── Atmósfera sintetizada ────────────────────────────────────────────────

  private stopAtmosphere() {
    this.atmosphereNodes.forEach((n) => {
      try { n.stop(); n.dispose() } catch { /* ya detenido */ }
    })
    this.atmosphereNodes = []
    this.atmosphereActive = false
    this.atmosphereGain?.gain.rampTo(0, 0.5)
  }

  private async startAtmosphere(cfg: AtmosphereConfig) {
    this.stopAtmosphere()
    if (!cfg.enabled) return

    this.atmosphereGain.gain.rampTo(cfg.volume, 1)
    this.syncChannelFxAtmosphere(cfg.fx)

    switch (cfg.type) {
      case 'vinyl': {
        const noise = new Tone.NoiseSynth({
          noise: { type: 'brown' },
          envelope: { attack: 1, decay: 0, sustain: 1, release: 1 },
        }).connect(this.atmosphereFilter)
        const lfo = new Tone.LFO(0.3, 300, 900).start()
        lfo.connect((this.atmosphereFilter as unknown as { frequency: Tone.Signal }).frequency)
        noise.triggerAttack()
        this.atmosphereNodes.push(noise, lfo)
        break
      }
      case 'rain': {
        const noise = new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 2, decay: 0, sustain: 1, release: 2 },
        }).connect(this.atmosphereFilter)
        this.atmosphereFilter.set({ frequency: 3500, type: 'bandpass' })
        noise.triggerAttack()
        this.atmosphereNodes.push(noise)
        break
      }
      case 'pad-dark': {
        // Acorde Am7: A2, C3, E3, G3
        const chord = ['A2', 'C3', 'E3', 'G3']
        const rev = new Tone.Reverb({ decay: 8, wet: 0.7 })
        await rev.generate()
        rev.connect(this.atmosphereFilter)
        const poly = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 2, decay: 1, sustain: 0.7, release: 4 },
        }).connect(rev)
        const chorus = new Tone.Chorus(0.5, 3, 0.5).connect(rev).start()
        poly.connect(chorus)
        poly.triggerAttack(chord)
        this.atmosphereNodes.push(poly, rev, chorus)
        break
      }
      case 'pad-space': {
        // Acorde Bm9: B2, D3, F#3, A3, C#4
        const chord = ['B2', 'D3', 'F#3', 'A3']
        const rev = new Tone.Reverb({ decay: 12, wet: 0.85 })
        await rev.generate()
        rev.connect(this.atmosphereFilter)
        const chorus = new Tone.Chorus(0.3, 5, 0.7).connect(rev).start()
        const poly = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 3, decay: 2, sustain: 0.5, release: 6 },
        }).connect(chorus)
        const lfo = new Tone.LFO(0.1, 0.3, 0.8).start()
        lfo.connect((this.atmosphereGain as unknown as { gain: Tone.Signal }).gain)
        poly.triggerAttack(chord)
        this.atmosphereNodes.push(poly, rev, chorus, lfo)
        break
      }
    }
    this.atmosphereActive = true
  }

  private syncChannelFxAtmosphere(fx: ChannelFxConfig) {
    if (!this.atmosphereFilter) return
    this.atmosphereFilter.set({ frequency: fx.filterFreq, type: fx.filterType, Q: fx.filterQ })
  }

  private syncAtmosphere(cfg: AtmosphereConfig) {
    if (!cfg.enabled && this.atmosphereActive) {
      this.stopAtmosphere()
      return
    }
    if (cfg.enabled && !this.atmosphereActive) {
      this.startAtmosphere(cfg)
      return
    }
    if (cfg.enabled && this.atmosphereActive) {
      this.atmosphereGain.gain.rampTo(cfg.volume, 0.1)
      this.syncChannelFxAtmosphere(cfg.fx)
    }
  }

  // ─── Playback: modo loop ───────────────────────────────────────────────────

  start(state: ProjectState) {
    this.sync(state)
    const totalSteps = state.channels[0]?.stepCount ?? 16
    const steps = Array.from({ length: totalSteps }, (_, i) => i)

    this.sequence?.dispose()
    this.songPart?.dispose()
    this.sequence = new Tone.Sequence(
      (time, step) => {
        this.currentStep = step as number
        this.stepCallback?.(step as number)
        this.triggerStep(time, step as number)
      },
      steps,
      '16n'
    )
    this.sequence.start(0)
    Tone.getTransport().start()
  }

  // ─── Playback: modo canción ───────────────────────────────────────────────

  startSong(state: ProjectState, arrangement: SongArrangement, patterns: Pattern[]) {
    this.sync(state)
    this.sequence?.dispose()
    this.songPart?.dispose()

    const stepDur = Tone.Time('16n').toSeconds()
    const events: Array<{ time: number; patternId: string; step: number }> = []

    for (const clip of arrangement.clips) {
      const pattern = patterns.find((p) => p.id === clip.patternId)
      if (!pattern) continue
      const stepsPerBar = 16
      const totalSteps  = clip.lengthBars * stepsPerBar
      const startTime   = clip.startBar * stepsPerBar * stepDur

      for (let s = 0; s < totalSteps; s++) {
        events.push({ time: startTime + s * stepDur, patternId: clip.patternId, step: s % stepsPerBar })
      }
    }

    if (!events.length) return

    events.sort((a, b) => a.time - b.time)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.songPart = new (Tone.Part as any)(
      (time: number, ev: { patternId: string; step: number }) => {
        const pattern = patterns.find((p) => p.id === ev.patternId)
        if (!pattern) return
        this.stepCallback?.(ev.step)
        this.triggerStepFromPattern(time, ev.step, pattern)
      },
      events.map((e) => ({ time: e.time, patternId: e.patternId, step: e.step }))
    )

    this.songPart!.start(0)
    Tone.getTransport().start()
  }

  pause() { Tone.getTransport().pause() }

  stop() {
    Tone.getTransport().stop()
    this.sequence?.stop()
    this.songPart?.stop()
    this.currentStep = 0
    this.stepCallback?.(0)
  }

  // ─── Trigger de pasos ─────────────────────────────────────────────────────

  private triggerStep(time: number, step: number) {
    if (!this.snapshot) return
    this.triggerStepFromPattern(time, step, {
      id: '', name: '', color: '', bars: 2,
      channels: this.snapshot.channels,
      synth: this.snapshot.synth,
    })
  }

  private triggerStepFromPattern(time: number, step: number, pattern: Pattern) {
    const { channels, synth } = pattern
    channels.forEach((ch) => {
      if (!ch.steps[step % ch.steps.length]) return
      switch (ch.id) {
        case 'kick':   this.kickSynth.triggerAttackRelease('C1', '8n', time);  break
        case 'snare':  this.snareSynth.triggerAttackRelease('8n', time);        break
        case 'hihat':  this.hihatSynth.triggerAttackRelease('32n', time);       break
        case 'clap':   this.clapNoise.triggerAttackRelease('16n', time);        break
        case 'tom':    this.tomSynth.triggerAttackRelease('G1', '8n', time);    break
        case 'melody': {
          const note = synth.notes[step % synth.notes.length]
          if (note) this.melodySynth.triggerAttackRelease(note, '8n', time)
          break
        }
      }
    })
  }

  // ─── Vista previa de nota ─────────────────────────────────────────────────
  previewNote(note: string) {
    if (!this._initialized) return
    this.melodySynth.triggerAttackRelease(note, '8n')
  }

  // ─── Export WAV ───────────────────────────────────────────────────────────
  async exportWav(state: ProjectState, bars = 2): Promise<Blob> {
    return exportWavOffline(state, bars)
  }

  async exportSongWav(state: ProjectState, arrangement: SongArrangement, patterns: Pattern[]): Promise<Blob> {
    const bpm         = state.bpm
    const stepDur     = 60 / bpm / 4
    const stepsPerBar = 16

    // Calcular duración total
    const lastBar = arrangement.clips.reduce((max, c) => Math.max(max, c.startBar + c.lengthBars), 0)
    const duration = lastBar * stepsPerBar * stepDur + 2

    const offlineCtx = new OfflineAudioContext(2, Math.ceil(duration * 44100), 44100)
    const masterGain = offlineCtx.createGain()
    masterGain.gain.value = state.masterVolume
    masterGain.connect(offlineCtx.destination)

    for (const clip of arrangement.clips) {
      const pattern = patterns.find((p) => p.id === clip.patternId)
      if (!pattern) continue
      const clipStart = clip.startBar * stepsPerBar * stepDur
      for (let s = 0; s < clip.lengthBars * stepsPerBar; s++) {
        const t  = clipStart + s * stepDur
        const si = s % stepsPerBar
        scheduleOfflineStep(offlineCtx, masterGain, pattern, si, t, state.synth)
      }
    }

    const rendered = await offlineCtx.startRendering()
    return audioBufferToWav(rendered)
  }
}

// ─── Helpers offline rendering ────────────────────────────────────────────────

function noteToFreq(note: string): number {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const m     = note.match(/([A-G]#?)(\d)/)
  if (!m) return 440
  return 440 * Math.pow(2, (notes.indexOf(m[1]) - 9 + (parseInt(m[2]) - 4) * 12) / 12)
}

function scheduleOfflineStep(
  ctx: OfflineAudioContext,
  out: AudioNode,
  pattern: Pattern,
  si: number,
  t: number,
  synth: import('../types').SynthConfig
) {
  pattern.channels.forEach((ch) => {
    if (!ch.steps[si]) return
    if (ch.id === 'kick') {
      const osc  = ctx.createOscillator(); const g = ctx.createGain()
      osc.connect(g); g.connect(out)
      osc.frequency.setValueAtTime(150, t); osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.35)
      g.gain.setValueAtTime(ch.volume * 0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      osc.start(t); osc.stop(t + 0.35)
    }
    if (ch.id === 'snare' || ch.id === 'clap') {
      const buf  = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.15), ctx.sampleRate)
      const data = buf.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      const src  = ctx.createBufferSource(); src.buffer = buf
      const g    = ctx.createGain(); src.connect(g); g.connect(out)
      g.gain.setValueAtTime(ch.volume * 0.7, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      src.start(t); src.stop(t + 0.18)
    }
    if (ch.id === 'hihat') {
      const buf  = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate)
      const data = buf.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      const src  = ctx.createBufferSource(); src.buffer = buf
      const bpf  = ctx.createBiquadFilter(); bpf.type = 'highpass'; bpf.frequency.value = 8000
      const g    = ctx.createGain(); src.connect(bpf); bpf.connect(g); g.connect(out)
      g.gain.setValueAtTime(ch.volume * 0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
      src.start(t); src.stop(t + 0.06)
    }
    if (ch.id === 'melody') {
      const note = synth.notes[si]; if (!note) return
      const osc  = ctx.createOscillator(); const g = ctx.createGain()
      osc.type  = synth.waveType as OscillatorType
      osc.frequency.value = noteToFreq(note)
      osc.connect(g); g.connect(out)
      const dur = 0.2
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(ch.volume * synth.sustain, t + synth.attack)
      g.gain.exponentialRampToValueAtTime(0.001, t + dur + synth.release)
      osc.start(t); osc.stop(t + dur + synth.release + 0.05)
    }
  })
}

async function exportWavOffline(state: ProjectState, bars: number): Promise<Blob> {
  const bpm         = state.bpm
  const stepsPerBar = 16
  const totalSteps  = stepsPerBar * bars
  const stepDur     = 60 / bpm / 4
  const duration    = totalSteps * stepDur + 2

  const offlineCtx = new OfflineAudioContext(2, Math.ceil(duration * 44100), 44100)
  const masterGain = offlineCtx.createGain()
  masterGain.gain.value = state.masterVolume
  masterGain.connect(offlineCtx.destination)

  const fakePattern: Pattern = {
    id: '', name: '', color: '', bars: 2,
    channels: state.channels, synth: state.synth,
  }

  for (let step = 0; step < totalSteps; step++) {
    scheduleOfflineStep(offlineCtx, masterGain, fakePattern, step % stepsPerBar, step * stepDur, state.synth)
  }

  const rendered = await offlineCtx.startRendering()
  return audioBufferToWav(rendered)
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const nc = buffer.numberOfChannels, sr = buffer.sampleRate, ns = buffer.length
  const bps = 32, ba = (nc * bps) / 8, ds = ns * ba
  const out = new ArrayBuffer(44 + ds)
  const v   = new DataView(out)
  const ws  = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
  ws(0, 'RIFF'); v.setUint32(4, 36 + ds, true); ws(8, 'WAVE'); ws(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 3, true); v.setUint16(22, nc, true)
  v.setUint32(24, sr, true); v.setUint32(28, sr * ba, true); v.setUint16(32, ba, true)
  v.setUint16(34, bps, true); ws(36, 'data'); v.setUint32(40, ds, true)
  let offset = 44
  for (let i = 0; i < ns; i++)
    for (let ch = 0; ch < nc; ch++) { v.setFloat32(offset, buffer.getChannelData(ch)[i], true); offset += 4 }
  return new Blob([out], { type: 'audio/wav' })
}

export default AudioEngine
