import React, { useState, useEffect } from 'react';
import { generateCourseStructure, enhanceText, generateAiImage, generateAiVideo, generateSopContent } from '../services/geminiService';
import { Course, Step, StepType, MediaType, ContentBlock, AlertVariant } from '../types';
import { 
  Wand2, Plus, Layout, Video, Download, CheckSquare, Loader2, Save, 
  Trash2, GripVertical, Link as LinkIcon, Upload, Bold, Italic, 
  List, Heading, Sparkles, Monitor, Smartphone, ChevronRight, Settings, 
  ArrowLeft, Play, ArrowUpRight, Image as ImageIcon, Film,
  AlertTriangle, HelpCircle, Type as TypeIcon, X, FileText
} from 'lucide-react';

interface AdminDashboardProps {
  initialCourse?: Course;
  allCourses: Course[];
  onSave: (course: Course) => void;
  onCancel: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialCourse, allCourses, onSave, onCancel }) => {
  // State
  const [topic, setTopic] = useState(initialCourse ? initialCourse.name : '');
  const [isGeneratingStructure, setIsGeneratingStructure] = useState(false);
  
  const [generatedSteps, setGeneratedSteps] = useState<Partial<Step>[]>(
    initialCourse ? initialCourse.steps : []
  );
  
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(!initialCourse);
  
  // Asset Generation State
  const [assetPrompt, setAssetPrompt] = useState('');
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    if (generatedSteps.length === 0) {
      addNewStep();
    } else if (!activeStepIndex) {
      setActiveStepIndex(0);
    }
  }, []);

  // --- Actions ---

  const handleGenerateStructure = async () => {
    if (!topic) return;
    setIsGeneratingStructure(true);
    const steps = await generateCourseStructure(topic);
    
    // Ensure generated steps have basic content block structure
    const processedSteps = steps.map(s => ({
        ...s,
        contentBlocks: [{
            id: `block-${Date.now()}-${Math.random()}`,
            type: 'text',
            content: s.description || ''
        } as ContentBlock]
    }));

    setGeneratedSteps(processedSteps);
    if (steps.length > 0) setActiveStepIndex(0);
    setIsGeneratingStructure(false);
    setShowAiPanel(false);
  };

  const handleSave = () => {
    const finalSteps = generatedSteps.map((s, i) => ({
        id: s.id || `step-${Date.now()}-${i}`,
        title: s.title || 'Untitled Step',
        description: s.description || 'Legacy description', // Fallback
        contentBlocks: s.contentBlocks || [],
        type: s.type || 'action',
        
        // SOP
        sopContent: s.sopContent,

        // Media defaults
        mediaType: s.mediaType || 'youtube',
        videoUrl: s.videoUrl,
        imageUrl: s.imageUrl,
        
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

  // --- Block Management ---

  const addBlock = (type: 'text' | 'alert' | 'quiz') => {
      if (activeStepIndex === null) return;
      const step = generatedSteps[activeStepIndex];
      const newBlock: ContentBlock = {
          id: `block-${Date.now()}`,
          type,
          content: type === 'text' ? '' : type === 'alert' ? 'Warning message here' : undefined,
          alertVariant: type === 'alert' ? 'warning' : undefined,
          quizQuestion: type === 'quiz' ? 'New Question?' : undefined,
          quizOptions: type === 'quiz' ? ['Option 1', 'Option 2'] : undefined,
          quizCorrectIndex: type === 'quiz' ? 0 : undefined
      };
      
      const updatedBlocks = [...(step.contentBlocks || []), newBlock];
      updateActiveStep('contentBlocks', updatedBlocks);
  };

  const updateBlock = (blockId: string, field: keyof ContentBlock, value: any) => {
      if (activeStepIndex === null) return;
      const step = generatedSteps[activeStepIndex];
      const updatedBlocks = (step.contentBlocks || []).map(b => 
          b.id === blockId ? { ...b, [field]: value } : b
      );
      updateActiveStep('contentBlocks', updatedBlocks);
  };

  const removeBlock = (blockId: string) => {
      if (activeStepIndex === null) return;
      const step = generatedSteps[activeStepIndex];
      const updatedBlocks = (step.contentBlocks || []).filter(b => b.id !== blockId);
      updateActiveStep('contentBlocks', updatedBlocks);
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
          description: '',
          contentBlocks: [{ id: `block-${Date.now()}`, type: 'text', content: 'Description of the step' }],
          type: 'action',
          actionLabel: 'Complete task',
          mediaType: 'youtube'
      };
      setGeneratedSteps(prev => [...prev, newStep]);
      setActiveStepIndex(generatedSteps.length);
  };

  // --- Asset Generation ---
  const handleGenerateAsset = async () => {
      if (!assetPrompt || activeStepIndex === null) return;
      setIsGeneratingAsset(true);
      setGenerationError(null);
      
      try {
          const stepType = generatedSteps[activeStepIndex].type;
          
          if (stepType === 'image') {
              const base64Image = await generateAiImage(assetPrompt);
              if (base64Image) {
                  updateActiveStep('imageUrl', base64Image);
                  updateActiveStep('mediaType', 'generated-image');
              }
          } else if (stepType === 'video') {
              // Defaulting to 16:9 for now, could be an option
              const videoUri = await generateAiVideo(assetPrompt, '16:9');
              if (videoUri) {
                  updateActiveStep('videoUrl', videoUri);
                  updateActiveStep('mediaType', 'generated-video');
              }
          } else if (stepType === 'sop') {
              const sopText = await generateSopContent(assetPrompt);
              if (sopText) {
                  updateActiveStep('sopContent', sopText);
              }
          }
      } catch (err) {
          setGenerationError("Generation failed. Please try again or check your API key.");
      } finally {
          setIsGeneratingAsset(false);
      }
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

  // Init content blocks if they don't exist (migration logic)
  useEffect(() => {
    if (activeStep && (!activeStep.contentBlocks || activeStep.contentBlocks.length === 0)) {
        updateActiveStep('contentBlocks', [{
            id: 'default-text',
            type: 'text',
            content: activeStep.description || ''
        }]);
    }
  }, [activeStepIndex]);

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
                        onClick={handleGenerateStructure}
                        disabled={isGeneratingStructure || !topic}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-colors flex items-center justify-center gap-2"
                    >
                        {isGeneratingStructure ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
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
                        <option value="image">Image</option>
                        <option value="sop">SOP Document</option>
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
                    activeStep.type === 'video' || activeStep.type === 'embedded' || activeStep.type === 'image' ? 'bg-black' : 'bg-slate-900'
                }`}>
                    {/* SOP EDITOR */}
                    {activeStep.type === 'sop' ? (
                        <div className="w-full h-full p-8 bg-slate-200/50 flex justify-center overflow-y-auto">
                            <div className="relative w-full max-w-2xl bg-white text-slate-900 min-h-full shadow-2xl p-8 rounded-sm">
                                <div className="absolute -top-12 left-0 flex items-center gap-2">
                                     <button 
                                        onClick={() => setShowAiPanel(!showAiPanel)}
                                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
                                     >
                                         <Wand2 className="w-3 h-3" /> Auto-Write SOP
                                     </button>
                                </div>
                                
                                {showAiPanel && (
                                     <div className="absolute top-4 left-4 right-4 z-20 bg-slate-900 p-4 rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-2">
                                         <div className="flex justify-between items-center mb-2">
                                             <h3 className="text-xs font-bold text-white uppercase">AI SOP Generator</h3>
                                             <button onClick={() => setShowAiPanel(false)}><X className="w-4 h-4 text-slate-400"/></button>
                                         </div>
                                         <textarea 
                                             value={assetPrompt} 
                                             onChange={(e) => setAssetPrompt(e.target.value)}
                                             placeholder="What is this SOP about? e.g. 'Handling customer refunds'"
                                             className="w-full bg-slate-800 text-white text-sm p-2 rounded mb-2 border border-slate-700"
                                         />
                                         <button 
                                             onClick={handleGenerateAsset}
                                             disabled={isGeneratingAsset}
                                             className="w-full bg-indigo-600 text-white py-2 rounded text-xs font-bold"
                                         >
                                             {isGeneratingAsset ? <Loader2 className="w-3 h-3 animate-spin mx-auto"/> : 'Generate Document'}
                                         </button>
                                     </div>
                                )}

                                <div className="text-xs text-slate-400 uppercase font-bold mb-4 border-b pb-2">Standard Operating Procedure</div>
                                <textarea
                                    value={activeStep.sopContent || ''}
                                    onChange={(e) => updateActiveStep('sopContent', e.target.value)}
                                    placeholder="# Procedure Title\n\nWrite your SOP here or use AI to generate it..."
                                    className="w-full h-[calc(100%-4rem)] resize-none outline-none text-slate-800 bg-transparent font-serif leading-relaxed"
                                />
                            </div>
                        </div>
                    ) : activeStep.type === 'video' ? (
                        <div className="w-full h-full relative group flex items-center justify-center">
                            {activeStep.mediaType === 'generated-video' && activeStep.videoUrl ? (
                                <video className="w-full h-full object-contain pointer-events-none" src={activeStep.videoUrl} muted autoPlay loop />
                            ) : activeStep.videoUrl ? (
                                <iframe className="w-full h-full object-cover opacity-50 group-hover:opacity-30" src={`https://www.youtube.com/embed/${activeStep.videoUrl}?controls=0`} />
                            ) : <Video className="w-16 h-16 opacity-50 text-slate-600" />}
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm z-20">
                                <div className="w-96 bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl">
                                    <div className="flex gap-2 mb-4 border-b border-slate-700 pb-2">
                                        <button onClick={() => updateActiveStep('mediaType', 'youtube')} className={`flex-1 pb-2 text-xs font-bold ${activeStep.mediaType !== 'generated-video' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}>YouTube</button>
                                        <button onClick={() => updateActiveStep('mediaType', 'generated-video')} className={`flex-1 pb-2 text-xs font-bold ${activeStep.mediaType === 'generated-video' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}>AI Generate</button>
                                    </div>
                                    {activeStep.mediaType === 'generated-video' ? (
                                        <div className="space-y-2">
                                            <textarea value={assetPrompt} onChange={(e) => setAssetPrompt(e.target.value)} placeholder="Video prompt..." className="w-full h-20 bg-slate-800 rounded p-2 text-xs text-white" />
                                            <button onClick={handleGenerateAsset} disabled={isGeneratingAsset} className="w-full py-2 bg-indigo-600 rounded text-xs font-bold flex justify-center">{isGeneratingAsset ? <Loader2 className="animate-spin w-4 h-4"/> : 'Generate'}</button>
                                        </div>
                                    ) : (
                                        <input value={activeStep.videoUrl || ''} onChange={(e) => updateActiveStep('videoUrl', e.target.value)} placeholder="YouTube ID" className="w-full bg-slate-800 p-3 rounded text-white" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeStep.type === 'image' ? (
                        <div className="w-full h-full relative group flex items-center justify-center">
                            {activeStep.imageUrl ? <img src={activeStep.imageUrl} className="w-full h-full object-contain" /> : <ImageIcon className="w-16 h-16 opacity-50 text-slate-600" />}
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm z-20">
                                <div className="w-96 bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl">
                                     <textarea value={assetPrompt} onChange={(e) => setAssetPrompt(e.target.value)} placeholder="Image prompt..." className="w-full h-20 bg-slate-800 rounded p-2 text-xs text-white mb-2" />
                                     <button onClick={handleGenerateAsset} disabled={isGeneratingAsset} className="w-full py-2 bg-indigo-600 rounded text-xs font-bold flex justify-center">{isGeneratingAsset ? <Loader2 className="animate-spin w-4 h-4"/> : 'Generate'}</button>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 opacity-30">
                           <Layout className="w-24 h-24 mb-4" />
                           <p>Asset settings available in full view</p>
                        </div>
                    )}
                </div>

                {/* Interactive Content (Right) */}
                <div className="lg:w-1/3 h-full bg-slate-950 flex flex-col relative border-l border-white/5">
                    <div className="flex-1 p-8 flex flex-col justify-start overflow-y-auto">
                        <div className="mb-2 text-indigo-400 font-mono text-xs tracking-widest uppercase flex items-center gap-2">
                             Step {activeStepIndex + 1} of {generatedSteps.length}
                             <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px]">EDITING</span>
                        </div>
                        
                        {/* Title Editor */}
                        <input
                            value={activeStep.title || ''}
                            onChange={(e) => updateActiveStep('title', e.target.value)}
                            className="text-3xl md:text-4xl font-bold mb-8 bg-transparent text-white border-b border-transparent focus:border-indigo-500 outline-none pb-2 placeholder-slate-700"
                            placeholder="Step Title..."
                        />

                        {/* BLOCK EDITOR LIST */}
                        <div className="space-y-4 mb-8">
                             {activeStep.contentBlocks?.map((block, bIdx) => (
                                 <div key={block.id} className="group relative bg-slate-900 rounded-xl border border-slate-800 p-4 hover:border-indigo-500/50 transition-colors">
                                     {/* Delete Block */}
                                     <button 
                                        onClick={() => removeBlock(block.id)}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                     >
                                         <X className="w-3 h-3" />
                                     </button>

                                     {block.type === 'text' && (
                                         <textarea
                                            value={block.content || ''}
                                            onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                                            className="w-full bg-transparent text-slate-300 resize-none outline-none min-h-[80px]"
                                            placeholder="Write description here..."
                                         />
                                     )}

                                     {block.type === 'alert' && (
                                         <div className="flex gap-3">
                                             <div className="flex flex-col gap-2">
                                                 <select 
                                                    value={block.alertVariant || 'info'}
                                                    onChange={(e) => updateBlock(block.id, 'alertVariant', e.target.value)}
                                                    className="bg-slate-800 text-xs rounded p-1 text-slate-400"
                                                 >
                                                     <option value="info">Info</option>
                                                     <option value="warning">Warning</option>
                                                     <option value="success">Success</option>
                                                     <option value="danger">Danger</option>
                                                 </select>
                                                 <AlertTriangle className="w-5 h-5 text-yellow-500 mx-auto opacity-50" />
                                             </div>
                                             <textarea
                                                value={block.content || ''}
                                                onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                                                className="w-full bg-slate-800/50 rounded p-2 text-sm text-yellow-200 resize-none outline-none"
                                                placeholder="Alert message..."
                                             />
                                         </div>
                                     )}

                                     {block.type === 'quiz' && (
                                         <div className="space-y-3">
                                             <div className="flex items-center gap-2 mb-2">
                                                 <HelpCircle className="w-4 h-4 text-indigo-400" />
                                                 <span className="text-xs font-bold text-indigo-400 uppercase">Quiz Block</span>
                                             </div>
                                             <input 
                                                value={block.quizQuestion || ''}
                                                onChange={(e) => updateBlock(block.id, 'quizQuestion', e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                                                placeholder="Question?"
                                             />
                                             <div className="space-y-2 pl-4 border-l-2 border-slate-800">
                                                 {block.quizOptions?.map((opt, optIdx) => (
                                                     <div key={optIdx} className="flex items-center gap-2">
                                                         <input 
                                                            type="radio" 
                                                            checked={block.quizCorrectIndex === optIdx}
                                                            onChange={() => updateBlock(block.id, 'quizCorrectIndex', optIdx)}
                                                            name={`quiz-${block.id}`}
                                                         />
                                                         <input 
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const newOpts = [...(block.quizOptions || [])];
                                                                newOpts[optIdx] = e.target.value;
                                                                updateBlock(block.id, 'quizOptions', newOpts);
                                                            }}
                                                            className="flex-1 bg-transparent border-b border-slate-700 text-sm text-slate-400 focus:border-indigo-500 outline-none"
                                                         />
                                                     </div>
                                                 ))}
                                                 <button 
                                                    onClick={() => updateBlock(block.id, 'quizOptions', [...(block.quizOptions||[]), 'New Option'])}
                                                    className="text-xs text-indigo-400 hover:text-indigo-300 mt-2"
                                                 >
                                                     + Add Option
                                                 </button>
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             ))}

                             {/* Add Block Bar */}
                             <div className="flex justify-center gap-2 py-4 border-t border-slate-800 border-dashed">
                                 <button onClick={() => addBlock('text')} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors">
                                     <TypeIcon className="w-3 h-3" /> Text
                                 </button>
                                 <button onClick={() => addBlock('alert')} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors">
                                     <AlertTriangle className="w-3 h-3" /> Banner
                                 </button>
                                 <button onClick={() => addBlock('quiz')} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors">
                                     <HelpCircle className="w-3 h-3" /> Quiz
                                 </button>
                             </div>
                        </div>

                        {/* Action Area Simulation (Bottom fixed relative) */}
                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                            {/* Action area visualization similar to before */}
                             <div className="text-center text-xs text-slate-500 uppercase font-bold mb-2">Completion Action (Preview)</div>
                            {activeStep.type === 'action' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-5 h-5 rounded border border-slate-600 bg-slate-800"></div>
                                        <input 
                                            value={activeStep.actionLabel || ''}
                                            onChange={(e) => updateActiveStep('actionLabel', e.target.value)}
                                            className="bg-transparent text-sm text-slate-300 border-b border-transparent focus:border-indigo-500 outline-none w-full"
                                            placeholder="Label (e.g. I accept)"
                                        />
                                    </div>
                                </div>
                            )}
                            {/* ... other types simplified for brevity in this specific update ... */}
                             {activeStep.type !== 'action' && (
                                 <div className="text-sm text-slate-400 text-center italic">
                                     {activeStep.type === 'sop' ? 'SOP Read Verification' :
                                      activeStep.type === 'video' ? 'Video Completion Trigger' : 
                                      activeStep.type === 'download' ? 'File Download Button' : 
                                      'Continue Button'}
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
