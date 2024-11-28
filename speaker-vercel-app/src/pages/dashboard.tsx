import { useState } from 'react';
import { VoiceCreator } from '@/components/voice-creator';
import { VoiceEditor } from '@/components/voice-editor';
import { DashboardStats } from '@/components/dashboard-stats';
import { SettingsPage } from '@/components/settings-page';
import { MarketplaceStudio } from '@/components/marketplace-studio';
import { Button } from '@/components/ui/button';
import { getUserVoices, deleteVoice } from '@/lib/db';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { 
  Mic2, 
  BarChart3, 
  Settings, 
  Trash2, 
  LogOut, 
  User,
  ShoppingCart 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type DashboardView = 'voices' | 'stats' | 'settings' | 'marketplace';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedVoice, setSelectedVoice] = useState<any>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardView>('voices');
  const queryClient = useQueryClient();

  const { data: voices = [], isLoading } = useQuery({
    queryKey: ['voices', user?.id],
    queryFn: () => getUserVoices(user?.id || 0),
    enabled: !!user,
    staleTime: 0,
  });

  const handleDeleteVoice = async (voiceId: number) => {
    if (window.confirm('Are you sure you want to delete this voice?')) {
      try {
        await deleteVoice(voiceId);
        if (user?.id) {
          queryClient.invalidateQueries({
            queryKey: ['voices', user.id]
          } as InvalidateQueryFilters);
        }
        toast.success('Voice deleted successfully');
      } catch (error) {
        toast.error('Failed to delete voice');
      }
    }
  };

  const menuItems = [
    { id: 'voices', label: 'Voice Studio', icon: Mic2 },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'marketplace', label: 'Marketplace Studio', icon: ShoppingCart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleVoiceCreated = () => {
    if (user?.id) {
      queryClient.invalidateQueries({
        queryKey: ['voices', user.id]
      } as InvalidateQueryFilters);
    }
    setShowCreator(false);
  };

  const renderContent = () => {
    if (currentView === 'stats') {
      return <DashboardStats voices={voices} />;
    }

    if (currentView === 'settings') {
      return <SettingsPage />;
    }

    if (currentView === 'marketplace') {
      return <MarketplaceStudio />;
    }

    return showCreator ? (
      <VoiceCreator onVoiceCreated={handleVoiceCreated} />
    ) : selectedVoice ? (
      <>
        <Button
          variant="ghost"
          onClick={() => setSelectedVoice(null)}
          className="mb-4"
        >
          ← Back to voices
        </Button>
        <VoiceEditor
          voiceId={selectedVoice.id}
          audioUrl={selectedVoice.audioUrl}
        />
      </>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div>Loading voices...</div>
        ) : voices.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            No voices created yet. Click "Create New Voice" to get started.
          </div>
        ) : (
          voices.map((voice) => (
            <div
              key={voice.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{voice.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (voice.id !== undefined) {
                      handleDeleteVoice(voice.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Created: {new Date(voice.createdAt).toLocaleDateString()}
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedVoice(voice)}
              >
                Edit Voice
              </Button>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <div className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as DashboardView)}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  currentView === item.id
                    ? "bg-purple-600 text-white"
                    : "hover:bg-gray-800 text-gray-300"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* User Account Section */}
        <div className="pt-4 mt-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300">
            <User className="w-5 h-5" />
            <div className="flex-1 truncate">
              <div className="font-medium">{user?.name}</div>
              <div className="text-gray-500 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full mt-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              {menuItems.find(item => item.id === currentView)?.label}
            </h1>
            {currentView === 'voices' && !selectedVoice && (
              <Button onClick={() => setShowCreator(!showCreator)}>
                {showCreator ? 'View Voices' : 'Create New Voice'}
              </Button>
            )}
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}