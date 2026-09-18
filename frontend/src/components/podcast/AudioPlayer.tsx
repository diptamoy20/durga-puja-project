import React, { useState, useRef, useEffect } from 'react';
import type { PodcastEpisode } from '@/types/podcast';
import { publicPodcastService } from '@/services/podcastService';

interface AudioPlayerProps {
  episode: PodcastEpisode;
  autoPlay?: boolean;
  onClose?: () => void;
  isDocked?: boolean;
}

export function AudioPlayer({ episode, autoPlay = false, onClose, isDocked = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(episode.audioDurationSeconds || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [recordedPlay, setRecordedPlay] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // Reset play tracking on new episode
    setRecordedPlay(false);
    setCurrentTime(0);
    if (autoPlay && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [episode.id, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        if (!recordedPlay) {
          publicPodcastService.recordPlay(episode.id).catch(() => {});
          setRecordedPlay(true);
        }
      }).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      if (!isNaN(audioDuration) && audioDuration > 0) {
        setDuration(Math.round(audioDuration));
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.min(Math.max(0, audioRef.current.currentTime + seconds), duration);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e1e24 0%, #2b1115 100%)',
        color: '#ffffff',
        borderRadius: isDocked ? '16px 16px 0 0' : '14px',
        padding: '16px 24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        position: isDocked ? 'fixed' : 'relative',
        bottom: isDocked ? 0 : 'auto',
        left: isDocked ? 0 : 'auto',
        right: isDocked ? 0 : 'auto',
        zIndex: isDocked ? 1000 : 1,
        maxWidth: isDocked ? '100%' : '100%',
        margin: '0 auto',
        backdropFilter: 'blur(10px)',
      }}
    >
      <audio
        ref={audioRef}
        src={episode.audioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Episode Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px', flex: '1 1 250px' }}>
          {episode.coverImageUrl && (
            <img
              src={episode.coverImageUrl}
              alt={episode.title}
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            />
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#f59e0b', fontWeight: 600 }}>
              S{episode.seasonNumber} • EP{episode.episodeNumber} {episode.language ? `• ${episode.language.toUpperCase()}` : ''}
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '280px',
                color: '#fff',
              }}
              title={episode.title}
            >
              {episode.title}
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              {episode.guestName ? `${episode.guestName} with ${episode.hostName || 'Host'}` : (episode.hostName || 'Official Podcast')}
            </div>
          </div>
        </div>

        {/* Center Controls & Scrubber */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: '2 1 340px',
            gap: '8px',
          }}
        >
          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => skipTime(-15)}
              title="Rewind 15 seconds"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#e2e8f0',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              <span style={{ fontSize: '16px' }}>↺</span> 15s
            </button>

            <button
              type="button"
              onClick={togglePlay}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                color: '#fff',
                border: '2px solid #f59e0b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 4px 14px rgba(185, 28, 28, 0.5)',
                transition: 'transform 0.15s ease',
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <button
              type="button"
              onClick={() => skipTime(15)}
              title="Forward 15 seconds"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#e2e8f0',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              15s <span style={{ fontSize: '16px' }}>↻</span>
            </button>
          </div>

          {/* Time Scrubber */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '480px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', minWidth: '35px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{
                flex: 1,
                cursor: 'pointer',
                accentColor: '#f59e0b',
                height: '4px',
                borderRadius: '2px',
              }}
            />
            <span style={{ fontSize: '11px', color: '#94a3b8', minWidth: '35px', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Settings (Speed, Volume, Close) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 200px', justifyContent: 'flex-end' }}>
          {/* Speed Preset Dropdown */}
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#f1f5f9',
              borderRadius: '6px',
              padding: '4px 6px',
              fontSize: '12px',
              cursor: 'pointer',
              outline: 'none',
            }}
            title="Playback Speed"
          >
            <option value="0.75" style={{ background: '#1e1e24' }}>0.75x</option>
            <option value="1" style={{ background: '#1e1e24' }}>1.0x</option>
            <option value="1.25" style={{ background: '#1e1e24' }}>1.25x</option>
            <option value="1.5" style={{ background: '#1e1e24' }}>1.5x</option>
            <option value="2" style={{ background: '#1e1e24' }}>2.0x</option>
          </select>

          {/* Volume Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '2px',
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              style={{
                width: '60px',
                accentColor: '#f59e0b',
                cursor: 'pointer',
                height: '4px',
              }}
              title="Volume"
            />
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#fff',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
              }}
              title="Dismiss Player"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
