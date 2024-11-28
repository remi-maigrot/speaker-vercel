import { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Scissors, Crop, ZoomIn, ZoomOut,
  Filter, Music2, Maximize, Minimize, RefreshCw, Download,
  Undo2, Redo2, Trash2, Edit2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

interface AudioSection {
  id: string;
  startTime: number;
  endTime: number;
  emotion?: string;
  emotionIntensity?: number;
  effects?: string[];
}

interface AudioEffect {
  id: string;
  name: string;
  intensity: number;
}

const ADVANCED_EMOTIONS = [
  'Joy', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Disgust',
  'Serenity', 'Melancholy', 'Excitement', 'Tension', 'Calmness'
];

const AUDIO_EFFECTS = [
  'Reverb', 'Echo', 'Pitch Shift', 'Time Stretch',
  'Compression', 'Noise Reduction', 'Equalization'
];

const EXPORT_FORMATS = ['MP3', 'WAV', 'FLAC'];

export function VoiceEditor({ voiceId, audioUrl }: { voiceId: number, audioUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSections, setAudioSections] = useState<AudioSection[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [appliedEffects, setAppliedEffects] = useState<AudioEffect[]>([]);
  const [volume, setVolume] = useState([50]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [exportFormat, setExportFormat] = useState<string>('MP3');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    console.log(`Editing voice with ID: ${voiceId}`);
  }, [voiceId]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const generateWaveform = async () => {
    try {
      const audioContext = new AudioContext();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const samples = 200;
      const step = Math.floor(channelData.length / samples);
      
      const waveform = Array.from({ length: samples }, (_, i) => {
        const start = i * step;
        const subArray = channelData.slice(start, start + step);
        const average = subArray.reduce((a, b) => Math.abs(a) + Math.abs(b), 0) / subArray.length;
        return average;
      });

      setWaveformData(waveform);
    } catch (error) {
      console.error("Waveform generation error:", error);
      toast.error("Failed to generate waveform");
    }
  };

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      generateWaveform();
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('volumechange', () => {
      setVolume([audio.volume * 100]);
    });

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', () => {});
      audio.removeEventListener('timeupdate', () => {});
      audio.removeEventListener('volumechange', () => {});
    };
  }, [audioUrl]);

  useEffect(() => {
    const canvas = waveformRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(31, 41, 55, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(96, 165, 250, 0.7)';
    
    const maxAmplitude = Math.max(...waveformData);
    
    waveformData.forEach((amplitude, index) => {
      const x = index * (canvas.width / waveformData.length);
      const height = (amplitude / maxAmplitude) * (canvas.height / 2);
      
      ctx.fillRect(x, canvas.height/2 - height, 2, height * 2);
    });

    if (duration > 0) {
      const timelinePosition = (currentTime / duration) * canvas.width;
      ctx.strokeStyle = 'rgba(239, 68, 68, 1)';
      ctx.beginPath();
      ctx.moveTo(timelinePosition, 0);
      ctx.lineTo(timelinePosition, canvas.height);
      ctx.stroke();
    }
  }, [waveformData, currentTime, duration]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const createAudioSection = () => {
    const newSection: AudioSection = {
      id: `section-${Date.now()}`,
      startTime: currentTime,
      endTime: currentTime + 5,
      emotion: selectedEmotion,
      emotionIntensity: 50
    };
    setAudioSections([...audioSections, newSection]);
    toast.success('Section created successfully');
  };

  const applyAudioEffect = (effectName: string) => {
    const newEffect: AudioEffect = {
      id: `effect-${Date.now()}`,
      name: effectName,
      intensity: 50
    };
    setAppliedEffects([...appliedEffects, newEffect]);
    toast.success(`Applied ${effectName} effect`);
  };

  return (
    <div className={`w-full ${isFullScreen ? 'h-screen' : 'h-[800px]'} bg-gray-900 text-white p-6 rounded-xl space-y-6 overflow-hidden`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon">
            <ZoomOut />
          </Button>
          <Button variant="outline" size="icon">
            <ZoomIn />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullScreen}>
            {isFullScreen ? <Minimize /> : <Maximize />}
          </Button>
          <Button variant="outline" size="icon" onClick={generateWaveform}>
            <RefreshCw />
          </Button>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Export Format" />
            </SelectTrigger>
            <SelectContent>
              {EXPORT_FORMATS.map((format) => (
                <SelectItem key={format} value={format}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={togglePlayPause}>
            {isPlaying ? <Pause /> : <Play />}
          </Button>
          <Button variant="outline" size="icon" onClick={createAudioSection}>
            <Scissors />
          </Button>
          <Button variant="outline" size="icon" onClick={() => applyAudioEffect('Reverb')}>
            <Filter />
          </Button>
          <Button variant="outline" size="icon" onClick={() => applyAudioEffect('Echo')}>
            <Music2 />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Select 
            value={playbackSpeed.toString()} 
            onValueChange={(value) => setPlaybackSpeed(parseFloat(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Playback Speed" />
            </SelectTrigger>
            <SelectContent>
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                <SelectItem key={speed} value={speed.toString()}>
                  {speed}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon">
            <Undo2 />
          </Button>
          <Button variant="outline" size="icon">
            <Redo2 />
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
        <canvas 
          ref={waveformRef} 
          width={1200} 
          height={250} 
          className="absolute top-0 left-0 w-full h-full"
        />
        {audioSections.map(section => (
          <div 
            key={section.id} 
            style={{
              left: `${(section.startTime / duration) * 100}%`,
              width: `${((section.endTime - section.startTime) / duration) * 100}%`
            }} 
            className="absolute h-full bg-blue-500 bg-opacity-30 border-l-2 border-blue-400"
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-12 h-12"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause /> : <Play />}
            </Button>
            <div>
              <p>{`${Math.floor(currentTime / 60)}:${(currentTime % 60).toFixed(0)}`}</p>
              <p className="text-sm text-gray-400">Current Position</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm">Volume</label>
            <Slider 
              value={volume} 
              onValueChange={setVolume}
              max={100} 
              step={1} 
            />
          </div>

          <Button 
            onClick={createAudioSection} 
            className="w-full"
            disabled={!selectedEmotion}
          >
            <Crop className="mr-2" /> Create Section
          </Button>
        </div>

        <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
          <div>
            <label className="block text-sm mb-2">Select Emotion</label>
            <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Emotion" />
              </SelectTrigger>
              <SelectContent>
                {ADVANCED_EMOTIONS.map((emotion) => (
                  <SelectItem key={emotion} value={emotion}>
                    {emotion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm mb-2">Audio Effects</label>
            <div className="grid grid-cols-2 gap-2">
              {AUDIO_EFFECTS.map((effect) => (
                <Button 
                  key={effect} 
                  variant="outline" 
                  size="sm"
                  onClick={() => applyAudioEffect(effect)}
                >
                  {effect}
                </Button>
              ))}
            </div>
          </div>

          {appliedEffects.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Applied Effects</h4>
              {appliedEffects.map(effect => (
                <div 
                  key={effect.id} 
                  className="flex justify-between items-center bg-gray-700 p-2 rounded mb-1"
                >
                  <span>{effect.name}</span>
                  <Slider 
                    value={[effect.intensity]} 
                    max={100} 
                    step={1} 
                    className="w-24"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium">Audio Sections</h3>
          {audioSections.length === 0 ? (
            <p className="text-gray-500 text-center">No sections created</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {audioSections.map(section => (
                <div 
                  key={section.id} 
                  className="flex justify-between items-center bg-gray-700 p-2 rounded"
                  >
                    <div>
                      <p>{section.emotion || 'Unnamed'}</p>
                      <p className="text-xs text-gray-400">
                        {section.startTime.toFixed(1)}s - {section.endTime.toFixed(1)}s
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="text-blue-400">
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400"
                        onClick={() => {
                          setAudioSections(audioSections.filter(s => s.id !== section.id));
                          toast.success('Section deleted');
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
  
            <div className="mt-4">
              <Button variant="default" className="w-full">
                <Download className="mr-2" /> Export Audio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default VoiceEditor;