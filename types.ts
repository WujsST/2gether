
export type StepType = 'video' | 'action' | 'download' | 'embedded' | 'link' | 'image' | 'sop';

export type MediaType = 'youtube' | 'generated-video' | 'generated-image' | 'upload';

export type BlockType = 'text' | 'alert' | 'quiz';
export type AlertVariant = 'info' | 'warning' | 'success' | 'danger';

export interface ContentBlock {
  id: string;
  type: BlockType;
  // Text & Alert content
  content?: string; 
  // Alert specific
  alertVariant?: AlertVariant;
  // Quiz specific
  quizQuestion?: string;
  quizOptions?: string[];
  quizCorrectIndex?: number;
}

export interface Step {
  id: string;
  title: string;
  description: string; // Kept for backwards compatibility/fallback
  contentBlocks?: ContentBlock[]; // New rich content structure
  type: StepType;
  
  // SOP specific
  sopContent?: string; // Markdown/HTML content for the SOP document

  // Media Configuration
  mediaType?: MediaType; 
  videoUrl?: string; // YouTube ID or Generated Video URI
  imageUrl?: string; // Base64 or URL for Image steps
  
  embedUrl?: string; // For 'embedded' type (Full URL)
  actionLabel?: string; // For 'action' type
  fileUrl?: string; // For 'download' type
  fileName?: string;
  linkedCourseId?: string; // For 'link' type (Reference to another Course ID)
  isCompleted?: boolean;
}

export interface Course {
  id: string;
  name: string;
  steps: Step[];
}

export interface UserProgress {
  userId: string;
  courseId: string;
  completedStepIds: string[];
  lastUpdated: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ThemeConfig {
  primaryColor: string; // Hex code
  radius: string; // '0px', '8px', '16px', '999px'
  mode: 'light' | 'dark'; // Preserved here for persistence
}

export interface GlobalSettings {
  platformName: string;
  logoUrl: string;
  theme?: ThemeConfig; // Added theme config
}
