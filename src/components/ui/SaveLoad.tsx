import { useRef } from 'react'
import LZString from 'lz-string'
import { useStore } from '../../store/useStore'
import { useAudioEngine } from '../../hooks/useAudioEngine'
import { ProjectState } from '../../types'

export function SaveLoad() {
  const exportProject = useStore((s) => s.exportProject)
  const loadProject = useStore((s) => s.loadProject)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { exportWav } = useAudioEngine()

  const handleSaveJSON = () => {
    const state = exportProject()
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beat-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoadJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const state = JSON.parse(ev.target?.result as string) as ProjectState
        loadProject(state)
      } catch {
        alert('Invalid project file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleShareLink = () => {
    const state = exportProject()
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state))
    const url = `${window.location.origin}${window.location.pathname}?p=${compressed}`
    navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard!'))
  }

  const handleExportWav = async () => {
    try {
      const blob = await exportWav(4)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `beat-${Date.now()}.wav`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed: ' + err)
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-surface-1 border-t border-surface-3">
      <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider mr-2">Project</span>

      <button
        onClick={handleSaveJSON}
        className="px-3 py-1.5 text-[10px] font-mono rounded bg-surface-3 text-white/60 hover:bg-surface-4 hover:text-white transition-all border border-surface-4"
      >
        💾 Save JSON
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1.5 text-[10px] font-mono rounded bg-surface-3 text-white/60 hover:bg-surface-4 hover:text-white transition-all border border-surface-4"
      >
        📂 Load JSON
      </button>
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleLoadJSON} className="hidden" />

      <button
        onClick={handleShareLink}
        className="px-3 py-1.5 text-[10px] font-mono rounded bg-surface-3 text-white/60 hover:bg-surface-4 hover:text-white transition-all border border-surface-4"
      >
        🔗 Share Link
      </button>

      <div className="flex-1" />

      <button
        onClick={handleExportWav}
        className="px-4 py-1.5 text-[10px] font-mono rounded bg-accent/20 text-accent-light hover:bg-accent/30 transition-all border border-accent/40 font-semibold shadow-glow-sm"
      >
        ⬇ Export WAV
      </button>
    </div>
  )
}
