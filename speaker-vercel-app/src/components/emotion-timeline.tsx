import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Emotion {
  id: number;
  emotion: string;
  startTime: number;
  endTime: number;
  intensity: number;
}

interface EmotionTimelineProps {
  emotions: Emotion[];
  duration: number;
  currentTime: number;
  onRemoveEmotion: (id: number) => void;
}

export function EmotionTimeline({
  emotions,
  duration,
  currentTime,
  onRemoveEmotion
}: EmotionTimelineProps) {
  const [timelineWidth, setTimelineWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      const timeline = document.getElementById('emotion-timeline');
      if (timeline) {
        setTimelineWidth(timeline.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const getEmotionStyle = (emotion: Emotion) => {
    const left = (emotion.startTime / duration) * 100;
    const width = ((emotion.endTime - emotion.startTime) / duration) * 100;
    
    return {
      left: `${left}%`,
      width: `${width}%`,
      height: `${emotion.intensity}%`,
    };
  };

  return (
    <div className="mt-4">
      <div
        id="emotion-timeline"
        className="relative h-24 bg-gray-100 rounded-lg overflow-hidden"
      >
        <div
          className="absolute top-0 w-0.5 h-full bg-blue-500 transition-all"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
        
        {emotions.map((emotion) => (
          <div
            key={emotion.id}
            className="absolute bottom-0 bg-blue-200 hover:bg-blue-300 transition-colors"
            style={getEmotionStyle(emotion)}
          >
            <div className="p-1 text-xs truncate">
              {emotion.emotion}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0"
                onClick={() => onRemoveEmotion(emotion.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}