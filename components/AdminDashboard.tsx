import React, { useState, useEffect } from 'react';
import { generateCourseStructure, enhanceText } from '../services/geminiService';
import { Course, Step, StepType } from '../types';
import { 
  Wand2, Plus, Layout, Video, Download, CheckSquare, Loader2, Save, 
  Trash2, GripVertical, Link as LinkIcon, Upload, Bold, Italic, 
  List, Heading, Sparkles, Monitor, Smartphone, ChevronRight, Settings, ArrowLeft, Play, ArrowUpRight 
} from 'lucide-react';

interface AdminDashboardProps {
  initialCourse?: Course;
  allCourses: Course[]; // Added to support linking to other courses
  onSave: (course: Course) => void;
  onCancel: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialCourse, allCourses, onSave, onCancel }) => {
  // State
  const [topic, setTopic] = useState(initialCourse ? initialCourse.name : '');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Use Partial<Step> internally for flexibility during creation, but cast when saving
  const [generatedSteps, setGeneratedSteps] = useState<Partial<Step>[]>(
    initialCourse ? initialCourse.steps : []
  );
  
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(!initialCourse); // Hide AI panel if editing existing

  // Initialize with a default step if empty
  useEffect(() => {
    if (generatedSteps.length === 0) {
      addNewStep();
    } else if (!activeStepIndex) {
      setActiveStepIndex(0);
    }
  }, []);

  // --- Actions ---

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const steps = await generateCourseStructure(topic);
    setGeneratedSteps(steps);
    if (steps.length > 0) setActiveStepIndex(0);
    setIsGenerating(false);
    setShowAiPanel(false); // Auto close AI panel to show results
  };

  const handleSave = () => {
    const finalSteps = generatedSteps.map((s, i) => ({
        id: s.id || `step-${Date.now()}-${i}`,
        title: s.title || 'Untitled Step',
        description: s.description || '',
        type: s.type || 'action',
        videoUrl: s.videoUrl,
        embedUrl: s.embedUrl,
        actionLabel: s.actionLabel,
        fileName: s.fileName,
        fileUrl: s.fileUrl,
        linkedCourseId: s.linkedCourseId,
        isCompleted: false
    })) as Step[];

    const courseToSave: Course = {
      id: initialCourse?.id || `course-${Date.now()}`,
      name: topic || 'New Course',
      steps: finalSteps.length > 0 ? finalSteps : []
    };
    onSave(courseToSave);
  };

  const updateActiveStep = (field: keyof Step, value: any) => {
    if (activeStepIndex === null) return;
    const newSteps = [...generatedSteps];
    newSteps[activeStepIndex] = { ...newSteps[activeStepIndex], [field]: value };
    setGeneratedSteps(newSteps);
  };

  const deleteStep = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSteps = generatedSteps.filter((_, i) => i !== index);
    setGeneratedSteps(newSteps);
    if (activeStepIndex === index) {
        setActiveStepIndex(null);
    } else if (activeStepIndex !== null && activeStepIndex > index) {
        setActiveStepIndex(activeStepIndex - 1);
    }
  };

  const addNewStep = () => {
      const newStep: Partial<Step> = {
          title: 'New Step',
          description: 'Description of the step',
          type: 'action',
          actionLabel: 'Complete task'
      };
      setGeneratedSteps(prev => [...prev, newStep]);
      setActiveStepIndex(generatedSteps.length); // Select new step
  };

  const handleEnhanceDescription = async () => {
    if (activeStepIndex === null) return;
    const currentDesc = generatedSteps[activeStepIndex].description;
    if (!currentDesc) return;
    
    setIsEnhancing(true);
    const improvedText = await enhanceText(currentDesc);
    updateActiveStep('description', improvedText);
    setIsEnhancing(false);
  };

  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById('preview-description') as HTMLTextAreaElement;
    if (!textarea || activeStepIndex === null) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = generatedSteps[activeStepIndex].description || '';
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    updateActiveStep('description', before + textToInsert + after);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  // --- Drag & Drop ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const newSteps = [...generatedSteps];
    const [draggedItem] = newSteps.splice(draggedItemIndex, 1);
    newSteps.splice(targetIndex, 0, draggedItem);
    setGeneratedSteps(newSteps);
    
    if (activeStepIndex === draggedItemIndex) setActiveStepIndex(targetIndex);
    else if (activeStepIndex !== null) {
         if (draggedItemIndex < activeStepIndex && targetIndex >= activeStepIndex) setActiveStepIndex(activeStepIndex - 1);
         else if (draggedItemIndex > activeStepIndex && targetIndex <= activeStepIndex) setActiveStepIndex(activeStepIndex + 1);
    }
    setDraggedItemIndex(null);
  };

  const activeStep = activeStepIndex !== null ? generatedSteps[activeStepIndex] : null;

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR: Structure & AI */}
      <div className="w-80 flex flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl z-20">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
            <button onClick={onCancel} className="p-1 hover:bg-slate-800 rounded">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    Editor
                </h1>
            </div>
        </div>

        {/* Course Name Input */}
        <div className="p-4 border-b border-slate-800">
            <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Course Name</label>
            <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="My Awesome Course"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none"
            />
        </div>

        {/* AI Toggle */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/30">
            <button 
                onClick={() => setShowAiPanel(!showAiPanel)}
                className="w-full flex items-center justify-between text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    <span>AI Assistant</span>
                </div>
                <Settings className={`w-4 h-4 transition-transform ${showAiPanel ? 'rotate-180' : ''}`} />
            </button>
            
            {showAiPanel && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs text-slate-500 mb-2">Generate a structure based on a topic.</p>
                    <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Onboarding for SEO Clients..."
                        className="w-full h-20 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 outline-none resize-none mb-3"
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-colors flex items-center justify-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Generate Structure
                    </button>
                </div>
            )}
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Outline</span>
            </div>
            {generatedSteps.map((step, idx) => (
                <div 
                    key={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`group relative p-3 rounded-xl border transition-all cursor-pointer select-none flex items-center gap-3 ${
                        activeStepIndex === idx 
                        ? 'bg-indigo-900/20 border-indigo-500/50 shadow-lg shadow-indigo-900/20' 
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                >
                    <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate text-slate-200">{step.title || 'Untitled'}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">{step.type}</div>
                    </div>
                    <button 
                        onClick={(e) => deleteStep(idx, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-md transition-all"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            ))}
            
            <button 
                onClick={addNewStep}
                className="w-full py-3 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-sm font-medium hover:border-slate-700 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add Step
            </button>
        </div>

        <div className="p-4 border-t border-slate-800">
             <button 
                onClick={handleSave}
                className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
                <Save className="w-4 h-4" />
                Save & Exit
            </button>
        </div>
      </div>

      {/* CENTER: Visual Editor (Preview Mode) */}
      <div className="flex-1 bg-black flex flex-col relative overflow-hidden">
        {/* Editor Toolbar Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-full px-4 py-2 flex items-center gap-4 shadow-2xl">
            <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
                <Monitor className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono text-slate-300">Desktop View</span>
            </div>
            {activeStep ? (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Step Type:</span>
                    <select 
                        value={activeStep.type}
                        onChange={(e) => updateActiveStep('type', e.target.value)}
                        className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer hover:text-indigo-400"
                    >
                        <option value="video">Video</option>
                        <option value="action">Action</option>
                        <option value="download">Download</option>
                        <option value="embedded">Embed</option>
                        <option value="link">Link Course</option>
                    </select>
                </div>
            ) : (
                <span className="text-xs text-slate-500">No step selected</span>
            )}
        </div>

        {activeStep ? (
            <div className="flex-1 flex flex-col lg:flex-row h-full pt-0 animate-in fade-in duration-300">
                {/* Visual Asset (Left) */}
                <div className={`lg:w-2/3 relative flex items-center justify-center border-r border-slate-900 ${
                    activeStep.type === 'video' || activeStep.type === 'embedded' ? 'bg-black' : 'bg-slate-900'
                }`}>
                    {/* ASSET CONFIGURATION OVERLAY */}
                    <div className="absolute top-6 left-6 z-10">
                        <div className="bg-black/50 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-white/50">
                            Asset Preview
                        </div>
                    </div>

                    {activeStep.type === 'video' ? (
                        <div className="w-full h-full relative group">
                            {activeStep.videoUrl ? (
                                <iframe
                                    className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity pointer-events-none"
                                    src={`https://www.youtube.com/embed/${activeStep.videoUrl}?controls=0`}
                                    title="Preview"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                                    <Video className="w-16 h-16 mb-4 opacity-50" />
                                    <p>No Video ID</p>
                                </div>
                            )}
                            {/* Editor Input Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                <div className="w-96 bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <label className="block text-xs font-bold text-indigo-400 mb-2 uppercase">YouTube Video ID</label>
                                    <input 
                                        value={activeStep.videoUrl || ''}
                                        onChange={(e) => updateActiveStep('videoUrl', e.target.value)}
                                        placeholder="e.g. jNQXAC9IVRw"
                                        className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">Paste the ID, not the full link.</p>
                                </div>
                            </div>
                        </div>
                    ) : activeStep.type === 'embedded' ? (
                        <div className="w-full h-full relative group flex items-center justify-center">
                            <div className="text-center opacity-50 group-hover:opacity-20">
                                <LinkIcon className="w-20 h-20 mx-auto mb-4 text-slate-600" />
                                <h3 className="text-xl font-bold text-slate-500">Embed Content</h3>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                <div className="w-96 bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl">
                                    <label className="block text-xs font-bold text-indigo-400 mb-2 uppercase">Embed URL</label>
                                    <input 
                                        value={activeStep.embedUrl || ''}
                                        onChange={(e) => updateActiveStep('embedUrl', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-8 group relative w-full h-full flex flex-col items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
                                {activeStep.type === 'download' ? (
                                    <Download className="w-10 h-10 text-indigo-400"/>
                                ) : activeStep.type === 'link' ? (
                                     <ArrowUpRight className="w-10 h-10 text-indigo-400"/>
                                ) : (
                                    <CheckSquare className="w-10 h-10 text-indigo-400"/>
                                )}
                            </div>
                            
                            {activeStep.type === 'download' && (
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-xl w-64">
                                    <label className="block text-xs text-slate-400 mb-1">File Name</label>
                                    <input 
                                        value={activeStep.fileName || ''}
                                        onChange={(e) => updateActiveStep('fileName', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white mb-2"
                                    />
                                    <label className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded cursor-pointer text-xs text-slate-300">
                                        <Upload className="w-3 h-3" /> Upload File
                                        <input type="file" className="hidden" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                updateActiveStep('fileName', file.name);
                                                updateActiveStep('fileUrl', URL.createObjectURL(file));
                                            }
                                        }}/>
                                    </label>
                                </div>
                            )}

                             {activeStep.type === 'link' && (
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-xl w-72">
                                    <label className="block text-xs text-slate-400 mb-1">Link to Course</label>
                                    <select
                                        value={activeStep.linkedCourseId || ''}
                                        onChange={(e) => updateActiveStep('linkedCourseId', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white mb-2 cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="">-- Select a Course --</option>
                                        {allCourses.filter(c => c.id !== initialCourse?.id).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-slate-500 text-center">User will be redirected to this workflow.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Interactive Content (Right) */}
                <div className="lg:w-1/3 h-full bg-slate-950 flex flex-col relative border-l border-white/5">
                    <div className="flex-1 p-8 flex flex-col justify-center overflow-y-auto">
                        <div className="mb-2 text-indigo-400 font-mono text-xs tracking-widest uppercase flex items-center gap-2">
                             Step {activeStepIndex + 1} of {generatedSteps.length}
                             <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px]">EDITING</span>
                        </div>
                        
                        {/* Title Editor */}
                        <input
                            value={activeStep.title || ''}
                            onChange={(e) => updateActiveStep('title', e.target.value)}
                            className="text-3xl md:text-4xl font-bold mb-4 bg-transparent text-white border-b border-transparent focus:border-indigo-500 outline-none pb-2 placeholder-slate-700"
                            placeholder="Step Title..."
                        />

                        {/* Description Editor with Toolbar */}
                        <div className="relative group mb-8">
                             <div className="absolute -top-10 left-0 right-0 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-1 opacity-0 group-focus-within:opacity-100 transition-opacity shadow-xl z-20">
                                <div className="flex gap-0.5">
                                    <button onClick={() => insertTextAtCursor('**Bold**')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><Bold className="w-3 h-3"/></button>
                                    <button onClick={() => insertTextAtCursor('_Italic_')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><Italic className="w-3 h-3"/></button>
                                    <button onClick={() => insertTextAtCursor('\n- ')} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><List className="w-3 h-3"/></button>
                                </div>
                                <button 
                                    onClick={handleEnhanceDescription}
                                    disabled={isEnhancing}
                                    className="text-[10px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-900/30 transition-colors"
                                >
                                    {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    AI Enhance
                                </button>
                             </div>
                            <textarea
                                id="preview-description"
                                value={activeStep.description || ''}
                                onChange={(e) => updateActiveStep('description', e.target.value)}
                                className="w-full h-40 bg-transparent text-lg text-slate-400 border border-transparent hover:border-slate-800 focus:border-indigo-500 rounded-lg p-2 outline-none resize-none leading-relaxed transition-all"
                                placeholder="Write the step instructions here..."
                            />
                        </div>

                        {/* Action Area Simulation */}
                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                            {activeStep.type === 'video' && (
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Play className="w-5 h-5 fill-current" />
                                    <span>User watches video to continue</span>
                                </div>
                            )}
                            {activeStep.type === 'action' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded border border-slate-600 bg-slate-800"></div>
                                        <input 
                                            value={activeStep.actionLabel || ''}
                                            onChange={(e) => updateActiveStep('actionLabel', e.target.value)}
                                            className="bg-transparent text-lg text-slate-300 border-b border-transparent focus:border-indigo-500 outline-none w-full"
                                            placeholder="Label (e.g. I accept)"
                                        />
                                    </div>
                                    <div className="w-full h-12 bg-slate-900 border border-slate-800 rounded-lg flex items-center px-4 text-slate-600 italic">
                                        User Input Field
                                    </div>
                                </div>
                            )}
                            {activeStep.type === 'download' && (
                                <div className="w-full py-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center gap-3 text-slate-300">
                                    <Download className="w-5 h-5" />
                                    <span>{activeStep.fileName || 'Download Button'}</span>
                                </div>
                            )}
                            {activeStep.type === 'link' && (
                                <div className="w-full py-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center gap-3 text-slate-300">
                                    <ArrowUpRight className="w-5 h-5" />
                                    <span>Continue to Next Workflow</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <Layout className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a step from the sidebar to edit</p>
            </div>
        )}
      </div>
    </div>
  );
};
