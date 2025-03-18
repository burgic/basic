// src/types/index.ts

export interface ReportData {
    text: string;
    images: string[];
  }
  
  export interface AnalysisResult {
    analysis: string;
    qaFeedback: string;
  }
  
  export interface ReadabilityMetrics {
    wordCount: number;
    sentenceCount: number;
    syllableCount: number;
    wordsPerSentence: number;
    fleschKincaid: number;
    fleschReadingEase: number;
    readingAge: number;
  }
  
  export interface ExtractedMetrics {
    readingAge: number[];
    fleschKincaid: number[];
    fleschReadingEase: number[];
    wordsPerSentence: number[];
    textVisualRatio: string[];
  }