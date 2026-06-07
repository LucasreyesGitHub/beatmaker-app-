import { Tutorial } from '../types'

export const TUTORIALS: Tutorial[] = [

  // ─────────────────────────────────────────────────────────────────────────
  // TUTORIAL 0: Tour de la app — para alguien que nunca usó nada de esto
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'tour-basico',
    name: '¿Cómo funciona esto?',
    genre: 'Introducción',
    difficulty: 'Principiante',
    description: 'Nunca usaste un programa de beats antes. Perfecto, empezamos desde cero. Te explico qué es cada botón en 5 minutos.',
    steps: [
      {
        id: 't0',
        title: 'Bienvenido 👋',
        body: 'Esta app te permite crear música. Piensa en ella como una caja de ritmos digital.\n\nLo que ves son filas de cuadros. Cada fila es un instrumento (KICK = bombo, SNARE = caja, etc). Cuando le das Play, los cuadros se van iluminando de izquierda a derecha, y cada cuadro que está prendido hace sonar ese instrumento.\n\nPresiona el botón de abajo para continuar.',
        tab: 'sequencer',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 't1',
        title: 'Prende tu primer cuadro 🟡',
        body: 'Ve a la fila que dice KICK (es la primera). Haz clic en el primer cuadro de esa fila — el que está resaltado en amarillo.\n\nEso es todo. Acabas de poner una nota.',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'kick', stepIndex: 0, pulse: true },
        ],
        completionTrigger: { kind: 'step-toggled', channelId: 'kick', stepIndex: 0 },
      },
      {
        id: 't2',
        title: '¡Dale Play! ▶',
        body: '¡Perfecto! Ahora presiona el botón PLAY que está arriba a la izquierda.\n\nVas a escuchar el bombo sonar en loop. El cuadro que prendiste se repite una y otra vez.\n\nPresiona "Entendido" cuando lo hayas escuchado.',
        tab: 'sequencer',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 't3',
        title: 'El BPM — velocidad de la música',
        body: 'Arriba ves "BPM" con un número. BPM significa "golpes por minuto" — básicamente qué tan rápida va la música.\n\n• 60 BPM = muy lento\n• 90 BPM = velocidad reggaetón\n• 140 BPM = muy rápido\n\nPuedes mover el slider o escribir un número. No necesitas tocarlo ahora.',
        tab: 'sequencer',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 't4',
        title: 'Listo para el primer beat 🎵',
        body: '¡Ya sabes lo básico!\n\n✅ Los cuadros = notas (clic para prender/apagar)\n✅ Cada fila = un instrumento\n✅ Play = escuchar todo junto\n✅ BPM = velocidad\n\nAhora intenta el tutorial "Tu primer beat de reggaetón" para hacer algo que suene de verdad.',
        tab: 'sequencer',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TUTORIAL 1: Primer beat de reggaetón — sin jerga, paso a paso
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'dembow-basico',
    name: 'Tu primer beat de reggaetón',
    genre: 'Reggaetón',
    difficulty: 'Principiante',
    description: 'Vamos a hacer un beat de reggaetón desde cero. Solo tienes que hacer clic donde te digo. Al final vas a tener algo que suena de verdad.',
    steps: [
      {
        id: 's0',
        title: 'Primero: velocidad correcta',
        body: 'El reggaetón va a 90 o 95 BPM. Ya lo puse en 90 para ti automáticamente.\n\nPresiona "Entendido" para seguir.',
        tab: 'sequencer',
        highlights: [],
        autoApply: { bpm: 90 },
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 's1',
        title: 'Paso 1 — El bombo (KICK) 🥁',
        body: 'El KICK es el golpe grave, el "BUM" del reggaetón.\n\nHaz clic en el cuadro amarillo de la fila KICK.\n\n(Es el primer cuadro de la primera fila)',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'kick', stepIndex: 0, pulse: true },
          { type: 'step', channelId: 'kick', stepIndex: 8, pulse: true },
        ],
        completionTrigger: { kind: 'step-toggled', channelId: 'kick', stepIndex: 0 },
      },
      {
        id: 's2',
        title: 'Otro bombo a la mitad 🥁',
        body: 'Ahora haz clic en el cuadro amarillo que está en la MITAD de la fila KICK.\n\nEso es el cuadro número 9.',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'kick', stepIndex: 8, pulse: true },
        ],
        completionTrigger: { kind: 'step-toggled', channelId: 'kick', stepIndex: 8 },
      },
      {
        id: 's3',
        title: 'Paso 2 — La caja (SNARE) 🔔',
        body: 'El SNARE es el "PA" del reggaetón, el golpe que le da el ritmo característico.\n\nHaz clic en el cuadro amarillo de la fila SNARE.\n\n(Es el quinto cuadro — justo en el primer cuarto de la barra)',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'snare', stepIndex: 4, pulse: true },
          { type: 'step', channelId: 'snare', stepIndex: 12, pulse: true },
        ],
        completionTrigger: { kind: 'step-toggled', channelId: 'snare', stepIndex: 4 },
      },
      {
        id: 's4',
        title: 'Otra caja más adelante',
        body: 'Ahora haz clic en el otro cuadro amarillo de la fila SNARE.\n\nEs el número 13, hacia el final.',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'snare', stepIndex: 12, pulse: true },
        ],
        completionTrigger: { kind: 'step-toggled', channelId: 'snare', stepIndex: 12 },
      },
      {
        id: 's5',
        title: 'Paso 3 — El platillo (HI-HAT) ✨',
        body: 'El HI-HAT es el "chic chic chic" — el sonido metálico que da el pulso.\n\nHaz clic en el PRIMER cuadro amarillo de la fila HI-HAT para empezar.',
        tab: 'sequencer',
        highlights: [0, 2, 4, 6, 8, 10, 12, 14].map(i => ({
          type: 'step' as const, channelId: 'hihat', stepIndex: i, pulse: true,
        })),
        completionTrigger: { kind: 'step-toggled', channelId: 'hihat', stepIndex: 0 },
      },
      {
        id: 's6',
        title: 'Más platillos — uno sí, uno no',
        body: 'Prende los platillos saltando uno. Quedaría así:\n\n✅ ☐ ✅ ☐ ✅ ☐ ✅ ☐ ✅ ☐ ✅ ☐ ✅ ☐ ✅ ☐\n\n(Los cuadros amarillos te guían. Prende todos los que puedas.)\n\nCuando tengas varios prendidos presiona "Entendido".',
        tab: 'sequencer',
        highlights: [2, 4, 6, 8, 10, 12, 14].map(i => ({
          type: 'step' as const, channelId: 'hihat', stepIndex: i, pulse: true,
        })),
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 's7',
        title: '¡Dale Play ahora! 🎉',
        body: '¡Eso es un beat de reggaetón!\n\nPresiona PLAY arriba para escucharlo. Si quieres que suene más rápido, sube el BPM a 95.\n\nPuedes prender y apagar cuadros mientras suena — la música cambia en tiempo real.',
        tab: 'sequencer',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TUTORIAL 2: Agregar melodía — muy simplificado
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'tainy-bass',
    name: 'Agrega una melodía',
    genre: 'Reggaetón Moderno',
    difficulty: 'Principiante',
    description: 'Ya tienes el ritmo. Ahora le agregamos notas de melodía con el sintetizador. Más fácil de lo que parece.',
    steps: [
      {
        id: 'b0',
        title: '¿Qué es el SYNTH?',
        body: 'La app tiene un instrumento virtual llamado "Sintetizador" (SYNTH).\n\nEs como un piano digital que puedes programar para que toque notas automáticamente mientras suena el beat.\n\nPrimero activa el paso 1 del canal MELODY — el cuadro amarillo de abajo.',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'melody', stepIndex: 0, pulse: true },
        ],
        completionTrigger: { kind: 'step-toggled', channelId: 'melody', stepIndex: 0 },
      },
      {
        id: 'b1',
        title: 'Activa más notas de melodía',
        body: 'Activa también los cuadros 5 y 9 de la fila MELODY.\n\nEstos son los momentos donde el sintetizador va a tocar una nota.\n\nCuando los tengas prendidos presiona "Entendido".',
        tab: 'sequencer',
        highlights: [
          { type: 'step', channelId: 'melody', stepIndex: 4, pulse: true },
          { type: 'step', channelId: 'melody', stepIndex: 8, pulse: true },
        ],
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 'b2',
        title: 'Ahora ve al tab SYNTH',
        body: 'Haz clic en el botón "∿ SYNTH" que está en la barra de arriba.\n\nAhí vas a ver un teclado de piano y unos pasos. Vas a asignarle notas a los pasos que prendiste.',
        tab: 'synth',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 'b3',
        title: 'Selecciona el paso 1 y asígnale una nota',
        body: 'En el Piano Roll (la sección de abajo), haz clic en el primer cuadro pequeño para seleccionarlo.\n\nLuego haz clic en cualquier tecla del teclado de piano — o en uno de los botones de notas que ves abajo (como "A2" o "C3").\n\nVas a escuchar el sonido y quedará asignado.',
        tab: 'synth',
        highlights: [],
        completionTrigger: { kind: 'note-assigned', stepIndex: 0 },
      },
      {
        id: 'b4',
        title: '¡Escúchalo! 🎵',
        body: '¡Perfecto! Ahora dale PLAY y escucha el beat con la melodía.\n\nPuedes cambiar las notas de los otros pasos igual — selecciona el cuadro y toca una nota.\n\nTip: las notas bajas (A1, A2) suenan más oscuras y graves. Las altas (C5, D5) más brillantes.',
        tab: 'synth',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TUTORIAL 3: Efectos — ultra simplificado
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'tainy-textures',
    name: 'Haz que suene más profesional',
    genre: 'Efectos de sonido',
    difficulty: 'Principiante',
    description: 'Con unos pocos giros de perilla tu beat va a sonar mucho más espacioso y profesional. Sin saber nada técnico.',
    steps: [
      {
        id: 't0',
        title: '¿Qué son los FX?',
        body: 'Los FX (efectos) son filtros que se aplican al sonido.\n\nEl más importante es el REVERB — hace que el sonido "rebote" como si estuvieras en una habitación grande o una catedral.\n\nVe al tab FX arriba.',
        tab: 'effects',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 't1',
        title: 'Sube el REVERB',
        body: 'Ves unas perillas (los círculos que giran). Busca la sección REVERB.\n\nSube la perilla "MIX" del Reverb hasta que marque más o menos 0.40 o 40%.\n\nVas a notar que el sonido empieza a "flotar" más. Eso es el efecto de sala.',
        tab: 'effects',
        highlights: [],
        completionTrigger: { kind: 'param-reached', param: 'reverbMix', threshold: 0.35 },
      },
      {
        id: 't2',
        title: 'Activa el sonido de fondo',
        body: 'La app tiene sonidos de ambiente — pads, lluvia, vinilo — que se reproducen de fondo y le dan profundidad al beat.\n\nHaz clic en la pestaña "✦ ATMÓSFERA" dentro del tab FX.\n\nLuego activa el botón "○ INACTIVA" para prender el efecto.',
        tab: 'effects',
        highlights: [],
        completionTrigger: { kind: 'atmosphere-enabled' },
      },
      {
        id: 't3',
        title: 'Elige tu ambiente',
        body: 'Prueba los distintos tipos:\n\n🎵 Pad Oscuro — cuerda misteriosa\n✨ Pad Espacial — flotante y cinematográfico\n⊙ Vinilo — sonido de disco de vinilo\n~ Lluvia — lluvia suave de fondo\n\nElige el que más te guste y dale PLAY para escuchar todo junto.',
        tab: 'effects',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
      {
        id: 't4',
        title: '¡Eso es producción musical! 🏆',
        body: '¡Felicitaciones! En este momento tienes:\n\n✅ Un ritmo de reggaetón\n✅ Una melodía de sintetizador\n✅ Efectos de reverb\n✅ Un pad de ambiente\n\nEso es exactamente lo que tiene un beat profesional. A partir de aquí es solo práctica y experimentar.',
        tab: 'effects',
        highlights: [],
        completionTrigger: { kind: 'auto' },
      },
    ],
  },
]
