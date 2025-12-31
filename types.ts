
export type StepType = 'video' | 'action' | 'download' | 'embedded' | 'link';

export interface Step {
  id: string;
  title: string;
  description: string;
  type: StepType;
  videoUrl?: string; // For 'video' type (YouTube ID)
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

export interface GlobalSettings {
  platformName: string;
  logoUrl: string;
}
