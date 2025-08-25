import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../hooks/use-toast'
import { supabase } from '../../lib/supabase'

interface UserSettings {
  openai_api_key?: string
  elevenlabs_api_key?: string
  openai_key_status?: boolean
  elevenlabs_key_status?: boolean
}

export const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState<UserSettings>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserSettings()
    }
  }, [user])

  const loadUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error)
        return
      }

      if (data) {
        setSettings({
          openai_api_key: data.openai_api_key || '',
          elevenlabs_api_key: data.elevenlabs_api_key || '',
          openai_key_status: data.openai_api_key ? true : false,
          elevenlabs_key_status: data.elevenlabs_api_key ? true : false,
        })
      }
    } catch (error) {
      console.error('Error loading user settings:', error)
    }
  }

  const saveSettings = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          openai_api_key: settings.openai_api_key,
          elevenlabs_api_key: settings.elevenlabs_api_key,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        throw error
      }

      toast({
        title: "Settings Saved",
        description: "Your API keys have been saved securely",
      })

      // Update status
      setSettings(prev => ({
        ...prev,
        openai_key_status: !!settings.openai_api_key,
        elevenlabs_key_status: !!settings.elevenlabs_api_key,
      }))

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const testOpenAIKey = async () => {
    if (!settings.openai_api_key) return

    setLoading(true)
    try {
      // Test with a simple API call
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${settings.openai_api_key}`,
        },
      })

      if (response.ok) {
        toast({
          title: "OpenAI Key Valid",
          description: "Your OpenAI API key is working correctly",
        })
        setSettings(prev => ({ ...prev, openai_key_status: true }))
      } else {
        throw new Error('Invalid API key')
      }
    } catch (error) {
      toast({
        title: "OpenAI Key Invalid",
        description: "Please check your API key",
        variant: "destructive",
      })
      setSettings(prev => ({ ...prev, openai_key_status: false }))
    } finally {
      setLoading(false)
    }
  }

  const testElevenLabsKey = async () => {
    if (!settings.elevenlabs_api_key) return

    setLoading(true)
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': settings.elevenlabs_api_key,
        },
      })

      if (response.ok) {
        toast({
          title: "ElevenLabs Key Valid",
          description: "Your ElevenLabs API key is working correctly",
        })
        setSettings(prev => ({ ...prev, elevenlabs_key_status: true }))
      } else {
        throw new Error('Invalid API key')
      }
    } catch (error) {
      toast({
        title: "ElevenLabs Key Invalid",
        description: "Please check your API key",
        variant: "destructive",
      })
      setSettings(prev => ({ ...prev, elevenlabs_key_status: false }))
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Manage your account and API keys for VoiceLoop features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Configure your API keys to enable VoiceLoop features. Your keys are stored securely in your user profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OpenAI API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">OpenAI API Key</label>
              <Badge variant={settings.openai_key_status ? "default" : "secondary"}>
                {settings.openai_key_status ? "Configured" : "Not Configured"}
              </Badge>
            </div>
            <Input
              type="password"
              placeholder="sk-..."
              value={settings.openai_api_key}
              onChange={(e) => setSettings(prev => ({ ...prev, openai_api_key: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={testOpenAIKey}
                disabled={!settings.openai_api_key || loading}
              >
                Test Key
              </Button>
              <p className="text-xs text-gray-500">
                Required for Whisper, GPT chat, and RAG features
              </p>
            </div>
          </div>

          {/* ElevenLabs API Key */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">ElevenLabs API Key (Optional)</label>
              <Badge variant={settings.elevenlabs_key_status ? "default" : "secondary"}>
                {settings.elevenlabs_key_status ? "Configured" : "Not Configured"}
              </Badge>
            </div>
            <Input
              type="password"
              placeholder="Your ElevenLabs API key"
              value={settings.elevenlabs_api_key}
              onChange={(e) => setSettings(prev => ({ ...prev, elevenlabs_api_key: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={testElevenLabsKey}
                disabled={!settings.elevenlabs_api_key || loading}
              >
                Test Key
              </Button>
              <p className="text-xs text-gray-500">
                Optional: Enhanced text-to-speech with better voice quality
              </p>
            </div>
          </div>

          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Status</CardTitle>
          <CardDescription>
            Current status of VoiceLoop features based on your API key configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Voice Transcription (Whisper)</span>
            <Badge variant={settings.openai_key_status ? "default" : "secondary"}>
              {settings.openai_key_status ? "Available" : "Requires OpenAI Key"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>AI Chat (GPT)</span>
            <Badge variant={settings.openai_key_status ? "default" : "secondary"}>
              {settings.openai_key_status ? "Available" : "Requires OpenAI Key"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Document Analysis (RAG)</span>
            <Badge variant={settings.openai_key_status ? "default" : "secondary"}>
              {settings.openai_key_status ? "Available" : "Requires OpenAI Key"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Enhanced Text-to-Speech</span>
            <Badge variant={settings.elevenlabs_key_status ? "default" : "secondary"}>
              {settings.elevenlabs_key_status ? "Available" : "Basic TTS Only"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
