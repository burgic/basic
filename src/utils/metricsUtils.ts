// src/utils/metricsUtils.ts

interface Metrics {
    readingAge: number[];
    fleschKincaid: number[];
    fleschReadingEase: number[];
    wordsPerSentence: number[];
    textVisualRatio: string[];
  }
  
  /**
   * Extract metrics from analysis text using regex patterns
   */
  export const extractMetrics = (analysis: string): Metrics => {
    const metrics: Metrics = {
      readingAge: [],
      fleschKincaid: [],
      fleschReadingEase: [],
      wordsPerSentence: [],
      textVisualRatio: []
    };
    
    // Convert to lowercase for case-insensitive matching
    const lowerAnalysis = analysis.toLowerCase();
    
    // Extract reading age mentions (e.g., "reading age: 12" or "reading age of 12")
    const readingAgePattern = /reading age:?\s*(?:of\s*)?(\d+(?:\.\d+)?)/g;
    let match;
    
    while ((match = readingAgePattern.exec(lowerAnalysis)) !== null) {
      metrics.readingAge.push(parseFloat(match[1]));
    }
    
    // Extract Flesch-Kincaid mentions
    const fleschKincaidPattern = /flesch[- ]kincaid[^:]*:?\s*(\d+(?:\.\d+)?)/g;
    while ((match = fleschKincaidPattern.exec(lowerAnalysis)) !== null) {
      metrics.fleschKincaid.push(parseFloat(match[1]));
    }
    
    // Extract Flesch Reading Ease mentions
    const fleschEasePattern = /flesch reading ease:?\s*(\d+(?:\.\d+)?)/g;
    while ((match = fleschEasePattern.exec(lowerAnalysis)) !== null) {
      metrics.fleschReadingEase.push(parseFloat(match[1]));
    }
    
    // Extract words per sentence mentions
    const wpsPattern = /(\d+(?:\.\d+)?)\s*words? per sentence/g;
    while ((match = wpsPattern.exec(lowerAnalysis)) !== null) {
      metrics.wordsPerSentence.push(parseFloat(match[1]));
    }
    
    // Extract text-to-visual ratio mentions (e.g., "3:1" or "text-to-visual ratio: 3:1")
    const ratioPattern = /text-to-visual ratio:?\s*(\d+:\d+)/g;
    while ((match = ratioPattern.exec(lowerAnalysis)) !== null) {
      metrics.textVisualRatio.push(match[1]);
    }
    
    return metrics;
  };
  
  /**
   * Calculate readability metrics for a text
   */
  export const calculateReadabilityMetrics = (text: string) => {
    // Count sentences (simple approximation)
    const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
    
    // Count words
    const words = text.match(/\b\S+\b/g) || [];
    const wordCount = words.length;
    
    // Count syllables (simple approximation)
    const syllableCount = countSyllables(text);
    
    // Calculate average words per sentence
    const wordsPerSentence = wordCount / Math.max(1, sentenceCount);
    
    // Calculate Flesch-Kincaid Grade Level
    const fleschKincaid = 0.39 * (wordsPerSentence) + 11.8 * (syllableCount / wordCount) - 15.59;
    
    // Calculate Flesch Reading Ease
    const fleschReadingEase = 206.835 - 1.015 * (wordsPerSentence) - 84.6 * (syllableCount / wordCount);
    
    // Estimate reading age (rough approximation)
    const readingAge = fleschKincaid + 5;
    
    return {
      wordCount,
      sentenceCount,
      syllableCount,
      wordsPerSentence,
      fleschKincaid,
      fleschReadingEase,
      readingAge
    };
  };
  
  /**
   * Count syllables in text (simplified approximation)
   */
  function countSyllables(text: string): number {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    let count = 0;
    
    for (const word of words) {
      // Count vowel groups as syllables
      const syllables = word.match(/[aeiouy]{1,2}/g)?.length || 1;
      
      // Add syllable if word ends with "le" or "les"
      const endsWithSilentE = /le$|les$/.test(word);
      
      count += Math.max(1, syllables + (endsWithSilentE ? 1 : 0));
    }
    
    return count;
  }
  