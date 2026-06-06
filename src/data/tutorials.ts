import { Tutorial } from '../types'

export const TUTORIALS: Tutorial[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // TUTORIAL 1: El Dembow Básico
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'dembow-basico',
    name: 'El Dembow Básico',
    genre: 'Reggaetón Clásico',
    difficulty: 'Principiante',
    description: 'Aprende a construir el ritmo fundamental del reggaetón — el Dembow — desde cero. En 7 pasos tendrás un beat que suena como lo que escuchas en el radio.',
    steps: [
      {
        id: 's1',
        title: '¡Bienvenido al Dembow!',
        body: 'El Dembow es el corazón del reggaetón. Nació en Jamaica, llegó a Puerto Rico y conquistó el mundo. Vamos a construirlo paso a paso. Primero ajustamos el BPM a 90 — el tempo clásico del género.',
        tab: 'sequencer',
        highlights: [],
        autoApply: { bpm: 90 },
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 's2',
        title: 'KICK: Los tiempos fuertes',
        body: 'El KICK marca los golpes 1 y 3 del compás. Activa los pasos 1 y 9 del canal KICK (los cuadros amarillos resaltados).',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'kick', stepIndex: 0, pulse: true },
          { type: 'step', channelId: 'kick', stepIndex: 8, pulse: true },
        ],
        completionTrigger: { kind: 'step-toggled', channelId: 'kick', stepIndex: 0 },
      },
      {
        id: 's3',
        title: 'KICK: El tercer golpe',
        body: 'Perfecto. Ahora activa también el paso 9 (el kick del tiempo 3). Siente la pulsación del ritmo.',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'kick', stepIndex: 8, pulse: true },
        ],
        completionTrigger: { kind: 'step-toggled', channelId: 'kick', stepIndex: 8 },
      },
      {
        id: 's4',
        title: 'SNARE: El contratiempo',
        body: 'El SNARE va en los tiempos 2 y 4. Esto crea la tensión del Dembow. Activa los pasos 5 y 13 del canal SNARE.',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'snare', stepIndex: 4, pulse: true },
          { type: 'step', channelId: 'snare', stepIndex: 12, pulse: true },
        ],
        completionTrigger: { kind: 'step-toggled', channelId: 'snare', stepIndex: 4 },
      },
      {
        id: 's5',
        title: 'SNARE: Completar el contratiempo',
        body: 'Ahora el paso 13 para completar los contratiempos. El patrón Kick-Snare ya forma el esqueleto del Dembow.',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'snare', stepIndex: 12, pulse: true },
        ],
        completionTrigger: { kind: 'step-toggled', channelId: 'snare', stepIndex: 12 },
      },
      {
        id: 's6',
        title: 'HI-HAT: El pegue',
        body: 'El hi-hat en corcheas (cada 2 pasos) le da el "pegue" característico. Activa los pasos 1, 3, 5, 7, 9, 11, 13 y 15 del HI-HAT.',
        tab: 'sequencer',
        highlights: [0, 2, 4, 6, 8, 10, 12, 14].map((i) => ({
          type: 'step' as const, channelId: 'hihat', stepIndex: i, pulse: true,
        })),
        completionTrigger: { kind: 'step-toggled', channelId: 'hihat', stepIndex: 0 },
      },
      {
        id: 's7',
        title: '¡Dembow listo! Dale Play',
        body: '¡Excelente! Ya tienes el ritmo Dembow básico. Presiona Play en el Transport para escucharlo. Desde aquí puedes ir al tab SYNTH para agregar una melodía de bajo.',
        tab: 'sequencer',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TUTORIAL 2: El Sub-Bass Estilo Tainy
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'tainy-bass',
    name: 'El Sub-Bass Estilo Tainy',
    genre: 'Reggaetón Moderno',
    difficulty: 'Intermedio',
    description: 'Tainy es conocido por sus bajos oscuros y pesados. Aprende a construir un sub-bass con el sintetizador interno que suene como sus producciones.',
    steps: [
      {
        id: 'b1',
        title: 'El secreto del bajo de Tainy',
        body: 'Tainy usa bajos en notas menores oscuras — La menor, Re menor — con un SAW que se "muerde" al oído. Vamos al tab SYNTH.',
        tab: 'synth',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 'b2',
        title: 'Activa el MELODY en paso 1',
        body: 'Primero activa el paso 1 del canal MELODY en el secuenciador. Eso le dice al sintetizador que toque en ese pulso.',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'melody', stepIndex: 0, pulse: true },
        ],
        completionTrigger: { kind: 'step-toggled', channelId: 'melody', stepIndex: 0 },
      },
      {
        id: 'b3',
        title: 'Asigna la nota A2 (La grave)',
        body: 'En el Piano Roll, selecciona el paso 1 (el cuadro MELODY que activaste) y asígnale la nota A2. Es el La en la segunda octava — muy oscuro y pesado.',
        tab: 'synth',
        highlights: [],
        completionTrigger: { kind: 'note-assigned', stepIndex: 0 },
      },
      {
        id: 'b4',
        title: 'Activa más pasos y crea el groove',
        body: 'Activa los pasos 5, 9 del MELODY y asígnales también A2 (o prueba con E2 para crear movimiento). Esto crea el bounce característico.',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'melody', stepIndex: 4, pulse: true },
          { type: 'step', channelId: 'melody', stepIndex: 8, pulse: true },
        ],
        completionTrigger: { kind: 'step-toggled', channelId: 'melody', stepIndex: 4 },
      },
      {
        id: 'b5',
        title: 'ADSR: El "thump" del bajo',
        body: 'En el SYNTH, baja el ATTACK al mínimo (0.001), sube el DECAY a 0.35 y baja el SUSTAIN a 0.2. Esto crea el ataque percusivo característico del bajo de reggaetón.',
        tab: 'synth',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 'b6',
        title: '¡Bajo completo!',
        body: 'Presiona Play y escucha cómo el bajo interactúa con el Dembow. Para mayor profundidad, ve al tab FX y sube el REVERB MIX a 20-30%.',
        tab: 'synth',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TUTORIAL 3: Texturas Espaciales Estilo Tainy
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'tainy-textures',
    name: 'Texturas Espaciales',
    genre: 'Reggaetón Moderno / Alternativo',
    difficulty: 'Avanzado',
    description: 'Lo que distingue a Tainy de otros productores es la atmósfera cinematográfica de sus beats. Aprende a crear ese espacio melancólico con reverb, filtros y pads de fondo.',
    steps: [
      {
        id: 't1',
        title: 'La atmósfera es el alma del beat',
        body: 'Canciones como "Callaíta", "La Canción" o "Hawái" tienen una capa invisible de textura que las hace cinematográficas. Vamos a crearla. Primero al tab FX.',
        tab: 'effects',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 't2',
        title: 'Reverb: El espacio grande',
        body: 'Sube el DECAY del Reverb a 6 segundos o más. Esto simula una catedral. El MIX a 40%. Sentirás que el beat "respira" y se expande.',
        tab: 'effects',
        highlights: [],
        completionTrigger: { kind: 'param-reached', param: 'reverbMix', threshold: 0.35 },
      },
      {
        id: 't3',
        title: 'Delay: El eco sutil',
        body: 'Ahora el Delay. TIME en 0.375 (negra con puntillo a 90bpm), FEEDBACK en 0.25, MIX en 0.15. Esto le da profundidad sin saturar.',
        tab: 'effects',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 't4',
        title: 'Atmósfera: El pad de fondo',
        body: 'Ve a la sección ATMÓSFERA dentro de FX. Actívala y selecciona "Pad Espacial" o "Pad Oscuro". Este pad se genera proceduralmente — sin samples.',
        tab: 'effects',
        highlights: [],
        completionTrigger: { kind: 'atmosphere-enabled' },
      },
      {
        id: 't5',
        title: 'Filtro en la atmósfera',
        body: 'En los FX del pad de atmósfera, baja el filtro LOWPASS a 2000-3000 Hz. Esto le da el tono "debajo del agua" (underwater) que caracteriza las producciones de Tainy.',
        tab: 'effects',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 't6',
        title: '¡El sonido Tainy está listo!',
        body: 'Presiona Play y escucha el beat completo con las texturas. Para llevar esto al siguiente nivel, ve al tab ARRANGER y construye una canción completa de 2 minutos usando patrones diferentes para intro, verso y coro.',
        tab: 'effects',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
    ],
  },
]
