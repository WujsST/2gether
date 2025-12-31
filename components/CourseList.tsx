import React from 'react';
import { Course } from '../types';
import { Plus, MoreVertical, Play, Edit, Trash2, Link as LinkIcon, Users, Video, FileText, Settings, BarChart3 } from 'lucide-react';

interface CourseListProps {
  courses: Course[];
  onCreateNew: () => void;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
  onPreview: (course: Course) => void;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
}

export const CourseList: React.FC<CourseListProps> = ({ courses, onCreateNew, onEdit, onDelete, onPreview, onOpenSettings, onOpenAnalytics }) => {
  
  const copyToClipboard = (courseId: string) => {
    const url = `${window.location.origin}?courseId=${courseId}`;
    navigator.clipboard.writeText(url);
    alert(`Link copied to clipboard!\n${url}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 
                className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-purple-600"
                style={{ backgroundImage: 'linear-gradient(to right, var(--primary), #9333ea)' }}
            >
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Manage your onboarding flows and track performance.</p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={onOpenAnalytics}
                className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-95"
                style={{ borderRadius: 'var(--radius)' }}
                title="Analytics"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
             <button 
                onClick={onOpenSettings}
                className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-95"
                style={{ borderRadius: 'var(--radius)' }}
                title="Platform Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={onCreateNew}
                className="px-6 py-3 text-white font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all active:scale-95"
                style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)' }}
              >
                <Plus className="w-5 h-5" />
                Create Flow
              </button>
          </div>
        </header>

        {courses.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No courses yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">Create your first AI-powered onboarding flow to get started.</p>
            <button onClick={onCreateNew} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Create now</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden" style={{ borderRadius: 'calc(var(--radius) * 1.5)' }}>
                <div className="absolute top-0 left-0 w-full h-1 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ backgroundColor: 'var(--primary)' }} />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl" style={{ color: 'var(--primary)' }}>
                    <Video className="w-6 h-6" />
                  </div>
                  <div className="relative">
                    <button 
                        onClick={() => copyToClipboard(course.id)}
                        className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        style={{ borderRadius: 'calc(var(--radius) * 0.5)' }}
                        title="Copy Share Link"
                    >
                        <LinkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 truncate pr-2">{course.name}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                  <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {course.steps.length} Steps</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Active</span>
                </div>

                <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button 
                    onClick={() => onPreview(course)}
                    className="flex-1 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    style={{ borderRadius: 'calc(var(--radius) * 0.5)' }}
                  >
                    <Play className="w-4 h-4" /> Preview
                  </button>
                  <button 
                    onClick={() => onEdit(course)}
                    className="p-2 text-slate-500 hover:text-[var(--primary)] hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    style={{ borderRadius: 'calc(var(--radius) * 0.5)' }}
                    title="Edit Structure"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(course.id)}
                    className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    style={{ borderRadius: 'calc(var(--radius) * 0.5)' }}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};