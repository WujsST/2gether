import React, { useState } from 'react';
import { Save, ArrowLeft, Building, Image as ImageIcon, Layout } from 'lucide-react';
import { GlobalSettings } from '../types';

interface SettingsViewProps {
  currentSettings: GlobalSettings;
  onSave: (settings: GlobalSettings) => void;
  onCancel: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentSettings, onSave, onCancel }) => {
  const [platformName, setPlatformName] = useState(currentSettings.platformName);
  const [logoUrl, setLogoUrl] = useState(currentSettings.logoUrl);

  const handleSave = () => {
    onSave({
      platformName,
      logoUrl
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
            <p className="text-slate-500 dark:text-slate-400">Configure white-label branding options.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
                
                {/* Section: General Info */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Building className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-xl font-bold">Brand Identity</h2>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Platform Name
                        </label>
                        <input 
                            type="text"
                            value={platformName}
                            onChange={(e) => setPlatformName(e.target.value)}
                            placeholder="e.g. Acme Corp Onboarding"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        />
                        <p className="text-xs text-slate-500 mt-1">This name will appear on browser tabs and the landing page.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Logo URL
                        </label>
                         <div className="flex gap-4">
                            <div className="flex-1">
                                <input 
                                    type="text"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                         </div>
                         <p className="text-xs text-slate-500 mt-1">Direct link to your transparent PNG/SVG logo (approx 200x50px).</p>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Layout className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-xl font-bold">Preview</h2>
                    </div>
                    
                    <div className="bg-slate-100 dark:bg-black rounded-xl p-6 flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 h-48 relative">
                        <div className="absolute top-2 left-2 text-xs text-slate-400 font-mono">CLIENT VIEW MOCKUP</div>
                        
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo Preview" className="h-12 object-contain mb-2" />
                        ) : (
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{platformName}</h1>
                        )}
                        <p className="text-slate-500 text-sm">The future of onboarding.</p>
                    </div>
                </div>

            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950/50 p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
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
