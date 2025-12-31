import React, { useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, Users, CheckCircle, Clock } from 'lucide-react';
import { Course, UserProgress } from '../types';

interface AnalyticsViewProps {
  courses: Course[];
  onBack: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ courses, onBack }) => {
  const [progressData, setProgressData] = useState<UserProgress[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('2gether_user_progress');
    if (stored) {
      setProgressData(JSON.parse(stored));
    }
  }, []);

  // --- Aggregations ---

  const totalUsers = new Set(progressData.map(p => p.userId)).size;
  
  const getCourseName = (id: string) => courses.find(c => c.id === id)?.name || 'Unknown Course';
  
  const getCompletionRate = (course: Course) => {
    const courseProgress = progressData.filter(p => p.courseId === course.id);
    if (courseProgress.length === 0) return 0;
    
    const completedCount = courseProgress.filter(p => p.completedStepIds.length === course.steps.length).length;
    return Math.round((completedCount / courseProgress.length) * 100);
  };

  const getActiveUsersForCourse = (courseId: string) => {
    return progressData.filter(p => p.courseId === courseId).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Analytics & Insights</h1>
            <p className="text-slate-500 dark:text-slate-400">Track user engagement and completion rates.</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-indigo-500">
              <Users className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wider">Total Unique Users</span>
            </div>
            <div className="text-4xl font-bold">{totalUsers}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
             <div className="flex items-center gap-3 mb-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wider">Total Sessions</span>
            </div>
            <div className="text-4xl font-bold">{progressData.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
             <div className="flex items-center gap-3 mb-2 text-purple-500">
              <BarChart3 className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wider">Active Courses</span>
            </div>
            <div className="text-4xl font-bold">{courses.length}</div>
          </div>
        </div>

        {/* Course Performance Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-12">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
             <h2 className="text-xl font-bold">Course Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Course Name</th>
                  <th className="p-4 font-semibold">Active Users</th>
                  <th className="p-4 font-semibold">Avg. Completion</th>
                  <th className="p-4 font-semibold">Steps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {courses.map(course => (
                  <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{course.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{getActiveUsersForCourse(course.id)}</td>
                    <td className="p-4">
                       <div className="flex items-center gap-3">
                         <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500 rounded-full" style={{ width: `${getCompletionRate(course)}%`}}></div>
                         </div>
                         <span className="text-sm font-medium">{getCompletionRate(course)}%</span>
                       </div>
                    </td>
                    <td className="p-4 text-slate-500">{course.steps.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Raw Log (Recent Activity) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
             <h2 className="text-xl font-bold">Recent User Activity Log</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
             {progressData.length === 0 ? (
               <div className="p-8 text-center text-slate-500">No activity recorded yet.</div>
             ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {progressData.sort((a,b) => b.lastUpdated - a.lastUpdated).map((log, idx) => {
                     const course = courses.find(c => c.id === log.courseId) || { name: 'Deleted Course', steps: [] };
                     // Fallback check if course object is actually found or using ID directly
                     const courseName = getCourseName(log.courseId);
                     const stepCount = courses.find(c => c.id === log.courseId)?.steps.length || 0;
                     
                     return (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div>
                           <div className="font-medium text-sm text-slate-900 dark:text-white flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                             User: <span className="font-mono text-slate-500">{log.userId.substring(0,8)}...</span>
                           </div>
                           <div className="text-xs text-slate-500 mt-1">
                             Started: <span className="text-indigo-600 dark:text-indigo-400">{courseName}</span>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                             {log.completedStepIds.length} / {stepCount} Steps
                           </div>
                           <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                             <Clock className="w-3 h-3" />
                             {new Date(log.lastUpdated).toLocaleDateString()} {new Date(log.lastUpdated).toLocaleTimeString()}
                           </div>
                        </div>
                      </div>
                     );
                  })}
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};