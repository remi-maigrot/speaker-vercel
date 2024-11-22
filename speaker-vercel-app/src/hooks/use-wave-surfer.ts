import { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveSurferHookOptions {
  audioUrl: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

interface WaveSurferHookReturn {
  waveformRef: React.RefObject<HTMLDivElement>;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
  togglePlayPause: () => void;
}

export function useWaveSurfer({ 
  audioUrl, 
  onReady, 
  onError 
}: WaveSurferHookOptions): WaveSurferHookReturn {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Cleanup function to handle wavesurfer instance
  const cleanup = () => {
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
      wavesurfer.current = null;
    }
  };

  useEffect(() => {
    if (!waveformRef.current || !audioUrl) {
      setIsLoading(false);
      return;
    }

    cleanup();

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4f46e5',
      progressColor: '#818cf8',
      cursorColor: '#312e81',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 100,
      barGap: 3,
      normalize: true,
      backend: 'WebAudio'
    });

    wavesurfer.current = ws;

    const handleReady = () => {
      setDuration(ws.getDuration());
      setIsLoading(false);
      onReady?.();
    };

    const handleError = (err: Error) => {
      console.error('WaveSurfer error:', err);
      setError('Error loading audio file');
      setIsLoading(false);
      onError?.(err);
    };

    const handleAudioprocess = () => {
      setCurrentTime(ws.getCurrentTime());
    };

    ws.on('ready', handleReady);
    ws.on('error', handleError);
    ws.on('audioprocess', handleAudioprocess);
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));

    try {
      ws.load(audioUrl);
    } catch (err) {
      handleError(err as Error);
    }

    return cleanup;
  }, [audioUrl, onReady, onError]);

  const togglePlayPause = () => {
    if (wavesurfer.current && !isLoading && !error) {
      wavesurfer.current.playPause();
    }
  };

  return {
    waveformRef,
    isPlaying,
    isLoading,
    error,
    currentTime,
    duration,
    togglePlayPause,
  };
}