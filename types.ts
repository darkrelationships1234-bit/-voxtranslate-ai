
export interface TranscriptionSegment {
  timestamp: string;
  originalText: string;
  translatedText: string;
}

export interface ProcessingResult {
  id: string;
  fileName: string;
  date: string;
  sourceLang: string;
  targetLang: string;
  segments: TranscriptionSegment[];
  summary?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface ErrorDetail {
  message: string;
  type: 'network' | 'format' | 'size' | 'api' | 'unknown';
  suggestions: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  POLLING = 'POLLING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type View = 'dashboard' | 'blog' | 'settings' | 'result' | 'privacy' | 'terms' | 'about' | 'contact';

export const SOURCE_LANGUAGES = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japanese' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }
];

export const TARGET_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' }
];
