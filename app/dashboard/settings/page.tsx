'use client';

import { Settings, Bell, User, Palette, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    slack: true,
  });
  const [compactMode, setCompactMode] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Load settings from DB on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setProfile({
            name: data.settings?.profile_name || data.name || 'Admin Demo',
            email: data.settings?.profile_email || 'admin@demo.com',
          });
          if (data.settings?.notifications) {
            setNotifications(data.settings.notifications);
          }
          if (data.settings?.compactMode !== undefined) {
            setCompactMode(data.settings.compactMode);
          }
        }
        setLoadingSettings(false);
      })
      .catch(() => setLoadingSettings(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            profile_name: profile.name,
            profile_email: profile.email,
            notifications,
            compactMode,
            theme: isDark ? 'dark' : 'light',
          },
        }),
      });
      const data = await res.json();
      if (data.error) {
        console.error('Save failed:', data.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
    setIsSaving(false);
  };

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and application preferences
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground relative overflow-hidden"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </span>
          ) : saved ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> Saved!
            </span>
          ) : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Section */}
        <section className="glass rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">Update your personal information</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-muted/30 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-muted/30 border-border/50"
              />
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="glass rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive daily summaries and ticket updates via email</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(v) => setNotifications({ ...notifications, email: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Get instant alerts on your desktop</p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(v) => setNotifications({ ...notifications, push: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Slack Integration</Label>
                <p className="text-sm text-muted-foreground">Send ticket alerts to your Slack workspace</p>
              </div>
              <Switch
                checked={notifications.slack}
                onCheckedChange={(v) => setNotifications({ ...notifications, slack: v })}
              />
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="glass rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[oklch(0.7_0.2_150)]/10 flex items-center justify-center text-[oklch(0.7_0.2_150)]">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground">Personalize your dashboard experience</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce whitespace in the dashboard list</p>
              </div>
              <Switch
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
