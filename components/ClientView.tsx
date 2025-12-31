import React, { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle, Download, FileText, Play, Link as LinkIcon, ArrowUpRight, Image as ImageIcon, AlertTriangle, Info, AlertCircle, HelpCircle, File } from 'lucide-react';
import { Course, Step, GlobalSettings, UserProgress, ContentBlock } from '../types';
import { AiChatWidget } from './AiChatWidget';
import { ReviewModal } from './ReviewModal';

interface ClientViewProps {
  course: Course;
  settings: GlobalSettings;
  courses?: Course[]; // To find linked course names if needed
}

// --- Sub-component: Quiz Block ---
const QuizBlock: React.FC<{ block: ContentBlock }> = ({ block }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = selected === block.quizCorrectIndex;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 my-4 shadow-sm" style={{ borderRadius: 'var(--radius)' }}>
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg text-[var(--primary)] bg-[var(--primary)]/10">
          <HelpCircle className="w-5 h-5" />
        </div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white pt-1">{block.quizQuestion}</h4>
      </div>
      
      <div className="space-y-2">
        {block.quizOptions?.map((option, idx) => {
          let style = {};
          let className = "w-full text-left p-3 border transition-all hover:bg-slate-50 dark:hover:bg-slate-800";
          
          if (isSubmitted) {
            if (idx === block.quizCorrectIndex) className = "w-full text-left p-3 border bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300";
            else if (idx === selected) className = "w-full text-left p-3 border bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300";
            else className += " opacity-50";
          } else if (selected === idx) {
             className = "w-full text-left p-3 border bg-[var(--primary)]/5";
             style = { borderColor: 'var(--primary)', color: 'var(--primary)' };
          } else {
             className += " border-slate-200 dark:border-slate-700";
          }

          return (
            <button
              key={idx}
              disabled={isSubmitted}
              onClick={() => setSelected(idx)}
              className={className}
              style={{ borderRadius: 'calc(var(--radius) * 0.75)', ...style }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {!isSubmitted && selected !== null && (
        <button 
          onClick={() => setIsSubmitted(true)}
          className="mt-4 w-full py-2 text-white font-semibold transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)', borderRadius: 'calc(var(--radius) * 0.75)' }}
        >
          Check Answer
        </button>
      )}

      {isSubmitted && (
         <div className={`mt-4 p-3 flex items-center gap-2 text-sm font-medium ${isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`} style={{ borderRadius: 'var(--radius)' }}>
            {isCorrect ? <CheckCircle className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
            {isCorrect ? "Correct! Well done." : "Incorrect. Try again?"}
            {!isCorrect && (
              <button onClick={() => { setIsSubmitted(false); setSelected(null); }} className="ml-auto underline">
                Reset
              </button>
            )}
         </div>
      )}
    </div>
  );
};

// --- Sub-component: Block Renderer ---
const BlockRenderer: React.FC<{ blocks: ContentBlock[] }> = ({ blocks }) => {
  return (
    <div className="space-y-4 mb-8">
      {blocks.map((block) => {
        if (block.type === 'alert') {
          const variants = {
            info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
            warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
            success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
            danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
          };
          const icons = {
             info: <Info className="w-5 h-5 flex-shrink-0" />,
             warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
             success: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
             danger: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
          };
          const v = block.alertVariant || 'info';
          
          return (
            <div key={block.id} className={`p-4 border flex gap-3 items-start ${variants[v]}`} style={{ borderRadius: 'var(--radius)' }}>
              {icons[v]}
              <div className="text-sm leading-relaxed">{block.content}</div>
            </div>
          );
        } else if (block.type === 'quiz') {
           return <QuizBlock key={block.id} block={block} />;
        } else {
           // Default Text
           return <p key={block.id} className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{block.content}</p>;
        }
      })}
    </div>
  );
};


export const ClientView: React.FC<ClientViewProps> = ({ course, settings, courses }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const currentStep = course.steps[currentStepIndex];
  
  // --- Initialization & Tracking ---
  
  useEffect(() => {
    // 1. Identify User
    let storedUserId = localStorage.getItem('2gether_user_id');
    if (!storedUserId) {
        storedUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('2gether_user_id', storedUserId);
    }
    setUserId(storedUserId);

    // 2. Load Progress for this user/course
    const allProgress: UserProgress[] = JSON.parse(localStorage.getItem('2gether_user_progress') || '[]');
    const myProgress = allProgress.find(p => p.userId === storedUserId && p.courseId === course.id);
    
    if (myProgress) {
        setCompletedSteps(myProgress.completedStepIds);
    } else {
        // Initialize entry
        const newProgress: UserProgress = {
            userId: storedUserId,
            courseId: course.id,
            completedStepIds: [],
            lastUpdated: Date.now()
        };
        localStorage.setItem('2gether_user_progress', JSON.stringify([...allProgress, newProgress]));
    }
  }, [course.id]);

  useEffect(() => {
    document.title = `${course.name} | ${settings.platformName}`;
  }, [course.name, settings.platformName]);

  const saveProgress = (newCompletedSteps: string[]) => {
      const allProgress: UserProgress[] = JSON.parse(localStorage.getItem('2gether_user_progress') || '[]');
      const index = allProgress.findIndex(p => p.userId === userId && p.courseId === course.id);
      
      const updatedEntry: UserProgress = {
          userId,
          courseId: course.id,
          completedStepIds: newCompletedSteps,
          lastUpdated: Date.now()
      };

      if (index >= 0) {
          allProgress[index] = updatedEntry;
      } else {
          allProgress.push(updatedEntry);
      }
      localStorage.setItem('2gether_user_progress', JSON.stringify(allProgress));
  };

  const markComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const newCompleted = [...completedSteps, stepId];
      setCompletedSteps(newCompleted);
      saveProgress(newCompleted);
    }
  };

  const handleNext = () => {
    markComplete(currentStep.id);
    
    if (currentStepIndex < course.steps.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 400); // 400ms matches CSS duration
    } else {
      setShowReview(true);
    }
  };

  const handleLinkedCourseRedirect = (targetCourseId: string) => {
     markComplete(currentStep.id);
     const url = new URL(window.location.href);
     url.searchParams.set('courseId', targetCourseId);
     window.location.href = url.toString();
  };

  const handleExportDoc = () => {
      if (!currentStep.sopContent) return;
      
      // Basic HTML-to-Doc strategy
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
      const footer = "</body></html>";
      // Convert basic Markdown to HTML logic (simplified)
      const contentHtml = currentStep.sopContent
         .replace(/^# (.*$)/gim, '<h1>$1</h1>')
         .replace(/^## (.*$)/gim, '<h2>$1</h2>')
         .replace(/^\- (.*$)/gim, '<li>$1</li>')
         .replace(/\n/gim, '<br>');

      const sourceHTML = header + contentHtml + footer;
      
      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      const fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = `${currentStep.title.replace(/\s+/g, '_')}_SOP.doc`;
      fileDownload.click();
      document.body.removeChild(fileDownload);
  };

  useEffect(() => {
    setIsTransitioning(false);
  }, [currentStepIndex]);

  // Helper to render media content
  const renderMedia = () => {
      if (currentStep.type === 'sop') {
          return (
              <div className="w-full h-full p-8 overflow-y-auto bg-slate-200/90 dark:bg-slate-900/90 backdrop-blur">
                  <div className="max-w-3xl mx-auto bg-white text-slate-900 min-h-[600px] shadow-2xl p-8 md:p-12 rounded-sm relative">
                       {/* Document Header Line */}
                       <div className="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
                           <div>
                               <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Standard Operating Procedure</div>
                               <h1 className="text-2xl font-serif font-bold">{currentStep.title}</h1>
                           </div>
                           <button 
                             onClick={handleExportDoc}
                             className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                             title="Download as Word Doc"
                           >
                               <Download className="w-3 h-3" /> Export .doc
                           </button>
                       </div>
                       
                       {/* Content */}
                       <div className="prose prose-slate max-w-none font-serif">
                           <div className="whitespace-pre-wrap leading-relaxed">
                               {currentStep.sopContent || "No content available for this SOP."}
                           </div>
                       </div>

                       {/* Footer */}
                       <div className="mt-12 pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between">
                           <span>{settings.platformName} Internal Document</span>
                           <span>Page 1 of 1</span>
                       </div>
                  </div>
              </div>
          );
      }

      if (currentStep.type === 'video') {
          if (currentStep.mediaType === 'generated-video' && currentStep.videoUrl) {
              return (
                  <div className="w-full h-full relative">
                       <video
                          className="w-full h-full object-contain"
                          src={currentStep.videoUrl}
                          controls
                          autoPlay
                          playsInline
                        /> 
                  </div>
              );
          } else if (currentStep.videoUrl) {
             return (
              <div className="w-full h-full relative">
                 <iframe
                  className="w-full h-full object-cover"
                  src={`https://www.youtube.com/embed/${currentStep.videoUrl}?autoplay=1&controls=0&modestbranding=1&rel=0`}
                  title="Onboarding Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                /> 
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
              </div>
            );
          }
      }

      if (currentStep.type === 'image' && currentStep.imageUrl) {
          return (
             <div className="w-full h-full relative p-8 flex items-center justify-center">
                 <img 
                    src={currentStep.imageUrl} 
                    alt={currentStep.title}
                    className="max-w-full max-h-full object-contain shadow-2xl"
                    style={{ borderRadius: 'var(--radius)' }}
                 />
             </div>
          );
      }

      if (currentStep.type === 'embedded' && currentStep.embedUrl) {
          return (
              <div className="w-full h-full">
                  <iframe
                    className="w-full h-full border-none"
                    src={currentStep.embedUrl}
                    title="Embedded Content"
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                  />
              </div>
          );
      }

      // Default Icon State
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 shadow-xl">
             {currentStep.type === 'download' ? <Download className="w-10 h-10" style={{ color: 'var(--primary)' }}/> : 
              currentStep.type === 'link' ? <ArrowUpRight className="w-10 h-10" style={{ color: 'var(--primary)' }}/> :
              currentStep.type === 'image' ? <ImageIcon className="w-10 h-10" style={{ color: 'var(--primary)' }}/> :
              currentStep.type === 'sop' ? <FileText className="w-10 h-10" style={{ color: 'var(--primary)' }}/> :
              <FileText className="w-10 h-10" style={{ color: 'var(--primary)' }}/>}
          </div>
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">{currentStep.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">{currentStep.description}</p>
        </div>
      );
  };

  // Safe content blocks retrieval (fallback to description if empty)
  const contentBlocks: ContentBlock[] = (currentStep.contentBlocks && currentStep.contentBlocks.length > 0) 
    ? currentStep.contentBlocks 
    : [{ id: 'default', type: 'text', content: currentStep.description }];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden flex flex-col transition-colors duration-500">
      
      {/* Branding Overlay */}
      <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
         {settings.logoUrl ? (
            <img 
                src={settings.logoUrl} 
                alt={settings.platformName} 
                className="h-10 w-auto object-contain drop-shadow-md"
            />
         ) : (
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg" style={{ borderRadius: 'var(--radius)' }}>
                <span className="font-bold text-lg tracking-tight text-white/90 drop-shadow-md">
                    {settings.platformName}
                </span>
            </div>
         )}
      </div>

      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 w-full z-20 h-2 bg-slate-200 dark:bg-slate-900">
        <div 
          className="h-full transition-all duration-700 ease-out"
          style={{ 
              width: `${((currentStepIndex + 1) / course.steps.length) * 100}%`,
              backgroundColor: 'var(--primary)'
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row h-full pt-2">
        
        {/* Left: Video / Content */}
        <div className={`lg:w-2/3 h-[50vh] lg:h-screen relative flex items-center justify-center border-r border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-500 ${currentStep.type === 'video' || currentStep.type === 'embedded' || currentStep.type === 'image' || currentStep.type === 'sop' ? 'bg-black' : 'bg-slate-100 dark:bg-slate-900'}`}>
          <div className={`w-full h-full flex items-center justify-center transition-all duration-400 ease-in-out transform ${isTransitioning ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
            {renderMedia()}
          </div>
        </div>

        {/* Right: Interactive Panel */}
        <div className="lg:w-1/3 h-[50vh] lg:h-screen bg-white/60 dark:bg-slate-950/50 backdrop-blur-sm flex flex-col relative transition-colors duration-500">
          <div className={`flex-1 p-8 flex flex-col justify-center transition-all duration-400 ease-in-out ${isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
            <div className="mb-2 font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--primary)' }}>
              Step {currentStepIndex + 1} of {course.steps.length}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
              {currentStep.title}
            </h1>
            
            {/* RICH CONTENT BLOCKS RENDERER */}
            <BlockRenderer blocks={contentBlocks} />

            {/* Action Area */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-white/5 shadow-inner" style={{ borderRadius: 'var(--radius)' }}>
              {currentStep.type === 'video' && (
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-300">
                  <Play className="w-5 h-5 fill-current" />
                  <span>Watch the video to continue</span>
                </div>
              )}

              {currentStep.type === 'image' && (
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-300">
                  <ImageIcon className="w-5 h-5" />
                  <span>Review the diagram above</span>
                </div>
              )}
              
              {(currentStep.type as string) === 'sop' && (
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-300">
                  <File className="w-5 h-5" />
                  <span>Read the procedure document</span>
                </div>
              )}

              {currentStep.type === 'embedded' && (
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-300">
                  <LinkIcon className="w-5 h-5" />
                  <span>Interact with the content to continue</span>
                </div>
              )}

              {currentStep.type === 'action' && (
                <div className="space-y-4">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input type="checkbox" className="w-6 h-6 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-offset-slate-900" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} />
                    <span className="text-lg text-slate-700 dark:text-slate-300 group-hover:opacity-80 transition-colors">{currentStep.actionLabel || "I have completed this task"}</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Type your answer here..." 
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:ring-1 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                    style={{ borderRadius: 'calc(var(--radius) * 0.5)', borderColor: 'transparent' }}
                  />
                </div>
              )}

              {currentStep.type === 'download' && (
                 <a 
                   href={currentStep.fileUrl || "#"}
                   download={currentStep.fileName}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 transition-all group shadow-sm cursor-pointer"
                   style={{ borderRadius: 'calc(var(--radius) * 0.75)' }}
                 >
                   <div className="p-2 rounded-lg group-hover:opacity-80" style={{ backgroundColor: 'var(--primary)', opacity: 0.1 }}>
                     <Download className="w-5 h-5" style={{ color: 'var(--primary)', opacity: 1 }} />
                   </div>
                   <span className="font-medium text-slate-700 dark:text-slate-200">{currentStep.fileName || "Resource.pdf"}</span>
                 </a>
              )}

              {currentStep.type === 'link' && currentStep.linkedCourseId && (
                 <button 
                   onClick={() => handleLinkedCourseRedirect(currentStep.linkedCourseId!)}
                   className="w-full py-4 text-white flex items-center justify-center gap-3 transition-all shadow-lg group hover:opacity-90"
                   style={{ backgroundColor: 'var(--primary)', borderRadius: 'calc(var(--radius) * 0.75)' }}
                 >
                   <span className="font-bold">Start Next Workflow</span>
                   <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
            <button 
              onClick={handleNext}
              className="w-full group relative flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-4 px-8 font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg hover:shadow-xl active:scale-95"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <span>{currentStepIndex === course.steps.length - 1 ? 'Finish' : 'Next Step'}</span>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AiChatWidget context={`The user is on step "${currentStep.title}". Type: ${currentStep.type}.`} />

      {/* Gating Modal */}
      <ReviewModal isOpen={showReview} onClose={() => window.location.reload()} />
    </div>
  );
};