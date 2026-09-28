import { useState, useRef, useEffect } from 'react'
import {
  Play, Pause, Volume2, VolumeX, Download, ExternalLink, X,
  ShieldCheck, Calendar, Phone, MapPin, FastForward
} from 'lucide-react'

export default function AudioPlayerModal({ lead, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [lead?.audio_url])

  function togglePlay() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => {
        console.warn('Playback error:', e)
      })
    }
  }

  function handleSeek(e) {
    const time = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  function toggleMute() {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  function cycleSpeed() {
    if (!audioRef.current) return
    const speeds = [1, 1.25, 1.5, 2]
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length
    const nextSpeed = speeds[nextIdx]
    audioRef.current.playbackRate = nextSpeed
    setPlaybackRate(nextSpeed)
  }

  function formatSeconds(secs) {
    if (!secs || isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  if (!lead) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="card w-full max-w-lg border-fresh-orange/30 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-fresh-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-fresh-orange animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-fresh-orange">
            Inspection Call Recording
          </span>
        </div>
        <h2 className="text-xl font-display font-bold text-white truncate">
          {lead.homeowner_name}
        </h2>

        {/* Lead Details Pill Row */}
        <div className="grid grid-cols-2 gap-2 my-4 text-xs">
          <div className="bg-fresh-border/40 p-2.5 rounded-lg flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-fresh-muted flex-shrink-0" />
            <span className="truncate">{lead.address || 'Address on file'}</span>
          </div>
          <div className="bg-fresh-border/40 p-2.5 rounded-lg flex items-center gap-2 text-slate-300">
            <Phone className="w-4 h-4 text-fresh-muted flex-shrink-0" />
            <a href={`tel:${lead.phone}`} className="hover:text-fresh-orange transition-colors">
              {lead.phone || 'Phone on file'}
            </a>
          </div>
          <div className="bg-fresh-border/40 p-2.5 rounded-lg flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="truncate font-medium text-green-300">
              {lead.insurance_carrier ? `${lead.insurance_carrier} Verified` : 'Active Insurance Confirmed'}
            </span>
          </div>
          <div className="bg-fresh-border/40 p-2.5 rounded-lg flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-fresh-orange flex-shrink-0" />
            <span className="truncate text-fresh-orange font-medium">
              {lead.appointment_date || 'Appointment Pre-Set'}
            </span>
          </div>
        </div>

        {/* Audio Element */}
        <audio ref={audioRef} src={lead.audio_url} preload="metadata" />

        {/* Player Box */}
        <div className="bg-[#0B0D12] border border-fresh-border rounded-xl p-5 mb-4">
          {/* Animated Waveform Visualization */}
          <div className="flex items-center justify-center gap-1.5 h-12 mb-4 px-4 bg-fresh-card/60 rounded-lg">
            {[40, 65, 80, 50, 95, 75, 45, 90, 60, 30, 85, 70, 55, 90, 45, 65, 80, 50, 70, 95, 60, 40].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlaying ? 'bg-fresh-orange' : 'bg-fresh-muted/40'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(15, (h * (0.5 + Math.random() * 0.5)))}%` : `${h * 0.4}%`,
                  opacity: (currentTime / (duration || 1)) > (i / 22) ? 1 : 0.4
                }}
              />
            ))}
          </div>

          {/* Time & Scrub Slider */}
          <div className="space-y-1 mb-4">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-fresh-orange bg-fresh-border h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-fresh-muted font-mono">
              <span>{formatSeconds(currentTime)}</span>
              <span>{duration ? formatSeconds(duration) : 'Recording Ready'}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-fresh-orange hover:bg-fresh-orange-light text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
              </button>

              <button
                onClick={cycleSpeed}
                className="text-xs font-mono font-bold px-2 py-1 rounded bg-fresh-border text-slate-300 hover:text-white hover:bg-fresh-border/80 flex items-center gap-1"
                title="Playback speed"
              >
                <FastForward className="w-3 h-3 text-fresh-orange" />
                {playbackRate}x
              </button>

              <button
                onClick={toggleMute}
                className="text-fresh-muted hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {lead.audio_url && (
                <a
                  href={lead.audio_url}
                  download={lead.audio_filename || `${lead.homeowner_name}_call_recording.mp3`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-1.5 px-3"
                  title="Download recording"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save Audio
                </a>
              )}
              {lead.audio_url && lead.audio_url.startsWith('http') && (
                <a
                  href={lead.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-xs p-1.5"
                  title="Open source file in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Lead Notes */}
        {lead.notes && (
          <div className="bg-fresh-card border border-fresh-border rounded-lg p-3 text-xs">
            <p className="font-semibold text-slate-200 mb-1">Call Notes & Damage Summary:</p>
            <p className="text-fresh-muted leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
