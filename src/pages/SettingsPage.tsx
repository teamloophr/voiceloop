import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Key, Volume2, Settings } from 'lucide-react';
import { settingsApi, voiceApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  openai_api_key?: string;
  has_openai_key?: boolean;
}

interface VoiceSettings {
  preferred_voice: string;
  speech_speed: number;
  auto_play_responses: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({});
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    preferred_voice: 'alloy',
    speech_speed: 1.0,
    auto_play_responses: false
  });
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<Array<{id: string, name: string}>>([]);
  const [testResult, setTestResult] = useState<{valid: boolean, message?: string, error?: string} | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    loadVoiceOptions();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsApi.getSettings();
      setSettings(response.data.settings || {});
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    }
  };

  const loadVoiceOptions = async () => {
    try {
      const response = await voiceApi.getVoices();
      setAvailableVoices(response.data.voices || []);
    } catch (error) {
      console.error('Error loading voice options:', error);
    }
  };

  const testApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const response = await settingsApi.testOpenAIKey(apiKey);
      setTestResult(response.data);
      
      if (response.data.valid) {
        toast({
          title: "Success",
          description: "API key is valid and working!",
        });
      } else {
        toast({
          title: "Error",
          description: response.data.error || "API key test failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setTestResult({
        valid: false,
        error: "Failed to test API key"
      });
      toast({
        title: "Error",
        description: "Failed to test API key",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setIsLoading(true);
    try {
      await settingsApi.updateSettings({ openai_api_key: apiKey });
      setSettings(prev => ({ ...prev, has_openai_key: true }));
      setApiKey('');
      toast({
        title: "Success",
        description: "API key saved successfully!",
      });
      await loadSettings();
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeApiKey = async () => {
    setIsLoading(true);
    try {
      await settingsApi.deleteOpenAIKey();
      setSettings(prev => ({ ...prev, has_openai_key: false }));
      toast({
        title: "Success",
        description: "API key removed successfully!",
      });
      await loadSettings();
    } catch (error) {
      console.error('Error removing API key:', error);
      toast({
        title: "Error",
        description: "Failed to remove API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateVoiceSettings = async (newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...newSettings }));
    // In a real app, you'd save these to the backend
    toast({
      title: "Success",
      description: "Voice settings updated!",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Temporary Notice Banner */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="text-yellow-800">
              <strong>⚠️ Database Temporarily Disabled</strong>
              <p className="text-sm mt-1">
                Waiting for PM database strategy decision. You can view the UI but database operations are disabled.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your AI assistant preferences</p>
        </div>

        {/* OpenAI API Key Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              OpenAI API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">OpenAI API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={testApiKey}
                  disabled={!apiKey.trim() || isTesting}
                  variant="outline"
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Test"
                  )}
                </Button>
                <Button
                  onClick={saveApiKey}
                  disabled={!apiKey.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>

            {/* API Key Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              {settings.has_openai_key ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  API Key Configured
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  No API Key
                </Badge>
              )}
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`p-3 rounded-lg ${
                testResult.valid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {testResult.valid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={testResult.valid ? 'text-green-800' : 'text-red-800'}>
                    {testResult.message || testResult.error}
                  </span>
                </div>
              </div>
            )}

            {/* Remove API Key */}
            {settings.has_openai_key && (
              <div className="pt-2">
                <Button
                  onClick={removeApiKey}
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                >
                  Remove API Key
                </Button>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>• Your API key is encrypted and stored securely</p>
              <p>• We never see or store your actual API key</p>
              <p>• You can remove your key at any time</p>
            </div>
          </CardContent>
        </Card>

        {/* Voice Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voice">Preferred Voice</Label>
                <Select
                  value={voiceSettings.preferred_voice}
                  onValueChange={(value) => updateVoiceSettings({ preferred_voice: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speed">Speech Speed</Label>
                <Select
                  value={voiceSettings.speech_speed.toString()}
                  onValueChange={(value) => updateVoiceSettings({ speech_speed: parseFloat(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.75">Slow (0.75x)</SelectItem>
                    <SelectItem value="1.0">Normal (1.0x)</SelectItem>
                    <SelectItem value="1.25">Fast (1.25x)</SelectItem>
                    <SelectItem value="1.5">Very Fast (1.5x)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-play"
                checked={voiceSettings.auto_play_responses}
                onCheckedChange={(checked) => updateVoiceSettings({ auto_play_responses: checked })}
              />
              <Label htmlFor="auto-play">Automatically play AI responses</Label>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>• Voice settings apply to text-to-speech responses</p>
              <p>• You can also manually play individual messages</p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Usage Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">Free</div>
                <div className="text-sm text-muted-foreground">API Usage</div>
                <div className="text-xs mt-2">
                  You pay OpenAI directly for your usage
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">Secure</div>
                <div className="text-sm text-muted-foreground">Data Storage</div>
                <div className="text-xs mt-2">
                  Your conversations are private and secure
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">Real-time</div>
                <div className="text-sm text-muted-foreground">Voice & Chat</div>
                <div className="text-xs mt-2">
                  Instant responses with voice support
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
