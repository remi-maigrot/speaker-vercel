import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserVoices, publishVoiceToMarketplace } from '@/lib/db';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Play, Pause, Loader2 } from 'lucide-react';

export function MarketplaceStudio() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedVoice, setSelectedVoice] = useState<any>(null);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const { data: voices = [], isLoading, refetch: refetchVoices } = useQuery({
    queryKey: ['voices', user?.id],
    queryFn: () => getUserVoices(user?.id || 0),
    enabled: !!user,
    staleTime: 0,
  });

  const handlePlayPause = (voice: any) => {
    if (playingId === voice.id) {
      currentAudio?.pause();
      setPlayingId(null);
      setCurrentAudio(null);
    } else {
      currentAudio?.pause();
      const audio = new Audio(voice.audioUrl);
      audio.onended = () => {
        setPlayingId(null);
        setCurrentAudio(null);
      };
      audio.play().catch(error => {
        console.error('Audio playback error:', error);
        toast.error('Failed to play audio sample');
      });
      setPlayingId(voice.id);
      setCurrentAudio(audio);
    }
  };

  const handlePublish = async () => {
    if (!selectedVoice) {
      toast.error("Please select a voice to publish");
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    setIsPublishing(true);
    try {
      await publishVoiceToMarketplace(
        selectedVoice.id,
        user!.id,
        Number(price),
        description.trim()
      );

      await Promise.all([
        queryClient.invalidateQueries(['voices']),
        queryClient.invalidateQueries(['marketplace-listings']),
        refetchVoices()
      ]);

      toast.success("Voice published to marketplace successfully!");
      setSelectedVoice(null);
      setPrice("");
      setDescription("");
    } catch (error) {
      console.error('Error publishing voice:', error);
      toast.error("Failed to publish voice to marketplace");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const unpublishedVoices = voices.filter(voice => !voice.isPublished);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Voices</h2>
          {unpublishedVoices.length === 0 ? (
            <div className="text-gray-500">No unpublished voices available</div>
          ) : (
            <div className="space-y-4">
              {unpublishedVoices.map((voice) => (
                <Card
                  key={voice.id}
                  className={`cursor-pointer transition-colors ${
                    selectedVoice?.id === voice.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedVoice(voice)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{voice.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPause(voice);
                      }}
                    >
                      {playingId === voice.id ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Preview
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Publish to Marketplace</h2>
          {selectedVoice ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your voice..."
                  rows={4}
                />
              </div>
              <Button
                className="w-full"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish Voice'
                )}
              </Button>
            </div>
          ) : (
            <div className="text-gray-500">
              Select a voice from the left to publish it to the marketplace
            </div>
          )}
        </div>
      </div>
    </div>
  );
}