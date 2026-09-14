'use client';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Pause, Play, Volume2, VolumeX, Maximize, Minimize, X, RotateCcw } from 'lucide-react';

interface Props {
  playbackId: string;
  poster?: string;
  title: string;
  onClose?: () => void;
  autoPlay?: boolean;
  onPlayingChange?: (playing: boolean) => void;
}

export function MediaPlayer({ playbackId, poster, title, onClose, autoPlay = false, onPlayingChange }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  const pendingPlay = useRef(false);
  const managedHls = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const play = useCallback(() => {
    const element = video.current;
    if (!element) return;
    if (!ready.current) { pendingPlay.current = true; setBuffering(true); return; }
    element.play().catch((reason: unknown) => {
      // An interrupted play or a browser autoplay rule is not a broken video.
      if (reason instanceof DOMException && ['AbortError', 'NotAllowedError'].includes(reason.name)) return;
      setError(true);
      setBuffering(false);
    });
  }, []);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    ready.current = false;
    managedHls.current = false;
    let cancelled = false;
    let destroy: (() => void) | undefined;
    const url = `https://stream.mux.com/${playbackId}.m3u8?refresh=${Date.now()}`;
    import('hls.js').then(({ default: Hls }) => {
      if (cancelled) return;
      if (Hls.isSupported()) {
        managedHls.current = true;
        const hls = new Hls({ maxBufferLength: 20 });
        let mediaRecoveryAttempted = false;
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal || cancelled) return;
          console.warn('Video stream failed:', data.type, data.details);
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !mediaRecoveryAttempted) {
            mediaRecoveryAttempted = true;
            hls.recoverMediaError();
          } else {
            setError(true);
            setBuffering(false);
            element.pause();
          }
        });
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (cancelled) return;
          ready.current = true;
          if (autoPlay || pendingPlay.current) { pendingPlay.current = false; play(); }
        });
        hls.loadSource(url);
        hls.attachMedia(element);
        destroy = () => hls.destroy();
      } else if (element.canPlayType('application/vnd.apple.mpegurl')) {
        ready.current = true;
        element.src = url;
        if (autoPlay || pendingPlay.current) { pendingPlay.current = false; play(); }
      } else setError(true);
    }).catch(() => { if (!cancelled) setError(true); });
    return () => {
      cancelled = true;
      ready.current = false;
      destroy?.();
      element.pause();
      element.removeAttribute('src');
      element.load();
    };
  }, [playbackId, attempt, autoPlay, play]);

  useEffect(() => {
    onPlayingChange?.(playing);
    return () => onPlayingChange?.(false);
  }, [playing, onPlayingChange]);

  useEffect(() => {
    const changed = () => setFullscreen(document.fullscreenElement === wrapper.current);
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);

  const toggle = () => { if (video.current?.paused) play(); else video.current?.pause(); };
  const retry = () => {
    pendingPlay.current = true;
    setError(false); setPlaying(false); setBuffering(false); setProgress(0); setDuration(0);
    setAttempt(value => value + 1);
  };
  const seek = (seconds: number) => {
    const element = video.current;
    if (element && Number.isFinite(element.duration)) element.currentTime = Math.min(element.duration, Math.max(0, seconds));
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else wrapper.current?.requestFullscreen().catch(() => {});
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    // Native buttons and sliders keep their own keyboard behavior.
    if (event.target !== event.currentTarget) return;
    switch (event.key.toLowerCase()) {
      case ' ': case 'k': event.preventDefault(); toggle(); break;
      case 'arrowleft': event.preventDefault(); seek((video.current?.currentTime ?? 0) - 5); break;
      case 'arrowright': event.preventDefault(); seek((video.current?.currentTime ?? 0) + 5); break;
      case 'm': event.preventDefault(); setMuted(value => !value); break;
      case 'f': event.preventDefault(); toggleFullscreen(); break;
    }
  };
  const timestamp = (seconds: number) => {
    const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    return `${Math.floor(safe / 60)}:${Math.floor(safe % 60).toString().padStart(2, '0')}`;
  };

  return <div className={`media-player ${onClose ? 'is-modal-player' : ''}`} ref={wrapper} tabIndex={0} role="group" aria-label={`${title} video player`} aria-keyshortcuts="Space K ArrowLeft ArrowRight M F" onKeyDown={keyboard}>
    <video ref={video} poster={poster} playsInline autoPlay={autoPlay} muted={muted} preload="metadata" onClick={toggle} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onPlaying={() => setBuffering(false)} onWaiting={() => setBuffering(true)} onCanPlay={() => setBuffering(false)} onEnded={() => setPlaying(false)} onError={() => { if (!managedHls.current && ready.current) { setError(true); setBuffering(false); } }} onTimeUpdate={() => setProgress(video.current?.currentTime ?? 0)} onDurationChange={() => setDuration(video.current?.duration || 0)} aria-label={title} />
    {!playing && !error && <button className="play-center" onClick={toggle} aria-label={`Play ${title}`}><Play fill="currentColor" size={26} /></button>}
    {buffering && playing && !error && <div className="video-buffering" role="status" aria-label="Loading video"><span /></div>}
    {error && <div className="video-error" role="alert"><p>The video could not be loaded.</p><button className="video-retry" onClick={retry}><RotateCcw size={16} /> try again</button><a href={`https://stream.mux.com/${playbackId}.m3u8`} target="_blank" rel="noreferrer">Open original video ↗</a></div>}
    <div className="video-controls">
      <button onClick={toggle} disabled={error} aria-label={playing ? 'Pause video' : 'Play video'}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
      <span>{timestamp(progress)}</span>
      <input aria-label="Video position" aria-valuetext={`${timestamp(progress)} of ${timestamp(duration)}`} type="range" min="0" max={Number.isFinite(duration) ? duration : 0} step="0.1" value={progress} disabled={!duration || error} onChange={event => seek(Number(event.target.value))} />
      <span>{timestamp(duration)}</span>
      <button aria-label={muted ? 'Unmute video' : 'Mute video'} aria-pressed={muted} onClick={() => setMuted(!muted)}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
      <button aria-label={fullscreen ? 'Exit fullscreen video' : 'Fullscreen video'} onClick={toggleFullscreen}>{fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button>
    </div>
    {onClose && <button className="player-close" onClick={onClose} aria-label="Close showreel"><X size={20} /></button>}
  </div>;
}
