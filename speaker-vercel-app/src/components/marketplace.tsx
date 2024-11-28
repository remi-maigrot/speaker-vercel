import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Star, Play, Pause, Loader2 } from 'lucide-react';
import { getMarketplaceListings } from '@/lib/db';
import { toast } from 'sonner';

export function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [voiceType, setVoiceType] = useState('all');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const { data: listings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: getMarketplaceListings,
    refetchInterval: 3000,
  });

  const filteredListings = listings.filter(listing =>
    listing.voice && // Check if voice exists
    listing.voice.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (voiceType === 'all' || listing.voice.type === voiceType)
  );

  const handlePlayPause = (listingId: number, audioUrl: string) => {
    if (!audioUrl) {
      toast.error('Audio file not available');
      return;
    }

    if (playingId === listingId) {
      currentAudio?.pause();
      setPlayingId(null);
      setCurrentAudio(null);
    } else {
      currentAudio?.pause();
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setPlayingId(null);
        setCurrentAudio(null);
      };
      audio.play().catch(error => {
        console.error('Audio playback error:', error);
        toast.error('Failed to play audio sample');
      });
      setPlayingId(listingId);
      setCurrentAudio(audio);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="text-red-500 mb-4">Failed to load marketplace listings</div>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Voice Marketplace</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search voices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={voiceType} onValueChange={setVoiceType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Voice type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
              <SelectItem value="generated">Generated</SelectItem>
              <SelectItem value="cloned">Cloned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No voices found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader>
                <CardTitle>{listing.voice?.name}</CardTitle>
                <CardDescription>{listing.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.5</span>
                  <span className="text-gray-500">(10 reviews)</span>
                </div>
                {listing.voice?.audioUrl && (
                  <Button
                    variant="outline"
                    className="w-full mb-4"
                    onClick={() => {
                      if (listing.id && listing.voice?.audioUrl) {
                        handlePlayPause(listing.id, listing.voice.audioUrl);
                      }
                    }}
                  >
                    {playingId === listing.id ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Stop Preview
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Preview Voice
                      </>
                    )}
                  </Button>
                )}
                <div className="text-2xl font-bold">${listing.price.toFixed(2)}</div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Purchase & Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
