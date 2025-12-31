import React, { useState } from 'react';
import { Save, ArrowLeft, Building, Image as ImageIcon, Layout, Palette, Moon, Sun, Check } from 'lucide-react';
import { GlobalSettings, ThemeConfig } from '../types';

interface SettingsViewProps {
  currentSettings: GlobalSettings;
  onSave: (settings: GlobalSettings) => void;
  onCancel: () => void;
}

const PRESET_THEMES = [
    { name: 'Indigo', color: '#4f46e5' },
    { name: 'Emerald', color: '#10b981' },
    { name: 'Rose', color: '#e11d48' },
    { name: 'Amber', color: '#d97706' },
    { name: 'Sky', color: '#0ea5e9' },
    { name: 'Violet', color: '#7c3aed' },
];

const RADIUS_OPTIONS = [
    { name: 'Sharp', value: '0px' },
    { name: 'Soft', value: '8px' },
    { name: 'Round', value: '16px' },
    { name: 'Pill', value: '9999px' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({ currentSettings, onSave, onCancel }) => {
  const [platformName, setPlatformName] = useState(currentSettings.platformName);
  const [logoUrl, setLogoUrl] = useState(currentSettings.logoUrl);
  
  // Theme State
  const [theme, setTheme] = useState<ThemeConfig>(currentSettings.theme || {
      primaryColor: '#4f46e5',
      radius: '12px',
      mode: 'dark'
  });

  const handleSave = () => {
    onSave({
      platformName,
      logoUrl,
      theme
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Platform Settings</h1>
            <p className="text-slate-500 dark:text-slate-400">Configure branding, colors, and style.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8 space-y-10">
                
                {/* Section: General Info */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <Building className="w-5 h-5 text-[var(--primary)]" style={{ color: theme.primaryColor }} />
                        <h2 className="text-xl font-bold">Brand Identity</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Platform Name
                            </label>
                            <input 
                                type="text"
                                value={platformName}
                                onChange={(e) => setPlatformName(e.target.value)}
                                placeholder="e.g. Acme Corp Onboarding"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Logo URL
                            </label>
                            <input 
                                type="text"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://example.com/logo.png"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Appearance */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <Palette className="w-5 h-5 text-[var(--primary)]" style={{ color: theme.primaryColor }} />
                        <h2 className="text-xl font-bold">Appearance</h2>
                    </div>

                    {/* Mode Selection */}
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Default Mode
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setTheme({...theme, mode: 'light'})}
                                className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${theme.mode === 'light' ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                style={theme.mode === 'light' ? { backgroundColor: theme.primaryColor, borderColor: theme.primaryColor } : {}}
                            >
                                <Sun className="w-4 h-4" /> Light
                            </button>
                            <button
                                onClick={() => setTheme({...theme, mode: 'dark'})}
                                className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${theme.mode === 'dark' ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                style={theme.mode === 'dark' ? { backgroundColor: theme.primaryColor, borderColor: theme.primaryColor } : {}}
                            >
                                <Moon className="w-4 h-4" /> Dark
                            </button>
                        </div>
                    </div>

                    {/* Primary Color */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Primary Color
                        </label>
                        <div className="flex flex-wrap gap-3 mb-4">
                            {PRESET_THEMES.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => setTheme({...theme, primaryColor: preset.color})}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${theme.primaryColor === preset.color ? 'ring-2 ring-offset-2 ring-[var(--primary)] dark:ring-offset-slate-900' : ''}`}
                                    style={{ backgroundColor: preset.color, borderColor: theme.primaryColor === preset.color ? theme.primaryColor : 'transparent' }}
                                    title={preset.name}
                                >
                                    {theme.primaryColor === preset.color && <Check className="w-5 h-5 text-white" />}
                                </button>
                            ))}
                            <div className="relative w-10 h-10 overflow-hidden rounded-full border border-slate-300 dark:border-slate-600 cursor-pointer hover:scale-110 transition-transform">
                                <input 
                                    type="color" 
                                    value={theme.primaryColor}
                                    onChange={(e) => setTheme({...theme, primaryColor: e.target.value})}
                                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Radius */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Corner Radius
                        </label>
                        <div className="flex gap-3">
                             {RADIUS_OPTIONS.map((opt) => (
                                 <button
                                    key={opt.name}
                                    onClick={() => setTheme({...theme, radius: opt.value})}
                                    className={`flex-1 py-2 rounded-lg text-sm border transition-all ${theme.radius === opt.value ? 'bg-slate-100 dark:bg-slate-800 border-[var(--primary)] text-[var(--primary)] font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                    style={theme.radius === opt.value ? { borderColor: theme.primaryColor, color: theme.primaryColor } : {}}
                                 >
                                     <div className="h-4 bg-current opacity-20 mb-2 w-full border-2 border-current" style={{ borderRadius: opt.value }}></div>
                                     {opt.name}
                                 </button>
                             ))}
                        </div>
                    </div>

                </div>

                {/* Preview */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Layout className="w-5 h-5 text-[var(--primary)]" style={{ color: theme.primaryColor }} />
                        <h2 className="text-xl font-bold">Preview</h2>
                    </div>
                    
                    <div className={`rounded-[var(--radius)] p-6 flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 h-48 relative transition-colors duration-300 ${theme.mode === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`} style={{ borderRadius: theme.radius }}>
                        <div className="absolute top-2 left-2 text-xs text-slate-400 font-mono">CLIENT VIEW</div>
                        
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo Preview" className="h-12 object-contain mb-2" />
                        ) : (
                            <h1 className="text-3xl font-bold mb-2">{platformName}</h1>
                        )}
                        <button 
                            className="px-6 py-2 text-white font-bold shadow-lg mt-4 transition-all"
                            style={{ backgroundColor: theme.primaryColor, borderRadius: theme.radius }}
                        >
                            Get Started
                        </button>
                    </div>
                </div>

            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950/50 p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    style={{ backgroundColor: theme.primaryColor, borderRadius: theme.radius }}
                >
                    <Save className="w-5 h-5" />
                    Save Changes
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};