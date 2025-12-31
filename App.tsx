import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientView } from './components/ClientView';
import { CourseList } from './components/CourseList';
import { SettingsView } from './components/SettingsView';
import { AnalyticsView } from './components/AnalyticsView';
import { Course, GlobalSettings } from './types';
import { Sun, Moon } from 'lucide-react';

const MOCK_COURSE: Course = {
  id: 'demo-1',
  name: 'Welcome to the Team',
  steps: [
    {
      id: 's1',
      title: 'Meet the Founder',
      description: 'A quick introduction to our vision, mission, and culture.',
      type: 'video',
      videoUrl: 'jNQXAC9IVRw', 
      isCompleted: false
    },
    {
      id: 's2',
      title: 'Sign the Contract',
      description: 'Please review the attached PDF and confirm you have signed the digital copy sent to your email.',
      type: 'action',
      actionLabel: 'I have signed the contract',
      isCompleted: false
    },
    {
      id: 's3',
      title: 'Download Handbook',
      description: 'Our culture handbook contains everything you need to know about benefits and holidays.',
      type: 'download',
      fileName: 'Employee_Handbook_2024.pdf',
      isCompleted: false
    }
  ]
};

const DEFAULT_SETTINGS: GlobalSettings = {
  platformName: '2gether',
  logoUrl: ''
};

// Persistence Helper
const loadCourses = (): Course[] => {
  const saved = localStorage.getItem('2gether_courses');
  return saved ? JSON.parse(saved) : [MOCK_COURSE];
};

const saveCoursesToStorage = (courses: Course[]) => {
  localStorage.setItem('2gether_courses', JSON.stringify(courses));
};

const loadSettings = (): GlobalSettings => {
  const saved = localStorage.getItem('2gether_settings');
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

const saveSettingsToStorage = (settings: GlobalSettings) => {
  localStorage.setItem('2gether_settings', JSON.stringify(settings));
};

function App() {
  const [view, setView] = useState<'landing' | 'admin-list' | 'admin-editor' | 'settings' | 'analytics' | 'client'>('landing');
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize
  useEffect(() => {
    // Theme Init
    if (isDarkMode) document.documentElement.classList.add('dark');
    
    // Load Data
    const loadedCourses = loadCourses();
    setCourses(loadedCourses);
    
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);

    // Check URL Params for courseId
    const params = new URLSearchParams(window.location.search);
    const sharedCourseId = params.get('courseId');

    if (sharedCourseId) {
      const found = loadedCourses.find(c => c.id === sharedCourseId);
      if (found) {
        setActiveCourse(found);
        setView('client');
      } else {
        // Remove param if invalid
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- Actions ---

  const handleCreateNew = () => {
    setEditingCourse(null);
    setView('admin-editor');
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setView('admin-editor');
  };

  const handleSaveCourse = (course: Course) => {
    let updatedCourses;
    if (editingCourse) {
      // Update existing
      updatedCourses = courses.map(c => c.id === course.id ? course : c);
    } else {
      // Add new
      updatedCourses = [...courses, course];
    }
    setCourses(updatedCourses);
    saveCoursesToStorage(updatedCourses);
    setView('admin-list');
  };

  const handleDeleteCourse = (id: string) => {
    if (window.confirm('Are you sure you want to delete this flow?')) {
      const updatedCourses = courses.filter(c => c.id !== id);
      setCourses(updatedCourses);
      saveCoursesToStorage(updatedCourses);
    }
  };

  const handleSaveSettings = (newSettings: GlobalSettings) => {
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
    setView('admin-list');
  };

  const handlePreviewCourse = (course: Course) => {
    setActiveCourse(course);
    setView('client');
  };

  const handleExitClient = () => {
    // Clear URL param if present
    const params = new URLSearchParams(window.location.search);
    if (params.get('courseId')) {
        window.history.replaceState({}, '', window.location.pathname);
    }
    setView('landing');
    setActiveCourse(null);
  };

  // --- Render ---

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-[100] p-3 rounded-full bg-white/10 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white/20 transition-all shadow-lg"
      aria-label="Toggle Theme"
    >
      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );

  if (view === 'client' && activeCourse) {
    return (
        <>
            <ThemeToggle />
            <ClientView course={activeCourse} settings={settings} courses={courses} />
            <button 
                onClick={handleExitClient}
                className="fixed bottom-4 left-4 z-50 text-xs text-slate-700 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
                Exit Demo
            </button>
        </>
    );
  }

  if (view === 'admin-editor') {
    return (
        <>
            <ThemeToggle />
            <AdminDashboard 
              initialCourse={editingCourse || undefined}
              allCourses={courses}
              onSave={handleSaveCourse}
              onCancel={() => setView('admin-list')}
            />
        </>
    );
  }

  if (view === 'settings') {
    return (
        <>
            <ThemeToggle />
            <SettingsView 
              currentSettings={settings}
              onSave={handleSaveSettings}
              onCancel={() => setView('admin-list')}
            />
        </>
    );
  }

  if (view === 'analytics') {
    return (
      <>
        <ThemeToggle />
        <AnalyticsView 
          courses={courses}
          onBack={() => setView('admin-list')}
        />
      </>
    );
  }

  if (view === 'admin-list') {
    return (
      <>
        <ThemeToggle />
        <CourseList 
          courses={courses}
          onCreateNew={handleCreateNew}
          onEdit={handleEditCourse}
          onDelete={handleDeleteCourse}
          onPreview={handlePreviewCourse}
          onOpenSettings={() => setView('settings')}
          onOpenAnalytics={() => setView('analytics')}
        />
        <button 
            onClick={() => setView('landing')}
            className="fixed bottom-4 left-4 z-50 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
            Logout
        </button>
      </>
    );
  }

  // Landing
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <ThemeToggle />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300/30 dark:bg-indigo-900/30 rounded-full blur-[128px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/30 dark:bg-purple-900/30 rounded-full blur-[128px]"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10 flex flex-col items-center">
             {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.platformName} className="h-16 mb-4 object-contain" />
             ) : (
                <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{settings.platformName}</h1>
             )}
            <p className="text-slate-600 dark:text-slate-400 text-lg">The future of onboarding.</p>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl">
            <div className="space-y-4">
                <button 
                    onClick={() => setView('admin-list')}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/50"
                >
                    Login as Admin
                </button>
                
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-sm">Or</span>
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                </div>

                <div className="space-y-3">
                   <p className="text-center text-sm text-slate-500">
                     Have a link? Paste it in your browser to start.
                   </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;
