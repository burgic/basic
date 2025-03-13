// src/types/index.ts

// Data extracted from PDF
export interface ReportData {
  text: string;
  images: string[];
}

// Analysis result from the API
export interface AnalysisResult {
  analysis: string;
  qaFeedback: string;
  metrics?: {
    readingAge?: number;
    fleschScore?: number;
    wordsPerSentence?: number;
    textVisualRatio?: string;
  };
}

// User profile
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'client';
  created_at: string;
}

// Saved analysis record
export interface AnalysisRecord {
  id: string;
  user_id: string;
  filename: string;
  report_hash: string;
  analysis: string;
  qa_feedback: string;
  metrics: {
    readingAge?: number;
    fleschScore?: number;
    wordsPerSentence?: number;
    textVisualRatio?: string;
  };
  created_at: string;
}

// Supabase schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      analyses: {
        Row: AnalysisRecord;
        Insert: Omit<AnalysisRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<AnalysisRecord, 'id' | 'created_at'>>;
      };
    };
  };
}