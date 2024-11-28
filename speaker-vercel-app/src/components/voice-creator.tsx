import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Upload, Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createVoice } from '@/lib/db';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface VoiceCreatorProps {
  onVoiceCreated: () => void;
}

export function VoiceCreator({ onVoiceCreated }: VoiceCreatorProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(prev => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setFileName('recording.webm');
        toast.success('Recording completed');
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      toast.info('Recording started');
    } catch (error) {
      toast.error('Failed to access microphone');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setFileName(file.name);
      toast.success('File uploaded successfully');
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error('Please enter a description for the voice');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI voice generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a dummy audio blob for demonstration
      const dummyBlob = new Blob(['dummy audio data'], { type: 'audio/wav' });
      setAudioBlob(dummyBlob);
      setFileName('generated-voice.wav');
      
      toast.success('Voice generated successfully');
    } catch (error) {
      toast.error('Failed to generate voice');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!user) {
      toast.error('Please log in to create a voice');
      return;
    }
  
    if (typeof user.id !== 'number') {
      toast.error('Invalid user ID');
      return;
    }
  
    if (!voiceName.trim()) {
      toast.error('Please provide a name for the voice');
      return;
    }
  
    if (!audioBlob) {
      toast.error('Please record, upload, or generate a voice');
      return;
    }
  
    setIsProcessing(true);
    try {
      // Ensure user.id is passed as a number
      await createVoice(user.id, voiceName.trim(), 'custom', audioBlob);
      toast.success('Voice created successfully');
      setVoiceName('');
      setAudioBlob(null);
      setFileName('');
      setAudioChunks([]);
      setPrompt('');
      onVoiceCreated();
    } catch (error) {
      console.error('Voice creation error:', error);
      toast.error('Failed to create voice. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Voice</h2>
      
      <div className="mb-4">
        <Label htmlFor="voiceName">Voice Name</Label>
        <Input
          id="voiceName"
          value={voiceName}
          onChange={(e) => setVoiceName(e.target.value)}
          placeholder="Enter voice name"
          className="mt-1"
        />
      </div>

      <Tabs defaultValue="record" className="mt-6">
        <TabsList className="grid grid-cols-3 gap-4">
          <TabsTrigger value="record" className="flex items-center gap-2">
            <Mic className="w-4 h-4" /> Record
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" /> Generate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="mt-4">
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              className={cn(
                "w-16 h-16 rounded-full transition-all duration-300",
                isRecording && "animate-pulse bg-red-500 hover:bg-red-600"
              )}
            >
              <Mic className={cn(
                "w-6 h-6",
                isRecording && "animate-pulse"
              )} />
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </p>
            {audioBlob && <p className="mt-2 text-sm text-green-500">Recording saved!</p>}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <Input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center gap-2"
            >
              <Upload className="w-6 h-6" />
              {fileName || 'Choose audio file'}
            </Label>
          </div>
        </TabsContent>

        <TabsContent value="generate" className="mt-4">
          <div className="space-y-4 p-8 border-2 border-dashed rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="prompt">Describe the voice you want to generate</Label>
              <Textarea
                id="prompt"
                placeholder="E.g., A deep male voice with a British accent, warm and friendly tone..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Voice'
              )}
            </Button>
            {audioBlob && <p className="text-sm text-green-500">Voice generated successfully!</p>}
          </div>
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleCreate}
        className="w-full mt-6"
        disabled={!voiceName || !audioBlob || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Voice'
        )}
      </Button>
    </div>
  );
}