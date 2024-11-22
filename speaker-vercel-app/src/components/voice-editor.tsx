import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addVoiceEmotion, getVoiceEmotions } from '@/lib/db';
import { Play, Pause, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceEditorProps {
  voiceId: number;
  audioUrl: string;
}

const EMOTIONS = [
  'Happy', 'Sad', 'Angry', 'Excited', 'Calm', 'Fearful',
  'Surprised', 'Disgusted', 'Neutral'
];

export function VoiceEditor({ voiceId, audioUrl }: VoiceEditorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [intensity, setIntensity] = useState([50]);
  const [emotions, setEmotions] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(audioUrl);
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onerror = () => toast.error('Error loading audio file');

    // Load existing emotions
    loadEmotions();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const loadEmotions = async () => {
    try {
      const voiceEmotions = await getVoiceEmotions(voiceId);
      setEmotions(voiceEmotions);
    } catch (error) {
      toast.error('Failed to load emotions');
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Playback error:', error);
        toast.error('Failed to play audio');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const addEmotion = async () => {
    if (!selectedEmotion) {
      toast.error('Please select an emotion');
      return;
    }

    try {
      const currentTime = audioRef.current?.currentTime || 0;
      await addVoiceEmotion(
        voiceId,
        selectedEmotion,
        currentTime,
        currentTime + 2,
        intensity[0]
      );
      
      loadEmotions();
      toast.success('Emotion added successfully');
      setSelectedEmotion('');
    } catch (error) {
      toast.error('Failed to add emotion');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={togglePlayPause}
            variant="outline"
            size="icon"
            className="w-12 h-12"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-1">Audio Controls</h3>
            <p className="text-sm text-gray-500">
              Play or pause the audio to add emotions at specific timestamps
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Emotion
            </label>
            <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
              <SelectTrigger>
                <SelectValue placeholder="Choose emotion" />
              </SelectTrigger>
              <SelectContent>
                {EMOTIONS.map((emotion) => (
                  <SelectItem key={emotion} value={emotion}>
                    {emotion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Intensity: {intensity[0]}%
            </label>
            <Slider
              value={intensity}
              onValueChange={setIntensity}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>
        </div>

        <Button
          onClick={addEmotion}
          className="w-full"
          disabled={!selectedEmotion}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Emotion at Current Time
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Emotion Timeline</h3>
        {emotions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No emotions added yet. Play the audio and add emotions at specific timestamps.
          </p>
        ) : (
          <div className="space-y-2">
            {emotions.map((emotion) => (
              <div
                key={emotion.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <span className="font-medium">{emotion.emotion}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    at {emotion.startTime.toFixed(1)}s
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Intensity: {emotion.intensity}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}